"""
Modelos SQLAlchemy para la Base de Datos
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base


class TripStatus(str, enum.Enum):
    """Estados posibles de un viaje"""
    PENDIENTE = "pendiente"
    EN_CURSO = "en_curso"
    COMPLETADO = "completado"
    CANCELADO = "cancelado"


class SeverityLevel(str, enum.Enum):
    """Niveles de severidad para eventos de somnolencia"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventType(str, enum.Enum):
    """Tipos de eventos de somnolencia"""
    MICROSUENO = "microsueno"
    CABECEO = "cabeceo"
    BOSTEZO = "bostezo"
    PARPADEO_OJOS = "parpadeo_ojos"
    FROTAMIENTO_OJOS = "frotamiento_ojos"


class Location(Base):
    """
    Modelo para almacenar los departamentos de Bolivia
    con sus coordenadas geográficas.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Relaciones
    trips_as_origin = relationship(
        "Trip", 
        back_populates="origin_location",
        foreign_keys="Trip.origin_id"
    )
    trips_as_destination = relationship(
        "Trip", 
        back_populates="destination_location",
        foreign_keys="Trip.destination_id"
    )

    def __repr__(self):
        return f"<Location(name='{self.name}', lat={self.latitude}, lng={self.longitude})>"


class Trip(Base):
    """
    Modelo para almacenar los viajes programados.
    """
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    
    # Referencias a ubicaciones
    origin_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    
    # Fecha y hora programada del viaje
    scheduled_date = Column(DateTime, nullable=False)
    scheduled_time = Column(String(10), nullable=False)  # Formato HH:MM
    
    # Estado del viaje
    status = Column(
        String(20), 
        default=TripStatus.PENDIENTE.value, 
        nullable=False
    )
    
    # Información del chofer (para simulación)
    driver_name = Column(String(100), default="Roberto Silva")
    driver_phone = Column(String(20), default="+591 70123456")
    driver_license = Column(String(20), default="LIC-123456")
    device_id = Column(String(50), default="tablet_001")
    
    # Ubicación actual del chofer (para rastreo en vivo)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    current_speed = Column(Float, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    
    # Relaciones
    origin_location = relationship(
        "Location", 
        back_populates="trips_as_origin",
        foreign_keys=[origin_id]
    )
    destination_location = relationship(
        "Location", 
        back_populates="trips_as_destination",
        foreign_keys=[destination_id]
    )
    drowsiness_events = relationship(
        "DrowsinessEvent",
        back_populates="trip",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Trip(id={self.id}, origin={self.origin_id}, dest={self.destination_id}, status={self.status})>"


class DrowsinessEvent(Base):
    """
    Modelo para almacenar eventos de somnolencia detectados durante un viaje.
    """
    __tablename__ = "drowsiness_events"

    id = Column(Integer, primary_key=True, index=True)
    
    # Referencia al viaje
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    # Tipo de evento
    tipo_evento = Column(String(30), nullable=False)
    
    # Detalles del evento
    duracion_segundos = Column(Float, nullable=False)
    cantidad_eventos = Column(Integer, default=1)
    nivel_severidad = Column(String(20), nullable=False)
    
    # Ubicación GPS
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    
    # Velocidad del vehículo
    velocidad_kmh = Column(Float, default=0)
    
    # Timestamp del evento
    timestamp_evento = Column(DateTime, nullable=False)
    
    # Información del dispositivo
    dispositivo_id = Column(String(50), default="tablet_001")
    version_app = Column(String(20), default="1.0.0")
    sincronizado_offline = Column(Boolean, default=False)
    
    # Timestamp de creación
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relación con Trip
    trip = relationship("Trip", back_populates="drowsiness_events")

    def __repr__(self):
        return f"<DrowsinessEvent(id={self.id}, tipo={self.tipo_evento}, severidad={self.nivel_severidad})>"
