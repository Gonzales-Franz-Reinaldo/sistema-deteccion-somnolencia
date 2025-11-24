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
        private const val NOSE_TIP = 1
        private const val NOSE_BASE = 0
        private const val NOSE_BOTTOM = 5
        private const val FOREHEAD = 4
        private const val RIGHT_CHEEK = 205
        private const val LEFT_CHEEK = 425
        
        // UMBRALES AJUSTADOS
        private const val LATERAL_THRESHOLD = 0.015f      // Inclinación lateral
        private const val VERTICAL_THRESHOLD = 0.012f     // Inclinación frontal
    }

    operator fun invoke(faceLandmarks: List<NormalizedLandmark>): HeadPosition {
        if (faceLandmarks.size < 468) {
            return HeadPosition(false, "cabeza arriba", 0f, 0f)
        }

        val noseTip = faceLandmarks[NOSE_TIP]
        val noseBase = faceLandmarks[NOSE_BASE]
        val noseBottom = faceLandmarks[NOSE_BOTTOM]
        val forehead = faceLandmarks[FOREHEAD]
        val rightCheek = faceLandmarks[RIGHT_CHEEK]
        val leftCheek = faceLandmarks[LEFT_CHEEK]

        // 📏 CALCULAR DISTANCIAS VERTICALES
        val distanceNoseMouth = euclideanDistance(noseTip, noseBase)
        val distanceForeheadNose = euclideanDistance(noseTip, noseBottom)

        // 📏 CALCULAR DISTANCIAS LATERALES
        val distanceNoseRightCheek = euclideanDistance(noseTip, rightCheek)
        val distanceNoseLeftCheek = euclideanDistance(noseTip, leftCheek)
        val lateralDifference = kotlin.math.abs(distanceNoseRightCheek - distanceNoseLeftCheek)

        Log.d(TAG, "📏 Verticales: nariz-boca=$distanceNoseMouth, frente-nariz=$distanceForeheadNose")
        Log.d(TAG, "📏 Laterales: Der=$distanceNoseRightCheek, Izq=$distanceNoseLeftCheek, Diff=$lateralDifference")

        // PRIORIDAD A INCLINACIÓN LATERAL (SIN CONDICIÓN VERTICAL)
        val isHeadDown: Boolean
        val position: String

        when {
            // CABECEO LATERAL DERECHO (nariz más cerca de mejilla derecha)
            // AHORA SOLO VERIFICA DISTANCIA LATERAL, NO REQUIERE CABEZA ABAJO
            distanceNoseRightCheek < distanceNoseLeftCheek - LATERAL_THRESHOLD -> {
                isHeadDown = true
                position = "cabeza abajo derecha"
                Log.d(TAG, "🙇➡️ CABECEO DERECHO (lateral=${lateralDifference.format(3)})")
            }
            
            // CABECEO LATERAL IZQUIERDO
            distanceNoseLeftCheek < distanceNoseRightCheek - LATERAL_THRESHOLD -> {
                isHeadDown = true
                position = "cabeza abajo izquierda"
                Log.d(TAG, "🙇⬅️ CABECEO IZQUIERDO (lateral=${lateralDifference.format(3)})")
            }
            
            // CABECEO FRONTAL (solo si no hay inclinación lateral significativa)
            lateralDifference < VERTICAL_THRESHOLD &&
            distanceNoseMouth < distanceForeheadNose -> {
                isHeadDown = true
                position = "cabeza abajo frontal"
                Log.d(TAG, "🙇⬇️ CABECEO FRONTAL (vertical=${(distanceForeheadNose - distanceNoseMouth).format(3)})")
            }
            
            // CABEZA NORMAL
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

    private fun Float.format(decimals: Int): String = "%.${decimals}f".format(this)
}