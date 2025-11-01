import time
from typing import Tuple, Dict, Any
from abc import ABC, abstractmethod
from app.drowsiness_processor.drowsiness_features.processor import ProcesadorSomnolencia


class Detector(ABC):
    @abstractmethod
    def detectar(self, distancia_ojos: dict) -> bool:
        raise NotImplemented


class DeteccionParpadeo(Detector):
    def __init__(self):
        self.es_parpadeo: bool = False

    def detectar(self, distancia_ojos: dict) -> bool:
        parpado_superior_derecho = distancia_ojos['distancia_parpado_superior_derecho']
        parpado_inferior_derecho = distancia_ojos['distancia_parpado_inferior_derecho']
        parpado_superior_izquierdo = distancia_ojos['distancia_parpado_superior_izquierdo']
        parpado_inferior_izquierdo = distancia_ojos['distancia_parpado_inferior_izquierdo']

        if (parpado_superior_derecho < parpado_inferior_derecho and 
            parpado_superior_izquierdo < parpado_inferior_izquierdo and 
            not self.es_parpadeo):
            self.es_parpadeo = True
            return True
        elif (parpado_superior_derecho > parpado_inferior_derecho and 
              parpado_superior_izquierdo > parpado_inferior_izquierdo and 
              self.es_parpadeo):
            self.es_parpadeo = False
        return False


class DeteccionMicrosueno(Detector):
    def __init__(self):
        self.tiempo_inicio: float = 0
        self.tiempo_fin: float = 0
        self.bandera: bool = False
        self.ojos_cerrados: bool = False

    def ojos_estan_cerrados(self, distancia_ojos: dict) -> bool:
        parpado_superior_derecho = distancia_ojos['distancia_parpado_superior_derecho']
        parpado_inferior_derecho = distancia_ojos['distancia_parpado_inferior_derecho']
        parpado_superior_izquierdo = distancia_ojos['distancia_parpado_superior_izquierdo']
        parpado_inferior_izquierdo = distancia_ojos['distancia_parpado_inferior_izquierdo']

        if (parpado_superior_derecho < parpado_inferior_derecho and 
            parpado_superior_izquierdo < parpado_inferior_izquierdo and 
            not self.ojos_cerrados):
            self.ojos_cerrados = True
        elif (parpado_superior_derecho > parpado_inferior_derecho and 
              parpado_superior_izquierdo > parpado_inferior_izquierdo and 
              self.ojos_cerrados):
            self.ojos_cerrados = False
        return self.ojos_cerrados

    def detectar(self, estan_ojos_cerrados: bool) -> Tuple[bool, float]:
        if estan_ojos_cerrados and not self.bandera:
            self.tiempo_inicio = time.time()
            self.bandera = True
        elif not estan_ojos_cerrados and self.bandera:
            self.tiempo_fin = time.time()
            duracion_parpadeo = round(self.tiempo_fin - self.tiempo_inicio, 0)
            self.bandera = False
            if duracion_parpadeo >= 2:
                self.tiempo_inicio = 0
                self.tiempo_fin = 0
                return True, duracion_parpadeo
        return False, 0.0


class ContadorParpadeos:
    def __init__(self):
        self.conteo_parpadeo: int = 0

    def incrementar(self):
        self.conteo_parpadeo += 1

    def reiniciar(self):
        self.conteo_parpadeo = 0


class ContadorMicrosueno:
    def __init__(self):
        self.conteo_microsueno: int = 0
        self.duraciones_microsueno = []

    def incrementar(self, duracion: float):
        self.conteo_microsueno += 1
        self.duraciones_microsueno.append(f"{self.conteo_microsueno} microsueño: {duracion} segundos")

    def reiniciar(self):
        self.conteo_microsueno = 0

    def obtener_duraciones(self):
        return self.duraciones_microsueno


class GeneradorReporte(ABC):
    @abstractmethod
    def generar_reporte(self, datos: dict[str, bool | int | list]) -> Dict[str, Any]:
        raise NotImplemented


class GeneradorReporteParpadeos(GeneradorReporte):
    def generar_reporte(self, datos: dict[str, bool | int | list]) -> Dict[str, Any]:
        conteo_parpadeo = datos.get("conteo_parpadeo", 0)
        tiempo_transcurrido = datos.get("tiempo_transcurrido", 0)
        reporte_parpadeo = datos.get("reporte_parpadeo", False)
        reporte_microsueno = datos.get("reporte_microsueno", False)

        return {
            'conteo_parpadeo': conteo_parpadeo,
            'mensaje_reporte': f'Contando parpadeos... {60 - tiempo_transcurrido} segundos restantes.',
            'reporte_parpadeo': reporte_parpadeo,
            'reporte_microsueno': reporte_microsueno
        }


class GeneradorReporteMicrosueno(GeneradorReporte):
    def generar_reporte(self, datos: dict[str, bool | int | list]) -> Dict[str, Any]:
        conteo_microsueno = datos.get("conteo_microsueno", 0)
        duraciones_microsueno = datos.get("duraciones_microsueno", [])
        reporte_microsueno = datos.get("reporte_microsueno", False)
        reporte_parpadeo = datos.get("reporte_parpadeo", False)

        return {
            'conteo_microsueno': conteo_microsueno,
            'duraciones_microsueno': duraciones_microsueno,
            'reporte_microsueno': reporte_microsueno,
            'reporte_parpadeo': reporte_parpadeo
        }


class EstimadorParpadeos(ProcesadorSomnolencia):
    def __init__(self):
        self.detector_parpadeo = DeteccionParpadeo()
        self.detector_microsueno = DeteccionMicrosueno()
        self.contador_parpadeo = ContadorParpadeos()
        self.contador_microsueno = ContadorMicrosueno()
        self.generador_reporte_parpadeo = GeneradorReporteParpadeos()
        self.generador_reporte_microsueno = GeneradorReporteMicrosueno()
        self.inicio_reporte = time.time()

    def procesar(self, distancia_ojos: dict):
        tiempo_actual = time.time()
        tiempo_transcurrido = round(tiempo_actual - self.inicio_reporte, 0)

        es_parpadeo = self.detector_parpadeo.detectar(distancia_ojos)
        if es_parpadeo:
            self.contador_parpadeo.incrementar()

        ojos_cerrados = self.detector_microsueno.ojos_estan_cerrados(distancia_ojos)
        es_microsueno, duracion_microsueno = self.detector_microsueno.detectar(ojos_cerrados)
        if es_microsueno:
            self.contador_microsueno.incrementar(duracion_microsueno)

        microsueno = self.contador_microsueno.conteo_microsueno

        if tiempo_transcurrido >= 60:
            datos_parpadeos = {
                "conteo_parpadeo": self.contador_parpadeo.conteo_parpadeo,
                "tiempo_transcurrido": tiempo_transcurrido,
                "reporte_parpadeo": True,
                "reporte_microsueno": False,
            }
            self.contador_parpadeo.reiniciar()
            self.inicio_reporte = tiempo_actual
            return self.generador_reporte_parpadeo.generar_reporte(datos_parpadeos)

        if es_microsueno:
            datos_microsueno = {
                "conteo_microsueno": self.contador_microsueno.conteo_microsueno,
                "duraciones_microsueno": self.contador_microsueno.obtener_duraciones(),
                "reporte_microsueno": True,
                "reporte_parpadeo": False
            }
            return self.generador_reporte_microsueno.generar_reporte(datos_microsueno)

        return {
            'conteo_parpadeo': f'Contando parpadeos... {60 - tiempo_transcurrido} segundos restantes.',
            'reporte_parpadeo': False,
            'reporte_microsueno': False
        }