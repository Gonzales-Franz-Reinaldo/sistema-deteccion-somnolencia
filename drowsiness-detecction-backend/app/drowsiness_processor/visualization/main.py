import numpy as np
import cv2
import time
from typing import Tuple


class VisualizadorReporte:
    def __init__(self):
        self.coordenadas = {
            'frotamiento_ojos_primera_mano': (10, 20),
            'frotamiento_ojos_segunda_mano': (10, 100),
            'parpadeo': (10, 180),
            'microsueno': (10, 260),
            'inclinacion': (10, 340),
            'bostezo': (10, 420),
        }
        self.visualizar_reportes = {
            'frotamiento_ojos_primera_mano': {'reporte': False, 'conteo': 0, 'duraciones': []},
            'frotamiento_ojos_segunda_mano': {'reporte': False, 'conteo': 0, 'duraciones': []},
            'parpadeo': {'reporte': False, 'conteo': 0},
            'microsueno': {'reporte': False, 'conteo': 0, 'duraciones': []},
            'inclinacion': {'reporte': False, 'conteo': 0, 'duraciones': []},
            'bostezo': {'reporte': False, 'conteo': 0, 'duraciones': []}
        }
        self.tiempos = {
            'frotamiento_ojos_primera_mano': time.time(),
            'frotamiento_ojos_segunda_mano': time.time(),
            'parpadeo': time.time(),
            'bostezo': time.time()
        }
        self.umbrales_advertencia = {
            'frotamiento_ojos_primera_mano': 10,
            'frotamiento_ojos_segunda_mano': 10,
            'microsueno': 1,
            'inclinacion': 1,
            'parpadeo': 20,
            'bostezo': 10
        }

        self.posicion_inicial: int = 20
        self.espaciado: int = 80
        self.margen: int = 40

    def dibujar_rectangulo(self, bosquejo: np.ndarray, superior_izquierda: Tuple[int, int], inferior_derecha: Tuple[int, int], color: Tuple[int, int, int]):
        cv2.rectangle(bosquejo, superior_izquierda, inferior_derecha, color, 2)

    def obtener_color(self, estado_reporte: str) -> Tuple[int, int, int]:
        if estado_reporte == 'esperando':
            return 180, 180, 180
        elif estado_reporte == 'advertencia':
            return 0, 255, 255
        elif estado_reporte == 'alarma':
            return 0, 0, 255
        elif estado_reporte == 'normal':
            return 0, 255, 0

    def dibujar_texto_reporte(self, bosquejo: np.ndarray, texto: str, posicion: Tuple[int, int], color: Tuple[int, int, int]):
        cv2.putText(bosquejo, texto, posicion, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1)

    def dibujar_advertencias_general(self, bosquejo: np.ndarray, caracteristica: str):
        posicion = self.coordenadas[caracteristica]
        color = self.obtener_color('esperando')
        if caracteristica == 'microsueno' or caracteristica == 'inclinacion':
            if caracteristica == 'microsueno':
                self.dibujar_texto_reporte(bosquejo, f"evaluando: {caracteristica.replace('_', ' ')}: manténgase alerta", posicion, color)

            if caracteristica == 'inclinacion':
                self.dibujar_texto_reporte(bosquejo, f"evaluando: {caracteristica.replace('_', ' ')}: manténgase alerta", posicion, color)
        else:
            tiempo_actual = time.time()
            tiempo_inicio_caracteristica = self.tiempos[caracteristica]
            tiempo_transcurrido = round(tiempo_actual - tiempo_inicio_caracteristica, 0)

            if caracteristica == 'frotamiento_ojos_primera_mano' or caracteristica == 'frotamiento_ojos_segunda_mano':
                self.dibujar_texto_reporte(bosquejo, f"contando: {caracteristica.replace('_', ' ')}: {300 - tiempo_transcurrido} segundos restantes", posicion, color)

            if caracteristica == 'parpadeo':
                self.dibujar_texto_reporte(bosquejo, f"contando: {caracteristica.replace('_', ' ')}: {60 - tiempo_transcurrido} segundos restantes", posicion, color)

            if caracteristica == 'bostezo':
                self.dibujar_texto_reporte(bosquejo, f"contando: {caracteristica.replace('_', ' ')}: {180 - tiempo_transcurrido} segundos restantes", posicion, color)

    def dibujar_advertencias_reporte(self, bosquejo: np.ndarray, caracteristica: str):
        posicion = self.coordenadas[caracteristica]
        conteo_caracteristica = self.visualizar_reportes[caracteristica]['conteo']
        umbral_advertencia = self.umbrales_advertencia[caracteristica]

        if caracteristica == 'microsueno' or caracteristica == 'inclinacion':
            if conteo_caracteristica >= umbral_advertencia:
                color = self.obtener_color('alarma')
        else:
            if conteo_caracteristica > umbral_advertencia:
                color = self.obtener_color('advertencia')
            else:
                color = self.obtener_color('normal')

        self.dibujar_texto_reporte(bosquejo, f"{caracteristica.replace('_', ' ')} {caracteristica}: {conteo_caracteristica}", posicion, color)

        if caracteristica == 'parpadeo':
            texto = f"{caracteristica.replace('_', ' ')} {caracteristica}: {conteo_caracteristica}"
            tamano_texto, _ = cv2.getTextSize(texto, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            ancho_texto, alto_texto = tamano_texto
            superior_izquierda = (posicion[0] - 10, posicion[1] - 20)
            inferior_derecha = (posicion[0] + ancho_texto + 20, posicion[1] + alto_texto + 20)
            self.dibujar_rectangulo(bosquejo, superior_izquierda, inferior_derecha, color)
            self.actualizar_coordenadas(caracteristica, (10, inferior_derecha[1]))

        if caracteristica != 'parpadeo':
            duraciones_caracteristica = self.visualizar_reportes[caracteristica]['duraciones']

            desplazamiento_y = posicion[1] + 30
            for i, duracion in enumerate(duraciones_caracteristica):
                self.dibujar_texto_reporte(bosquejo, f"#{i + 1}: {duracion} seg", (posicion[0], desplazamiento_y), color)
                desplazamiento_y += 20

                texto = f"#{i + 1}: {duracion} seg"

                tamano_texto, _ = cv2.getTextSize(texto, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
                ancho_texto, alto_texto = tamano_texto
                superior_izquierda = (posicion[0] - 10, posicion[1] - 20)
                inferior_derecha = (posicion[0] + ancho_texto + 20, posicion[1] + alto_texto + 20 * (len(duraciones_caracteristica) + 1))
                self.dibujar_rectangulo(bosquejo, superior_izquierda, inferior_derecha, color)
                self.actualizar_coordenadas(caracteristica, (10, inferior_derecha[1]))

    def actualizar_coordenadas(self, caracteristica: str, nuevas_coordenadas: tuple[int, int]):
        claves = list(self.coordenadas.keys())
        coordenadas = list(self.coordenadas.values())
        posicion = claves.index(caracteristica)
        x, y = nuevas_coordenadas
        y = y + self.margen
        if posicion == 5:
            pass
        else:
            coordenadas[posicion+1] = (x, y)
            self.coordenadas = dict(zip(claves, coordenadas))

    def actualizar_reporte(self, caracteristica: str, datos: dict):
        caracteristica_base = caracteristica.replace('_primera_mano', '').replace('_segunda_mano', '')
        reporte = datos[f'reporte_{caracteristica_base}']

        if reporte:
            contador = datos[f'conteo_{caracteristica_base}']
            self.visualizar_reportes[caracteristica]['reporte'] = reporte
            self.visualizar_reportes[caracteristica]['conteo'] = contador

        if caracteristica != 'parpadeo':
            if reporte:
                duraciones = datos[f'duraciones_{caracteristica_base}']
                self.visualizar_reportes[caracteristica]['duraciones'] = duraciones

    def visualizar_todos_reportes(self, bosquejo: np.ndarray, datos_reporte: dict):
        # primera mano
        self.actualizar_reporte('frotamiento_ojos_primera_mano', datos_reporte['frotamiento_ojos_primera_mano'])
        if self.visualizar_reportes['frotamiento_ojos_primera_mano']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'frotamiento_ojos_primera_mano')
        else:
            self.dibujar_advertencias_general(bosquejo, 'frotamiento_ojos_primera_mano')

        # segunda mano
        self.actualizar_reporte('frotamiento_ojos_segunda_mano', datos_reporte['frotamiento_ojos_segunda_mano'])
        if self.visualizar_reportes['frotamiento_ojos_segunda_mano']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'frotamiento_ojos_segunda_mano')
        else:
            self.dibujar_advertencias_general(bosquejo, 'frotamiento_ojos_segunda_mano')

        # parpadeo
        self.actualizar_reporte('parpadeo', datos_reporte['parpadeo_y_microsueno'])
        if self.visualizar_reportes['parpadeo']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'parpadeo')
        else:
            self.dibujar_advertencias_general(bosquejo, 'parpadeo')

        # microsueño
        self.actualizar_reporte('microsueno', datos_reporte['parpadeo_y_microsueno'])
        if self.visualizar_reportes['microsueno']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'microsueno')
        else:
            self.dibujar_advertencias_general(bosquejo, 'microsueno')

        # inclinación
        self.actualizar_reporte('inclinacion', datos_reporte['inclinacion'])
        if self.visualizar_reportes['inclinacion']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'inclinacion')
        else:
            self.dibujar_advertencias_general(bosquejo, 'inclinacion')

        # bostezo
        self.actualizar_reporte('bostezo', datos_reporte['bostezo'])
        if self.visualizar_reportes['bostezo']['reporte']:
            self.dibujar_advertencias_reporte(bosquejo, 'bostezo')
        else:
            self.dibujar_advertencias_general(bosquejo, 'bostezo')
        return bosquejo