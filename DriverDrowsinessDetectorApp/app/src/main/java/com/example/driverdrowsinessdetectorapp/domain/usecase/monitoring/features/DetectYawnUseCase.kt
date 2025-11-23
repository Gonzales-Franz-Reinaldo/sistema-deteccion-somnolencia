package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import javax.inject.Inject

class DetectYawnUseCase @Inject constructor(
    private val windowedCounter: WindowedCounterUseCase
) {
    
    companion object {
        private const val MAR_THRESHOLD = 0.6f
        private const val YAWN_DURATION_MS = 4000L  // ✅ CAMBIAR A 4 SEGUNDOS
        
        private const val YAWN_WINDOW_MS = 180_000L  // 3 minutos
        private const val YAWN_COUNT_THRESHOLD = 10
    }
    
    private var mouthOpenStartTime: Long? = null
    private val yawnDurations = mutableListOf<Long>()
    private var isCurrentlyYawning = false // ✅ NUEVO: Flag para evitar registro múltiple
    
    operator fun invoke(mar: Float): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        val isMouthOpen = mar > MAR_THRESHOLD
        
        if (isMouthOpen) {
            // BOCA ABIERTA
            if (mouthOpenStartTime == null) {
                mouthOpenStartTime = currentTime
                isCurrentlyYawning = false
            }
            
            val duration = currentTime - (mouthOpenStartTime ?: currentTime)
            
            // ✅ CORRECCIÓN: Solo registra UNA VEZ cuando alcanza umbral
            if (duration >= YAWN_DURATION_MS && !isCurrentlyYawning) {
                isCurrentlyYawning = true
                yawnDurations.add(duration)
                windowedCounter.addEvent(
                    currentTime,
                    WindowedCounterUseCase.WindowConfig(
                        windowDurationMs = YAWN_WINDOW_MS,
                        threshold = YAWN_COUNT_THRESHOLD
                    )
                )
                return Triple(true, getYawnCount(currentTime), yawnDurations)
            }
            
            // Durante el bostezo, NO alertar repetidamente
            return Triple(false, getYawnCount(currentTime), yawnDurations)
        } else {
            // BOCA CERRADA - Resetear estado
            mouthOpenStartTime = null
            isCurrentlyYawning = false
        }
        
        return Triple(false, getYawnCount(currentTime), yawnDurations)
    }
    
    private fun getYawnCount(currentTime: Long): Int {
        return windowedCounter.getCurrentCount(currentTime, YAWN_WINDOW_MS)
    }
    
    fun reset() {
        mouthOpenStartTime = null
        yawnDurations.clear()
        windowedCounter.reset()
        isCurrentlyYawning = false
    }
}