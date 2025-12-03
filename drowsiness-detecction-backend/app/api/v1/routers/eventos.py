"""
Router de Eventos de Somnolencia.

Endpoints para crear, consultar y gestionar eventos de somnolencia
detectados por la aplicación móvil.

"""
import logging  

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_user, get_current_admin_user, get_current_chofer_user
from app.models.user import Usuario
from app.crud import evento_somnolencia as crud_eventos
from app.crud.user import user as crud_user  
from app.schemas.evento_somnolencia import (
    EventoSomnolenciaCreate,
    EventoSomnolenciaBatch,
    EventoSomnolenciaResponse,
    EventoResumen,
    EventoConChofer,
    EstadisticasChofer,
    EstadisticasGenerales,
    TipoEvento,
    NivelSeveridad
)

# Import del servicio de notificaciones
from app.services.evento_notification_service import evento_notification_service
from app.schemas.notificacion_somnolencia import EventoSomnolenciaWS

logger = logging.getLogger(__name__)  

router = APIRouter()


@router.post(
    "/",
    response_model=EventoSomnolenciaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear evento de somnolencia",
    description="Registra un nuevo evento de somnolencia detectado"
)
async def crear_evento_somnolencia(
    evento_in: EventoSomnolenciaCreate,
    
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Crear un evento de somnolencia**
    
    Usado por la app móvil Android cuando detecta un evento.
    El chofer solo puede crear eventos propios (id_chofer se toma del token).
    
    **Tipos de evento:**
    - `microsueno`: Ojos cerrados >= 2 segundos
    - `cabeceo`: Cabeza inclinada >= 3 segundos  
    - `parpadeo_ojos`: > 20 parpadeos en 60 segundos
    - `bostezo`: > 3 bostezos en 180 segundos
    - `frotamiento_ojos`: > 3 frotamientos en 300 segundos
    """
    # Verificar que es chofer
    if current_user.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los choferes pueden registrar eventos de somnolencia"
        )
    
    # Crear evento en DB
    evento = crud_eventos.crear_evento(
        db=db,
        evento=evento_in,
        id_chofer=current_user.id_usuario
    )
    
    # ← NUEVO: Notificar a admins conectados
    try:
        evento_ws = EventoSomnolenciaWS(
            id_viaje=evento.id_viaje,
            id_chofer=evento.id_chofer,
            tipo_evento=evento.tipo_evento,
            nivel_severidad=evento.nivel_severidad,
            duracion_segundos=evento.duracion_segundos,
            timestamp_evento=evento.timestamp_evento.isoformat(),
            latitud=evento.latitud,
            longitud=evento.longitud,
            velocidad_kmh=evento.velocidad_kmh,
            ear_promedio=evento.ear_promedio,
            mar_promedio=evento.mar_promedio
        )
        
        # Obtener nombre del chofer
        chofer = db.query(Usuario).filter(Usuario.id_usuario == evento.id_chofer).first()
        nombre_chofer = chofer.nombre_completo if chofer else "Chofer desconocido"
        
        # Notificar (no esperamos respuesta, fire-and-forget)
        import asyncio
        asyncio.create_task(
            evento_notification_service.notificar_evento(evento_ws, nombre_chofer)
        )
        
    except Exception as e:
        logger.warning(f"Error enviando notificación de evento: {e}")
    
    return evento



@router.post(
    "/batch",
    response_model=List[EventoSomnolenciaResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Crear eventos en lote (sync offline)",
    description="Sincroniza múltiples eventos acumulados durante periodo offline."
)
async def crear_eventos_batch(
    batch: EventoSomnolenciaBatch,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Crear múltiples eventos en lote**
    
    Usado cuando el chofer recupera conexión a internet y necesita
    sincronizar eventos que se guardaron localmente durante el periodo offline.
    
    - Máximo 100 eventos por request
    - Todos los eventos se crean en una sola transacción
    """
    logger.info(f"📦 Recibiendo batch de {len(batch.eventos)} eventos de chofer {current_user.id_usuario}")
    
    # Verificar que es chofer
    if current_user.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los choferes pueden registrar eventos de somnolencia"
        )
    
    try:
        # Crear eventos en lote
        db_eventos = crud_eventos.crear_eventos_batch(
            db=db,
            eventos=batch.eventos,
            id_chofer=current_user.id_usuario
        )
        
        logger.info(f"✅ Batch creado: {len(db_eventos)} eventos guardados")
        
        # Notificar eventos críticos en background (no bloquea la respuesta)
        # Usar try/except para que si falla la notificación, no falle el endpoint
        try:
            background_tasks.add_task(
                evento_notification_service.notify_evento_batch,
                eventos=db_eventos,
                db=db
            )
        except Exception as notif_error:
            logger.warning(f"⚠️ Error agregando tarea de notificación: {notif_error}")
        
        return db_eventos
        
    except Exception as e:
        logger.error(f"❌ Error creando batch: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando eventos: {str(e)}"
        )


# ENDPOINTS PARA CONSULTAR EVENTOS

@router.get(
    "/mis-eventos",
    response_model=List[EventoResumen],
    summary="Obtener mis eventos (chofer)",
    description="El chofer obtiene sus propios eventos de somnolencia."
)
def obtener_mis_eventos(
    limite: int = Query(50, ge=1, le=200, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación"),
    dias: int = Query(7, ge=1, le=90, description="Eventos de los últimos X días"),
    tipo_evento: Optional[TipoEvento] = Query(None, description="Filtrar por tipo"),
    nivel_severidad: Optional[NivelSeveridad] = Query(None, description="Filtrar por severidad"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener eventos propios (para chofer)**
    
    Permite al chofer ver su historial de eventos de somnolencia.
    """
    if current_user.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este endpoint es solo para choferes"
        )
    
    desde = datetime.utcnow() - timedelta(days=dias)
    
    eventos = crud_eventos.obtener_eventos_por_chofer(
        db=db,
        id_chofer=current_user.id_usuario,
        limite=limite,
        offset=offset,
        desde=desde,
        tipo_evento=tipo_evento.value if tipo_evento else None,
        nivel_severidad=nivel_severidad.value if nivel_severidad else None
    )
    
    return eventos


@router.get(
    "/chofer/{id_chofer}",
    response_model=List[EventoResumen],
    summary="Obtener eventos de un chofer (admin)",
    description="Admin obtiene eventos de cualquier chofer."
)
def obtener_eventos_chofer(
    id_chofer: int,
    limite: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    dias: int = Query(7, ge=1, le=90),
    tipo_evento: Optional[TipoEvento] = Query(None),
    nivel_severidad: Optional[NivelSeveridad] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener eventos de un chofer específico (solo admin)**
    """
    # Solo admin puede ver eventos de otros
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este endpoint"
        )
    
    
    chofer = crud_user.get_by_id(db, user_id=id_chofer)
    if not chofer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chofer con ID {id_chofer} no encontrado"
        )
    
    desde = datetime.utcnow() - timedelta(days=dias)
    
    eventos = crud_eventos.obtener_eventos_por_chofer(
        db=db,
        id_chofer=id_chofer,
        limite=limite,
        offset=offset,
        desde=desde,
        tipo_evento=tipo_evento.value if tipo_evento else None,
        nivel_severidad=nivel_severidad.value if nivel_severidad else None
    )
    
    return eventos


@router.get(
    "/viaje/{id_viaje}",
    response_model=List[EventoResumen],
    summary="Obtener eventos de un viaje",
    description="Obtiene todos los eventos ocurridos durante un viaje específico."
)
def obtener_eventos_viaje(
    id_viaje: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener todos los eventos de un viaje específico**
    
    - Admin: Puede ver cualquier viaje
    - Chofer: Solo puede ver sus propios viajes
    """
    eventos = crud_eventos.obtener_eventos_por_viaje(db, id_viaje)
    
    # Si es chofer, verificar que el viaje le pertenece
    if current_user.rol == "chofer" and eventos:
        if eventos[0].id_chofer != current_user.id_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver este viaje"
            )
    
    return eventos


@router.get(
    "/recientes",
    response_model=List[EventoConChofer],
    summary="Obtener eventos recientes (admin)",
    description="Dashboard admin: eventos de los últimos X minutos."
)
def obtener_eventos_recientes(
    minutos: int = Query(60, ge=5, le=1440, description="Últimos X minutos"),
    limite: int = Query(100, ge=1, le=500),
    solo_criticos: bool = Query(False, description="Solo eventos CRITICAL y HIGH"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener eventos recientes para dashboard admin**
    
    Usado para monitoreo en tiempo real. Retorna eventos
    de todos los choferes en los últimos X minutos.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este endpoint"
        )
    
    eventos = crud_eventos.obtener_eventos_recientes(
        db=db,
        minutos=minutos,
        limite=limite,
        solo_criticos=solo_criticos
    )
    
    # Agregar nombre del chofer
    resultado = []
    for evento in eventos:
        evento_dict = {
            "id_evento": evento.id_evento,
            "tipo_evento": evento.tipo_evento,
            "nivel_severidad": evento.nivel_severidad,
            "duracion_segundos": float(evento.duracion_segundos) if evento.duracion_segundos else None,
            "cantidad_eventos": evento.cantidad_eventos,
            "timestamp_evento": evento.timestamp_evento,
            "latitud": float(evento.latitud) if evento.latitud else None,
            "longitud": float(evento.longitud) if evento.longitud else None,
            "velocidad_kmh": evento.velocidad_kmh,
            "nombre_chofer": evento.chofer.nombre_completo if evento.chofer else None
        }
        resultado.append(EventoConChofer(**evento_dict))
    
    return resultado


# ENDPOINTS DE ESTADÍSTICAS

@router.get(
    "/estadisticas/mis-estadisticas",
    response_model=EstadisticasChofer,
    summary="Mis estadísticas (chofer)",
    description="El chofer obtiene sus propias estadísticas."
)
def obtener_mis_estadisticas(
    dias: int = Query(7, ge=1, le=90, description="Estadísticas de los últimos X días"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener estadísticas propias (para chofer)**
    """
    if current_user.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este endpoint es solo para choferes"
        )
    
    stats = crud_eventos.obtener_estadisticas_chofer(
        db=db,
        id_chofer=current_user.id_usuario,
        dias=dias
    )
    
    return EstadisticasChofer(
        id_chofer=current_user.id_usuario,
        nombre_chofer=current_user.nombre_completo,
        periodo_dias=dias,
        **stats
    )


@router.get(
    "/estadisticas/chofer/{id_chofer}",
    response_model=EstadisticasChofer,
    summary="Estadísticas de un chofer (admin)",
    description="Admin obtiene estadísticas de cualquier chofer."
)
def obtener_estadisticas_chofer(
    id_chofer: int,
    dias: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Obtener estadísticas de un chofer específico (solo admin)**
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este endpoint"
        )
    
    chofer = crud_user.get_by_id(db, user_id=id_chofer)
    if not chofer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chofer con ID {id_chofer} no encontrado"
        )
    
    stats = crud_eventos.obtener_estadisticas_chofer(
        db=db,
        id_chofer=id_chofer,
        dias=dias
    )
    
    return EstadisticasChofer(
        id_chofer=id_chofer,
        nombre_chofer=chofer.nombre_completo,
        periodo_dias=dias,
        **stats
    )


@router.get(
    "/estadisticas/generales",
    response_model=EstadisticasGenerales,
    summary="Estadísticas generales (admin)",
    description="Dashboard admin: estadísticas de todo el sistema."
)
def obtener_estadisticas_generales(
    dias: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    **Estadísticas generales del sistema (solo admin)**
    
    Incluye:
    - Total de eventos
    - Eventos por tipo
    - Eventos por severidad
    - Top 5 choferes con más eventos
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este endpoint"
        )
    
    stats = crud_eventos.obtener_estadisticas_generales(db, dias)
    
    return EstadisticasGenerales(**stats)