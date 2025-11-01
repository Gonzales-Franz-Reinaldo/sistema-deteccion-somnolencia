import numpy as np
from abc import ABC, abstractmethod


class CalculadoraDistancia(ABC):
    @abstractmethod
    def calcular_distancia(self, punto1, punto2):
        pass


class CalculadoraDistanciaEuclidiana(CalculadoraDistancia):
    def calcular_distancia(self, punto1, punto2):
        punto1 = punto1[1]
        punto2 = punto2[1]
        return np.linalg.norm(punto1 - punto2)


class ProcesamientoPuntosOjos:
    def __init__(self, calculadora_distancia: CalculadoraDistancia):
        self.calculadora_distancia = calculadora_distancia
        self.ojos: dict = {}

    def calcular_distancias(self, puntos_ojos: dict):
        parpado_superior_derecho = self.calculadora_distancia.calcular_distancia(
            puntos_ojos['distancias'][0], puntos_ojos['distancias'][1]
        )
        parpado_superior_izquierdo = self.calculadora_distancia.calcular_distancia(
            puntos_ojos['distancias'][2], puntos_ojos['distancias'][3]
        )
        parpado_inferior_derecho = self.calculadora_distancia.calcular_distancia(
            puntos_ojos['distancias'][4], puntos_ojos['distancias'][5]
        )
        parpado_inferior_izquierdo = self.calculadora_distancia.calcular_distancia(
            puntos_ojos['distancias'][6], puntos_ojos['distancias'][7]
        )
        return (
            parpado_superior_derecho, 
            parpado_superior_izquierdo, 
            parpado_inferior_derecho, 
            parpado_inferior_izquierdo
        )

    def principal(self, puntos_ojos: dict):
        (
            distancia_parpado_superior_derecho, 
            distancia_parpado_superior_izquierdo, 
            distancia_parpado_inferior_derecho, 
            distancia_parpado_inferior_izquierdo
        ) = self.calcular_distancias(puntos_ojos)
        
        self.ojos['distancia_parpado_superior_derecho'] = distancia_parpado_superior_derecho
        self.ojos['distancia_parpado_superior_izquierdo'] = distancia_parpado_superior_izquierdo
        self.ojos['distancia_parpado_inferior_derecho'] = distancia_parpado_inferior_derecho
        self.ojos['distancia_parpado_inferior_izquierdo'] = distancia_parpado_inferior_izquierdo
        return self.ojos