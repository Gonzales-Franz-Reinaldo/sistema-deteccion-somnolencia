import time
from typing import Tuple, Dict, Any
from abc import ABC, abstractmethod
from app.drowsiness_processor.drowsiness_features.processor import ProcesadorSomnolencia


class Detector(ABC):
    @abstractmethod
    def detectar(self, distancia_ojos: dict) -> bool:
        raise NotImplemented


class DeteccionFrotamientoOjos(Detector):
    def __init__(self):
        self.tiempo_inicio: float = 0
        self.tiempo_fin: float = 0
        self.bandera: bool = False
        self.frotamiento_ojos: bool = False

    def verificar_frotamiento_ojos(self, distancia_ojo: dict) -> bool:
        distancias = [
            distancia_ojo.get(dedo, float('inf')) 
            for dedo in ['pulgar', 'dedo_indice', 'dedo_medio', 'dedo_anular', 'dedo_menique']
        ]
        self.frotamiento_ojos = any(distancia < 40 for distancia in distancias)
        return self.frotamiento_ojos

    def detectar(self, frotamiento_ojos: bool) -> Tuple[bool, float]:
        if frotamiento_ojos and not self.bandera:
            self.tiempo_inicio = time.time()
            self.bandera = True
        elif not frotamiento_ojos and self.bandera:
            self.tiempo_fin = time.time()
            duracion_frotamiento_ojos = round(self.tiempo_fin - self.tiempo_inicio, 0)
            self.bandera = False
            if duracion_frotamiento_ojos > 1:
                self.tiempo_inicio = 0
                self.tiempo_fin = 0
                return True, duracion_frotamiento_ojos
        return False, 0.0


class ContadorFrotamientoOjos:
    def __init__(self):
        self.conteo_frotamiento_ojos: int = 0
        self.duraciones_frotamiento_ojos = []

    def incrementar(self, duracion: float, lado: str):
        self.conteo_frotamiento_ojos += 1
        self.duraciones_frotamiento_ojos.append(
            f"{self.conteo_frotamiento_ojos} frotamiento ojo {lado}: {duracion} segundos"
        )

    def reiniciar(self):
        self.conteo_frotamiento_ojos = 0

    def obtener_duraciones(self):
        return self.duraciones_frotamiento_ojos


class GeneradorReporte(ABC):
    @abstractmethod
    def generar_reporte(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplemented


class GeneradorReporteFrotamientoOjos(GeneradorReporte):
    def generar_reporte(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        conteo_frotamiento_ojos = datos.get("conteo_frotamiento_ojos", 0)
        duraciones_frotamiento_ojos = datos.get("duraciones_frotamiento_ojos", [])
        tiempo_transcurrido = datos.get("tiempo_transcurrido", 0)
        reporte_frotamiento_ojos = datos.get("reporte_frotamiento_ojos", False)

        return {
            'conteo_frotamiento_ojos': conteo_frotamiento_ojos,
            'duraciones_frotamiento_ojos': duraciones_frotamiento_ojos,
            'mensaje_reporte': f'Contando frotamiento de ojos... {300 - tiempo_transcurrido} segundos restantes.',
            'reporte_frotamiento_ojos': reporte_frotamiento_ojos
        }


class EstimadorFrotamientoOjos(ProcesadorSomnolencia):
    def __init__(self):
        self.deteccion_frotamiento_ojos_derecho = DeteccionFrotamientoOjos()
        self.deteccion_frotamiento_ojos_izquierdo = DeteccionFrotamientoOjos()
        self.contador_frotamiento_ojos_derecho = ContadorFrotamientoOjos()
        self.contador_frotamiento_ojos_izquierdo = ContadorFrotamientoOjos()
        self.generador_reporte_frotamiento_ojos = GeneradorReporteFrotamientoOjos()
        self.inicio_reporte = time.time()

    def procesar(self, puntos_manos: dict):
        tiempo_actual = time.time()
        tiempo_transcurrido = round(tiempo_actual - self.inicio_reporte, 0)

        frotamiento_ojos_derecho = self.deteccion_frotamiento_ojos_derecho.verificar_frotamiento_ojos(
            puntos_manos.get('mano_a_ojo_derecho', {})
        )
        frotamiento_ojos_izquierdo = self.deteccion_frotamiento_ojos_izquierdo.verificar_frotamiento_ojos(
            puntos_manos.get('mano_a_ojo_izquierdo', {})
        )

        es_frotamiento_ojos_derecho, duracion_frotamiento_ojos_derecho = (
            self.deteccion_frotamiento_ojos_derecho.detectar(frotamiento_ojos_derecho)
        )
        es_frotamiento_ojos_izquierdo, duracion_frotamiento_ojos_izquierdo = (
            self.deteccion_frotamiento_ojos_izquierdo.detectar(frotamiento_ojos_izquierdo)
        )

        if es_frotamiento_ojos_derecho:
            self.contador_frotamiento_ojos_derecho.incrementar(duracion_frotamiento_ojos_derecho, 'derecho')
        if es_frotamiento_ojos_izquierdo:
            self.contador_frotamiento_ojos_izquierdo.incrementar(duracion_frotamiento_ojos_izquierdo, 'izquierdo')

        if tiempo_transcurrido >= 300:
            datos_frotamiento_ojos = {
                "conteo_frotamiento_ojos": (
                    self.contador_frotamiento_ojos_derecho.conteo_frotamiento_ojos + 
                    self.contador_frotamiento_ojos_izquierdo.conteo_frotamiento_ojos
                ),
                "duraciones_frotamiento_ojos": (
                    self.contador_frotamiento_ojos_derecho.obtener_duraciones() + 
                    self.contador_frotamiento_ojos_izquierdo.obtener_duraciones()
                ),
                "tiempo_transcurrido": tiempo_transcurrido,
                "reporte_frotamiento_ojos": True
            }
            self.contador_frotamiento_ojos_derecho.reiniciar()
            self.contador_frotamiento_ojos_izquierdo.reiniciar()
            self.inicio_reporte = tiempo_actual
            return self.generador_reporte_frotamiento_ojos.generar_reporte(datos_frotamiento_ojos)

        return {
            'mensaje_reporte': f'Contando frotamiento de ojos... {300 - tiempo_transcurrido} segundos restantes.',
            'reporte_frotamiento_ojos': False,
        }