import mediapipe as mp
import numpy as np
import cv2
from typing import Tuple, Any, List, Dict


class InferenciaRostroMalla:
    def __init__(self, confianza_minima_deteccion=0.6, confianza_minima_seguimiento=0.6):
        self.malla_rostro = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=confianza_minima_deteccion,
            min_tracking_confidence=confianza_minima_seguimiento
        )

    def procesar(self, imagen: np.ndarray) -> Tuple[bool, Any]:
        imagen_rgb = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)
        malla_rostro = self.malla_rostro.process(imagen_rgb)
        return bool(malla_rostro.multi_face_landmarks), malla_rostro


class ExtractorRostroMalla:
    def __init__(self):
        self.puntos: dict = {
            'ojos': {'distancias': []},
            'boca': {'distancias': []},
            'cabeza': {'distancias': []},
        }

    def extraer_puntos(self, imagen_rostro: np.ndarray, info_malla_rostro: Any) -> List[List[int]]:
        h, w, _ = imagen_rostro.shape
        puntos_malla = [
            [i, int(pt.x * w), int(pt.y * h)]
            for rostro in info_malla_rostro.multi_face_landmarks
            for i, pt in enumerate(rostro.landmark)
        ]
        return puntos_malla

    def extraer_puntos_caracteristicas(self, puntos_rostro: List[List[int]], indices_caracteristicas: dict):
        for caracteristica, indices in indices_caracteristicas.items():
            for sub_caracteristica, sub_indices in indices.items():
                self.puntos[caracteristica][sub_caracteristica] = [puntos_rostro[i][1:] for i in sub_indices]

    def obtener_puntos_ojos(self, puntos_rostro: List[List[int]]) -> Dict[str, List[List[int]]]:
        indices_caracteristicas = {
            'ojos': {
                'distancias': [159, 145, 385, 374, 468, 472, 473, 477, 468, 473],
            }
        }
        self.extraer_puntos_caracteristicas(puntos_rostro, indices_caracteristicas)
        return self.puntos['ojos']

    def obtener_puntos_boca(self, puntos_rostro: List[List[int]]) -> Dict[str, List[List[int]]]:
        indices_caracteristicas = {
            'boca': {
                'distancias': [13, 14, 17, 199]
            }
        }
        self.extraer_puntos_caracteristicas(puntos_rostro, indices_caracteristicas)
        return self.puntos['boca']

    def obtener_puntos_cabeza(self, puntos_rostro: List[List[int]]) -> Dict[str, List[List[int]]]:
        indices_caracteristicas = {
            'cabeza': {
                'distancias': [1, 0, 1, 5, 4, 205, 425]
            }
        }
        self.extraer_puntos_caracteristicas(puntos_rostro, indices_caracteristicas)
        return self.puntos['cabeza']


class DibujadorRostroMalla:
    def __init__(self, color: Tuple[int, int, int] = (255, 255, 0)):
        self.mp_dibujar = mp.solutions.drawing_utils
        self.config_dibujar = self.mp_dibujar.DrawingSpec(color=color, thickness=1, circle_radius=1)

    def dibujar(self, imagen_rostro: np.ndarray, info_malla_rostro: Any):
        for malla_rostro in info_malla_rostro.multi_face_landmarks:
            self.mp_dibujar.draw_landmarks(
                imagen_rostro, 
                malla_rostro, 
                mp.solutions.face_mesh.FACEMESH_TESSELATION,
                self.config_dibujar, 
                self.config_dibujar
            )

    def dibujar_bosquejo(self, imagen_rostro: np.ndarray, info_malla_rostro: Any):
        h, w, _ = imagen_rostro.shape
        imagen_negra = np.zeros((h, w, 3), dtype=np.uint8)
        for malla_rostro in info_malla_rostro.multi_face_landmarks:
            for pt in malla_rostro.landmark:
                x = int(pt.x * w)
                y = int(pt.y * h)
                z = int(pt.z * 50)
                cv2.circle(imagen_negra, (x, y), 1, (255 - z, 255 - z, 0 - z), -1)
        return imagen_negra


class ProcesadorRostroMalla:
    def __init__(self):
        self.inferencia = InferenciaRostroMalla()
        self.extractor = ExtractorRostroMalla()
        self.dibujador = DibujadorRostroMalla()

    def procesar(self, imagen_rostro: np.ndarray, dibujar: bool = True) -> Tuple[dict, bool, np.ndarray]:
        h, w, _ = imagen_rostro.shape
        bosquejo = np.zeros((h, w, 3), dtype=np.uint8)
        exito, info_malla_rostro = self.inferencia.procesar(imagen_rostro)
        if not exito:
            return {}, exito, bosquejo

        puntos_rostro = self.extractor.extraer_puntos(imagen_rostro, info_malla_rostro)
        puntos = {
            'ojos': self.extractor.obtener_puntos_ojos(puntos_rostro),
            'boca': self.extractor.obtener_puntos_boca(puntos_rostro),
            'cabeza': self.extractor.obtener_puntos_cabeza(puntos_rostro),
        }

        if dibujar:
            bosquejo = self.dibujador.dibujar_bosquejo(imagen_rostro, info_malla_rostro)
            return puntos, exito, bosquejo

        return puntos, exito, bosquejo