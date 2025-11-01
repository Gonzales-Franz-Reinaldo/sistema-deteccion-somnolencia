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


class ProcesamientoPuntosCabeza:
    def __init__(self, calculadora_distancia: CalculadoraDistancia):
        self.calculadora_distancia = calculadora_distancia
        self.cabeza: dict = {}

    def calcular_distancias(self, puntos_cabeza: dict):
        nariz_boca = self.calculadora_distancia.calcular_distancia(
            puntos_cabeza['distancias'][0], 
            puntos_cabeza['distancias'][1]
        )
        frente_cabeza = self.calculadora_distancia.calcular_distancia(
            puntos_cabeza['distancias'][2], 
            puntos_cabeza['distancias'][3]
        )
        return nariz_boca, frente_cabeza

    def principal(self, puntos_cabeza: dict):
        distancia_nariz_boca, distancia_nariz_cabeza = self.calcular_distancias(puntos_cabeza)
        self.cabeza['distancia_nariz_boca'] = distancia_nariz_boca
        self.cabeza['distancia_nariz_cabeza'] = distancia_nariz_cabeza
        self.cabeza['punto_nariz'] = puntos_cabeza['distancias'][4]
        self.cabeza['punto_mejilla_derecha'] = puntos_cabeza['distancias'][5]
        self.cabeza['punto_mejilla_izquierda'] = puntos_cabeza['distancias'][6]
        return self.cabeza