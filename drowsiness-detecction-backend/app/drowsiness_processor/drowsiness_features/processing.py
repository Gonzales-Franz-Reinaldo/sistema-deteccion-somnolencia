# Imports absolutos
from app.drowsiness_processor.drowsiness_features.processor import ProcesadorSomnolencia
from app.drowsiness_processor.drowsiness_features.eye_rub.processing import EstimadorFrotamientoOjos
from app.drowsiness_processor.drowsiness_features.flicker_and_microsleep.processing import EstimadorParpadeos
from app.drowsiness_processor.drowsiness_features.pitch.processing import EstimadorInclinacion
from app.drowsiness_processor.drowsiness_features.yawn.processing import EstimadorBostezo


class ProcesamientoCaracteristicasSomnolencia:
    def __init__(self):
        self.caracteristicas_somnolencia: dict[str, ProcesadorSomnolencia] = {
            'frotamiento_ojos_primera_mano': EstimadorFrotamientoOjos(),
            'frotamiento_ojos_segunda_mano': EstimadorFrotamientoOjos(),
            'parpadeo_y_microsueno': EstimadorParpadeos(),
            'inclinacion': EstimadorInclinacion(),
            'bostezo': EstimadorBostezo(),
        }
        self.caracteristica_procesada: dict = {
            'frotamiento_ojos_primera_mano': None,
            'frotamiento_ojos_segunda_mano': None,
            'parpadeo_y_microsueno': None,
            'inclinacion': None,
            'bostezo': None
        }

    def principal(self, distancias: dict):
        self.caracteristica_procesada['frotamiento_ojos_primera_mano'] = None
        self.caracteristica_procesada['frotamiento_ojos_segunda_mano'] = None
        
        if 'primera_mano' in distancias:
            self.caracteristica_procesada['frotamiento_ojos_primera_mano'] = (
                self.caracteristicas_somnolencia['frotamiento_ojos_primera_mano'].procesar(distancias['primera_mano'])
            )
        else:
            self.caracteristica_procesada['frotamiento_ojos_primera_mano'] = (
                self.caracteristicas_somnolencia['frotamiento_ojos_primera_mano'].procesar({})
            )

        if 'segunda_mano' in distancias:
            self.caracteristica_procesada['frotamiento_ojos_segunda_mano'] = (
                self.caracteristicas_somnolencia['frotamiento_ojos_segunda_mano'].procesar(distancias['segunda_mano'])
            )
        else:
            self.caracteristica_procesada['frotamiento_ojos_segunda_mano'] = (
                self.caracteristicas_somnolencia['frotamiento_ojos_segunda_mano'].procesar({})
            )

        self.caracteristica_procesada['parpadeo_y_microsueno'] = (
            self.caracteristicas_somnolencia['parpadeo_y_microsueno'].procesar(distancias.get('ojos', {}))
        )
        self.caracteristica_procesada['inclinacion'] = (
            self.caracteristicas_somnolencia['inclinacion'].procesar(distancias.get('cabeza', {}))
        )
        self.caracteristica_procesada['bostezo'] = (
            self.caracteristicas_somnolencia['bostezo'].procesar(distancias.get('boca', {}))
        )
        return self.caracteristica_procesada