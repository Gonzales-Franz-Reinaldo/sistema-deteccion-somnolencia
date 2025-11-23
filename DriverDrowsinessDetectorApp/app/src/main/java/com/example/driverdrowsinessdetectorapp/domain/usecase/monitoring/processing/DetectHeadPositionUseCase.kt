package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing

import android.util.Log
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject
import kotlin.math.sqrt

data class HeadPosition(
    val isHeadDown: Boolean,
    val position: String,
    val distanceNoseMouth: Float,
    val distanceForeheadNose: Float
)

class DetectHeadPositionUseCase @Inject constructor() {

    companion object {
        private const val TAG = "DetectHeadPositionUseCase"
        
        // ÍNDICES CORRECTOS
        private const val NOSE_TIP = 4
        private const val MOUTH_CENTER = 0
        private const val FOREHEAD = 5
        private const val RIGHT_CHEEK = 205
        private const val LEFT_CHEEK = 425
        
        // Umbral de inclinación
        private const val TILT_THRESHOLD = 0.02f // 2% de diferencia
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

        val distanceNoseMouth = euclideanDistance(noseTip, mouthCenter)
        val distanceForeheadNose = euclideanDistance(forehead, noseTip)

        val noseY = noseTip.y()
        val rightCheekY = rightCheek.y()
        val leftCheekY = leftCheek.y()

        Log.d(TAG, "🎯 Coordenadas: nariz=$noseY, mejillaDer=$rightCheekY, mejillaIzq=$leftCheekY")
        Log.d(TAG, "📏 Distancias: nariz-boca=$distanceNoseMouth, frente-nariz=$distanceForeheadNose")

        val isHeadDown: Boolean
        val position: String

        //  LÓGICA CORRECTA SEGÚN PYTHON
        when {
            // Cabeza inclinada a la DERECHA (mejilla derecha SUBE)
            (rightCheekY - noseY) > TILT_THRESHOLD && noseY > leftCheekY &&
                    distanceNoseMouth < distanceForeheadNose -> {
                isHeadDown = true
                position = "cabeza abajo derecha"
                Log.d(TAG, "🙇 CABECEO DERECHA detectado (diff=${rightCheekY - noseY})")
            }
            
            // Cabeza inclinada a la IZQUIERDA (mejilla izquierda SUBE)
            (leftCheekY - noseY) > TILT_THRESHOLD && noseY > rightCheekY &&
                    distanceNoseMouth < distanceForeheadNose -> {
                isHeadDown = true
                position = "cabeza abajo izquierda"
                Log.d(TAG, "🙇 CABECEO IZQUIERDA detectado (diff=${leftCheekY - noseY})")
            }
            
            // Cabeza NORMAL
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