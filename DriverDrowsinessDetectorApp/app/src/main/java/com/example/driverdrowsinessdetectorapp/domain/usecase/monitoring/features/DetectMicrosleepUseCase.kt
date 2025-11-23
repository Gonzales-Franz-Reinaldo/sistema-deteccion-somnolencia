package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import javax.inject.Inject

/**
 * Caso de Uso: Detectar Microsueño
 * 
 * Microsueño = Ojos cerrados >2.5 segundos
 * 
 * Equivalente a: drowsiness_processor/drowsiness_features/flicker_and_microsleep/processing.py
 */
class DetectMicrosleepUseCase @Inject constructor() {
    
    companion object {
        private const val EAR_THRESHOLD = 0.20f
        private const val MICROSLEEP_DURATION_MS = 2500L // 2.5 segundos
    }
    
    private var eyesClosedStartTime: Long? = null
    private var microsleepCount = 0
    private val microsleepDurations = mutableListOf<Long>()
    private var isCurrentlyInMicrosleep = false // ✅ NUEVO: Flag para evitar alertas repetidas
    
    /**
     * Detectar microsueño
     * 
     * @param ear Eye Aspect Ratio
     * @return Triple<Boolean, Int, List<Long>> - (isMicrosleep, count, durations)
     */
    operator fun invoke(ear: Float): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        val isEyeClosed = ear < EAR_THRESHOLD
        
        if (isEyeClosed) {
            // OJOS CERRADOS
            if (eyesClosedStartTime == null) {
                eyesClosedStartTime = currentTime
                isCurrentlyInMicrosleep = false // Reset flag al iniciar nuevo cierre
            }
            
            val duration = currentTime - (eyesClosedStartTime ?: currentTime)
            
            // ✅ CORRECCIÓN: Solo alerta UNA VEZ cuando alcanza el umbral
            if (duration >= MICROSLEEP_DURATION_MS && !isCurrentlyInMicrosleep) {
                isCurrentlyInMicrosleep = true
                microsleepCount++
                microsleepDurations.add(duration)
                return Triple(true, microsleepCount, microsleepDurations)
            }
            
            // Mientras dura el microsueño, NO alertar repetidamente
            return Triple(false, microsleepCount, microsleepDurations)
        } else {
            // OJOS ABIERTOS - Resetear estado
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