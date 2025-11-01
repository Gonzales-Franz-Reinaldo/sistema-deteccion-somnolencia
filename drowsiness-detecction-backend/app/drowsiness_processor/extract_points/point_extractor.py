import numpy as np
from typing import Tuple
import logging as log

from app.drowsiness_processor.extract_points.face_mesh.face_mesh_processor import ProcesadorRostroMalla
from app.drowsiness_processor.extract_points.hands.hands_processor import ProcesadorManos


log.basicConfig(level=log.INFO)
logger = log.getLogger(__name__)


class ExtractorPuntos:
    def __init__(self):
        self.malla_rostro = ProcesadorRostroMalla()
        self.manos = ProcesadorManos()

    def procesar(self, imagen_rostro: np.ndarray) -> Tuple[dict, bool, np.ndarray]:
        puntos_rostro, exito_malla, dibujar_bosquejo = self.malla_rostro.procesar(imagen_rostro, dibujar=True)
        if exito_malla:
            puntos_manos, exito_manos, dibujar_bosquejo = self.manos.procesar(imagen_rostro, dibujar_bosquejo, dibujar=True)
            if exito_manos:
                puntos_fusionados = self.fusionar_puntos(puntos_rostro, puntos_manos)
                return puntos_fusionados, True, dibujar_bosquejo
            else:
                return puntos_rostro, True, dibujar_bosquejo
        else:
            return puntos_rostro, False, dibujar_bosquejo

    def fusionar_puntos(self, puntos_rostro: dict, puntos_manos: dict) -> dict:
        puntos_fusionados = {**puntos_rostro, **puntos_manos}
        return puntos_fusionados