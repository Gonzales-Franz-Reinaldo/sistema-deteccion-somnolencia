"""
Operaciones CRUD para la Base de Datos
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime
import httpx

from . import models, schemas
from .data import BOLIVIA_DEPARTMENTS


# ==================== LOCATION CRUD ====================

def get_location(db: Session, location_id: int) -> Optional[models.Location]:
    """Obtener una ubicación por ID"""
    return db.query(models.Location).filter(models.Location.id == location_id).first()


def get_location_by_name(db: Session, name: str) -> Optional[models.Location]:
    """Obtener una ubicación por nombre"""
    return db.query(models.Location).filter(models.Location.name == name).first()


def get_locations(db: Session) -> List[models.Location]:
    """Obtener todas las ubicaciones"""
    return db.query(models.Location).order_by(models.Location.name).all()


def create_location(db: Session, location: schemas.LocationCreate) -> models.Location:
    """Crear una nueva ubicación"""
    db_location = models.Location(
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def init_bolivia_departments(db: Session) -> None:
    """
    Inicializar la base de datos con los 9 departamentos de Bolivia.
    Solo inserta si no existen.
    """
    for dept in BOLIVIA_DEPARTMENTS:
        existing = get_location_by_name(db, dept["name"])
        if not existing:
            location = schemas.LocationCreate(**dept)
            create_location(db, location)
    print("✅ Departamentos de Bolivia inicializados correctamente")


# ==================== TRIP CRUD ====================

def get_trip(db: Session, trip_id: int) -> Optional[models.Trip]:
    """Obtener un viaje por ID"""
    return db.query(models.Trip).filter(models.Trip.id == trip_id).first()


def get_trips(db: Session, skip: int = 0, limit: int = 100) -> List[models.Trip]:
    """Obtener todos los viajes con paginación"""
    return db.query(models.Trip).order_by(models.Trip.created_at.desc()).offset(skip).limit(limit).all()


def get_active_trips(db: Session) -> List[models.Trip]:
    """Obtener viajes activos (en curso)"""
    return db.query(models.Trip).filter(
        models.Trip.status == models.TripStatus.EN_CURSO.value
    ).all()


def create_trip(db: Session, trip: schemas.TripCreate) -> models.Trip:
    """Crear un nuevo viaje"""
    db_trip = models.Trip(
        origin_id=trip.origin_id,
        destination_id=trip.destination_id,
        scheduled_date=trip.scheduled_date,
        scheduled_time=trip.scheduled_time,
        status=models.TripStatus.PENDIENTE.value
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


def start_trip(db: Session, trip_id: int) -> Optional[models.Trip]:
    """Iniciar un viaje - cambiar estado a EN_CURSO"""
    db_trip = get_trip(db, trip_id)
    if db_trip and db_trip.status == models.TripStatus.PENDIENTE.value:
        db_trip.status = models.TripStatus.EN_CURSO.value
        db_trip.started_at = datetime.now()
        # Inicializar posición en el origen
        origin = get_location(db, db_trip.origin_id)
        if origin:
            db_trip.current_latitude = origin.latitude
            db_trip.current_longitude = origin.longitude
        db.commit()
        db.refresh(db_trip)
    return db_trip


def end_trip(db: Session, trip_id: int) -> Optional[models.Trip]:
    """Finalizar un viaje - cambiar estado a COMPLETADO"""
    db_trip = get_trip(db, trip_id)
    if db_trip and db_trip.status == models.TripStatus.EN_CURSO.value:
        db_trip.status = models.TripStatus.COMPLETADO.value
        db_trip.ended_at = datetime.now()
        db.commit()
        db.refresh(db_trip)
    return db_trip


def update_trip_position(
    db: Session, 
    trip_id: int, 
    latitude: float, 
    longitude: float, 
    speed: float = 0
) -> Optional[models.Trip]:
    """Actualizar la posición actual del chofer"""
    db_trip = get_trip(db, trip_id)
    if db_trip:
        db_trip.current_latitude = latitude
        db_trip.current_longitude = longitude
        db_trip.current_speed = speed
        db.commit()
        db.refresh(db_trip)
    return db_trip


def update_trip_status(db: Session, trip_id: int, status: str) -> Optional[models.Trip]:
    """Actualizar el estado de un viaje"""
    db_trip = get_trip(db, trip_id)
    if db_trip:
        db_trip.status = status
        db.commit()
        db.refresh(db_trip)
    return db_trip


def delete_trip(db: Session, trip_id: int) -> bool:
    """Eliminar un viaje"""
    db_trip = get_trip(db, trip_id)
    if db_trip:
        db.delete(db_trip)
        db.commit()
        return True
    return False


# ==================== DROWSINESS EVENTS CRUD ====================

def create_drowsiness_event(
    db: Session, 
    trip_id: int, 
    event: schemas.DrowsinessEventCreate
) -> models.DrowsinessEvent:
    """Crear un nuevo evento de somnolencia"""
    db_event = models.DrowsinessEvent(
        trip_id=trip_id,
        tipo_evento=event.tipo_evento,
        duracion_segundos=event.duracion_segundos,
        cantidad_eventos=event.cantidad_eventos,
        nivel_severidad=event.nivel_severidad,
        latitud=event.latitud,
        longitud=event.longitud,
        velocidad_kmh=event.velocidad_kmh,
        timestamp_evento=event.timestamp_evento,
        dispositivo_id=event.dispositivo_id,
        version_app=event.version_app,
        sincronizado_offline=event.sincronizado_offline
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_trip_events(
    db: Session, 
    trip_id: int, 
    limit: int = 100
) -> List[models.DrowsinessEvent]:
    """Obtener todos los eventos de un viaje"""
    return db.query(models.DrowsinessEvent).filter(
        models.DrowsinessEvent.trip_id == trip_id
    ).order_by(desc(models.DrowsinessEvent.timestamp_evento)).limit(limit).all()


def get_recent_events(
    db: Session, 
    trip_id: int, 
    limit: int = 10
) -> List[models.DrowsinessEvent]:
    """Obtener los eventos más recientes de un viaje"""
    return db.query(models.DrowsinessEvent).filter(
        models.DrowsinessEvent.trip_id == trip_id
    ).order_by(desc(models.DrowsinessEvent.timestamp_evento)).limit(limit).all()


def count_events_by_severity(db: Session, trip_id: int) -> dict:
    """Contar eventos por nivel de severidad"""
    events = db.query(models.DrowsinessEvent).filter(
        models.DrowsinessEvent.trip_id == trip_id
    ).all()
    
    counts = {
        "total": len(events),
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
    }
    
    for event in events:
        if event.nivel_severidad in counts:
            counts[event.nivel_severidad] += 1
    
    return counts


# ==================== ROUTE SERVICE ====================

async def get_route_from_openroute(
    origin_lat: float, 
    origin_lng: float, 
    destination_lat: float, 
    destination_lng: float
) -> schemas.RouteResponse:
    """
    Obtener ruta desde OpenRouteService (gratuito).
    Si falla, retorna una línea directa entre los puntos.
    """
    # OpenRouteService API (gratuita, hasta 2000 requests/día)
    # Nota: Para producción, registrarse en openrouteservice.org para obtener API key
    OPENROUTE_API_KEY = "5b3ce3597851110001cf62480f4a4a0e6e0b4a0e8f4a4a0e6e0b4a0e"  # API key de prueba
    
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    
    headers = {
        "Authorization": OPENROUTE_API_KEY,
        "Content-Type": "application/json"
    }
    
    body = {
        "coordinates": [
            [origin_lng, origin_lat],
            [destination_lng, destination_lat]
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=body, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                route = data["routes"][0]
                geometry = route["geometry"]
                
                # Decodificar polyline
                coordinates = decode_polyline(geometry)
                
                # Convertir distancia de metros a km y duración de segundos a minutos
                distance_km = route["summary"]["distance"] / 1000
                duration_minutes = route["summary"]["duration"] / 60
                
                return schemas.RouteResponse(
                    coordinates=coordinates,
                    distance_km=round(distance_km, 2),
                    duration_minutes=round(duration_minutes, 2),
                    success=True,
                    message="Ruta calculada correctamente"
                )
    except Exception as e:
        print(f"Error al obtener ruta de OpenRouteService: {e}")
    
    # Fallback: línea directa entre origen y destino
    return schemas.RouteResponse(
        coordinates=[
            [origin_lat, origin_lng],
            [destination_lat, destination_lng]
        ],
        distance_km=calculate_direct_distance(origin_lat, origin_lng, destination_lat, destination_lng),
        duration_minutes=0,
        success=False,
        message="No se pudo calcular la ruta real. Mostrando línea directa."
    )


def decode_polyline(polyline_str: str) -> list:
    """
    Decodificar polyline de Google/OpenRouteService a lista de coordenadas.
    """
    index = 0
    lat = 0
    lng = 0
    coordinates = []
    
    while index < len(polyline_str):
        # Decodificar latitud
        shift = 0
        result = 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat
        
        # Decodificar longitud
        shift = 0
        result = 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng
        
        coordinates.append([lat / 1e5, lng / 1e5])
    
    return coordinates


def calculate_direct_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcular distancia directa entre dos puntos usando la fórmula de Haversine.
    Retorna la distancia en kilómetros.
    """
    import math
    
    R = 6371  # Radio de la Tierra en km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)
