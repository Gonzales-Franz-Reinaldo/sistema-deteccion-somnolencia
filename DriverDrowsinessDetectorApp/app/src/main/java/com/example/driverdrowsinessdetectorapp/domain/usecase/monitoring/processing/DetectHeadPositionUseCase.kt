package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing

import android.util.Log
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject
import kotlin.math.sqrt

data class HeadPosition(
    val isHeadDown: Boolean,
    val position: String,
    val distanceNoseMouth: Float,
    val distanceForeheadNose: Float,
    val noFaceDetected: Boolean = false  
)

class DetectHeadPositionUseCase @Inject constructor() {

    companion object {
        private const val TAG = "DetectHeadPosition"
        
        // Índices MediaPipe
        private const val NOSE_TIP = 1
        private const val NOSE_BASE = 0
        private const val NOSE_BOTTOM = 5
        
        // Umbral para detectar cabeza abajo
        private const val HEAD_DOWN_THRESHOLD = 0.002f
        private const val HYSTERESIS_MARGIN = 0.005f
    }
    
    private var wasHeadDown = false
    private var lastKnownHeadDown = false  
    private var frameCount = 0

    operator fun invoke(faceLandmarks: List<NormalizedLandmark>?): HeadPosition {
        frameCount++
        
        // ✅ SI NO HAY ROSTRO: Mantener último estado conocido
        if (faceLandmarks == null || faceLandmarks.size < 468) {
            if (frameCount % 10 == 0) {
                Log.w(TAG, "⚠️ Sin rostro detectado - Manteniendo estado: ${if(lastKnownHeadDown) "ABAJO" else "ARRIBA"}")
            }
            return HeadPosition(
                isHeadDown = lastKnownHeadDown,  // ✅ Usar último estado
                position = if (lastKnownHeadDown) "cabeza abajo (sin rostro)" else "sin rostro",
                distanceNoseMouth = 0f,
                distanceForeheadNose = 0f,
                noFaceDetected = true
            )
        }

        val noseTip = faceLandmarks[NOSE_TIP]
        val noseBase = faceLandmarks[NOSE_BASE]
        val noseBottom = faceLandmarks[NOSE_BOTTOM]

        val distanceNoseMouth = euclideanDistance(noseTip, noseBase)
        val distanceForeheadNose = euclideanDistance(noseTip, noseBottom)
        
        val difference = distanceForeheadNose - distanceNoseMouth

        // Detectar con histéresis
        val isHeadDown: Boolean = if (wasHeadDown) {
            difference > -HYSTERESIS_MARGIN
        } else {
            difference > HEAD_DOWN_THRESHOLD
        }
        
        //  Actualizar estados
        val stateChanged = isHeadDown != wasHeadDown
        wasHeadDown = isHeadDown
        lastKnownHeadDown = isHeadDown  
        
        val position = if (isHeadDown) "cabeza abajo" else "cabeza arriba"

        // Log cuando cambia estado
        if (stateChanged) {
            if (isHeadDown) {
                Log.w(TAG, "🙇⬇️ CABEZA INCLINADA DETECTADA (diff=${"%.3f".format(difference)})")
            } else {
                Log.d(TAG, "⬆️ Cabeza ARRIBA (diff=${"%.3f".format(difference)})")
            }
        }

        return HeadPosition(
            isHeadDown = isHeadDown,
            position = position,
            distanceNoseMouth = distanceNoseMouth,
            distanceForeheadNose = distanceForeheadNose,
            noFaceDetected = false
        )
    }

    private fun euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): Float {
        val dx = p1.x() - p2.x()
        val dy = p1.y() - p2.y()
        return sqrt(dx * dx + dy * dy)
    }
    
    fun reset() {
        wasHeadDown = false
        lastKnownHeadDown = false
        frameCount = 0
    }
}