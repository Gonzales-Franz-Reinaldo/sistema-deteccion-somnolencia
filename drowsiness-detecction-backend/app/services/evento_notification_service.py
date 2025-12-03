"""
Servicio especializado para notificaciones de eventos de somnolencia.

Maneja la lógica de:
- Formatear eventos para notificaciones
- Determinar severidad y colores
- Enviar a administradores conectados
- Manejar batches de eventos offline

@author Sistema de Detección de Somnolencia
@version 1.0
"""

import logging
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.services.connection_manager import (
    connection_manager,
    WebSocketMessage,
    ConnectionType
)
from app.schemas.notificacion_somnolencia import (
    EventoSomnolenciaWS,
    NotificacionSomnolenciaAdmin,
    NotificacionBatchAdmin,
    SeveridadNotificacion
)
from app.models.evento_somnolencia import EventoSomnolencia

logger = logging.getLogger(__name__)


class EventoNotificationService:
    """
    Servicio para gestionar notificaciones de eventos de somnolencia.
    """
    
    # Configuración de colores por severidad
    COLORES_SEVERIDAD = {
        "CRITICAL": "#DC2626",  # Rojo
        "HIGH": "#EA580C",      # Naranja oscuro
        "MEDIUM": "#F59E0B",    # Amber
        "LOW": "#3B82F6",       # Azul
    }
    
    # Iconos por tipo de evento
    ICONOS_EVENTO = {
        "microsueno": "🚨",
        "cabeceo": "😴",
        "bostezo": "🥱",
        "parpadeo_excesivo": "👁️",
        "parpadeo_ojos": "👁️",
        "frotamiento_ojos": "🤦",
    }
    
    # Títulos por tipo de evento
    TITULOS_EVENTO = {
        "microsueno": "MICROSUEÑO DETECTADO",
        "cabeceo": "CABECEO DETECTADO",
        "bostezo": "BOSTEZO FRECUENTE",
        "parpadeo_excesivo": "PARPADEO EXCESIVO",
        "parpadeo_ojos": "PARPADEO EXCESIVO",
        "frotamiento_ojos": "FROTAMIENTO DE OJOS",
    }
    
    # Eventos considerados críticos
    EVENTOS_CRITICOS = {"microsueno", "cabeceo"}
    SEVERIDADES_CRITICAS = {"CRITICAL", "HIGH"}
    
    def __init__(self):
        self._notificaciones_enviadas = 0
        self._batches_enviados = 0
        logger.info("🔔 EventoNotificationService inicializado")
    
    async def notificar_evento(
        self,
        evento: EventoSomnolenciaWS,
        nombre_chofer: str
    ) -> int:
        """
        Envía notificación de un evento individual a todos los admins.
        """
        try:
            notificacion = self._crear_notificacion_evento(evento, nombre_chofer)
            
            message = WebSocketMessage(
                event_type="NOTIF_SOMNOLENCIA",
                data=notificacion.model_dump(),
                priority="high" if notificacion.es_critico else "normal"
            )
            
            sent_count = await connection_manager.broadcast_to_admins(message)
            self._notificaciones_enviadas += sent_count
            
            logger.info(
                f"🔔 Notificación enviada: {evento.tipo_evento} "
                f"({evento.nivel_severidad}) → {sent_count} admins"
            )
            
            return sent_count
            
        except Exception as e:
            logger.error(f"❌ Error enviando notificación: {e}")
            return 0
    
    async def notificar_batch(
        self,
        eventos: List[Dict[str, Any]],
        id_viaje: int,
        id_chofer: int,
        nombre_chofer: str
    ) -> int:
        """
        Envía notificación de resumen batch a todos los admins.
        """
        if not eventos:
            return 0
        
        try:
            notificacion = self._crear_notificacion_batch(
                eventos, id_viaje, id_chofer, nombre_chofer
            )
            
            message = WebSocketMessage(
                event_type="NOTIF_BATCH_SOMNOLENCIA",
                data=notificacion.model_dump(),
                priority="high" if notificacion.tiene_criticos else "normal"
            )
            
            sent_count = await connection_manager.broadcast_to_admins(message)
            self._batches_enviados += 1
            
            logger.info(
                f"📦 Notificación batch enviada: {len(eventos)} eventos "
                f"de {nombre_chofer} → {sent_count} admins"
            )
            
            return sent_count
            
        except Exception as e:
            logger.error(f"❌ Error enviando notificación batch: {e}")
            return 0
    
    async def notify_evento_batch(
        self,
        eventos: List[EventoSomnolencia],
        db=None
    ) -> int:
        """
        Notifica sobre un batch de eventos sincronizados (para background_tasks).
        
        Este método es llamado desde el endpoint /batch como background task.
        
        Args:
            eventos: Lista de eventos de somnolencia (modelos SQLAlchemy)
            db: Sesión de base de datos (opcional)
            
        Returns:
            Número de notificaciones enviadas
        """
        if not eventos:
            logger.debug("📦 Batch vacío, no hay nada que notificar")
            return 0
        
        try:
            # Filtrar solo eventos críticos
            eventos_criticos = [
                e for e in eventos 
                if (e.nivel_severidad in self.SEVERIDADES_CRITICAS or 
                    e.tipo_evento in self.EVENTOS_CRITICOS)
            ]
            
            if not eventos_criticos:
                logger.info(f"📦 Batch de {len(eventos)} eventos sin eventos críticos")
                return 0
            
            logger.info(
                f"🔔 Batch con {len(eventos_criticos)} eventos críticos "
                f"de {len(eventos)} totales"
            )
            
            # Obtener info del primer evento para el chofer
            primer_evento = eventos[0]
            id_chofer = primer_evento.id_chofer
            id_viaje = primer_evento.id_viaje
            
            # Obtener nombre del chofer
            nombre_chofer = f"Chofer ID: {id_chofer}"
            if db:
                from app.models.user import Usuario
                chofer = db.query(Usuario).filter(
                    Usuario.id_usuario == id_chofer
                ).first()
                if chofer:
                    nombre_chofer = chofer.nombre_completo
            
            # Contar por tipo
            conteo_tipos = {}
            for e in eventos_criticos:
                tipo = e.tipo_evento
                conteo_tipos[tipo] = conteo_tipos.get(tipo, 0) + 1
            
            # Crear notificación de resumen
            notificacion_data = {
                "type": "NOTIF_BATCH_SOMNOLENCIA",
                "id_notificacion": str(uuid.uuid4()),
                "id_viaje": id_viaje,
                "id_chofer": id_chofer,
                "nombre_chofer": nombre_chofer,
                "total_eventos": len(eventos),
                "eventos_criticos": len(eventos_criticos),
                "conteo_por_tipo": conteo_tipos,
                "tiene_criticos": len(eventos_criticos) > 0,
                "timestamp_notificacion": datetime.utcnow().isoformat(),
                "titulo": f"⚠️ Sincronización Offline",
                "mensaje": (
                    f"{nombre_chofer} sincronizó {len(eventos)} eventos "
                    f"({len(eventos_criticos)} críticos)"
                ),
                "color": self.COLORES_SEVERIDAD.get("HIGH", "#EA580C"),
                "icono": "📦"
            }
            
            message = WebSocketMessage(
                event_type="NOTIF_BATCH_SOMNOLENCIA",
                data=notificacion_data,
                priority="high"
            )
            
            sent_count = await connection_manager.broadcast_to_admins(message)
            self._batches_enviados += 1
            
            logger.info(
                f"📤 Resumen de batch enviado a {sent_count} admins: "
                f"{len(eventos)} eventos de {nombre_chofer}"
            )
            
            return sent_count
            
        except Exception as e:
            logger.error(f"❌ Error en notify_evento_batch: {e}", exc_info=True)
            return 0
    
    def _crear_notificacion_evento(
        self,
        evento: EventoSomnolenciaWS,
        nombre_chofer: str
    ) -> NotificacionSomnolenciaAdmin:
        """
        Crea una notificación formateada para un evento.
        """
        tipo = evento.tipo_evento.lower()
        severidad = evento.nivel_severidad.upper()
        
        # Determinar si es crítico
        es_critico = (
            tipo in self.EVENTOS_CRITICOS or 
            severidad in self.SEVERIDADES_CRITICAS
        )
        
        # Obtener color e icono
        color = self.COLORES_SEVERIDAD.get(severidad, "#3B82F6")
        icono = self.ICONOS_EVENTO.get(tipo, "⚠️")
        titulo = self.TITULOS_EVENTO.get(tipo, "EVENTO DETECTADO")
        
        # Construir mensaje
        mensaje = self._construir_mensaje_evento(
            nombre_chofer,
            tipo,
            evento.duracion_segundos,
            evento.velocidad_kmh
        )
        
        return NotificacionSomnolenciaAdmin(
            type="NOTIF_SOMNOLENCIA",
            id_notificacion=str(uuid.uuid4()),
            id_viaje=evento.id_viaje,
            id_chofer=evento.id_chofer,
            nombre_chofer=nombre_chofer,
            tipo_evento=tipo,
            nivel_severidad=severidad,
            duracion_segundos=evento.duracion_segundos,
            timestamp_evento=evento.timestamp_evento,
            timestamp_notificacion=datetime.utcnow().isoformat(),
            latitud=evento.latitud,
            longitud=evento.longitud,
            velocidad_kmh=evento.velocidad_kmh,
            titulo=f"{icono} {titulo}",
            mensaje=mensaje,
            color=color,
            icono=icono,
            es_critico=es_critico
        )
    
    def _crear_notificacion_batch(
        self,
        eventos: List[Dict[str, Any]],
        id_viaje: int,
        id_chofer: int,
        nombre_chofer: str
    ) -> NotificacionBatchAdmin:
        """
        Crea una notificación de batch.
        """
        # Contar eventos por tipo
        conteo_tipos = {}
        eventos_criticos = 0
        
        for evento in eventos:
            tipo = evento.get("tipo_evento", "desconocido")
            severidad = evento.get("nivel_severidad", "MEDIUM")
            
            conteo_tipos[tipo] = conteo_tipos.get(tipo, 0) + 1
            
            if tipo in self.EVENTOS_CRITICOS or severidad in self.SEVERIDADES_CRITICAS:
                eventos_criticos += 1
        
        tiene_criticos = eventos_criticos > 0
        
        return NotificacionBatchAdmin(
            type="NOTIF_BATCH_SOMNOLENCIA",
            id_notificacion=str(uuid.uuid4()),
            id_viaje=id_viaje,
            id_chofer=id_chofer,
            nombre_chofer=nombre_chofer,
            total_eventos=len(eventos),
            eventos_criticos=eventos_criticos,
            conteo_por_tipo=conteo_tipos,
            tiene_criticos=tiene_criticos,
            timestamp_notificacion=datetime.utcnow().isoformat(),
            titulo="📦 Sincronización Offline",
            mensaje=(
                f"{nombre_chofer} sincronizó {len(eventos)} eventos "
                f"({eventos_criticos} críticos)"
            ),
            color=self.COLORES_SEVERIDAD.get("HIGH" if tiene_criticos else "MEDIUM"),
            icono="📦"
        )
    
    def _construir_mensaje_evento(
        self,
        nombre_chofer: str,
        tipo_evento: str,
        duracion: float,
        velocidad: Optional[float]
    ) -> str:
        """
        Construye el mensaje descriptivo del evento.
        """
        mensajes = {
            "microsueno": f"{nombre_chofer} presentó un microsueño de {duracion:.1f}s",
            "cabeceo": f"{nombre_chofer} presentó cabeceo de {duracion:.1f}s",
            "bostezo": f"{nombre_chofer} ha bostezado frecuentemente",
            "parpadeo_ojos": f"{nombre_chofer} presenta parpadeo excesivo",
            "parpadeo_excesivo": f"{nombre_chofer} presenta parpadeo excesivo",
            "frotamiento_ojos": f"{nombre_chofer} se ha frotado los ojos",
        }
        
        mensaje = mensajes.get(
            tipo_evento,
            f"{nombre_chofer} presentó un evento de somnolencia"
        )
        
        if velocidad and velocidad > 0:
            mensaje += f" a {velocidad:.0f} km/h"
        
        return mensaje
    
    def get_stats(self) -> dict:
        """
        Obtiene estadísticas del servicio.
        """
        return {
            "notificaciones_enviadas": self._notificaciones_enviadas,
            "batches_enviados": self._batches_enviados,
            "connection_stats": connection_manager.get_stats()
        }


# Instancia global
evento_notification_service = EventoNotificationService()