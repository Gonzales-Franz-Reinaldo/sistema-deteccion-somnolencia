"""
Gestor de conexiones WebSocket para GPS en Tiempo Real.

Mantiene las conexiones de choferes y admins, y retransmite
las actualizaciones de ubicación GPS.

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from typing import Dict, List, Optional, Set
from fastapi import WebSocket
import asyncio
import json
import logging
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ChoferGPSConnection:
    """Información de conexión GPS de un chofer."""
    websocket: WebSocket
    id_viaje: int
    id_chofer: int
    nombre_chofer: str
    connected_at: datetime = field(default_factory=datetime.utcnow)
    last_position: Optional[dict] = None
    last_update: Optional[datetime] = None


@dataclass
class AdminGPSSubscription:
    """Suscripción de un admin a un viaje."""
    websocket: WebSocket
    user_id: int
    subscribed_at: datetime = field(default_factory=datetime.utcnow)


class GPSRealtimeManager:
    """
    Gestor centralizado de conexiones GPS en tiempo real.
    
    Responsabilidades:
    - Mantener conexiones de choferes (1 por viaje)
    - Mantener suscripciones de admins (N por viaje)
    - Retransmitir ubicaciones de chofer a admins suscritos
    - Notificar conexiones/desconexiones
    """
    
    def __init__(self):
        # Conexiones de choferes: {id_viaje: ChoferGPSConnection}
        self._chofer_connections: Dict[int, ChoferGPSConnection] = {}
        
        # Suscripciones de admins: {id_viaje: [AdminGPSSubscription, ...]}
        self._admin_subscriptions: Dict[int, List[AdminGPSSubscription]] = {}
        
        # Lock para operaciones thread-safe
        self._lock = asyncio.Lock()
        
        # Estadísticas
        self._total_updates_sent = 0
        self._total_connections = 0
        
        logger.info("🛰️ GPSRealtimeManager inicializado")
    
    # CONEXIONES DE CHOFERES
    
    async def connect_chofer(
        self,
        websocket: WebSocket,
        id_viaje: int,
        id_chofer: int,
        nombre_chofer: str
    ) -> bool:
        """
        Registra la conexión GPS de un chofer.
        
        Args:
            websocket: Conexión WebSocket
            id_viaje: ID del viaje activo
            id_chofer: ID del chofer
            nombre_chofer: Nombre del chofer
            
        Returns:
            True si la conexión fue exitosa
        """
        try:
            await websocket.accept()
            
            async with self._lock:
                # Si ya hay una conexión para este viaje, cerrarla
                if id_viaje in self._chofer_connections:
                    old_conn = self._chofer_connections[id_viaje]
                    try:
                        await old_conn.websocket.close(code=4000, reason="Nueva conexión")
                    except Exception:
                        pass
                
                # Registrar nueva conexión
                connection = ChoferGPSConnection(
                    websocket=websocket,
                    id_viaje=id_viaje,
                    id_chofer=id_chofer,
                    nombre_chofer=nombre_chofer
                )
                self._chofer_connections[id_viaje] = connection
                self._total_connections += 1
            
            logger.info(f"🚗 Chofer conectado GPS: viaje={id_viaje}, chofer={nombre_chofer}")
            
            # Notificar a admins suscritos
            await self._notify_admins_chofer_status(
                id_viaje=id_viaje,
                id_chofer=id_chofer,
                nombre_chofer=nombre_chofer,
                connected=True
            )
            
            # Enviar confirmación al chofer
            await self._send_to_chofer(id_viaje, {
                "type": "CONNECTION_ESTABLISHED",
                "message": "Conexión GPS establecida",
                "id_viaje": id_viaje,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error conectando chofer GPS: {e}")
            return False
    
    async def disconnect_chofer(self, id_viaje: int):
        """
        Desregistra la conexión GPS de un chofer.
        
        Args:
            id_viaje: ID del viaje
        """
        async with self._lock:
            if id_viaje in self._chofer_connections:
                connection = self._chofer_connections[id_viaje]
                del self._chofer_connections[id_viaje]
                
                logger.info(f"🔌 Chofer desconectado GPS: viaje={id_viaje}")
                
                # Notificar a admins (fuera del lock)
                asyncio.create_task(
                    self._notify_admins_chofer_status(
                        id_viaje=id_viaje,
                        id_chofer=connection.id_chofer,
                        nombre_chofer=connection.nombre_chofer,
                        connected=False,
                        ultima_posicion=connection.last_position
                    )
                )
    
    async def update_chofer_position(
        self,
        id_viaje: int,
        lat: float,
        lng: float,
        velocidad_kmh: Optional[float] = None,
        heading: Optional[float] = None,
        precision_m: Optional[float] = None,
        timestamp: Optional[datetime] = None
    ) -> int:
        """
        Actualiza la posición de un chofer y la retransmite a los admins.
        
        Args:
            id_viaje: ID del viaje
            lat: Latitud
            lng: Longitud
            velocidad_kmh: Velocidad en km/h
            heading: Dirección en grados
            precision_m: Precisión en metros
            timestamp: Timestamp de la posición
            
        Returns:
            Número de admins que recibieron la actualización
        """
        if id_viaje not in self._chofer_connections:
            logger.warning(f"⚠️ Viaje {id_viaje} no tiene chofer conectado")
            return 0
        
        connection = self._chofer_connections[id_viaje]
        
        # Actualizar última posición
        position_data = {
            "lat": lat,
            "lng": lng,
            "velocidad_kmh": velocidad_kmh,
            "heading": heading,
            "precision_m": precision_m,
            "timestamp": (timestamp or datetime.utcnow()).isoformat()
        }
        connection.last_position = position_data
        connection.last_update = datetime.utcnow()
        
        # ← NUEVO: Log de posición recibida
        logger.info(f"📍 Posición recibida de chofer {connection.nombre_chofer}: ({lat}, {lng})")
        
        # Construir mensaje para admins
        message = {
            "type": "GPS_POSITION",
            "id_viaje": id_viaje,
            "id_chofer": connection.id_chofer,
            "nombre_chofer": connection.nombre_chofer,
            **position_data
        }
        
        # Enviar a todos los admins suscritos
        admins_count = len(self._admin_subscriptions.get(id_viaje, []))
        logger.info(f"📡 Retransmitiendo a {admins_count} admins suscritos al viaje {id_viaje}")
        
        sent_count = await self._broadcast_to_admins(id_viaje, message)
        self._total_updates_sent += sent_count
        
        # ← NUEVO: Log de envío completado
        logger.info(f"✅ Posición enviada a {sent_count}/{admins_count} admins")
        
        return sent_count
    
    # SUSCRIPCIONES DE ADMINS
    
    async def subscribe_admin(
        self,
        websocket: WebSocket,
        id_viaje: int,
        user_id: int
    ) -> bool:
        """
        Suscribe un admin a las actualizaciones GPS de un viaje.
        
        Args:
            websocket: Conexión WebSocket
            id_viaje: ID del viaje a observar
            user_id: ID del usuario admin
            
        Returns:
            True si la suscripción fue exitosa
        """
        try:
            await websocket.accept()
            
            async with self._lock:
                if id_viaje not in self._admin_subscriptions:
                    self._admin_subscriptions[id_viaje] = []
                
                subscription = AdminGPSSubscription(
                    websocket=websocket,
                    user_id=user_id
                )
                self._admin_subscriptions[id_viaje].append(subscription)
            
            logger.info(f"👁️ Admin {user_id} suscrito a GPS viaje {id_viaje}")
            
            # Enviar estado actual del chofer si está conectado
            if id_viaje in self._chofer_connections:
                connection = self._chofer_connections[id_viaje]
                await self._send_to_websocket(websocket, {
                    "type": "CHOFER_CONNECTED",
                    "id_viaje": id_viaje,
                    "id_chofer": connection.id_chofer,
                    "nombre_chofer": connection.nombre_chofer,
                    "mensaje": "Chofer actualmente conectado",
                    "ultima_posicion": connection.last_position,
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                await self._send_to_websocket(websocket, {
                    "type": "CHOFER_DISCONNECTED",
                    "id_viaje": id_viaje,
                    "mensaje": "Chofer no conectado actualmente",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error suscribiendo admin GPS: {e}")
            return False
    
    async def unsubscribe_admin(self, id_viaje: int, user_id: int):
        """
        Desuscribe un admin de las actualizaciones GPS de un viaje.
        
        Args:
            id_viaje: ID del viaje
            user_id: ID del usuario admin
        """
        async with self._lock:
            if id_viaje in self._admin_subscriptions:
                self._admin_subscriptions[id_viaje] = [
                    sub for sub in self._admin_subscriptions[id_viaje]
                    if sub.user_id != user_id
                ]
                
                # Limpiar lista vacía
                if not self._admin_subscriptions[id_viaje]:
                    del self._admin_subscriptions[id_viaje]
        
        logger.info(f"👁️ Admin {user_id} desuscrito de GPS viaje {id_viaje}")
    
    async def unsubscribe_admin_by_websocket(self, websocket: WebSocket):
        """
        Desuscribe un admin por su WebSocket (usado en desconexión).
        
        Args:
            websocket: WebSocket a desuscribir
        """
        async with self._lock:
            for id_viaje in list(self._admin_subscriptions.keys()):
                self._admin_subscriptions[id_viaje] = [
                    sub for sub in self._admin_subscriptions[id_viaje]
                    if sub.websocket != websocket
                ]
                
                if not self._admin_subscriptions[id_viaje]:
                    del self._admin_subscriptions[id_viaje]
    
    # MÉTODOS PRIVADOS
    
    async def _send_to_websocket(self, websocket: WebSocket, data: dict) -> bool:
        """Envía datos a un WebSocket específico."""
        try:
            await websocket.send_json(data)
            return True
        except Exception as e:
            logger.debug(f"Error enviando a WebSocket: {e}")
            return False
    
    async def _send_to_chofer(self, id_viaje: int, data: dict) -> bool:
        """Envía datos al chofer de un viaje."""
        if id_viaje not in self._chofer_connections:
            return False
        
        return await self._send_to_websocket(
            self._chofer_connections[id_viaje].websocket,
            data
        )
    
    async def _broadcast_to_admins(self, id_viaje: int, data: dict) -> int:
        """
        Envía datos a todos los admins suscritos a un viaje.
        
        Returns:
            Número de envíos exitosos
        """
        if id_viaje not in self._admin_subscriptions:
            return 0
        
        sent_count = 0
        failed_subscriptions = []
        
        for subscription in self._admin_subscriptions[id_viaje]:
            if await self._send_to_websocket(subscription.websocket, data):
                sent_count += 1
            else:
                failed_subscriptions.append(subscription)
        
        # Limpiar suscripciones fallidas
        if failed_subscriptions:
            async with self._lock:
                for failed in failed_subscriptions:
                    if id_viaje in self._admin_subscriptions:
                        self._admin_subscriptions[id_viaje] = [
                            sub for sub in self._admin_subscriptions[id_viaje]
                            if sub.websocket != failed.websocket
                        ]
        
        return sent_count
    
    async def _notify_admins_chofer_status(
        self,
        id_viaje: int,
        id_chofer: int,
        nombre_chofer: str,
        connected: bool,
        ultima_posicion: Optional[dict] = None
    ):
        """Notifica a los admins sobre el estado de conexión del chofer."""
        message = {
            "type": "CHOFER_CONNECTED" if connected else "CHOFER_DISCONNECTED",
            "id_viaje": id_viaje,
            "id_chofer": id_chofer,
            "nombre_chofer": nombre_chofer,
            "mensaje": f"Chofer {'conectado' if connected else 'desconectado'}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if ultima_posicion:
            message["ultima_posicion"] = ultima_posicion
        
        await self._broadcast_to_admins(id_viaje, message)
    
    # UTILIDADES PÚBLICAS
    
    def is_chofer_connected(self, id_viaje: int) -> bool:
        """Verifica si el chofer de un viaje está conectado."""
        return id_viaje in self._chofer_connections
    
    def get_chofer_last_position(self, id_viaje: int) -> Optional[dict]:
        """Obtiene la última posición conocida del chofer."""
        if id_viaje in self._chofer_connections:
            return self._chofer_connections[id_viaje].last_position
        return None
    
    def get_subscribed_admins_count(self, id_viaje: int) -> int:
        """Obtiene el número de admins suscritos a un viaje."""
        return len(self._admin_subscriptions.get(id_viaje, []))
    
    def get_stats(self) -> dict:
        """Obtiene estadísticas del manager."""
        return {
            "choferes_conectados": len(self._chofer_connections),
            "viajes_monitoreados": len(self._admin_subscriptions),
            "total_admins_suscritos": sum(
                len(subs) for subs in self._admin_subscriptions.values()
            ),
            "total_actualizaciones_enviadas": self._total_updates_sent,
            "total_conexiones_historicas": self._total_connections,
            "viajes_activos": list(self._chofer_connections.keys())
        }
    
    def get_active_trips(self) -> List[dict]:
        """Obtiene información de los viajes con GPS activo."""
        result = []
        for id_viaje, connection in self._chofer_connections.items():
            result.append({
                "id_viaje": id_viaje,
                "id_chofer": connection.id_chofer,
                "nombre_chofer": connection.nombre_chofer,
                "connected_at": connection.connected_at.isoformat(),
                "last_update": connection.last_update.isoformat() if connection.last_update else None,
                "last_position": connection.last_position,
                "admins_watching": self.get_subscribed_admins_count(id_viaje)
            })
        return result


# Instancia global del GPSRealtimeManager
gps_realtime_manager = GPSRealtimeManager()