package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.EyeDistances
import javax.inject.Inject

class DetectBlinkUseCase @Inject constructor(
    private val windowedCounter: WindowedCounterUseCase
) {

    companion object {
        private const val TAG = "DetectBlinkUseCase"
        private const val BLINK_WINDOW_MS = 60_000L
        private const val BLINK_COUNT_THRESHOLD = 20
        
        // ✅ UMBRAL EAR: Ojos cerrados cuando EAR < 0.2
        private const val EAR_THRESHOLD = 0.2f
    }

    private var wasEyesClosed = false

    operator fun invoke(eyeDistances: EyeDistances): Triple<Boolean, Int, Boolean> {
        val currentTime = System.currentTimeMillis()

        // ✅ CALCULAR EAR (Eye Aspect Ratio)
        val earRight = if (eyeDistances.horizontalRightEye > 0) {
            eyeDistances.verticalRightEyelid / eyeDistances.horizontalRightEye
        } else 0f
        
        val earLeft = if (eyeDistances.horizontalLeftEye > 0) {
            eyeDistances.verticalLeftEyelid / eyeDistances.horizontalLeftEye
        } else 0f
        
        val avgEar = (earRight + earLeft) / 2f

        // ✅ DETECCIÓN: EAR < 0.2 = CERRADO
        val isEyesClosed = avgEar < EAR_THRESHOLD

        var isBlinking = false

        // Detectar parpadeo completo (cerrado → abierto)
        if (wasEyesClosed && !isEyesClosed) {
            windowedCounter.addEvent(
                currentTime,
                WindowedCounterUseCase.WindowConfig(
                    windowDurationMs = BLINK_WINDOW_MS,
                    threshold = BLINK_COUNT_THRESHOLD
                )
            )
            isBlinking = true
            Log.d(TAG, "👁️ Parpadeo detectado (EAR: $avgEar)")
        }

        wasEyesClosed = isEyesClosed

        val blinkCount = windowedCounter.getCurrentCount(currentTime, BLINK_WINDOW_MS)

        return Triple(isBlinking, blinkCount, isEyesClosed)
    }

    fun reset() {
        wasEyesClosed = false
        windowedCounter.reset()
    }
}