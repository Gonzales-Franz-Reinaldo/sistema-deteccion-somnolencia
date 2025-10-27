import cv2
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import Usuario
from app.drowsiness_processor.main import DrowsinessDetectionSystem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_monitoring_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint para monitoreo en tiempo real
    
    Flujo:
    1. Cliente se conecta
    2. Cliente envía frames de video en base64
    3. Servidor procesa con DrowsinessDetectionSystem
    4. Servidor retorna: original_image, sketch_image, json_report
    """
    
    # Inicializar sistema de detección
    drowsiness_detection_system = DrowsinessDetectionSystem()
    
    await websocket.accept()
    logger.info("Cliente WebSocket conectado al sistema de monitoreo")
    
    frame_count = 0
    
    try:
        while True:
            # Recibir frame del cliente
            data = await websocket.receive_text()
            
            try:
                # Procesar frame con el sistema de detección
                original_image, sketch, json_report = drowsiness_detection_system.run(data)
                
                # Configurar compresión JPEG (80% calidad)
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
                
                # Codificar sketch a base64
                _, buffer_sketch = cv2.imencode('.jpg', sketch, encode_param)
                sketch_base64 = base64.b64encode(buffer_sketch).decode('utf-8')
                
                # Codificar imagen original a base64
                _, buffer_original_image = cv2.imencode('.jpg', original_image, encode_param)
                original_image_base64 = base64.b64encode(buffer_original_image).decode('utf-8')
                
                # Enviar respuesta al cliente
                await websocket.send_json({
                    "json_report": json_report,
                    "sketch_image": sketch_base64,
                    "original_image": original_image_base64,
                })
                
                # Logging cada 30 frames
                frame_count += 1
                if frame_count % 30 == 0:
                    logger.info(f"Frames procesados: {frame_count}")
                    
            except Exception as e:
                logger.error(f"Error al procesar frame: {str(e)}", exc_info=True)
                # Enviar error al cliente pero mantener conexión
                await websocket.send_json({
                    "error": str(e),
                    "json_report": {},
                    "sketch_image": "",
                    "original_image": "",
                })
    
    except WebSocketDisconnect:
        logger.info("Cliente WebSocket desconectado del sistema de monitoreo")
    except Exception as e:
        logger.error(f"Error en WebSocket de monitoreo: {str(e)}", exc_info=True)


@router.get("/status")
async def monitoring_status(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Endpoint para verificar el estado del sistema de monitoreo
    
    Requiere autenticación
    """
    return {
        "status": "operational",
        "user": current_user.usuario,
        "role": current_user.rol,
        "message": "Sistema de monitoreo disponible"
    }