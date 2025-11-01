import numpy as np
from abc import ABC, abstractmethod


class CalculadoraDistancia(ABC):
    @abstractmethod
    def calcular_distancia(self, punto1, punto2):
        pass


class CalculadoraDistanciaEuclidiana(CalculadoraDistancia):
    def calcular_distancia(self, punto1, punto2):
        return np.linalg.norm(np.array(punto1) - np.array(punto2))


class CalculadoraDistanciaDedoOjo:
    def __init__(self, calculadora_distancia: CalculadoraDistancia):
        self.calculadora_distancia = calculadora_distancia

    def calcular_distancias_dedo_ojo(self, puntos_dedos: dict, punto_ojo: list) -> dict:
        return {
            'pulgar': self.calculadora_distancia.calcular_distancia(puntos_dedos[0], punto_ojo),
            'dedo_indice': self.calculadora_distancia.calcular_distancia(puntos_dedos[1], punto_ojo),
            'dedo_medio': self.calculadora_distancia.calcular_distancia(puntos_dedos[2], punto_ojo),
            'dedo_anular': self.calculadora_distancia.calcular_distancia(puntos_dedos[3], punto_ojo),
            'dedo_menique': self.calculadora_distancia.calcular_distancia(puntos_dedos[4], punto_ojo),
        }


class ProcesamientoPuntosSegundaMano:
    def __init__(self, calculadora_distancia: CalculadoraDistancia):
        self.calculadora_distancia = calculadora_distancia
        self.calculadora_dedo_ojo = CalculadoraDistanciaDedoOjo(calculadora_distancia)
        self.manos: dict = {}

    def principal(self, puntos_mano: dict, puntos_ojos: dict):
        self.manos['mano_a_ojo_derecho'] = self.calculadora_dedo_ojo.calcular_distancias_dedo_ojo(
            puntos_mano['distancias'], 
            puntos_ojos['distancias'][8]
        )
        self.manos['mano_a_ojo_izquierdo'] = self.calculadora_dedo_ojo.calcular_distancias_dedo_ojo(
            puntos_mano['distancias'], 
            puntos_ojos['distancias'][9]
        )
        return self.manos