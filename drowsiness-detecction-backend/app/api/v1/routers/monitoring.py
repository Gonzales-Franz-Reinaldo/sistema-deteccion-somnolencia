import cv2
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import Usuario
from app.drowsiness_processor.main import SistemaDeteccionSomnolencia

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