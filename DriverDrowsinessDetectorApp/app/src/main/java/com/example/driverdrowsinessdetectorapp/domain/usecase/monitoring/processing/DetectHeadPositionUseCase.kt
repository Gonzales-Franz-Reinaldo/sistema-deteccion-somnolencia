package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing

import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject
import kotlin.math.sqrt

/**
 * Detectar Posición de Cabeza - MÉTODO PYTHON
 *
 * Equivalente a: pitch/processing.py - DeteccionInclinacion
 */
data class HeadPosition(
    val isHeadDown: Boolean,
    val position: String,  // "cabeza abajo derecha", "cabeza abajo izquierda", "cabeza arriba"
    val distanceNoseMouth: Float,
    val distanceForeheadNose: Float
)

class DetectHeadPositionUseCase @Inject constructor() {

    companion object {
        // Índices según Python: cabeza['distancias'] = [1, 0, 1, 5, 4, 205, 425]
        private const val NOSE_TIP = 4
        private const val MOUTH_CENTER = 0
        private const val FOREHEAD = 5
        private const val RIGHT_CHEEK = 205
        private const val LEFT_CHEEK = 425
    }

    operator fun invoke(faceLandmarks: List<NormalizedLandmark>): HeadPosition {
        if (faceLandmarks.size < 468) {
            return HeadPosition(false, "cabeza arriba", 0f, 0f)
        }

        val noseTip = faceLandmarks[NOSE_TIP]
        val mouthCenter = faceLandmarks[MOUTH_CENTER]
        val forehead = faceLandmarks[FOREHEAD]
        val rightCheek = faceLandmarks[RIGHT_CHEEK]
        val leftCheek = faceLandmarks[LEFT_CHEEK]

        // Calcular distancias
        val distanceNoseMouth = euclideanDistance(noseTip, mouthCenter)
        val distanceForeheadNose = euclideanDistance(forehead, noseTip)

        // Obtener coordenadas Y
        val noseY = noseTip.y()
        val rightCheekY = rightCheek.y()
        val leftCheekY = leftCheek.y()

        // LÓGICA PYTHON EXACTA
        val isHeadDown: Boolean
        val position: String

        when {
            // Cabeza abajo derecha
            rightCheekY > noseY && noseY > leftCheekY &&
                    distanceNoseMouth < distanceForeheadNose -> {
                isHeadDown = true
                position = "cabeza abajo derecha"
            }
            // Cabeza abajo izquierda
            leftCheekY > noseY && noseY > rightCheekY &&
                    distanceNoseMouth < distanceForeheadNose -> {
                isHeadDown = true
                position = "cabeza abajo izquierda"
            }
            // Cabeza arriba
            noseY < rightCheekY && noseY < leftCheekY &&
                    distanceNoseMouth > distanceForeheadNose -> {
                isHeadDown = false
                position = "cabeza arriba"
            }
            else -> {
                isHeadDown = false
                position = "cabeza arriba"
            }
        }

        return HeadPosition(isHeadDown, position, distanceNoseMouth, distanceForeheadNose)
    }

    private fun euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): Float {
        val dx = p1.x() - p2.x()
        val dy = p1.y() - p2.y()
        return sqrt(dx * dx + dy * dy)
    }
}