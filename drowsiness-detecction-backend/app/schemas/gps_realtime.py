"""
Schemas para GPS en Tiempo Real.

Define las estructuras de datos para la comunicación
WebSocket de ubicación GPS.

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class GPSMessageType(str, Enum):
    """Tipos de mensajes GPS WebSocket."""
    # Chofer → Backend
    GPS_UPDATE = "GPS_UPDATE"
    GPS_START = "GPS_START"
    GPS_STOP = "GPS_STOP"
    PING = "PING"
    
    # Backend → Admin
    GPS_POSITION = "GPS_POSITION"
    CHOFER_CONNECTED = "CHOFER_CONNECTED"
    CHOFER_DISCONNECTED = "CHOFER_DISCONNECTED"
    PONG = "PONG"
    ERROR = "ERROR"


class GPSCoordinates(BaseModel):
    """Coordenadas GPS con metadatos."""
    lat: float = Field(..., ge=-90, le=90, description="Latitud")
    lng: float = Field(..., ge=-180, le=180, description="Longitud")
    velocidad_kmh: Optional[float] = Field(None, ge=0, le=300, description="Velocidad en km/h")
    heading: Optional[float] = Field(None, ge=0, le=360, description="Dirección en grados")
    precision_m: Optional[float] = Field(None, ge=0, description="Precisión en metros")
    altitud_m: Optional[float] = Field(None, description="Altitud en metros")


class GPSUpdateFromChofer(BaseModel):
    """
    Mensaje de actualización GPS enviado por el chofer.
    Chofer → Backend
    """
    type: str = GPSMessageType.GPS_UPDATE
    id_viaje: int = Field(..., gt=0, description="ID del viaje activo")
    id_chofer: int = Field(..., gt=0, description="ID del chofer")
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    velocidad_kmh: Optional[float] = Field(None, ge=0, le=300)
    heading: Optional[float] = Field(None, ge=0, le=360)
    precision_m: Optional[float] = Field(None, ge=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "GPS_UPDATE",
                "id_viaje": 123,
                "id_chofer": 45,
                "lat": -17.3895,
                "lng": -66.1568,
                "velocidad_kmh": 65.5,
                "heading": 180.0,
                "precision_m": 5.0,
                "timestamp": "2025-12-02T10:30:00Z"
            }
        }


class GPSPositionToAdmin(BaseModel):
    """
    Mensaje de posición GPS enviado a los admins.
    Backend → Admin
    """
    type: str = GPSMessageType.GPS_POSITION
    id_viaje: int
    id_chofer: int
    nombre_chofer: str
    lat: float
    lng: float
    velocidad_kmh: Optional[float] = None
    heading: Optional[float] = None
    precision_m: Optional[float] = None
    timestamp: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "GPS_POSITION",
                "id_viaje": 123,
                "id_chofer": 45,
                "nombre_chofer": "Juan Pérez",
                "lat": -17.3895,
                "lng": -66.1568,
                "velocidad_kmh": 65.5,
                "heading": 180.0,
                "precision_m": 5.0,
                "timestamp": "2025-12-02T10:30:00Z"
            }
        }


class ChoferConnectionStatus(BaseModel):
    """Estado de conexión del chofer."""
    type: str
    id_viaje: int
    id_chofer: int
    nombre_chofer: str
    mensaje: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ultima_posicion: Optional[GPSCoordinates] = None


class GPSStartMessage(BaseModel):
    """Mensaje de inicio de tracking GPS."""
    type: str = GPSMessageType.GPS_START
    id_viaje: int
    id_chofer: int


class GPSStopMessage(BaseModel):
    """Mensaje de fin de tracking GPS."""
    type: str = GPSMessageType.GPS_STOP
    id_viaje: int
    id_chofer: int
    motivo: Optional[str] = None