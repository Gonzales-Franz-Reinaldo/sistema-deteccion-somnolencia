"""
Servicio de Notificaciones para eventos de somnolencia.

Responsabilidades:
- Detectar eventos críticos que requieren notificación
- Crear mensajes de notificación estructurados
- Enviar notificaciones a usuarios relevantes
- Mantener historial de notificaciones enviadas

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from enum import Enum

from app.services.connection_manager import (
    connection_manager,
    WebSocketMessage,
    ConnectionType
)
from app.models.evento_somnolencia import EventoSomnolencia
from app.models.user import Usuario
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class NotificationPriority(str, Enum):
    """Prioridades de notificación."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationType(str, Enum):
    """Tipos de notificación."""
    # Eventos de somnolencia
    EVENTO_SOMNOLENCIA = "evento_somnolencia"
    EVENTO_CRITICO = "evento_critico"
    
    # Alertas
    ALERTA_CHOFER = "alerta_chofer"
    ALERTA_VIAJE = "alerta_viaje"
    
    # Sistema
    SISTEMA = "sistema"
    CONEXION = "conexion"


class NotificationService:
    """
    Servicio centralizado de notificaciones.
    
    Características:
    - Detecta eventos que requieren notificación inmediata
    - Formatea mensajes según el tipo de evento
    - Envía a usuarios relevantes (admins, monitores)
    - Soporta diferentes prioridades
    """
    
    # Niveles de severidad que requieren notificación inmediata
    CRITICAL_SEVERITY_LEVELS = {"CRITICAL", "HIGH"}
    
    # Tipos de evento que siempre notifican
    ALWAYS_NOTIFY_TYPES = {"microsueno", "cabeceo"}
    
    def __init__(self):
        self._notifications_sent = 0
        logger.info("🔔 NotificationService inicializado")
    
    async def notify_evento_somnolencia(
        self,
        evento: EventoSomnolencia,
        chofer: Optional[Usuario] = None,
        db: Optional[Session] = None
    ) -> int:
        """
        Notifica sobre un evento de somnolencia.
        
        Envía notificación a todos los admins si el evento es crítico.
        
        Args:
            evento: Evento de somnolencia
            chofer: Usuario chofer (opcional, se busca si no se proporciona)
            db: Sesión de base de datos
            
        Returns:
            Número de notificaciones enviadas
        """
        # Determinar si requiere notificación
        if not self._requires_notification(evento):
            logger.debug(f"Evento {evento.id_evento} no requiere notificación")
            return 0
        
        # Obtener información del chofer si no se proporcionó
        chofer_nombre = "Chofer desconocido"
        if chofer:
            chofer_nombre = chofer.nombre_completo
        elif db:
            chofer_db = db.query(Usuario).filter(
                Usuario.id_usuario == evento.id_chofer
            ).first()
            if chofer_db:
                chofer_nombre = chofer_db.nombre_completo
        
        # Crear mensaje de notificación
        message = self._create_evento_message(evento, chofer_nombre)
        
        # Enviar a todos los admins
        sent_count = await connection_manager.broadcast_to_admins(message)
        
        # También enviar a monitores si existen
        sent_count += await connection_manager.broadcast_to_type(
            message,
            ConnectionType.MONITOR
        )
        
        self._notifications_sent += sent_count
        
        logger.info(
            f"🔔 Notificación evento {evento.tipo_evento} "
            f"(severidad: {evento.nivel_severidad}) - "
            f"Enviada a {sent_count} usuarios"
        )
        
        return sent_count
    
    async def notify_evento_batch(
        self,
        eventos: List[EventoSomnolencia],
        db: Optional[Session] = None
    ) -> int:
        """
        Notifica sobre un batch de eventos sincronizados.
        
        Solo notifica si hay eventos críticos en el batch.
        
        Args:
            eventos: Lista de eventos
            db: Sesión de base de datos
            
        Returns:
            Número de notificaciones enviadas
        """
        # Filtrar solo eventos críticos
        eventos_criticos = [
            e for e in eventos 
            if self._requires_notification(e)
        ]
        
        if not eventos_criticos:
            return 0
        
        # Si hay muchos eventos críticos, enviar resumen
        if len(eventos_criticos) > 3:
            return await self._notify_batch_summary(eventos_criticos, db)
        
        # Si son pocos, notificar individualmente
        total_sent = 0
        for evento in eventos_criticos:
            total_sent += await self.notify_evento_somnolencia(evento, db=db)
        
        return total_sent
    
    async def notify_alerta_chofer(
        self,
        chofer_id: int,
        chofer_nombre: str,
        mensaje: str,
        datos_extra: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Envía una alerta sobre un chofer específico.
        
        Args:
            chofer_id: ID del chofer
            chofer_nombre: Nombre del chofer
            mensaje: Mensaje de alerta
            datos_extra: Datos adicionales
            
        Returns:
            Número de notificaciones enviadas
        """
        message = WebSocketMessage(
            event_type=NotificationType.ALERTA_CHOFER,
            data={
                "chofer_id": chofer_id,
                "chofer_nombre": chofer_nombre,
                "mensaje": mensaje,
                "datos_extra": datos_extra or {}
            },
            priority=NotificationPriority.HIGH
        )
        
        return await connection_manager.broadcast_to_admins(message)
    
    async def notify_sistema(
        self,
        mensaje: str,
        tipo: str = "info",
        datos: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Envía una notificación del sistema.
        
        Args:
            mensaje: Mensaje del sistema
            tipo: Tipo de mensaje (info, warning, error)
            datos: Datos adicionales
            
        Returns:
            Número de notificaciones enviadas
        """
        priority = NotificationPriority.NORMAL
        if tipo == "error":
            priority = NotificationPriority.HIGH
        elif tipo == "warning":
            priority = NotificationPriority.NORMAL
        
        message = WebSocketMessage(
            event_type=NotificationType.SISTEMA,
            data={
                "mensaje": mensaje,
                "tipo": tipo,
                "datos": datos or {}
            },
            priority=priority
        )
        
        return await connection_manager.broadcast_all(message)
    
    def _requires_notification(self, evento: EventoSomnolencia) -> bool:
        """
        Determina si un evento requiere notificación inmediata.
        
        Args:
            evento: Evento a evaluar
            
        Returns:
            True si requiere notificación
        """
        # Siempre notificar eventos críticos
        if evento.nivel_severidad in self.CRITICAL_SEVERITY_LEVELS:
            return True
        
        # Siempre notificar microsueños y cabeceos
        if evento.tipo_evento in self.ALWAYS_NOTIFY_TYPES:
            return True
        
        return False
    
    def _create_evento_message(
        self,
        evento: EventoSomnolencia,
        chofer_nombre: str
    ) -> WebSocketMessage:
        """
        Crea un mensaje de notificación para un evento.
        
        Args:
            evento: Evento de somnolencia
            chofer_nombre: Nombre del chofer
            
        Returns:
            WebSocketMessage formateado
        """
        # Determinar prioridad basada en severidad
        priority = NotificationPriority.NORMAL
        if evento.nivel_severidad == "CRITICAL":
            priority = NotificationPriority.CRITICAL
        elif evento.nivel_severidad == "HIGH":
            priority = NotificationPriority.HIGH
        
        # Crear título descriptivo
        titulo = self._get_evento_titulo(evento)
        
        # Crear descripción
        descripcion = self._get_evento_descripcion(evento, chofer_nombre)
        
        return WebSocketMessage(
            event_type=NotificationType.EVENTO_CRITICO if priority in [
                NotificationPriority.CRITICAL, 
                NotificationPriority.HIGH
            ] else NotificationType.EVENTO_SOMNOLENCIA,
            data={
                "id_evento": evento.id_evento,
                "id_chofer": evento.id_chofer,
                "chofer_nombre": chofer_nombre,
                "tipo_evento": evento.tipo_evento,
                "nivel_severidad": evento.nivel_severidad,
                "duracion_segundos": evento.duracion_segundos,
                "cantidad_eventos": evento.cantidad_eventos,
                "ubicacion": {
                    "latitud": float(evento.latitud) if evento.latitud else None,
                    "longitud": float(evento.longitud) if evento.longitud else None
                },
                "velocidad_kmh": evento.velocidad_kmh,
                "timestamp_evento": evento.timestamp_evento.isoformat() if evento.timestamp_evento else None,
                "titulo": titulo,
                "descripcion": descripcion,
                "emoji": self._get_evento_emoji(evento.tipo_evento)
            },
            timestamp=evento.timestamp_evento,
            priority=priority
        )
    
    async def _notify_batch_summary(
        self,
        eventos: List[EventoSomnolencia],
        db: Optional[Session] = None
    ) -> int:
        """
        Envía un resumen de múltiples eventos críticos.
        
        Args:
            eventos: Lista de eventos críticos
            db: Sesión de base de datos
            
        Returns:
            Número de notificaciones enviadas
        """
        # Agrupar por chofer
        eventos_por_chofer: Dict[int, List[EventoSomnolencia]] = {}
        for evento in eventos:
            if evento.id_chofer not in eventos_por_chofer:
                eventos_por_chofer[evento.id_chofer] = []
            eventos_por_chofer[evento.id_chofer].append(evento)
        
        # Crear resumen
        resumen_choferes = []
        for chofer_id, eventos_chofer in eventos_por_chofer.items():
            # Obtener nombre del chofer
            chofer_nombre = f"Chofer ID: {chofer_id}"
            if db:
                chofer_db = db.query(Usuario).filter(
                    Usuario.id_usuario == chofer_id
                ).first()
                if chofer_db:
                    chofer_nombre = chofer_db.nombre_completo
            
            resumen_choferes.append({
                "chofer_id": chofer_id,
                "chofer_nombre": chofer_nombre,
                "total_eventos": len(eventos_chofer),
                "tipos": list(set(e.tipo_evento for e in eventos_chofer)),
                "max_severidad": max(
                    (e.nivel_severidad for e in eventos_chofer),
                    key=lambda s: ["NORMAL", "MEDIUM", "HIGH", "CRITICAL"].index(s)
                )
            })
        
        message = WebSocketMessage(
            event_type="eventos_batch_criticos",
            data={
                "total_eventos": len(eventos),
                "total_choferes": len(eventos_por_chofer),
                "resumen_choferes": resumen_choferes,
                "mensaje": f"⚠️ Se sincronizaron {len(eventos)} eventos críticos de {len(eventos_por_chofer)} chofer(es)"
            },
            priority=NotificationPriority.HIGH
        )
        
        return await connection_manager.broadcast_to_admins(message)
    
    def _get_evento_titulo(self, evento: EventoSomnolencia) -> str:
        """Obtiene título descriptivo para el evento."""
        titulos = {
            "microsueno": "🚨 Microsueño Detectado",
            "cabeceo": "⚠️ Cabeceo Detectado",
            "bostezo": "😴 Bostezo Excesivo",
            "parpadeo_ojos": "👁️ Parpadeo Anormal",
            "frotamiento_ojos": "🤦 Frotamiento de Ojos"
        }
        return titulos.get(evento.tipo_evento, "⚠️ Evento de Somnolencia")
    
    def _get_evento_descripcion(
        self,
        evento: EventoSomnolencia,
        chofer_nombre: str
    ) -> str:
        """Genera descripción del evento."""
        descripciones = {
            "microsueno": f"{chofer_nombre} presentó un microsueño de {evento.duracion_segundos:.1f}s",
            "cabeceo": f"{chofer_nombre} presentó cabeceo de {evento.duracion_segundos:.1f}s",
            "bostezo": f"{chofer_nombre} ha bostezado {evento.cantidad_eventos} veces",
            "parpadeo_ojos": f"{chofer_nombre} presenta parpadeo excesivo ({evento.cantidad_eventos} en ventana)",
            "frotamiento_ojos": f"{chofer_nombre} se ha frotado los ojos {evento.cantidad_eventos} veces"
        }
        
        base = descripciones.get(
            evento.tipo_evento,
            f"{chofer_nombre} presentó un evento de somnolencia"
        )
        
        if evento.velocidad_kmh and evento.velocidad_kmh > 0:
            base += f" a {evento.velocidad_kmh} km/h"
        
        return base
    
    def _get_evento_emoji(self, tipo_evento: str) -> str:
        """Obtiene emoji para el tipo de evento."""
        emojis = {
            "microsueno": "😴",
            "cabeceo": "🙇",
            "bostezo": "🥱",
            "parpadeo_ojos": "👁️",
            "frotamiento_ojos": "🤦"
        }
        return emojis.get(tipo_evento, "⚠️")
    
    def get_stats(self) -> dict:
        """Obtiene estadísticas del servicio."""
        return {
            "notifications_sent": self._notifications_sent,
            "connection_stats": connection_manager.get_stats()
        }


# Instancia global del NotificationService
notification_service = NotificationService()