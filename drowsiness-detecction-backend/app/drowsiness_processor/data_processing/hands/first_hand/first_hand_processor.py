from app.drowsiness_processor.data_processing.processors.hands_processor import ProcesadorManos
from app.drowsiness_processor.data_processing.hands.first_hand.first_hand_processing import (
    CalculadoraDistanciaEuclidiana, 
    ProcesamientoPuntosPrimeraMano
)


class ProcesadorPrimeraMano(ProcesadorManos):
    def __init__(self):
        calculadora_distancia = CalculadoraDistanciaEuclidiana()
        self.procesador = ProcesamientoPuntosPrimeraMano(calculadora_distancia)

    def procesar(self, puntos_mano: dict, puntos_ojos: dict):
        return self.procesador.principal(puntos_mano, puntos_ojos)