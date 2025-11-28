import cv2
import base64
import logging
import math
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.user import Usuario
from app.drowsiness_processor.main import SistemaDeteccionSomnolencia
from app.models.posicion_viaje import PosicionViaje
from app.models.sesion import SesionViaje
from app.crud import reporte as crud_reporte
from app.crud.monitoring import obtener_metricas_monitoreo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def punto_final_websocket_monitoreo(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    """
    Endpoint WebSocket para monitoreo en tiempo real
    
    Flujo:
    1. Cliente se conecta
    2. Cliente envía cuadros de video en base64
    3. Servidor procesa con SistemaDeteccionSomnolencia
    4. Servidor retorna: imagen_original, imagen_bosquejo, reporte_json
    """
    
    # Inicializar sistema de detección
    sistema_deteccion_somnolencia = SistemaDeteccionSomnolencia()
    
    await websocket.accept()
    logger.info("Cliente WebSocket conectado al sistema de monitoreo")
    
    conteo_cuadros = 0
    
    try:
        while True:
            # Recibir cuadro del cliente
            datos = await websocket.receive_text()
            
            try:
                # Procesar cuadro con el sistema de detección
                imagen_original, bosquejo, reporte_json = sistema_deteccion_somnolencia.ejecutar(datos)
                
                # Configurar compresión JPEG (80% calidad)
                parametro_codificacion = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
                
                # Codificar bosquejo a base64
                _, buffer_bosquejo = cv2.imencode('.jpg', bosquejo, parametro_codificacion)
                bosquejo_base64 = base64.b64encode(buffer_bosquejo).decode('utf-8')
                
                # Codificar imagen original a base64
                _, buffer_imagen_original = cv2.imencode('.jpg', imagen_original, parametro_codificacion)
                imagen_original_base64 = base64.b64encode(buffer_imagen_original).decode('utf-8')
                
                # Enviar respuesta al cliente
                await websocket.send_json({
                    "reporte_json": reporte_json,
                    "imagen_bosquejo": bosquejo_base64,
                    "imagen_original": imagen_original_base64,
                })
                
                # Logging cada 30 cuadros
                conteo_cuadros += 1
                if conteo_cuadros % 30 == 0:
                    logger.info(f"Cuadros procesados: {conteo_cuadros}")
                    
            except Exception as e:
                logger.error(f"Error al procesar cuadro: {str(e)}", exc_info=True)
                # Enviar error al cliente pero mantener conexión
                await websocket.send_json({
                    "error": str(e),
                    "reporte_json": {},
                    "imagen_bosquejo": "",
                    "imagen_original": "",
                })
    
    except WebSocketDisconnect:
        logger.info("Cliente WebSocket desconectado del sistema de monitoreo")
    except Exception as e:
        logger.error(f"Error en WebSocket de monitoreo: {str(e)}", exc_info=True)


@router.get("/status")
async def estado_monitoreo(
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Endpoint para verificar el estado del sistema de monitoreo
    
    Requiere autenticación
    """
    return {
        "estado": "operacional",
        "usuario": usuario_actual.usuario,
        "rol": usuario_actual.rol,
        "mensaje": "Sistema de monitoreo disponible"
    }


@router.get("/viajes-activos")
def viajes_activos(
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin_user)
):
    """Lista de sesiones de viaje activas con última posición y métricas."""
    data = crud_reporte.obtener_viajes_activos_con_ultima_posicion(db)
    return {"viajes": data, "total": len(data)}


@router.get("/metrics")
def metrics_monitoreo(
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin_user)
):
    """Métricas para cabecera de monitoreo de viajes."""
    return obtener_metricas_monitoreo(db)


@router.get("/viaje/{id_sesion}/posiciones")
def posiciones_viaje(
    id_sesion: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin_user)
):
    """Posiciones paginadas de una sesión."""
    # Verificar existencia sesión
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    posiciones, total = crud_reporte.obtener_posiciones_por_sesion(db, id_sesion, limit=limit, skip=skip)
    return {
        "id_sesion": id_sesion,
        "total": total,
        "skip": skip,
        "limit": limit,
        "posiciones": [
            {
                "id_posicion": p.id_posicion,
                "lat": p.lat,
                "lng": p.lng,
                "velocidad": p.velocidad,
                "heading": p.heading,
                "timestamp": p.timestamp
            } for p in posiciones
        ]
    }


@router.post("/viaje/{id_sesion}/posicion")
def registrar_posicion(
    id_sesion: int,
    lat: float,
    lng: float,
    velocidad: float | None = None,
    heading: float | None = None,
    origen: str | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Registrar posición actual del chofer; requiere que la sesión esté activa y pertenezca al chofer."""
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    if sesion.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado para registrar posición en esta sesión")
    if sesion.estado != 'activa':
        raise HTTPException(status_code=400, detail="La sesión no está activa")

    # Registrar posición
    posicion = PosicionViaje(
        id_sesion=id_sesion,
        lat=lat,
        lng=lng,
        velocidad=velocidad,
        heading=heading,
        origen=origen or 'device'
    )
    db.add(posicion)

    # Si no hay ubicación inicio definida, establecerla
    if not sesion.ubicacion_inicio:
        sesion.ubicacion_inicio = f"{lat},{lng}"

    db.commit()
    db.refresh(posicion)
    return {
        "status": "ok",
        "id_posicion": posicion.id_posicion,
        "timestamp": posicion.timestamp
    }


@router.post("/viaje/{id_sesion}/posicion-test")
def registrar_posicion_test(
    id_sesion: int,
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin_user)
):
    """Insertar una posición de prueba (admin) para la sesión activa.

    Genera un ligero desplazamiento respecto a la última posición o un punto fijo si no existen posiciones.
    Facilita pruebas sin necesidad del dispositivo del chofer.
    """
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    if sesion.estado != 'activa':
        raise HTTPException(status_code=400, detail="La sesión no está activa")

    ultima = db.query(PosicionViaje).filter(PosicionViaje.id_sesion == id_sesion).order_by(PosicionViaje.id_posicion.desc()).first()
    if not ultima:
        base_lat, base_lng = -16.5, -68.15
    else:
        base_lat, base_lng = ultima.lat, ultima.lng

    # Desplazamiento pequeño pseudo-aleatorio
    import random
    delta_lat = (random.random() - 0.5) * 0.0005
    delta_lng = (random.random() - 0.5) * 0.0005
    nueva = PosicionViaje(
        id_sesion=id_sesion,
        lat=base_lat + delta_lat,
        lng=base_lng + delta_lng,
        velocidad=round(random.uniform(20, 80), 2),
        heading=round(random.uniform(0, 359), 2),
        origen='test'
    )
    if not sesion.ubicacion_inicio:
        sesion.ubicacion_inicio = f"{nueva.lat},{nueva.lng}"
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {
        "status": "ok",
        "id_posicion": nueva.id_posicion,
        "lat": nueva.lat,
        "lng": nueva.lng,
        "timestamp": nueva.timestamp
    }


@router.post("/viaje/{id_sesion}/finalizar")
def finalizar_viaje(
    id_sesion: int,
    lat: float | None = None,
    lng: float | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Finalizar sesión de viaje: set fecha_fin, estado, duración y ubicación final."""
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    if sesion.id_usuario != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado para finalizar esta sesión")
    if sesion.estado != 'activa':
        raise HTTPException(status_code=400, detail="La sesión ya no está activa")

    from datetime import datetime
    sesion.fecha_fin = datetime.utcnow()
    if lat is not None and lng is not None:
        sesion.ubicacion_fin = f"{lat},{lng}"
    # Calcular duración en minutos
    if sesion.fecha_inicio and sesion.fecha_fin:
        duracion = (sesion.fecha_fin - sesion.fecha_inicio).total_seconds() / 60.0
        sesion.duracion_minutos = int(duracion)
    sesion.estado = 'finalizada'

    db.commit()
    db.refresh(sesion)
    return {"status": "ok", "id_sesion": sesion.id_sesion, "duracion_minutos": sesion.duracion_minutos}


@router.websocket("/viaje/{id_sesion}/stream")
async def stream_viaje(
    websocket: WebSocket,
    id_sesion: int,
    db: Session = Depends(get_db)
):
    """WebSocket para enviar posiciones y alertas recientes de un viaje."""
    # Validar existencia de la sesión antes de aceptar
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        await websocket.close(code=4404)
        return

    await websocket.accept()
    logger.info(f"WebSocket viaje {id_sesion} conectado")
    last_pos_id = None
    last_alert_id = None

    from app.models.sesion import AlertaSomnolencia

    try:
        while True:
            # Esperar un mensaje del cliente o timeout para enviar heartbeat
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=2.0)
            except asyncio.TimeoutError:
                pass  # Enviamos actualización aunque no haya mensaje
            except WebSocketDisconnect:
                logger.info(f"WebSocket viaje {id_sesion} desconectado por cliente")
                break

            nuevas_pos = db.query(PosicionViaje).filter(
                PosicionViaje.id_sesion == id_sesion,
                (PosicionViaje.id_posicion > last_pos_id) if last_pos_id else True
            ).order_by(PosicionViaje.id_posicion.asc()).all()
            if nuevas_pos:
                last_pos_id = nuevas_pos[-1].id_posicion

            nuevas_alertas = db.query(AlertaSomnolencia).filter(
                AlertaSomnolencia.id_sesion == id_sesion,
                (AlertaSomnolencia.id_alerta > last_alert_id) if last_alert_id else True
            ).order_by(AlertaSomnolencia.id_alerta.asc()).all()
            if nuevas_alertas:
                last_alert_id = nuevas_alertas[-1].id_alerta

            # Sólo enviar si hay novedades o cada X segundos (heartbeat)
            payload = {
                "posiciones": [
                    {
                        "id_posicion": p.id_posicion,
                        "lat": p.lat,
                        "lng": p.lng,
                        "velocidad": p.velocidad,
                        "heading": p.heading,
                        "timestamp": p.timestamp.isoformat() if p.timestamp else None
                    } for p in nuevas_pos
                ],
                "alertas": [
                    {
                        "id_alerta": a.id_alerta,
                        "tipo_alerta": a.tipo_alerta,
                        "severidad": a.severidad,
                        "duracion_segundos": a.duracion_segundos,
                        "timestamp_alerta": a.timestamp_alerta.isoformat() if a.timestamp_alerta else None
                    } for a in nuevas_alertas
                ],
                "heartbeat": True if not nuevas_pos and not nuevas_alertas else False
            }
            try:
                await websocket.send_json(payload)
            except WebSocketDisconnect:
                logger.info(f"WebSocket viaje {id_sesion} desconectado al enviar")
                break
    except Exception as e:
        logger.error(f"Error en stream viaje {id_sesion}: {e}", exc_info=True)
        try:
            await websocket.close()
        except Exception:
            pass


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distancia Haversine en kilómetros entre dos puntos."""
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/viaje/{id_sesion}/info")
def info_viaje(
    id_sesion: int,
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin_user)
):
    """Información detallada del viaje para panel (chofer, métricas, distancia)."""
    sesion = db.query(SesionViaje).filter(SesionViaje.id_sesion == id_sesion).first()
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Cargar posiciones para distancia (simple; optimizar con acumulado si crece).
    posiciones = db.query(PosicionViaje).filter(PosicionViaje.id_sesion == id_sesion).order_by(PosicionViaje.id_posicion.asc()).all()
    distancia_km = 0.0
    for i in range(1, len(posiciones)):
        p1 = posiciones[i - 1]
        p2 = posiciones[i]
        distancia_km += _haversine(p1.lat, p1.lng, p2.lat, p2.lng)

    chofer = sesion.usuario

    return {
        "id_sesion": sesion.id_sesion,
        "estado": sesion.estado,
        "nivel_alerta": sesion.nivel_alerta,
        "fecha_inicio": sesion.fecha_inicio,
        "fecha_fin": sesion.fecha_fin,
        "duracion_minutos": sesion.duracion_minutos,
        "ruta_nombre": sesion.ruta_nombre,
        "ubicacion_inicio": sesion.ubicacion_inicio,
        "ubicacion_fin": sesion.ubicacion_fin,
        "distancia_km": round(distancia_km, 3),
        "contadores": {
            "microsuenos": sesion.total_microsuenos,
            "bostezos": sesion.total_bostezos,
            "parpadeos_excesivos": sesion.total_parpadeos_excesivos,
            "cabeceos": sesion.total_cabeceos,
            "frotamiento_ojos": sesion.total_frotamiento_ojos,
            "total_alertas": sesion.total_alertas,
        },
        "chofer": {
            "id_usuario": chofer.id_usuario if chofer else None,
            "nombre_completo": chofer.nombre_completo if chofer else None,
            "email": chofer.email if chofer else None,
            "dni_ci": chofer.dni_ci if chofer else None,
            "telefono": chofer.telefono if chofer else None,
            "ciudad": chofer.ciudad if chofer else None,
            "numero_licencia": chofer.numero_licencia if chofer else None,
            "categoria_licencia": chofer.categoria_licencia if chofer else None,
            "tipo_chofer": chofer.tipo_chofer if chofer else None,
            "empresa": chofer.nombre_empresa if chofer else None,
        }
    }
