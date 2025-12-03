"""
Schemas para notificaciones de eventos de somnolencia en tiempo real.

Define las estructuras de datos para mensajes WebSocket
relacionados con eventos de somnolencia.

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class SeveridadNotificacion(str, Enum):
    """Niveles de severidad para notificaciones."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TipoEventoSomnolencia(str, Enum):
    """Tipos de eventos de somnolencia."""
    MICROSLEEP = "microsueno"
    NODDING = "cabeceo"
    YAWNING = "bostezo"
    EXCESSIVE_BLINKING = "parpadeo_excesivo"
    EYE_RUB = "frotamiento_ojos"


class EventoSomnolenciaWS(BaseModel):
    """
    Mensaje WebSocket para un evento de somnolencia individual.
    Enviado desde la app Android al backend.
    """
    type: str = Field(default="EVENTO_SOMNOLENCIA", description="Tipo de mensaje")
    id_viaje: int = Field(..., description="ID del viaje")
    id_chofer: int = Field(..., description="ID del chofer")
    tipo_evento: str = Field(..., description="Tipo de evento de somnolencia")
    nivel_severidad: str = Field(..., description="Nivel de severidad")
    duracion_segundos: float = Field(..., description="Duración del evento en segundos")
    timestamp_evento: str = Field(..., description="Timestamp del evento ISO 8601")
    
    # Ubicación (opcional)
    latitud: Optional[float] = Field(None, description="Latitud GPS")
    longitud: Optional[float] = Field(None, description="Longitud GPS")
    velocidad_kmh: Optional[float] = Field(None, description="Velocidad en km/h")
    
    # Métricas adicionales
    ear_promedio: Optional[float] = Field(None, description="EAR promedio")
    mar_promedio: Optional[float] = Field(None, description="MAR promedio")
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "EVENTO_SOMNOLENCIA",
                "id_viaje": 123,
                "id_chofer": 45,
                "tipo_evento": "microsueno",
                "nivel_severidad": "CRITICAL",
                "duracion_segundos": 2.5,
                "timestamp_evento": "2025-12-02T10:30:00Z",
                "latitud": -17.3895,
                "longitud": -66.1568,
                "velocidad_kmh": 65.5
            }
        }


class EventosBatchWS(BaseModel):
    """
    Mensaje WebSocket para batch de eventos sincronizados.
    Enviado cuando el chofer recupera conexión.
    """
    type: str = Field(default="EVENTOS_BATCH", description="Tipo de mensaje")
    id_viaje: int = Field(..., description="ID del viaje")
    id_chofer: int = Field(..., description="ID del chofer")
    nombre_chofer: str = Field(..., description="Nombre del chofer")
    eventos: List[EventoSomnolenciaWS] = Field(..., description="Lista de eventos")
    total_eventos: int = Field(..., description="Total de eventos en el batch")
    periodo_inicio: str = Field(..., description="Timestamp del primer evento")
    periodo_fin: str = Field(..., description="Timestamp del último evento")


class NotificacionSomnolenciaAdmin(BaseModel):
    """
    Notificación enviada a los administradores.
    Formato estandarizado para el frontend.
    """
    type: str = Field(default="NOTIF_SOMNOLENCIA", description="Tipo de mensaje")
    id_notificacion: str = Field(..., description="ID único de la notificación")
    
    # Información del evento
    id_viaje: int = Field(..., description="ID del viaje")
    id_chofer: int = Field(..., description="ID del chofer")
    nombre_chofer: str = Field(..., description="Nombre del chofer")
    
    tipo_evento: str = Field(..., description="Tipo de evento")
    nivel_severidad: str = Field(..., description="Nivel de severidad")
    duracion_segundos: float = Field(..., description="Duración en segundos")
    
    # Metadatos
    timestamp_evento: str = Field(..., description="Timestamp del evento")
    timestamp_notificacion: str = Field(..., description="Timestamp de la notificación")
    
    # Ubicación
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    velocidad_kmh: Optional[float] = None
    
    # UI helpers
    titulo: str = Field(..., description="Título para mostrar")
    mensaje: str = Field(..., description="Mensaje descriptivo")
    color: str = Field(..., description="Color de la notificación (hex)")
    icono: str = Field(..., description="Emoji/icono")
    es_critico: bool = Field(..., description="Si es evento crítico")
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "NOTIF_SOMNOLENCIA",
                "id_notificacion": "notif_123_1701234567",
                "id_viaje": 123,
                "id_chofer": 45,
                "nombre_chofer": "Juan Pérez",
                "tipo_evento": "microsueno",
                "nivel_severidad": "CRITICAL",
                "duracion_segundos": 2.5,
                "timestamp_evento": "2025-12-02T10:30:00Z",
                "timestamp_notificacion": "2025-12-02T10:30:01Z",
                "latitud": -17.3895,
                "longitud": -66.1568,
                "velocidad_kmh": 65.5,
                "titulo": "🚨 MICROSUEÑO DETECTADO",
                "mensaje": "Juan Pérez presentó microsueño (2.5s) a 65.5 km/h",
                "color": "#DC2626",
                "icono": "🚨",
                "es_critico": True
            }
        }


class NotificacionBatchAdmin(BaseModel):
    """
    Notificación de batch enviada a los administradores.
    """
    type: str = Field(default="NOTIF_BATCH_SOMNOLENCIA", description="Tipo de mensaje")
    id_notificacion: str = Field(..., description="ID único de la notificación")
    
    # Información del viaje/chofer
    id_viaje: Optional[int] = Field(None, description="ID del viaje")
    id_chofer: int = Field(..., description="ID del chofer")
    nombre_chofer: str = Field(..., description="Nombre del chofer")
    
    # Contadores
    total_eventos: int = Field(..., description="Total de eventos en el batch")
    eventos_criticos: int = Field(0, description="Eventos críticos en el batch")
    conteo_por_tipo: Dict[str, int] = Field(default_factory=dict, description="Conteo por tipo")
    tiene_criticos: bool = Field(False, description="Si tiene eventos críticos")
    
    # Timestamps
    timestamp_notificacion: str = Field(..., description="Timestamp de la notificación")
    
    # UI helpers
    titulo: str = Field(..., description="Título para mostrar")
    mensaje: str = Field(..., description="Mensaje descriptivo")
    color: str = Field(default="#F59E0B", description="Color de la notificación")
    icono: str = Field(default="📦", description="Emoji/icono")
    
    class Config:
        from_attributes = True