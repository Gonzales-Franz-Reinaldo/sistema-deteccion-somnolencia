package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.HeadPosition
import javax.inject.Inject

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectNoddingUseCase"
        private const val NODDING_DURATION_MS = 3000L // 3 segundos
    }
    
    private var headDownStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var lastDetectionTime: Long = 0
    private var isCurrentlyDetecting = false
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        if (headPosition.isHeadDown) {
            // Cabeza inclinada
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                isCurrentlyDetecting = false
                Log.d(TAG, "🙇 Cabeza inclinada: ${headPosition.position}")
            }
            
            val duration = currentTime - (headDownStartTime ?: currentTime)
            
            //  DETECTAR MIENTRAS ESTÁ INCLINADA (cada 3 segundos)
            if (duration >= NODDING_DURATION_MS && !isCurrentlyDetecting) {
                isCurrentlyDetecting = true
                noddingCount++
                noddingDurations.add(duration)
                lastDetectionTime = currentTime
                Log.d(TAG, "🚨 CABECEO DETECTADO: ${duration}ms (count=$noddingCount)")
                return Triple(true, noddingCount, noddingDurations)
            }
            
            // Mostrar progreso cada segundo
            if (duration > 1000 && duration % 1000 < 200) {
                Log.d(TAG, "⏱️ Cabeza inclinada: ${duration}ms / ${NODDING_DURATION_MS}ms")
            }
            
        } else {
            // Cabeza volvió arriba
            if (headDownStartTime != null) {
                val duration = currentTime - (headDownStartTime ?: currentTime)
                Log.d(TAG, "⬆️ Cabeza volvió arriba (duración total: ${duration}ms)")
                headDownStartTime = null
                isCurrentlyDetecting = false
            }
        }
        
        return Triple(false, noddingCount, noddingDurations)
    }
    
    fun reset() {
        headDownStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        lastDetectionTime = 0
        isCurrentlyDetecting = false
        Log.d(TAG, "🔄 Contador reseteado")
    }
}