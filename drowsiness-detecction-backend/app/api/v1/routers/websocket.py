"""
Router WebSocket para conexiones en tiempo real.

Endpoints:
- /ws/admin - Conexión para administradores (notificaciones)
- /ws/chofer/{id_viaje} - Conexión para choferes (enviar eventos)
- /ws/monitor - Conexión para dashboards de monitoreo
- /ws/stats - Estadísticas de conexiones (HTTP)

@author Sistema de Detección de Somnolencia
@version 1.0
"""

import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.api.deps import get_db
from app.services.connection_manager import (
    connection_manager,
    ConnectionType,
    WebSocketMessage
)
from app.services.notification_service import notification_service
from app.services.evento_notification_service import evento_notification_service
from app.models.user import Usuario
from app.models.viaje import Viaje
from app.core.security import decode_token
from app.schemas.notificacion_somnolencia import EventoSomnolenciaWS

logger = logging.getLogger(__name__)

router = APIRouter()


async def verify_websocket_token(token: str, db: Session) -> Optional[Usuario]:
    """
    Verifica el token JWT para conexiones WebSocket.
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
        logger.error(f"Error verificando token WebSocket: {e}")
        return None


@router.websocket("/admin")
async def websocket_admin_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Token de autenticación"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint para administradores.
    
    Recibe notificaciones de:
    - Eventos de somnolencia (NOTIF_SOMNOLENCIA)
    - Batches de eventos sincronizados (NOTIF_BATCH)
    - Alertas de choferes
    - Notificaciones del sistema
    
    Query params:
        token: JWT token de autenticación
    """
    # Verificar autenticación
    user = await verify_websocket_token(token, db)
    
    if not user:
        await websocket.close(code=4001, reason="Token inválido")
        return
    
    # Verificar que sea admin
    if user.rol != "admin":
        await websocket.close(code=4003, reason="Acceso denegado - Solo admins")
        return
    
    user_id = user.id_usuario
    
    # Conectar
    connected = await connection_manager.connect(
        websocket=websocket,
        user_id=user_id,
        connection_type=ConnectionType.ADMIN
    )
    
    if not connected:
        await websocket.close(code=4000, reason="Error de conexión")
        return
    
    logger.info(f"🔌 Admin conectado para notificaciones: {user.nombre_completo} (ID: {user_id})")
    
    # Enviar confirmación de conexión
    await websocket.send_json({
        "type": "CONNECTION_ESTABLISHED",
        "user_id": user_id,
        "user_name": user.nombre_completo,
        "message": "Conectado al sistema de notificaciones",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    try:
        while True:
            # Recibir mensajes del admin (ping, subscribe, etc.)
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_admin_message(user_id, message, websocket)
            except json.JSONDecodeError:
                logger.warning(f"Mensaje no-JSON de admin {user_id}: {data}")
                
    except WebSocketDisconnect:
        logger.info(f"🔌 Admin desconectado: {user.nombre_completo}")
    except Exception as e:
        logger.error(f"Error en WebSocket admin {user_id}: {e}")
    finally:
        await connection_manager.disconnect(user_id, ConnectionType.ADMIN)


# ═══════════════════════════════════════════════════════════════
# NUEVO: WebSocket para Choferes (enviar eventos de somnolencia)
# ═══════════════════════════════════════════════════════════════

@router.websocket("/chofer/{id_viaje}")
async def websocket_chofer_eventos(
    websocket: WebSocket,
    id_viaje: int,
    token: str = Query(..., description="JWT Token"),
    db: Session = Depends(get_db)
):
    """
    WebSocket para que el chofer envíe eventos de somnolencia en tiempo real.
    """
    logger.info("═══════════════════════════════════════")
    logger.info(f"🔌 NUEVA CONEXIÓN WS EVENTOS")
    logger.info(f"   Viaje ID: {id_viaje}")
    logger.info(f"   Token: {token[:20]}...")
    logger.info("═══════════════════════════════════════")
    
    # 1. Verificar autenticación
    user = await verify_websocket_token(token, db)
    if not user:
        logger.error(f"❌ Token inválido para viaje {id_viaje}")
        await websocket.close(code=4001, reason="Token inválido")
        return
    
    logger.info(f"✅ Usuario autenticado: {user.nombre_completo} (ID: {user.id_usuario})")
    
    # 2. Verificar que es chofer
    if user.rol != "chofer":
        logger.error(f"❌ Usuario {user.id_usuario} no es chofer (rol: {user.rol})")
        await websocket.close(code=4003, reason="Solo choferes pueden conectar")
        return
    
    # 3. Verificar viaje
    viaje = db.query(Viaje).filter(
        Viaje.id_viaje == id_viaje,
        Viaje.id_chofer == user.id_usuario,
        Viaje.estado.in_(['pendiente', 'en_curso'])
    ).first()
    
    if not viaje:
        logger.error(f"❌ Viaje {id_viaje} no encontrado o no pertenece al chofer {user.id_usuario}")
        await websocket.close(code=4004, reason="Viaje no encontrado")
        return
    
    logger.info(f"✅ Viaje verificado: {viaje.origen} → {viaje.destino}")
    
    # 4. Aceptar conexión
    await websocket.accept()
    
    logger.info(f"═══════════════════════════════════════")
    logger.info(f"✅ CHOFER CONECTADO PARA EVENTOS")
    logger.info(f"   Chofer: {user.nombre_completo}")
    logger.info(f"   Viaje: {id_viaje}")
    logger.info(f"═══════════════════════════════════════")
    
    # Enviar confirmación
    await websocket.send_json({
        "type": "CONNECTION_ESTABLISHED",
        "id_viaje": id_viaje,
        "id_chofer": user.id_usuario,
        "message": "Conectado al sistema de eventos",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"📩 Mensaje recibido de chofer {user.nombre_completo}: {data[:100]}...")
            
            try:
                message = json.loads(data)
                await handle_chofer_evento_message(message, user, id_viaje, websocket)
            except json.JSONDecodeError:
                logger.warning(f"Mensaje no es JSON válido: {data}")
                
    except WebSocketDisconnect:
        logger.info(f"🔌 Chofer {user.nombre_completo} desconectado de eventos (viaje {id_viaje})")
    except Exception as e:
        logger.error(f"❌ Error en WebSocket eventos: {e}")
    finally:
        logger.info(f"🔴 Conexión eventos finalizada para viaje {id_viaje}")


async def handle_chofer_evento_message(
    message: dict,
    user: Usuario,
    id_viaje: int,
    websocket: WebSocket
):
    """
    Maneja mensajes de eventos del chofer.
    """
    msg_type = message.get("type", "")
    
    if msg_type == "PING":
        await websocket.send_json({"type": "PONG"})
        return
    
    if msg_type == "EVENTO_SOMNOLENCIA":
        # Evento individual
        try:
            evento = EventoSomnolenciaWS(
                type="EVENTO_SOMNOLENCIA",
                id_viaje=id_viaje,
                id_chofer=user.id_usuario,
                tipo_evento=message.get("tipo_evento", "desconocido"),
                nivel_severidad=message.get("nivel_severidad", "MEDIUM"),
                duracion_segundos=message.get("duracion_segundos", 0),
                timestamp_evento=message.get("timestamp_evento", datetime.utcnow().isoformat()),
                latitud=message.get("latitud"),
                longitud=message.get("longitud"),
                velocidad_kmh=message.get("velocidad_kmh"),
                ear_promedio=message.get("ear_promedio"),
                mar_promedio=message.get("mar_promedio")
            )
            
            # Notificar a admins
            sent_count = await evento_notification_service.notificar_evento(
                evento=evento,
                nombre_chofer=user.nombre_completo
            )
            
            # Confirmar al chofer
            await websocket.send_json({
                "type": "EVENTO_RECIBIDO",
                "tipo_evento": evento.tipo_evento,
                "admins_notificados": sent_count,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(
                f"📤 Evento {evento.tipo_evento} de {user.nombre_completo} "
                f"→ {sent_count} admins notificados"
            )
            
        except Exception as e:
            logger.error(f"Error procesando evento: {e}")
            await websocket.send_json({
                "type": "ERROR",
                "message": f"Error procesando evento: {str(e)}"
            })
    
    elif msg_type == "EVENTOS_BATCH":
        # Batch de eventos (sincronización offline)
        eventos = message.get("eventos", [])
        
        if eventos:
            sent_count = await evento_notification_service.notificar_batch(
                eventos=eventos,
                id_viaje=id_viaje,
                id_chofer=user.id_usuario,
                nombre_chofer=user.nombre_completo
            )
            
            await websocket.send_json({
                "type": "BATCH_RECIBIDO",
                "total_eventos": len(eventos),
                "admins_notificados": sent_count,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(
                f"📤 Batch de {len(eventos)} eventos de {user.nombre_completo} "
                f"→ {sent_count} admins notificados"
            )
    
    else:
        logger.warning(f"Tipo de mensaje desconocido: {msg_type}")


@router.websocket("/monitor")
async def websocket_monitor_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Token de autenticación"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint para dashboards de monitoreo.
    """
    user = await verify_websocket_token(token, db)
    
    if not user:
        await websocket.close(code=4001, reason="Token inválido")
        return
    
    user_id = user.id_usuario
    
    connected = await connection_manager.connect(
        websocket=websocket,
        user_id=user_id,
        connection_type=ConnectionType.MONITOR
    )
    
    if not connected:
        await websocket.close(code=4000, reason="Error de conexión")
        return
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "PING":
                    await websocket.send_json({"type": "PONG"})
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        logger.info(f"Monitor desconectado: {user_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket monitor: {e}")
    finally:
        await connection_manager.disconnect(user_id, ConnectionType.MONITOR)


async def handle_admin_message(user_id: int, message: dict, websocket: WebSocket):
    """
    Maneja mensajes recibidos de admins.
    """
    msg_type = message.get("type", "")
    
    if msg_type == "PING":
        await websocket.send_json({
            "type": "PONG",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    elif msg_type == "GET_STATS":
        stats = {
            "websocket": connection_manager.get_stats(),
            "notifications": notification_service.get_stats(),
            "eventos": evento_notification_service.get_stats()
        }
        await websocket.send_json({
            "type": "STATS",
            "data": stats
        })


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS HTTP AUXILIARES
# ═══════════════════════════════════════════════════════════════

@router.get(
    "/stats",
    summary="Estadísticas de WebSocket",
    description="Obtiene estadísticas de conexiones WebSocket activas"
)
async def get_websocket_stats():
    """Obtiene estadísticas del sistema WebSocket."""
    return {
        "status": "ok",
        "websocket": connection_manager.get_stats(),
        "notifications": notification_service.get_stats(),
        "eventos": evento_notification_service.get_stats()
    }


@router.get(
    "/connections",
    summary="Conexiones activas",
    description="Lista de usuarios conectados por WebSocket"
)
async def get_active_connections():
    """Lista de conexiones activas."""
    return {
        "admins": connection_manager.get_connected_users(ConnectionType.ADMIN),
        "choferes": connection_manager.get_connected_users(ConnectionType.CHOFER),
        "monitors": connection_manager.get_connected_users(ConnectionType.MONITOR)
    }


@router.post(
    "/test-notification",
    summary="Test de notificación",
    description="Envía una notificación de prueba a todos los admins conectados"
)
async def send_test_notification():
    """Envía notificación de prueba."""
    from app.schemas.notificacion_somnolencia import EventoSomnolenciaWS
    
    evento_test = EventoSomnolenciaWS(
        id_viaje=0,
        id_chofer=0,
        tipo_evento="microsueno",
        nivel_severidad="CRITICAL",
        duracion_segundos=2.5,
        timestamp_evento=datetime.utcnow().isoformat(),
        latitud=-17.3895,
        longitud=-66.1568,
        velocidad_kmh=65.5
    )
    
    sent_count = await evento_notification_service.notificar_evento(
        evento=evento_test,
        nombre_chofer="[TEST] Chofer de Prueba"
    )
    
    return {
        "status": "ok",
        "message": f"Notificación de prueba enviada a {sent_count} admins"
    }