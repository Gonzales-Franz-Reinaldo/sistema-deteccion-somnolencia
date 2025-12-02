"""
Esquemas Pydantic para validación de datos
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventType(str, Enum):
    MICROSUENO = "microsueno"
    CABECEO = "cabeceo"
    BOSTEZO = "bostezo"
    PARPADEO_OJOS = "parpadeo_ojos"
    FROTAMIENTO_OJOS = "frotamiento_ojos"


# ==================== LOCATION SCHEMAS ====================

class LocationBase(BaseModel):
    """Esquema base para ubicaciones"""
    name: str
    latitude: float
    longitude: float


class LocationCreate(LocationBase):
    """Esquema para crear una ubicación"""
    pass


class LocationResponse(LocationBase):
    """Esquema de respuesta para ubicaciones"""
    id: int

    class Config:
        from_attributes = True


# ==================== TRIP SCHEMAS ====================

class TripBase(BaseModel):
    """Esquema base para viajes"""
    origin_id: int
    destination_id: int
    scheduled_date: datetime
    scheduled_time: str

    @field_validator('scheduled_time')
    @classmethod
    def validate_time_format(cls, v):
        """Validar formato de hora HH:MM"""
        if ':' not in v:
            raise ValueError('El formato de hora debe ser HH:MM')
        parts = v.split(':')
        if len(parts) != 2:
            raise ValueError('El formato de hora debe ser HH:MM')
        try:
            hour = int(parts[0])
            minute = int(parts[1])
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError('Hora inválida')
        except ValueError:
            raise ValueError('El formato de hora debe ser HH:MM')
        return v

    @field_validator('destination_id')
    @classmethod
    def validate_different_locations(cls, v, info):
        """Validar que origen y destino sean diferentes"""
        if 'origin_id' in info.data and v == info.data['origin_id']:
            raise ValueError('El origen y destino deben ser diferentes')
        return v


class TripCreate(TripBase):
    """Esquema para crear un viaje"""
    pass


class TripResponse(TripBase):
    """Esquema de respuesta para viajes"""
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    driver_license: Optional[str] = None
    device_id: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    current_speed: Optional[float] = None
    origin_location: Optional[LocationResponse] = None
    destination_location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True


class TripWithRoute(TripResponse):
    """Esquema de respuesta con información de ruta"""
    route_coordinates: Optional[list] = None
    distance_km: Optional[float] = None
    duration_minutes: Optional[float] = None


# ==================== ROUTE SCHEMAS ====================

class RouteRequest(BaseModel):
    """Esquema para solicitar una ruta"""
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float


class RouteResponse(BaseModel):
    """Esquema de respuesta para rutas"""
    coordinates: list
    distance_km: float
    duration_minutes: float
    success: bool
    message: Optional[str] = None


# ==================== DROWSINESS EVENT SCHEMAS ====================

class DrowsinessEventBase(BaseModel):
    """Esquema base para eventos de somnolencia"""
    tipo_evento: str
    duracion_segundos: float
    cantidad_eventos: int = 1
    nivel_severidad: str
    latitud: float
    longitud: float
    velocidad_kmh: float = 0
    timestamp_evento: datetime
    dispositivo_id: str = "tablet_001"
    version_app: str = "1.0.0"
    sincronizado_offline: bool = False

    @field_validator('tipo_evento')
    @classmethod
    def validate_event_type(cls, v):
        valid_types = ['microsueno', 'cabeceo', 'bostezo', 'parpadeo_ojos', 'frotamiento_ojos']
        if v.lower() not in valid_types:
            raise ValueError(f'Tipo de evento inválido. Válidos: {valid_types}')
        return v.lower()

    @field_validator('nivel_severidad')
    @classmethod
    def validate_severity(cls, v):
        valid_levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Nivel de severidad inválido. Válidos: {valid_levels}')
        return v.upper()


class DrowsinessEventCreate(DrowsinessEventBase):
    """Esquema para crear un evento de somnolencia"""
    pass


class DrowsinessEventResponse(DrowsinessEventBase):
    """Esquema de respuesta para eventos de somnolencia"""
    id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== LIVE TRACKING SCHEMAS ====================

class LivePositionUpdate(BaseModel):
    """Esquema para actualizar posición en vivo"""
    latitude: float
    longitude: float
    speed: float = 0


class TripLiveData(BaseModel):
    """Esquema para datos en vivo del viaje"""
    trip_id: int
    status: str
    driver_name: str
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    current_speed: float
    origin: LocationResponse
    destination: LocationResponse
    recent_events: List[DrowsinessEventResponse] = []
    total_events: int = 0
    critical_events: int = 0
    high_events: int = 0
    medium_events: int = 0


class SimulationConfig(BaseModel):
    """Configuración para la simulación de viaje"""
    speed_kmh: float = 80
    event_frequency_seconds: int = 10
    include_events: bool = True
