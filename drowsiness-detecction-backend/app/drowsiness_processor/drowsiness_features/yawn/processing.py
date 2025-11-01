import time
from typing import Tuple, Dict, Any
from abc import ABC, abstractmethod
from app.drowsiness_processor.drowsiness_features.processor import ProcesadorSomnolencia


class Detector(ABC):
    @abstractmethod
    def detectar(self, distancia_boca: dict) -> bool:
        raise NotImplemented


class DeteccionBostezo(Detector):
    def __init__(self):
        self.tiempo_inicio: float = 0
        self.tiempo_fin: float = 0
        self.bandera: bool = False
        self.boca_abierta: bool = False

    def verificar_boca_abierta(self, distancias_boca: dict) -> bool:
        distancia_labios = distancias_boca['distancia_labios']
        distancia_menton = distancias_boca['distancia_menton']

        if distancia_labios > distancia_menton:
            self.boca_abierta = True
        elif distancia_labios < distancia_menton:
            self.boca_abierta = False
        return self.boca_abierta

    def detectar(self, boca_abierta: bool) -> Tuple[bool, float]:
        if boca_abierta and not self.bandera:
            self.tiempo_inicio = time.time()
            self.bandera = True
        elif not boca_abierta and self.bandera:
            self.tiempo_fin = time.time()
            duracion_bostezo = round(self.tiempo_fin - self.tiempo_inicio, 0)
            self.bandera = False
            if duracion_bostezo > 4:
                self.tiempo_inicio = 0
                self.tiempo_fin = 0
                return True, duracion_bostezo
        return False, 0.0


class ContadorBostezo:
    def __init__(self):
        self.conteo_bostezo: int = 0
        self.duraciones_bostezo = []

    def incrementar(self, duracion: float):
        self.conteo_bostezo += 1
        self.duraciones_bostezo.append(f"{self.conteo_bostezo} bostezo: {duracion} segundos")

    def reiniciar(self):
        self.conteo_bostezo = 0

    def obtener_duraciones(self):
        return self.duraciones_bostezo


class GeneradorReporte(ABC):
    @abstractmethod
    def generar_reporte(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplemented


class GeneradorReporteBostezo(GeneradorReporte):
    def generar_reporte(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        conteo_bostezo = datos.get("conteo_bostezo", 0)
        duraciones_bostezo = datos.get("duraciones_bostezo", [])
        tiempo_transcurrido = datos.get("tiempo_transcurrido", 0)
        reporte_bostezo = datos.get("reporte_bostezo", False)

        return {
            'conteo_bostezo': conteo_bostezo,
            'duraciones_bostezo': duraciones_bostezo,
            'mensaje_reporte': f'Contando bostezos... {180 - tiempo_transcurrido} segundos restantes.',
            'reporte_bostezo': reporte_bostezo
        }


class EstimadorBostezo(ProcesadorSomnolencia):
    def __init__(self):
        self.deteccion_bostezo = DeteccionBostezo()
        self.contador_bostezo = ContadorBostezo()
        self.generador_reporte_bostezo = GeneradorReporteBostezo()
        self.inicio_reporte = time.time()

    def procesar(self, puntos_boca: dict):
        tiempo_actual = time.time()
        tiempo_transcurrido = round(tiempo_actual - self.inicio_reporte, 0)

        boca_abierta = self.deteccion_bostezo.verificar_boca_abierta(puntos_boca)
        es_bostezo, duracion_bostezo = self.deteccion_bostezo.detectar(boca_abierta)
        if es_bostezo:
            self.contador_bostezo.incrementar(duracion_bostezo)

        if tiempo_transcurrido >= 180:
            datos_bostezo = {
                "conteo_bostezo": self.contador_bostezo.conteo_bostezo,
                "duraciones_bostezo": self.contador_bostezo.obtener_duraciones(),
                "tiempo_transcurrido": tiempo_transcurrido,
                "reporte_bostezo": True
            }
            self.contador_bostezo.reiniciar()
            self.inicio_reporte = tiempo_actual
            return self.generador_reporte_bostezo.generar_reporte(datos_bostezo)

        return {
            'conteo_bostezo': f'Contando bostezos... {180 - tiempo_transcurrido} segundos restantes.',
            'reporte_bostezo': False
        }