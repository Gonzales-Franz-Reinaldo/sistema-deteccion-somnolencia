from app.drowsiness_processor.data_processing.processors.face_processor import ProcesadorRostro
from app.drowsiness_processor.data_processing.head.head_processing import (
    CalculadoraDistanciaEuclidiana, 
    ProcesamientoPuntosCabeza
)


class ProcesadorCabeza(ProcesadorRostro):
    def __init__(self):
        calculadora_distancia = CalculadoraDistanciaEuclidiana()
        self.procesador = ProcesamientoPuntosCabeza(calculadora_distancia)

    def procesar(self, puntos: dict):
        return self.procesador.principal(puntos)