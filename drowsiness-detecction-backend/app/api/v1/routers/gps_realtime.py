"""
Router WebSocket para GPS en Tiempo Real.

Endpoints:
- /ws/gps/chofer/{id_viaje} - Chofer envía ubicación
- /ws/gps/admin/{id_viaje}  - Admin recibe ubicación
- /gps/stats               - Estadísticas (HTTP)
- /gps/active-trips        - Viajes activos (HTTP)

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import logging
import json
from datetime import datetime
from typing import Optional

from app.api.deps import get_db
from app.services.gps_realtime_manager import gps_realtime_manager
from app.models.user import Usuario
from app.models.viaje import Viaje
from app.core.security import decode_token

logger = logging.getLogger(__name__)

router = APIRouter()


async def verify_websocket_token(token: str, db: Session) -> Optional[Usuario]:
    """
    Verifica el token JWT para conexiones WebSocket.
    
    Args:
        token: JWT token
        db: Sesión de base de datos
        
    Returns:
        Usuario si el token es válido, None en caso contrario
    """
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
        
        user = db.query(Usuario).filter(
            Usuario.id_usuario == int(user_id)
        ).first()
        
        if not user or not user.activo:
            return None
        
        return user
        
    except Exception as e:
        logger.error(f"Error verificando token WebSocket GPS: {e}")
        return None


def verify_viaje_exists(id_viaje: int, db: Session) -> Optional[Viaje]:
    """Verifica que el viaje existe y está activo."""
    return db.query(Viaje).filter(
        Viaje.id_viaje == id_viaje,
        Viaje.estado.in_(['pendiente', 'en_curso'])
    ).first()


# WEBSOCKET PARA CHOFERES (envían ubicación)

@router.websocket("/chofer/{id_viaje}")
async def websocket_gps_chofer(
    websocket: WebSocket,
    id_viaje: int,
    token: str = Query(..., description="JWT Token"),
    db: Session = Depends(get_db)
):
    """
    WebSocket para que el chofer envíe su ubicación GPS.
    
    El chofer se conecta y envía actualizaciones cada 2 segundos:
    ```json
    {
        "type": "GPS_UPDATE",
        "lat": -17.3895,
        "lng": -66.1568,
        "velocidad_kmh": 65.5,
        "heading": 180.0,
        "precision_m": 5.0
    }
    ```
    
    Path params:
        id_viaje: ID del viaje activo
        
    Query params:
        token: JWT token de autenticación
    """
    # 1. Verificar autenticación
    user = await verify_websocket_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Token inválido o expirado")
        return
    
    # 2. Verificar que es chofer
    if user.rol != "chofer":
        await websocket.close(code=4003, reason="Solo choferes pueden enviar GPS")
        return
    
    # 3. Verificar que el viaje existe y pertenece al chofer
    viaje = verify_viaje_exists(id_viaje, db)
    if not viaje:
        await websocket.close(code=4004, reason="Viaje no encontrado o no activo")
        return
    
    if viaje.id_chofer != user.id_usuario:
        await websocket.close(code=4003, reason="El viaje no pertenece a este chofer")
        return
    
    # 4. Conectar
    connected = await gps_realtime_manager.connect_chofer(
        websocket=websocket,
        id_viaje=id_viaje,
        id_chofer=user.id_usuario,
        nombre_chofer=user.nombre_completo
    )
    
    if not connected:
        return
    
    try:
        # 5. Loop de mensajes
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                msg_type = message.get("type", "")
                
                if msg_type == "GPS_UPDATE":
                    gps_data = message.get("data", message)
                    
                    lat = gps_data.get("lat")
                    lng = gps_data.get("lng")
                    
                    # Validar que las coordenadas existen
                    if lat is None or lng is None:
                        logger.warning(f"Coordenadas inválidas recibidas: lat={lat}, lng={lng}")
                        await websocket.send_json({
                            "type": "ERROR",
                            "message": "Coordenadas lat/lng requeridas"
                        })
                        continue
                    
                    # Actualizar posición
                    await gps_realtime_manager.update_chofer_position(
                        id_viaje=id_viaje,
                        lat=float(lat),
                        lng=float(lng),
                        velocidad_kmh=gps_data.get("velocidad_kmh"),
                        heading=gps_data.get("heading"),
                        precision_m=gps_data.get("precision_m"),
                        timestamp=datetime.fromisoformat(gps_data["timestamp"]) if gps_data.get("timestamp") else None
                    )
                    
                elif msg_type == "PING":
                    await websocket.send_json({
                        "type": "PONG",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                elif msg_type == "GPS_STOP":
                    logger.info(f"Chofer {user.id_usuario} detuvo GPS viaje {id_viaje}")
                    break
                    
            except json.JSONDecodeError:
                if data == "ping":
                    await websocket.send_text("pong")
                    
            except Exception as e:
                logger.error(f"Error procesando mensaje GPS chofer: {e}")
                await websocket.send_json({
                    "type": "ERROR",
                    "message": str(e)
                })
                
    except WebSocketDisconnect:
        logger.info(f"Chofer {user.id_usuario} desconectado GPS viaje {id_viaje}")
    except Exception as e:
        logger.error(f"Error en WebSocket GPS chofer: {e}")
    finally:
        await gps_realtime_manager.disconnect_chofer(id_viaje)


# WEBSOCKET PARA ADMINS (reciben ubicación)

@router.websocket("/admin/{id_viaje}")
async def websocket_gps_admin(
    websocket: WebSocket,
    id_viaje: int,
    token: str = Query(..., description="JWT Token"),
    db: Session = Depends(get_db)
):
    """
    WebSocket para que el admin reciba ubicaciones GPS de un viaje.
    
    El admin se suscribe y recibe actualizaciones en tiempo real:
    ```json
    {
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
    ```
    
    También recibe notificaciones de conexión/desconexión:
    ```json
    {
        "type": "CHOFER_CONNECTED" | "CHOFER_DISCONNECTED",
        "id_viaje": 123,
        "nombre_chofer": "Juan Pérez",
        "mensaje": "Chofer conectado/desconectado"
    }
    ```
    
    Path params:
        id_viaje: ID del viaje a observar
        
    Query params:
        token: JWT token de autenticación
    """
    # 1. Verificar autenticación
    user = await verify_websocket_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Token inválido o expirado")
        return
    
    # 2. Verificar que es admin
    if user.rol != "admin":
        await websocket.close(code=4003, reason="Solo admins pueden monitorear GPS")
        return
    
    # 3. Verificar que el viaje existe
    viaje = db.query(Viaje).filter(Viaje.id_viaje == id_viaje).first()
    if not viaje:
        await websocket.close(code=4004, reason="Viaje no encontrado")
        return
    
    # 4. Suscribir
    subscribed = await gps_realtime_manager.subscribe_admin(
        websocket=websocket,
        id_viaje=id_viaje,
        user_id=user.id_usuario
    )
    
    if not subscribed:
        return
    
    try:
        # 5. Mantener conexión abierta
        while True:
            data = await websocket.receive_text()
            
            # Responder a pings
            if data == "ping":
                await websocket.send_text("pong")
            else:
                try:
                    message = json.loads(data)
                    if message.get("type") == "PING":
                        await websocket.send_json({
                            "type": "PONG",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                except json.JSONDecodeError:
                    pass
                    
    except WebSocketDisconnect:
        logger.info(f"Admin {user.id_usuario} desuscrito de GPS viaje {id_viaje}")
    except Exception as e:
        logger.error(f"Error en WebSocket GPS admin: {e}")
    finally:
        await gps_realtime_manager.unsubscribe_admin(id_viaje, user.id_usuario)


# ENDPOINTS HTTP AUXILIARES

@router.get(
    "/stats",
    summary="Estadísticas GPS en Tiempo Real",
    description="Obtiene estadísticas del sistema de GPS en tiempo real"
)
async def get_gps_stats():
    """
    Obtiene estadísticas del sistema GPS.
    
    Returns:
        Estadísticas de conexiones y actualizaciones
    """
    return {
        "status": "ok",
        "gps_realtime": gps_realtime_manager.get_stats()
    }


@router.get(
    "/active-trips",
    summary="Viajes con GPS Activo",
    description="Lista de viajes que tienen GPS en tiempo real activo"
)
async def get_active_gps_trips():
    """
    Obtiene lista de viajes con GPS activo.
    
    Returns:
        Lista de viajes con información del chofer y última posición
    """
    return {
        "status": "ok",
        "trips": gps_realtime_manager.get_active_trips()
    }


@router.get(
    "/trip/{id_viaje}/status",
    summary="Estado GPS de un Viaje",
    description="Obtiene el estado actual del GPS de un viaje específico"
)
async def get_trip_gps_status(id_viaje: int):
    """
    Obtiene el estado GPS de un viaje específico.
    
    Args:
        id_viaje: ID del viaje
        
    Returns:
        Estado de conexión y última posición conocida
    """
    is_connected = gps_realtime_manager.is_chofer_connected(id_viaje)
    last_position = gps_realtime_manager.get_chofer_last_position(id_viaje)
    admins_watching = gps_realtime_manager.get_subscribed_admins_count(id_viaje)
    
    return {
        "id_viaje": id_viaje,
        "chofer_connected": is_connected,
        "last_position": last_position,
        "admins_watching": admins_watching
    }