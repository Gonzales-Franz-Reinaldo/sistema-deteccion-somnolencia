from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from enum import Enum


# ENUMS PARA VALIDACIÓN

class TipoEvento(str, Enum):
    MICROSUENO = "microsueno"
    CABECEO = "cabeceo"
    PARPADEO_OJOS = "parpadeo_ojos"
    BOSTEZO = "bostezo"
    FROTAMIENTO_OJOS = "frotamiento_ojos"


class NivelSeveridad(str, Enum):
    NORMAL = "NORMAL"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# SCHEMAS PARA CREAR EVENTOS (desde app móvil)

class EventoSomnolenciaCreate(BaseModel):
    """
    Schema para crear un evento de somnolencia.
    Enviado desde la app móvil Android.
    """
    # Relaciones (id_chofer se obtiene del token JWT)
    id_viaje: Optional[int] = Field(None, description="ID del viaje activo (opcional)")
    
    # Tipo de evento
    tipo_evento: TipoEvento = Field(..., description="Tipo de evento detectado")
    
    # Detalles del evento
    duracion_segundos: Optional[float] = Field(
        None, 
        gt=0, 
        le=300,  # Máximo 5 minutos
        description="Duración del evento en segundos"
    )
    cantidad_eventos: Optional[int] = Field(
        1, 
        ge=1,
        le=100,
        description="Cantidad de eventos en ventana (ej: 20 parpadeos)"
    )
    nivel_severidad: NivelSeveridad = Field(..., description="Nivel de severidad de la alerta")
    
    # Ubicación GPS
    latitud: Optional[float] = Field(None, ge=-90, le=90, description="Latitud GPS")
    longitud: Optional[float] = Field(None, ge=-180, le=180, description="Longitud GPS")
    velocidad_kmh: Optional[int] = Field(None, ge=0, le=300, description="Velocidad en km/h")
    
    # Timestamp del evento (cuando ocurrió realmente)
    timestamp_evento: datetime = Field(..., description="Momento exacto del evento")
    
    # Metadatos del dispositivo
    dispositivo_id: Optional[str] = Field(None, max_length=100, description="ID único del tablet")
    version_app: Optional[str] = Field(None, max_length=20, description="Versión de la app")
    sincronizado_offline: bool = Field(False, description="True si se guardó offline primero")
    
    class Config:
        use_enum_values = True
        json_schema_extra = { 
            "example": {
                "id_viaje": 123,
                "tipo_evento": "microsueno",
                "duracion_segundos": 3.2,
                "cantidad_eventos": 1,
                "nivel_severidad": "CRITICAL",
                "latitud": -12.0464,
                "longitud": -77.0428,
                "velocidad_kmh": 85,
                "timestamp_evento": "2025-11-28T14:23:45",
                "dispositivo_id": "tablet_001",
                "version_app": "1.0.0",
                "sincronizado_offline": False
            }
        }


class EventoSomnolenciaBatch(BaseModel):
    """
    Schema para enviar múltiples eventos en lote.
    Usado cuando el chofer recupera conexión después de estar offline.
    """
    eventos: List[EventoSomnolenciaCreate] = Field(
        ..., 
        min_length=1,  
        max_length=100,  
        description="Lista de eventos"
    )


# SCHEMAS PARA RESPUESTAS

class EventoSomnolenciaResponse(BaseModel):
    """
    Schema de respuesta con todos los datos del evento.
    """
    id_evento: int
    id_chofer: int
    id_viaje: Optional[int]
    tipo_evento: str
    duracion_segundos: Optional[float]
    cantidad_eventos: Optional[int]
    nivel_severidad: Optional[str]
    latitud: Optional[float]
    longitud: Optional[float]
    velocidad_kmh: Optional[int]
    timestamp_evento: datetime
    timestamp_sincronizado: datetime
    dispositivo_id: Optional[str]
    version_app: Optional[str]
    sincronizado_offline: bool
    
    class Config:
        from_attributes = True 


class EventoResumen(BaseModel):
    """
    Schema resumido para listados.
    """
    id_evento: int
    tipo_evento: str
    nivel_severidad: Optional[str]
    duracion_segundos: Optional[float]
    cantidad_eventos: Optional[int]
    timestamp_evento: datetime
    latitud: Optional[float]
    longitud: Optional[float]
    velocidad_kmh: Optional[int]
    
    class Config:
        from_attributes = True


class EventoConChofer(EventoResumen):
    """
    Schema con información del chofer incluida.
    """
    nombre_chofer: Optional[str] = None
    
    class Config:
        from_attributes = True


# SCHEMAS PARA ESTADÍSTICAS

class EstadisticasChofer(BaseModel):
    """
    Estadísticas de eventos por chofer.
    """
    id_chofer: int
    nombre_chofer: str
    periodo_dias: int
    
    # Contadores por tipo
    total_eventos: int
    microsuenos: int
    cabeceos: int
    bostezos: int
    parpadeo_ojos: int
    frotamientos_ojos: int
    
    # Por severidad
    eventos_critical: int
    eventos_high: int
    eventos_medium: int
    
    # Último evento
    ultimo_evento: Optional[datetime]
    
    class Config:
        from_attributes = True


class EstadisticasGenerales(BaseModel):
    """
    Estadísticas generales del sistema (para admin).
    """
    periodo_dias: int
    total_eventos: int
    total_choferes_con_eventos: int
    
    # Por tipo
    por_tipo: dict
    
    # Por severidad
    por_severidad: dict
    
    # Top choferes con más eventos
    top_choferes: List[dict]
    
    class Config:
        from_attributes = True