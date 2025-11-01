import numpy as np
import mediapipe as mp
import cv2
from typing import Tuple, Any, List, Dict


class InferenciaManos:
    def __init__(self, confianza_minima_deteccion=0.6, confianza_minima_seguimiento=0.6):
        self.manos = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            model_complexity=1,
            min_detection_confidence=confianza_minima_deteccion,
            min_tracking_confidence=confianza_minima_seguimiento
        )

    def procesar(self, imagen: np.ndarray) -> Tuple[bool, Any]:
        imagen_rgb = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)
        manos = self.manos.process(imagen_rgb)
        return bool(manos.multi_hand_landmarks), manos


class ExtractorManos:
    def __init__(self):
        self.puntos: dict = {
            'dedos': {'distancias': []},
        }

    def contar_manos(self, info_manos):
        return len(info_manos.multi_hand_landmarks)

    def extraer_puntos(self, imagen_rostro: np.ndarray, info_manos: Any, indice_mano: int = 0) -> List[List[int]]:
        h, w, _ = imagen_rostro.shape
        mano_elegida = info_manos.multi_hand_landmarks[indice_mano]
        puntos_manos = [
            [i, int(pt.x * w), int(pt.y * h)]
            for mano in info_manos.multi_hand_landmarks
            for i, pt in enumerate(mano_elegida.landmark)
        ]
        return puntos_manos

    def extraer_puntos_caracteristicas(self, puntos_manos: List[List[int]], indices_caracteristicas: dict):
        for caracteristica, indices in indices_caracteristicas.items():
            for sub_caracteristica, sub_indices in indices.items():
                self.puntos[caracteristica][sub_caracteristica] = [puntos_manos[i][1:] for i in sub_indices]

    def obtener_puntos_mano(self, puntos_manos: List[List[int]]) -> Dict[str, List[List[int]]]:
        indices_caracteristicas = {
            'dedos': {
                'distancias': [4, 8, 12, 16, 20],
            }
        }
        self.extraer_puntos_caracteristicas(puntos_manos, indices_caracteristicas)
        return self.puntos['dedos']


class DibujadorManos:
    def __init__(self, color: Tuple[int, int, int] = (255, 255, 0)):
        self.mp_dibujar = mp.solutions.drawing_utils
        self.config_dibujar = self.mp_dibujar.DrawingSpec(color=color, thickness=1, circle_radius=1)

    def dibujar(self, imagen_bosquejo: np.ndarray, info_manos: Any):
        for manos in info_manos.multi_hand_landmarks:
            self.mp_dibujar.draw_landmarks(
                imagen_bosquejo, 
                manos, 
                mp.solutions.hands.HAND_CONNECTIONS,
                self.config_dibujar, 
                self.config_dibujar
            )

        return imagen_bosquejo


class ProcesadorManos:
    def __init__(self):
        self.inferencia = InferenciaManos()
        self.extractor = ExtractorManos()
        self.dibujador = DibujadorManos()
        self.puntos: dict = {
            'primera_mano': {'distancias': []},
            'segunda_mano': {'distancias': []},
        }

    def procesar(self, imagen_mano: np.ndarray, imagen_bosquejo: np.ndarray, dibujar: bool = False) -> Tuple[dict, bool, np.ndarray]:
        exito, info_manos = self.inferencia.procesar(imagen_mano)
        if not exito:
            return self.puntos, exito, imagen_bosquejo

        num_manos = self.extractor.contar_manos(info_manos)
        if num_manos >= 2:
            puntos_primera_mano = self.extractor.extraer_puntos(imagen_mano, info_manos, indice_mano=0)
            puntos_segunda_mano = self.extractor.extraer_puntos(imagen_mano, info_manos, indice_mano=1)
            puntos = {
                'primera_mano': self.extractor.obtener_puntos_mano(puntos_primera_mano),
                'segunda_mano': self.extractor.obtener_puntos_mano(puntos_segunda_mano),
            }
        else:
            puntos_primera_mano = self.extractor.extraer_puntos(imagen_mano, info_manos, indice_mano=0)
            puntos = {
                'primera_mano': self.extractor.obtener_puntos_mano(puntos_primera_mano),
            }

        if dibujar:
            imagen_bosquejo = self.dibujador.dibujar(imagen_bosquejo, info_manos)
            return puntos, exito, imagen_bosquejo
        return puntos, exito, imagen_bosquejo