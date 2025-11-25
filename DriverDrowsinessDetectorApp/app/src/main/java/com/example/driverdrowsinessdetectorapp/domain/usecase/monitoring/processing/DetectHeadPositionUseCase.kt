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
        
        // ========== ÍNDICES MEDIAPIPE ==========
        private const val NOSE_TIP = 1
        private const val NOSE_BASE = 0
        private const val NOSE_BOTTOM = 5
        private const val FOREHEAD = 4
        
        // UMBRAL SOLO PARA CABEZA HACIA ABAJO
        private const val VERTICAL_THRESHOLD = 0.012f
    }

    operator fun invoke(faceLandmarks: List<NormalizedLandmark>): HeadPosition {
        if (faceLandmarks.size < 468) {
            return HeadPosition(false, "cabeza arriba", 0f, 0f)
        }

        val noseTip = faceLandmarks[NOSE_TIP]
        val noseBase = faceLandmarks[NOSE_BASE]
        val noseBottom = faceLandmarks[NOSE_BOTTOM]
        val forehead = faceLandmarks[FOREHEAD]

        // ========== CALCULAR DISTANCIAS VERTICALES ==========
        val distanceNoseMouth = euclideanDistance(noseTip, noseBase)
        val distanceForeheadNose = euclideanDistance(noseTip, noseBottom)

        Log.d(TAG, "📏 Verticales: nariz-boca=${distanceNoseMouth.f3()}, frente-nariz=${distanceForeheadNose.f3()}")

        // ========== DETECTAR SOLO CABEZA HACIA ABAJO ==========
        val isHeadDown: Boolean
        val position: String

        // CONDICIÓN: CABEZA AGACHADA HACIA ABAJO
        if (distanceNoseMouth < distanceForeheadNose) {
            isHeadDown = true
            position = "cabeza abajo"
            Log.w(TAG, "🙇⬇️ CABECEO FRONTAL DETECTADO")
            Log.w(TAG, "   → Diferencia: ${(distanceForeheadNose - distanceNoseMouth).f3()}")
        } else {
            isHeadDown = false
            position = "cabeza arriba"
        }

        return HeadPosition(isHeadDown, position, distanceNoseMouth, distanceForeheadNose)
    }

    private fun euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): Float {
        val dx = p1.x() - p2.x()
        val dy = p1.y() - p2.y()
        return sqrt(dx * dx + dy * dy)
    }

    private fun Float.f3(): String = "%.3f".format(this)
}