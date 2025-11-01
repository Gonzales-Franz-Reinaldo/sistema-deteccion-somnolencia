import csv
import os
import json
from datetime import datetime


class ReportesSomnolencia:
    def __init__(self, nombre_archivo: str):
        self.nombre_archivo = nombre_archivo
        self.campos = ['marca_tiempo', 'reporte_frotamiento_ojos_primera_mano', 'conteo_frotamiento_ojos_primera_mano',
                       'duraciones_frotamiento_ojos_primera_mano', '|',
                       'reporte_frotamiento_ojos_segunda_mano', 'conteo_frotamiento_ojos_segunda_mano', 'duraciones_frotamiento_ojos_segunda_mano', '|',
                       'reporte_parpadeo', 'conteo_parpadeo', '|',
                       'reporte_microsueno', 'conteo_microsueno', 'duraciones_microsueno', '|',
                       'reporte_inclinacion', 'conteo_inclinacion', 'duraciones_inclinacion', '|',
                       'reporte_bostezo', 'conteo_bostezo', 'duraciones_bostezo']

        if not os.path.exists(self.nombre_archivo):
            self.crear_archivo_csv()

    def crear_archivo_csv(self):
        with open(self.nombre_archivo, mode='w', newline='') as archivo:
            escritor = csv.DictWriter(archivo, fieldnames=self.campos)
            escritor.writeheader()

    def principal(self, datos_reporte: dict):
        if (datos_reporte['frotamiento_ojos_primera_mano']['reporte_frotamiento_ojos'] or
                datos_reporte['frotamiento_ojos_segunda_mano']['reporte_frotamiento_ojos'] or
                datos_reporte['parpadeo_y_microsueno']['reporte_parpadeo'] or
                datos_reporte['parpadeo_y_microsueno']['reporte_microsueno'] or
                datos_reporte['inclinacion']['reporte_inclinacion'] or
                datos_reporte['bostezo']['reporte_bostezo']):
            fila = {
                'marca_tiempo': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'reporte_frotamiento_ojos_primera_mano': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('reporte_frotamiento_ojos', False),
                'conteo_frotamiento_ojos_primera_mano': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('conteo_frotamiento_ojos', 0),
                'duraciones_frotamiento_ojos_primera_mano': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('duraciones_frotamiento_ojos', []),
                '|': '|',
                'reporte_frotamiento_ojos_segunda_mano': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('reporte_frotamiento_ojos', False),
                'conteo_frotamiento_ojos_segunda_mano': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('conteo_frotamiento_ojos', 0),
                'duraciones_frotamiento_ojos_segunda_mano': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('duraciones_frotamiento_ojos', []),
                '|': '|',
                'reporte_parpadeo': datos_reporte.get('parpadeo_y_microsueno', {}).get('reporte_parpadeo', False),
                'conteo_parpadeo': datos_reporte.get('parpadeo_y_microsueno', {}).get('conteo_parpadeos', 0),
                '|': '|',
                'reporte_microsueno': datos_reporte.get('parpadeo_y_microsueno', {}).get('reporte_microsueno', False),
                'conteo_microsueno': datos_reporte.get('parpadeo_y_microsueno', {}).get('conteo_microsueno', 0),
                'duraciones_microsueno': datos_reporte.get('parpadeo_y_microsueno', {}).get('duraciones_microsueno', []),
                '|': '|',
                'reporte_inclinacion': datos_reporte.get('inclinacion', {}).get('reporte_inclinacion', False),
                'conteo_inclinacion': datos_reporte.get('inclinacion', {}).get('conteo_inclinacion', 0),
                'duraciones_inclinacion': datos_reporte.get('inclinacion', {}).get('duraciones_inclinacion', []),
                '|': '|',
                'reporte_bostezo': datos_reporte.get('bostezo', {}).get('reporte_bostezo', False),
                'conteo_bostezo': datos_reporte.get('bostezo', {}).get('conteo_bostezo', 0),
                'duraciones_bostezo': datos_reporte.get('bostezo', {}).get('duraciones_bostezo', [])
            }

            with open(self.nombre_archivo, mode='a', newline='') as archivo:
                escritor = csv.DictWriter(archivo, fieldnames=self.campos)
                escritor.writerow(fila)

    def generar_reporte_json(self, datos_reporte: dict) -> str:
        reporte_json = {
            'marca_tiempo': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'frotamiento_ojos_primera_mano': {
                'reporte': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('reporte_frotamiento_ojos', False),
                'conteo': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('conteo_frotamiento_ojos', 0),
                'duraciones': datos_reporte.get('frotamiento_ojos_primera_mano', {}).get('duraciones_frotamiento_ojos', [])
            },
            'frotamiento_ojos_segunda_mano': {
                'reporte': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('reporte_frotamiento_ojos', False),
                'conteo': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('conteo_frotamiento_ojos', 0),
                'duraciones': datos_reporte.get('frotamiento_ojos_segunda_mano', {}).get('duraciones_frotamiento_ojos', [])
            },
            'parpadeo': {
                'reporte': datos_reporte.get('parpadeo_y_microsueno', {}).get('reporte_parpadeo', False),
                'conteo': datos_reporte.get('parpadeo_y_microsueno', {}).get('conteo_parpadeos', 0)
            },
            'microsueno': {
                'reporte': datos_reporte.get('parpadeo_y_microsueno', {}).get('reporte_microsueno', False),
                'conteo': datos_reporte.get('parpadeo_y_microsueno', {}).get('conteo_microsueno', 0),
                'duraciones': datos_reporte.get('parpadeo_y_microsueno', {}).get('duraciones_microsueno', [])
            },
            'inclinacion': {
                'reporte': datos_reporte.get('inclinacion', {}).get('reporte_inclinacion', False),
                'conteo': datos_reporte.get('inclinacion', {}).get('conteo_inclinacion', 0),
                'duraciones': datos_reporte.get('inclinacion', {}).get('duraciones_inclinacion', [])
            },
            'bostezo': {
                'reporte': datos_reporte.get('bostezo', {}).get('reporte_bostezo', False),
                'conteo': datos_reporte.get('bostezo', {}).get('conteo_bostezo', 0),
                'duraciones': datos_reporte.get('bostezo', {}).get('duraciones_bostezo', [])
            }
        }
        return json.dumps(reporte_json)