# Imports absolutos
from app.drowsiness_processor.data_processing.processors.face_processor import ProcesadorRostro
from app.drowsiness_processor.data_processing.processors.hands_processor import ProcesadorManos
from app.drowsiness_processor.data_processing.eyes.eyes_processor import ProcesadorOjos
from app.drowsiness_processor.data_processing.hands.first_hand.first_hand_processor import ProcesadorPrimeraMano
from app.drowsiness_processor.data_processing.hands.second_hand.second_hand_processor import ProcesadorSegundaMano
from app.drowsiness_processor.data_processing.head.head_processor import ProcesadorCabeza
from app.drowsiness_processor.data_processing.mouth.mouth_processor import ProcesadorBoca


class ProcesamientoPuntos:
    def __init__(self):
        self.procesadores_rostro: dict[str, ProcesadorRostro] = {
            'ojos': ProcesadorOjos(),
            'cabeza': ProcesadorCabeza(),
            'boca': ProcesadorBoca()
        }
        self.procesadores_manos: dict[str, ProcesadorManos] = {
            'primera_mano': ProcesadorPrimeraMano(),
            'segunda_mano': ProcesadorSegundaMano(),
        }
        self.puntos_procesados: dict = {}

    def principal(self, puntos: dict):
        self.puntos_procesados = {}
        self.puntos_procesados['ojos'] = self.procesadores_rostro['ojos'].procesar(puntos.get('ojos', {}))

        if 'primera_mano' in puntos:
            self.puntos_procesados['primera_mano'] = (
                self.procesadores_manos['primera_mano'].procesar(puntos['primera_mano'], puntos.get('ojos', {}))
            )

        if 'segunda_mano' in puntos:
            self.puntos_procesados['segunda_mano'] = (
                self.procesadores_manos['segunda_mano'].procesar(puntos['segunda_mano'], puntos.get('ojos', {}))
            )

        self.puntos_procesados['cabeza'] = self.procesadores_rostro['cabeza'].procesar(puntos.get('cabeza', {}))
        self.puntos_procesados['boca'] = self.procesadores_rostro['boca'].procesar(puntos.get('boca', {}))

        return self.puntos_procesados