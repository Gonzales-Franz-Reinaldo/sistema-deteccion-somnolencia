import numpy as np
import base64
import cv2

from app.drowsiness_processor.extract_points.point_extractor import ExtractorPuntos
from app.drowsiness_processor.data_processing.main import ProcesamientoPuntos
from app.drowsiness_processor.drowsiness_features.processing import ProcesamientoCaracteristicasSomnolencia
from app.drowsiness_processor.visualization.main import VisualizadorReporte
from app.drowsiness_processor.reports.main import ReportesSomnolencia


class SistemaDeteccionSomnolencia:
    def __init__(self):
        self.extractor_puntos = ExtractorPuntos()
        self.procesamiento_puntos = ProcesamientoPuntos()
        self.procesamiento_caracteristicas = ProcesamientoCaracteristicasSomnolencia()
        self.visualizador = VisualizadorReporte()
        self.reportes = ReportesSomnolencia('app/drowsiness_processor/reports/august/drowsiness_report.csv')
        self.reporte_json: dict = {}

    def ejecutar(self, imagen_base64: str):
        # decodificar base64
        bytes_imagen = base64.b64decode(imagen_base64)
        # convertir bytes a imagen OpenCV
        imagen = cv2.imdecode(np.frombuffer(bytes_imagen, np.uint8), cv2.IMREAD_COLOR)
        return self.procesamiento_cuadro(imagen)

    def procesamiento_cuadro(self, imagen_rostro: np.ndarray):
        puntos_clave, control_proceso, bosquejo = self.extractor_puntos.procesar(imagen_rostro)
        if control_proceso:
            puntos_procesados = self.procesamiento_puntos.principal(puntos_clave)
            caracteristicas_somnolencia_procesadas = self.procesamiento_caracteristicas.principal(puntos_procesados)
            bosquejo = self.visualizador.visualizar_todos_reportes(bosquejo, caracteristicas_somnolencia_procesadas)
            self.reportes.principal(caracteristicas_somnolencia_procesadas)
            self.reporte_json = self.reportes.generar_reporte_json(caracteristicas_somnolencia_procesadas)
        return imagen_rostro, bosquejo, self.reporte_json