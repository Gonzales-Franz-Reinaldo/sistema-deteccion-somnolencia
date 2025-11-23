package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing

import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject
import kotlin.math.sqrt

/**
 * Caso de Uso: Detectar Manos Cerca de Ojos
 * 
 * Equivalente a: drowsiness_processor/data_processing/hands/
 * 
 * Detecta si las manos están cerca de los ojos (frotamiento de ojos)
 */
class DetectHandNearEyesUseCase @Inject constructor() {
    
    companion object {
        // ✅ CONVERTIR 40 píxeles a normalizado
        // Asumiendo resolución típica de 640x480:
        private const val PROXIMITY_THRESHOLD = 40f / 640f  // ≈ 0.0625f
        
        private const val LEFT_EYE_CENTER = 468   // Índice Python
        private const val RIGHT_EYE_CENTER = 473  // Índice Python
        
        private const val INDEX_FINGER_TIP = 8
        private const val MIDDLE_FINGER_TIP = 12
    }
    
    /**
     * Detectar si alguna mano está cerca de los ojos
     * 
     * @param faceLandmarks Landmarks faciales
     * @param handLandmarks Lista de landmarks de manos detectadas
     * @return Pair<Boolean, String> - (isNearEyes, whichHand)
     */
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>,
        handLandmarks: List<List<NormalizedLandmark>>?
    ): Pair<Boolean, String?> {
        if (faceLandmarks.size < 468 || handLandmarks.isNullOrEmpty()) {
            return Pair(false, null)
        }
        
        // Obtener centros de ojos
        val leftEyeCenter = faceLandmarks[LEFT_EYE_CENTER]
        val rightEyeCenter = faceLandmarks[RIGHT_EYE_CENTER]
        
        // Verificar cada mano detectada
        handLandmarks.forEachIndexed { index, hand ->
            if (hand.size >= 21) {
                val indexFingerTip = hand[INDEX_FINGER_TIP]
                val middleFingerTip = hand[MIDDLE_FINGER_TIP]
                
                // Calcular distancias a ambos ojos
                val distIndexToLeftEye = euclideanDistance(indexFingerTip, leftEyeCenter)
                val distIndexToRightEye = euclideanDistance(indexFingerTip, rightEyeCenter)
                val distMiddleToLeftEye = euclideanDistance(middleFingerTip, leftEyeCenter)
                val distMiddleToRightEye = euclideanDistance(middleFingerTip, rightEyeCenter)
                
                // Verificar si algún dedo está cerca de algún ojo
                val isNearEyes = distIndexToLeftEye < PROXIMITY_THRESHOLD ||
                                distIndexToRightEye < PROXIMITY_THRESHOLD ||
                                distMiddleToLeftEye < PROXIMITY_THRESHOLD ||
                                distMiddleToRightEye < PROXIMITY_THRESHOLD
                
                if (isNearEyes) {
                    val handLabel = if (index == 0) "PRIMERA_MANO" else "SEGUNDA_MANO"
                    return Pair(true, handLabel)
                }
            }
        }
        
        return Pair(false, null)
    }
    
    /**
     * Calcular distancia euclidiana 2D entre dos puntos
     */
    private fun euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): Float {
        val dx = p1.x() - p2.x()
        val dy = p1.y() - p2.y()
        return sqrt(dx * dx + dy * dy)
    }
}