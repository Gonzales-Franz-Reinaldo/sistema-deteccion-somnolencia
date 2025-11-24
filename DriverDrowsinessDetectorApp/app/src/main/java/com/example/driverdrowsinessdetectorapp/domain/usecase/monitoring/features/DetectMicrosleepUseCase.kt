package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.EyeDistances
import javax.inject.Inject

class DetectMicrosleepUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectMicrosleepUseCase"
        private const val MICROSLEEP_DURATION_MS = 2500L
        private const val EAR_THRESHOLD = 0.2f  
    }
    
    private var eyesClosedStartTime: Long? = null
    private var microsleepCount = 0
    private val microsleepDurations = mutableListOf<Long>()
    private var isCurrentlyInMicrosleep = false
    
    operator fun invoke(eyeDistances: EyeDistances): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()

        //  CALCULAR EAR
        val earRight = if (eyeDistances.horizontalRightEye > 0) {
            eyeDistances.verticalRightEyelid / eyeDistances.horizontalRightEye
        } else 0f
        
        val earLeft = if (eyeDistances.horizontalLeftEye > 0) {
            eyeDistances.verticalLeftEyelid / eyeDistances.horizontalLeftEye
        } else 0f
        
        val avgEar = (earRight + earLeft) / 2f
        val isEyesClosed = avgEar < EAR_THRESHOLD

        Log.d(TAG, "EAR: Right=$earRight, Left=$earLeft, Avg=$avgEar, Closed=$isEyesClosed")

        if (isEyesClosed) {
            if (eyesClosedStartTime == null) {
                eyesClosedStartTime = currentTime
                isCurrentlyInMicrosleep = false
                Log.d(TAG, "👁️ Ojos cerrados (EAR=$avgEar)")
            }

            val duration = currentTime - (eyesClosedStartTime ?: currentTime)

            if (duration >= MICROSLEEP_DURATION_MS && !isCurrentlyInMicrosleep) {
                isCurrentlyInMicrosleep = true
                microsleepCount++
                microsleepDurations.add(duration)
                Log.d(TAG, "🚨 MICROSUEÑO: ${duration}ms (count=$microsleepCount)")
                return Triple(true, microsleepCount, microsleepDurations)
            }

            return Triple(false, microsleepCount, microsleepDurations)
        } else {
            // Ojos abiertos
            if (eyesClosedStartTime != null) {
                val duration = currentTime - (eyesClosedStartTime ?: currentTime)
                Log.d(TAG, "👁️ Ojos abiertos (duración: ${duration}ms)")
            }
            eyesClosedStartTime = null
            isCurrentlyInMicrosleep = false
        }
        
        return Triple(false, microsleepCount, microsleepDurations)
    }
    
    fun reset() {
        eyesClosedStartTime = null
        microsleepCount = 0
        microsleepDurations.clear()
        isCurrentlyInMicrosleep = false
    }
}