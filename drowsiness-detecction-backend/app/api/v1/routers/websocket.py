"""
Router WebSocket para conexiones en tiempo real.

Endpoints:
- /ws/admin/{user_id} - Conexión para administradores
- /ws/monitor - Conexión para dashboards de monitoreo
- /ws/stats - Estadísticas de conexiones (HTTP)

@author Sistema de Detección de Somnolencia
@version 1.0
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import logging
import json
from typing import Optional

from app.api.deps import get_db
from app.services.connection_manager import (
    connection_manager,
    ConnectionType,
    WebSocketMessage
)
from app.services.notification_service import notification_service
from app.models.user import Usuario
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
    - Eventos críticos de somnolencia
    - Alertas de choferes
    - Notificaciones del sistema
    
    Query params:
        token: JWT token de autenticación
    
    Mensajes recibidos:
        - ping: Responde con pong
        - subscribe: Suscribirse a eventos específicos
    
    Mensajes enviados:
        - evento_critico: Nuevo evento de somnolencia crítico
        - alerta_chofer: Alerta sobre un chofer
        - sistema: Notificación del sistema
    """
    # Verificar autenticación
    user = await verify_websocket_token(token, db)
    
    if not user:
        await websocket.close(code=4001, reason="Token inválido o expirado")
        return
    
    # Verificar que sea admin
    if user.rol != "admin":
        await websocket.close(code=4003, reason="Solo administradores pueden conectarse")
        return
    
    user_id = user.id_usuario
    
    # Conectar
    connected = await connection_manager.connect(
        websocket=websocket,
        user_id=user_id,
        connection_type=ConnectionType.ADMIN
    )
    
    if not connected:
        return
    
    try:
        # Loop de mensajes
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_admin_message(user_id, message)
            except json.JSONDecodeError:
                # Si no es JSON, verificar comandos simples
                if data == "ping":
                    await connection_manager.send_personal_message(
                        user_id=user_id,
                        message=WebSocketMessage(
                            event_type="pong",
                            data={"timestamp": "now"}
                        ),
                        connection_type=ConnectionType.ADMIN
                    )
                    
    except WebSocketDisconnect:
        logger.info(f"Admin {user_id} desconectado")
    except Exception as e:
        logger.error(f"Error en WebSocket admin {user_id}: {e}")
    finally:
        await connection_manager.disconnect(user_id, ConnectionType.ADMIN)


@router.websocket("/monitor")
async def websocket_monitor_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Token de autenticación"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint para dashboards de monitoreo.
    
    Similar al endpoint admin pero sin restricción de rol.
    Útil para pantallas de monitoreo en centros de control.
    
    Query params:
        token: JWT token de autenticación
    """
    # Verificar autenticación
    user = await verify_websocket_token(token, db)
    
    if not user:
        await websocket.close(code=4001, reason="Token inválido o expirado")
        return
    
    user_id = user.id_usuario
    
    # Conectar como monitor
    connected = await connection_manager.connect(
        websocket=websocket,
        user_id=user_id,
        connection_type=ConnectionType.MONITOR
    )
    
    if not connected:
        return
    
    try:
        while True:
            data = await websocket.receive_text()
            
            if data == "ping":
                await connection_manager.send_personal_message(
                    user_id=user_id,
                    message=WebSocketMessage(
                        event_type="pong",
                        data={"timestamp": "now"}
                    ),
                    connection_type=ConnectionType.MONITOR
                )
                
    except WebSocketDisconnect:
        logger.info(f"Monitor {user_id} desconectado")
    except Exception as e:
        logger.error(f"Error en WebSocket monitor {user_id}: {e}")
    finally:
        await connection_manager.disconnect(user_id, ConnectionType.MONITOR)


async def handle_admin_message(user_id: int, message: dict):
    """
    Maneja mensajes recibidos de admins.
    
    Args:
        user_id: ID del usuario admin
        message: Mensaje recibido
    """
    msg_type = message.get("type", "")
    
    if msg_type == "ping":
        await connection_manager.send_personal_message(
            user_id=user_id,
            message=WebSocketMessage(
                event_type="pong",
                data={"received": message}
            ),
            connection_type=ConnectionType.ADMIN
        )
    
    elif msg_type == "subscribe":
        # Futuro: manejar suscripciones a eventos específicos
        await connection_manager.send_personal_message(
            user_id=user_id,
            message=WebSocketMessage(
                event_type="subscribed",
                data={
                    "topics": message.get("topics", []),
                    "status": "ok"
                }
            ),
            connection_type=ConnectionType.ADMIN
        )
    
    elif msg_type == "get_stats":
        stats = notification_service.get_stats()
        await connection_manager.send_personal_message(
            user_id=user_id,
            message=WebSocketMessage(
                event_type="stats",
                data=stats
            ),
            connection_type=ConnectionType.ADMIN
        )


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS HTTP AUXILIARES
# ═══════════════════════════════════════════════════════════════

@router.get(
    "/stats",
    summary="Estadísticas de WebSocket",
    description="Obtiene estadísticas de conexiones WebSocket activas"
)
async def get_websocket_stats():
    """
    Obtiene estadísticas del sistema WebSocket.
    
    Returns:
        Estadísticas de conexiones y notificaciones
    """
    return {
        "status": "ok",
        "websocket": connection_manager.get_stats(),
        "notifications": notification_service.get_stats()
    }


@router.get(
    "/connections",
    summary="Conexiones activas",
    description="Lista de usuarios conectados por WebSocket"
)
async def get_active_connections():
    """
    Obtiene lista de conexiones activas.
    
    Returns:
        Lista de usuarios conectados por tipo
    """
    return {
        "admins": connection_manager.get_connected_users(ConnectionType.ADMIN),
        "monitors": connection_manager.get_connected_users(ConnectionType.MONITOR),
        "total": len(connection_manager.get_connected_users())
    }


@router.post(
    "/test-notification",
    summary="Test de notificación",
    description="Envía una notificación de prueba a todos los admins conectados"
)
async def send_test_notification():
    """
    Envía una notificación de prueba.
    
    Útil para verificar que el sistema WebSocket está funcionando.
    
    Returns:
        Número de notificaciones enviadas
    """
    message = WebSocketMessage(
        event_type="test_notification",
        data={
            "mensaje": "🔔 Esta es una notificación de prueba",
            "timestamp": "now"
        },
        priority="normal"
    )
    
    sent_count = await connection_manager.broadcast_to_admins(message)
    
    return {
        "status": "ok",
        "message": "Notificación de prueba enviada",
        "sent_to": sent_count,
        "connected_admins": connection_manager.get_connected_users(ConnectionType.ADMIN)
    }