"""
API Principal - FastAPI
Endpoints para gestión de viajes GPS en Bolivia
"""
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager
from datetime import datetime
import asyncio
import random

from .database import engine, Base, get_db
from . import crud, models, schemas


# Crear las tablas en la base de datos al iniciar
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eventos de inicio y cierre de la aplicación"""
    # Startup: Crear tablas e inicializar datos
    print("🚀 Iniciando aplicación...")
    
    # IMPORTANTE: Eliminar y recrear tablas para actualizar estructura
    # Comentar estas líneas después de la primera ejecución si quieres mantener datos
    print("⚠️  Recreando tablas con nueva estructura...")
    Base.metadata.drop_all(bind=engine)
    
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas correctamente")
    
    # Inicializar departamentos de Bolivia
    db = next(get_db())
    crud.init_bolivia_departments(db)
    db.close()
    
    yield
    
    # Shutdown
    print("👋 Cerrando aplicación...")


# Crear la aplicación FastAPI
app = FastAPI(
    title="GPS Bolivia - API de Viajes",
    description="API para gestión de rutas de viaje entre departamentos de Bolivia",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ENDPOINTS DE UBICACIONES ====================

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz para verificar que la API está funcionando"""
    return {
        "message": "🗺️ GPS Bolivia API - Funcionando correctamente",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/locations", response_model=List[schemas.LocationResponse], tags=["Ubicaciones"])
def get_locations(db: Session = Depends(get_db)):
    """
    Obtener todos los departamentos de Bolivia.
    Retorna la lista de ubicaciones con sus coordenadas.
    """
    locations = crud.get_locations(db)
    return locations


@app.get("/locations/{location_id}", response_model=schemas.LocationResponse, tags=["Ubicaciones"])
def get_location(location_id: int, db: Session = Depends(get_db)):
    """
    Obtener un departamento por su ID.
    """
    location = crud.get_location(db, location_id)
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ubicación no encontrada"
        )
    return location


# ==================== ENDPOINTS DE VIAJES ====================

@app.get("/trips", response_model=List[schemas.TripResponse], tags=["Viajes"])
def get_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtener todos los viajes registrados.
    """
    trips = crud.get_trips(db, skip=skip, limit=limit)
    return trips


@app.get("/trips/{trip_id}", response_model=schemas.TripResponse, tags=["Viajes"])
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Obtener un viaje por su ID.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    return trip


@app.post("/trips", response_model=schemas.TripResponse, status_code=status.HTTP_201_CREATED, tags=["Viajes"])
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo viaje.
    Requiere: origin_id, destination_id, scheduled_date, scheduled_time
    """
    # Verificar que existan las ubicaciones
    origin = crud.get_location(db, trip.origin_id)
    if origin is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El origen seleccionado no existe"
        )
    
    destination = crud.get_location(db, trip.destination_id)
    if destination is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El destino seleccionado no existe"
        )
    
    # Crear el viaje
    db_trip = crud.create_trip(db, trip)
    return db_trip


@app.patch("/trips/{trip_id}/status", response_model=schemas.TripResponse, tags=["Viajes"])
def update_trip_status(trip_id: int, status: str, db: Session = Depends(get_db)):
    """
    Actualizar el estado de un viaje.
    Estados válidos: pendiente, en_curso, completado, cancelado
    """
    valid_statuses = ["pendiente", "en_curso", "completado", "cancelado"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Estados válidos: {valid_statuses}"
        )
    
    trip = crud.update_trip_status(db, trip_id, status)
    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Viaje no encontrado"
        )
    return trip


@app.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Viajes"])
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Eliminar un viaje.
    """
    success = crud.delete_trip(db, trip_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    return None


# ==================== ENDPOINTS DE RUTAS ====================

@app.post("/route", response_model=schemas.RouteResponse, tags=["Rutas"])
async def get_route(request: schemas.RouteRequest):
    """
    Calcular la ruta entre dos puntos.
    Intenta usar OpenRouteService, si falla retorna línea directa.
    """
    route = await crud.get_route_from_openroute(
        request.origin_lat,
        request.origin_lng,
        request.destination_lat,
        request.destination_lng
    )
    return route


@app.get("/route/{origin_id}/{destination_id}", response_model=schemas.RouteResponse, tags=["Rutas"])
async def get_route_by_locations(origin_id: int, destination_id: int, db: Session = Depends(get_db)):
    """
    Calcular la ruta entre dos departamentos usando sus IDs.
    """
    origin = crud.get_location(db, origin_id)
    if origin is None:
        raise HTTPException(status_code=404, detail="Origen no encontrado")
    
    destination = crud.get_location(db, destination_id)
    if destination is None:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    
    route = await crud.get_route_from_openroute(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
    )
    return route


# ==================== ENDPOINTS DE CONTROL DE VIAJES ====================

@app.post("/trips/{trip_id}/start", response_model=schemas.TripResponse, tags=["Control de Viajes"])
def start_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Iniciar un viaje - cambia el estado a EN_CURSO.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    if trip.status != models.TripStatus.PENDIENTE.value:
        raise HTTPException(
            status_code=400, 
            detail=f"El viaje no puede iniciarse. Estado actual: {trip.status}"
        )
    
    updated_trip = crud.start_trip(db, trip_id)
    return updated_trip


@app.post("/trips/{trip_id}/end", response_model=schemas.TripResponse, tags=["Control de Viajes"])
def end_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Finalizar un viaje - cambia el estado a COMPLETADO.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    if trip.status != models.TripStatus.EN_CURSO.value:
        raise HTTPException(
            status_code=400, 
            detail=f"El viaje no puede finalizarse. Estado actual: {trip.status}"
        )
    
    updated_trip = crud.end_trip(db, trip_id)
    return updated_trip


@app.post("/trips/{trip_id}/position", response_model=schemas.TripResponse, tags=["Control de Viajes"])
def update_position(
    trip_id: int, 
    position: schemas.LivePositionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualizar la posición actual del chofer.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    updated_trip = crud.update_trip_position(
        db, trip_id, 
        position.latitude, 
        position.longitude, 
        position.speed
    )
    return updated_trip


# ==================== ENDPOINTS DE EVENTOS DE SOMNOLENCIA ====================

@app.post("/trips/{trip_id}/events", response_model=schemas.DrowsinessEventResponse, tags=["Eventos de Somnolencia"])
def create_event(
    trip_id: int, 
    event: schemas.DrowsinessEventCreate, 
    db: Session = Depends(get_db)
):
    """
    Registrar un nuevo evento de somnolencia.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    if trip.status != models.TripStatus.EN_CURSO.value:
        raise HTTPException(
            status_code=400, 
            detail="Solo se pueden registrar eventos en viajes en curso"
        )
    
    db_event = crud.create_drowsiness_event(db, trip_id, event)
    return db_event


@app.get("/trips/{trip_id}/events", response_model=List[schemas.DrowsinessEventResponse], tags=["Eventos de Somnolencia"])
def get_trip_events(trip_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtener todos los eventos de somnolencia de un viaje.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    events = crud.get_trip_events(db, trip_id, limit)
    return events


@app.get("/trips/{trip_id}/live", response_model=schemas.TripLiveData, tags=["Monitoreo en Vivo"])
def get_live_data(trip_id: int, db: Session = Depends(get_db)):
    """
    Obtener datos en vivo del viaje: posición actual, eventos recientes, estadísticas.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    # Obtener ubicaciones
    origin = crud.get_location(db, trip.origin_id)
    destination = crud.get_location(db, trip.destination_id)
    
    # Obtener eventos recientes
    recent_events = crud.get_recent_events(db, trip_id, limit=10)
    
    # Contar eventos por severidad
    event_counts = crud.count_events_by_severity(db, trip_id)
    
    return schemas.TripLiveData(
        trip_id=trip.id,
        status=trip.status,
        driver_name=trip.driver_name or "Conductor",
        current_latitude=trip.current_latitude,
        current_longitude=trip.current_longitude,
        current_speed=trip.current_speed or 0,
        origin=schemas.LocationResponse(
            id=origin.id,
            name=origin.name,
            latitude=origin.latitude,
            longitude=origin.longitude
        ),
        destination=schemas.LocationResponse(
            id=destination.id,
            name=destination.name,
            latitude=destination.latitude,
            longitude=destination.longitude
        ),
        recent_events=recent_events,
        total_events=event_counts["total"],
        critical_events=event_counts["CRITICAL"],
        high_events=event_counts["HIGH"],
        medium_events=event_counts["MEDIUM"]
    )


# ==================== SIMULADOR DE VIAJE ====================

# Almacén de simulaciones activas
active_simulations = {}


async def simulate_trip_movement(trip_id: int, db_session_factory):
    """
    Simula el movimiento del chofer a lo largo de la ruta,
    generando eventos de somnolencia aleatorios.
    """
    db = db_session_factory()
    try:
        trip = crud.get_trip(db, trip_id)
        if not trip:
            return
        
        origin = crud.get_location(db, trip.origin_id)
        destination = crud.get_location(db, trip.destination_id)
        
        # Configuración de la simulación
        total_steps = 50  # Número de pasos para completar el viaje
        step_delay = 2  # Segundos entre cada paso
        
        # Calcular incrementos
        lat_step = (destination.latitude - origin.latitude) / total_steps
        lng_step = (destination.longitude - origin.longitude) / total_steps
        
        current_lat = origin.latitude
        current_lng = origin.longitude
        
        # Tipos de eventos y sus probabilidades
        event_types = [
            ("microsueno", "CRITICAL", 0.05),
            ("cabeceo", "HIGH", 0.08),
            ("bostezo", "MEDIUM", 0.15),
            ("parpadeo_ojos", "HIGH", 0.10),
            ("frotamiento_ojos", "MEDIUM", 0.12)
        ]
        
        for step in range(total_steps):
            # Verificar si la simulación sigue activa
            if trip_id not in active_simulations or not active_simulations[trip_id]:
                break
            
            # Refrescar el trip desde la BD
            db.refresh(trip)
            if trip.status != models.TripStatus.EN_CURSO.value:
                break
            
            # Actualizar posición
            current_lat += lat_step + random.uniform(-0.001, 0.001)
            current_lng += lng_step + random.uniform(-0.001, 0.001)
            speed = random.uniform(60, 100)
            
            crud.update_trip_position(db, trip_id, current_lat, current_lng, speed)
            
            # Generar evento aleatorio
            if random.random() < 0.3:  # 30% de probabilidad de evento
                event_type, severity, _ = random.choice(event_types)
                
                # Ajustar severidad según el tipo
                if event_type == "microsueno":
                    severity = "CRITICAL"
                    duracion = random.uniform(2, 5)
                elif event_type == "cabeceo":
                    severity = random.choice(["HIGH", "MEDIUM"])
                    duracion = random.uniform(3, 6)
                elif event_type == "bostezo":
                    severity = random.choice(["MEDIUM", "LOW"])
                    duracion = random.uniform(120, 300)
                elif event_type == "parpadeo_ojos":
                    severity = random.choice(["HIGH", "MEDIUM"])
                    duracion = random.uniform(30, 90)
                else:  # frotamiento_ojos
                    severity = random.choice(["MEDIUM", "LOW"])
                    duracion = random.uniform(200, 400)
                
                event_data = schemas.DrowsinessEventCreate(
                    tipo_evento=event_type,
                    duracion_segundos=duracion,
                    cantidad_eventos=random.randint(1, 5),
                    nivel_severidad=severity,
                    latitud=current_lat,
                    longitud=current_lng,
                    velocidad_kmh=speed,
                    timestamp_evento=datetime.now(),
                    dispositivo_id=trip.device_id or "tablet_001",
                    version_app="1.0.0",
                    sincronizado_offline=False
                )
                
                crud.create_drowsiness_event(db, trip_id, event_data)
            
            await asyncio.sleep(step_delay)
        
        # Finalizar viaje si se completó la ruta
        if trip_id in active_simulations and active_simulations[trip_id]:
            # Mover a destino final
            crud.update_trip_position(
                db, trip_id, 
                destination.latitude, 
                destination.longitude, 
                0
            )
            crud.end_trip(db, trip_id)
            active_simulations[trip_id] = False
            
    finally:
        db.close()


@app.post("/trips/{trip_id}/simulate/start", tags=["Simulador"])
async def start_simulation(
    trip_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Iniciar simulación de viaje con generación automática de eventos.
    """
    trip = crud.get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    # Si el viaje está pendiente, iniciarlo
    if trip.status == models.TripStatus.PENDIENTE.value:
        crud.start_trip(db, trip_id)
    elif trip.status != models.TripStatus.EN_CURSO.value:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede simular un viaje con estado: {trip.status}"
        )
    
    # Marcar simulación como activa
    active_simulations[trip_id] = True
    
    # Iniciar simulación en segundo plano
    from .database import SessionLocal
    background_tasks.add_task(simulate_trip_movement, trip_id, SessionLocal)
    
    return {
        "message": "Simulación iniciada",
        "trip_id": trip_id,
        "status": "en_curso"
    }


@app.post("/trips/{trip_id}/simulate/stop", tags=["Simulador"])
def stop_simulation(trip_id: int, db: Session = Depends(get_db)):
    """
    Detener simulación de viaje.
    """
    if trip_id in active_simulations:
        active_simulations[trip_id] = False
    
    trip = crud.get_trip(db, trip_id)
    if trip and trip.status == models.TripStatus.EN_CURSO.value:
        crud.end_trip(db, trip_id)
    
    return {
        "message": "Simulación detenida",
        "trip_id": trip_id,
        "status": "completado"
    }
