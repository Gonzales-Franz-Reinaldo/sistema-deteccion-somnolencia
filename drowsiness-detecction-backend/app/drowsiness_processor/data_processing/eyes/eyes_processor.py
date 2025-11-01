from app.drowsiness_processor.data_processing.processors.face_processor import ProcesadorRostro
from app.drowsiness_processor.data_processing.eyes.eyes_processing import (
    ProcesamientoPuntosOjos, 
    CalculadoraDistanciaEuclidiana
)


class ProcesadorOjos(ProcesadorRostro):
    def __init__(self):
        calculadora_distancia = CalculadoraDistanciaEuclidiana()
        self.procesador = ProcesamientoPuntosOjos(calculadora_distancia)

    def procesar(self, puntos: dict):
        return self.procesador.principal(puntos)