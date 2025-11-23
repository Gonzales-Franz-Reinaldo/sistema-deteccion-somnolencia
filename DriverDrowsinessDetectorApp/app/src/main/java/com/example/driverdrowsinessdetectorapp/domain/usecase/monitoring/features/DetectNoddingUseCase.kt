package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.HeadPosition
import javax.inject.Inject

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectNoddingUseCase"
        private const val NODDING_DURATION_MS = 3000L
    }
    
    private var headDownStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var isCurrentlyNodding = false
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        if (headPosition.isHeadDown) {
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                isCurrentlyNodding = false
                Log.d(TAG, "🙇 Cabeza inclinada")
            }
            
            val duration = currentTime - (headDownStartTime ?: currentTime)
            Log.d(TAG, "⏱️ Cabeza inclinada: ${duration}ms")
            
        } else {
            //  CABEZA VOLVIÓ ARRIBA - CALCULAR DURACIÓN
            if (headDownStartTime != null) {
                val duration = currentTime - (headDownStartTime ?: currentTime)
                headDownStartTime = null
                
                // CABECEO = CABEZA ABAJO ≥ 3 SEGUNDOS
                if (duration >= NODDING_DURATION_MS && !isCurrentlyNodding) {
                    isCurrentlyNodding = true
                    noddingCount++
                    noddingDurations.add(duration)
                    Log.d(TAG, "🚨 CABECEO: ${duration}ms (count=$noddingCount)")
                    return Triple(true, noddingCount, noddingDurations)
                } else {
                    Log.d(TAG, "🙇 Cabeza arriba (duración: ${duration}ms)")
                }
            }
        }
        
        return Triple(false, noddingCount, noddingDurations)
    }
    
    fun reset() {
        headDownStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        isCurrentlyNodding = false
    }
}