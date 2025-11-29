"""
Gestor de conexiones WebSocket para notificaciones en tiempo real.

Mantiene un registro de todas las conexiones activas y permite
enviar mensajes a usuarios específicos o broadcast a todos.

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from typing import Dict, List, Optional, Set
from fastapi import WebSocket
import asyncio
import json
import logging
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class ConnectionType(str, Enum):
    """Tipos de conexión WebSocket."""
    ADMIN = "admin"
    CHOFER = "chofer"
    MONITOR = "monitor"  # Para dashboards de monitoreo


class WebSocketMessage:
    """Estructura de mensaje WebSocket."""
    
    def __init__(
        self,
        event_type: str,
        data: dict,
        timestamp: Optional[datetime] = None,
        priority: str = "normal"
    ):
        self.event_type = event_type
        self.data = data
        self.timestamp = timestamp or datetime.utcnow()
        self.priority = priority
    
    def to_json(self) -> str:
        """Convierte el mensaje a JSON string."""
        return json.dumps({
            "event_type": self.event_type,
            "data": self.data,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority
        }, default=str)
    
    def to_dict(self) -> dict:
        """Convierte el mensaje a diccionario."""
        return {
            "event_type": self.event_type,
            "data": self.data,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority
        }


class ConnectionManager:
    """
    Gestor centralizado de conexiones WebSocket.
    
    Características:
    - Mantiene conexiones por usuario y tipo
    - Soporta broadcast a grupos específicos
    - Maneja reconexiones y desconexiones
    - Thread-safe para operaciones concurrentes
    """
    
    def __init__(self):
        # Conexiones activas: {user_id: {connection_type: WebSocket}}
        self._active_connections: Dict[int, Dict[str, WebSocket]] = {}
        
        # Conexiones por tipo (para broadcast rápido)
        self._connections_by_type: Dict[str, Set[int]] = {
            ConnectionType.ADMIN: set(),
            ConnectionType.CHOFER: set(),
            ConnectionType.MONITOR: set()
        }
        
        # Lock para operaciones thread-safe
        self._lock = asyncio.Lock()
        
        # Estadísticas
        self._total_connections = 0
        self._total_messages_sent = 0
        
        logger.info("🔌 ConnectionManager inicializado")
    
    async def connect(
        self,
        websocket: WebSocket,
        user_id: int,
        connection_type: str = ConnectionType.ADMIN
    ) -> bool:
        """
        Registra una nueva conexión WebSocket.
        
        Args:
            websocket: Conexión WebSocket
            user_id: ID del usuario
            connection_type: Tipo de conexión (admin, chofer, monitor)
            
        Returns:
            True si la conexión fue exitosa
        """
        try:
            await websocket.accept()
            
            async with self._lock:
                # Cerrar conexión anterior si existe
                if user_id in self._active_connections:
                    old_ws = self._active_connections[user_id].get(connection_type)
                    if old_ws:
                        try:
                            await old_ws.close()
                        except Exception:
                            pass
                
                # Registrar nueva conexión
                if user_id not in self._active_connections:
                    self._active_connections[user_id] = {}
                
                self._active_connections[user_id][connection_type] = websocket
                self._connections_by_type[connection_type].add(user_id)
                self._total_connections += 1
            
            logger.info(f"✅ WebSocket conectado: user_id={user_id}, type={connection_type}")
            
            # Enviar mensaje de bienvenida
            await self.send_personal_message(
                user_id=user_id,
                message=WebSocketMessage(
                    event_type="connection_established",
                    data={
                        "message": "Conexión establecida exitosamente",
                        "user_id": user_id,
                        "connection_type": connection_type
                    }
                ),
                connection_type=connection_type
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error conectando WebSocket: {e}")
            return False
    
    async def disconnect(
        self,
        user_id: int,
        connection_type: str = ConnectionType.ADMIN
    ):
        """
        Desregistra una conexión WebSocket.
        
        Args:
            user_id: ID del usuario
            connection_type: Tipo de conexión
        """
        async with self._lock:
            if user_id in self._active_connections:
                if connection_type in self._active_connections[user_id]:
                    del self._active_connections[user_id][connection_type]
                    
                    # Si no quedan conexiones, eliminar usuario
                    if not self._active_connections[user_id]:
                        del self._active_connections[user_id]
                
                # Actualizar índice por tipo
                if user_id in self._connections_by_type.get(connection_type, set()):
                    self._connections_by_type[connection_type].discard(user_id)
        
        logger.info(f"🔌 WebSocket desconectado: user_id={user_id}, type={connection_type}")
    
    async def send_personal_message(
        self,
        user_id: int,
        message: WebSocketMessage,
        connection_type: str = ConnectionType.ADMIN
    ) -> bool:
        """
        Envía un mensaje a un usuario específico.
        
        Args:
            user_id: ID del usuario destinatario
            message: Mensaje a enviar
            connection_type: Tipo de conexión
            
        Returns:
            True si el mensaje fue enviado
        """
        try:
            websocket = self._active_connections.get(user_id, {}).get(connection_type)
            
            if websocket:
                await websocket.send_text(message.to_json())
                self._total_messages_sent += 1
                logger.debug(f"📤 Mensaje enviado a user_id={user_id}: {message.event_type}")
                return True
            else:
                logger.debug(f"⚠️ Usuario {user_id} no conectado")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error enviando mensaje a user_id={user_id}: {e}")
            await self.disconnect(user_id, connection_type)
            return False
    
    async def broadcast_to_type(
        self,
        message: WebSocketMessage,
        connection_type: str = ConnectionType.ADMIN
    ) -> int:
        """
        Envía un mensaje a todos los usuarios de un tipo específico.
        
        Args:
            message: Mensaje a enviar
            connection_type: Tipo de conexión (admin, chofer, monitor)
            
        Returns:
            Número de mensajes enviados exitosamente
        """
        sent_count = 0
        user_ids = list(self._connections_by_type.get(connection_type, set()))
        
        for user_id in user_ids:
            if await self.send_personal_message(user_id, message, connection_type):
                sent_count += 1
        
        logger.info(f"📢 Broadcast a {connection_type}: {sent_count}/{len(user_ids)} mensajes enviados")
        return sent_count
    
    async def broadcast_to_admins(self, message: WebSocketMessage) -> int:
        """
        Envía un mensaje a todos los administradores conectados.
        
        Args:
            message: Mensaje a enviar
            
        Returns:
            Número de mensajes enviados
        """
        return await self.broadcast_to_type(message, ConnectionType.ADMIN)
    
    async def broadcast_all(self, message: WebSocketMessage) -> int:
        """
        Envía un mensaje a TODAS las conexiones activas.
        
        Args:
            message: Mensaje a enviar
            
        Returns:
            Número total de mensajes enviados
        """
        total_sent = 0
        
        for connection_type in self._connections_by_type.keys():
            total_sent += await self.broadcast_to_type(message, connection_type)
        
        return total_sent
    
    def is_connected(self, user_id: int, connection_type: str = None) -> bool:
        """
        Verifica si un usuario está conectado.
        
        Args:
            user_id: ID del usuario
            connection_type: Tipo específico (opcional)
            
        Returns:
            True si el usuario está conectado
        """
        if user_id not in self._active_connections:
            return False
        
        if connection_type:
            return connection_type in self._active_connections[user_id]
        
        return bool(self._active_connections[user_id])
    
    def get_connected_users(self, connection_type: str = None) -> List[int]:
        """
        Obtiene lista de usuarios conectados.
        
        Args:
            connection_type: Filtrar por tipo (opcional)
            
        Returns:
            Lista de user_ids conectados
        """
        if connection_type:
            return list(self._connections_by_type.get(connection_type, set()))
        
        return list(self._active_connections.keys())
    
    def get_stats(self) -> dict:
        """
        Obtiene estadísticas del ConnectionManager.
        
        Returns:
            Diccionario con estadísticas
        """
        return {
            "total_active_connections": sum(
                len(conns) for conns in self._active_connections.values()
            ),
            "connections_by_type": {
                ctype: len(users) 
                for ctype, users in self._connections_by_type.items()
            },
            "total_users_connected": len(self._active_connections),
            "total_connections_historical": self._total_connections,
            "total_messages_sent": self._total_messages_sent
        }


# Instancia global del ConnectionManager
connection_manager = ConnectionManager()