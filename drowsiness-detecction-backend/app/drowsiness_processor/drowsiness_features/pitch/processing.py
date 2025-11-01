import time
from typing import Tuple, Dict, Any
from abc import ABC, abstractmethod
from app.drowsiness_processor.drowsiness_features.processor import ProcesadorSomnolencia


class Detector(ABC):
    @abstractmethod
    def detectar(self, distancias_cabeza: dict) -> Tuple[bool, str]:
        raise NotImplemented


class DeteccionInclinacion(Detector):
    def __init__(self):
        self.tiempo_inicio: float = 0
        self.tiempo_fin: float = 0
        self.bandera: bool = False
        self.cabeza_abajo: bool = False
        self.posicion_cabeza: str = ''

    def verificar_cabeza_abajo(self, distancias_cabeza: dict) -> Tuple[bool, str]:
        distancia_nariz_boca = distancias_cabeza['distancia_nariz_boca']
        distancia_frente_nariz = distancias_cabeza['distancia_nariz_cabeza']
        punto_nariz = distancias_cabeza['punto_nariz'][1]
        punto_mejilla_derecha = distancias_cabeza['punto_mejilla_derecha'][1]
        punto_mejilla_izquierda = distancias_cabeza['punto_mejilla_izquierda'][1]

        if (punto_mejilla_derecha > punto_nariz > punto_mejilla_izquierda and 
            distancia_nariz_boca < distancia_frente_nariz):
            self.cabeza_abajo = True
            self.posicion_cabeza = 'cabeza abajo derecha'
        elif (punto_mejilla_izquierda > punto_nariz > punto_mejilla_derecha and 
              distancia_nariz_boca < distancia_frente_nariz):
            self.cabeza_abajo = True
            self.posicion_cabeza = 'cabeza abajo izquierda'
        elif (punto_nariz < punto_mejilla_derecha and 
              punto_nariz < punto_mejilla_izquierda and 
              distancia_nariz_boca > distancia_frente_nariz):
            self.cabeza_abajo = False
            self.posicion_cabeza = 'cabeza arriba'
        return self.cabeza_abajo, self.posicion_cabeza

    def detectar(self, cabeza_abajo: bool) -> Tuple[bool, float]:
        if cabeza_abajo and not self.bandera:
            self.tiempo_inicio = time.time()
            self.bandera = True
        elif not cabeza_abajo and self.bandera:
            self.tiempo_fin = time.time()
            duracion_inclinacion = round(self.tiempo_fin - self.tiempo_inicio, 0)
            self.bandera = False
            if duracion_inclinacion >= 3.0:
                self.tiempo_inicio = 0
                self.tiempo_fin = 0
                return True, duracion_inclinacion
        return False, 0.0


class ContadorInclinacion:
    def __init__(self):
        self.conteo_inclinacion: int = 0
        self.duraciones_inclinacion = []

    def incrementar(self, duracion: float):
        self.conteo_inclinacion += 1
        self.duraciones_inclinacion.append(f"{self.conteo_inclinacion} inclinación: {duracion} segundos")

    def reiniciar(self):
        self.conteo_inclinacion = 0

    def obtener_duraciones(self):
        return self.duraciones_inclinacion


class GeneradorReporte(ABC):
    @abstractmethod
    def generar_reporte(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplemented


class GeneradorReporteInclinacion(GeneradorReporte):
    def generar_reporte(self, datos: Dict[str, Any]) -> dict[str, Any]:
        conteo_inclinacion = datos.get("conteo_inclinacion", 0)
        duraciones_inclinacion = datos.get("duraciones_inclinacion", [])
        cabeza_abajo = datos.get("cabeza_abajo", False)
        reporte_inclinacion = datos.get("reporte_inclinacion", False)

        return {
            'conteo_inclinacion': conteo_inclinacion,
            'duraciones_inclinacion': duraciones_inclinacion,
            'cabeza_abajo': cabeza_abajo,
            'reporte_inclinacion': reporte_inclinacion
        }


class EstimadorInclinacion(ProcesadorSomnolencia):
    def __init__(self):
        self.deteccion_inclinacion = DeteccionInclinacion()
        self.contador_inclinacion = ContadorInclinacion()
        self.generador_reporte_inclinacion = GeneradorReporteInclinacion()

    def procesar(self, puntos_cabeza: dict):
        cabeza_abajo, posicion_cabeza = self.deteccion_inclinacion.verificar_cabeza_abajo(puntos_cabeza)
        es_inclinacion, duracion_inclinacion = self.deteccion_inclinacion.detectar(cabeza_abajo)
        if es_inclinacion:
            self.contador_inclinacion.incrementar(duracion_inclinacion)

        if es_inclinacion:
            datos_inclinacion = {
                "conteo_inclinacion": self.contador_inclinacion.conteo_inclinacion,
                "duraciones_inclinacion": self.contador_inclinacion.obtener_duraciones(),
                "cabeza_abajo": cabeza_abajo,
                "reporte_inclinacion": True
            }

            return self.generador_reporte_inclinacion.generar_reporte(datos_inclinacion)

        return {
            'conteo_inclinacion': f'Contando inclinaciones...',
            'reporte_inclinacion': False,
            'cabeza_abajo': cabeza_abajo
        }