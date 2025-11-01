import numpy as np
from abc import ABC, abstractmethod


class CalculadoraDistancia(ABC):
    @abstractmethod
    def calcular_distancia(self, punto1, punto2):
        pass


class CalculadoraDistanciaEuclidiana(CalculadoraDistancia):
    def calcular_distancia(self, punto1, punto2):
        return np.linalg.norm(np.array(punto1) - np.array(punto2))


class ProcesamientoPuntosBoca:
    def __init__(self, calculadora_distancia: CalculadoraDistancia):
        self.calculadora_distancia = calculadora_distancia
        self.boca: dict = {}

    def calcular_distancias(self, puntos_boca: dict):
        labios = self.calculadora_distancia.calcular_distancia(
            puntos_boca['distancias'][0], 
            puntos_boca['distancias'][1]
        )
        menton = self.calculadora_distancia.calcular_distancia(
            puntos_boca['distancias'][2], 
            puntos_boca['distancias'][3]
        )
        return labios, menton

    def principal(self, puntos_boca: dict):
        distancia_labios, distancia_menton = self.calcular_distancias(puntos_boca)
        self.boca['distancia_labios'] = distancia_labios
        self.boca['distancia_menton'] = distancia_menton
        return self.boca