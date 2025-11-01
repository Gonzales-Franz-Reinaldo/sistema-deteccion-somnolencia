from app.drowsiness_processor.data_processing.processors.face_processor import ProcesadorRostro
from app.drowsiness_processor.data_processing.mouth.mouth_processing import (
    CalculadoraDistanciaEuclidiana, 
    ProcesamientoPuntosBoca
)


class ProcesadorBoca(ProcesadorRostro):
    def __init__(self):
        calculadora_distancia = CalculadoraDistanciaEuclidiana()
        self.procesador = ProcesamientoPuntosBoca(calculadora_distancia)

    def procesar(self, puntos: dict):
        return self.procesador.principal(puntos)