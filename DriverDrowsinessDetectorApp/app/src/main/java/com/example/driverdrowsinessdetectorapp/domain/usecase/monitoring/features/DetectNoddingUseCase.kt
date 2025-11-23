package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose
import javax.inject.Inject
import kotlin.math.abs

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val PITCH_THRESHOLD = 30f // ✅ Umbral ajustado
        private const val NODDING_DURATION_MS = 1500L // 1.5 segundos
    }
    
    private var noddingStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var isCurrentlyNodding = false // ✅ NUEVO: Flag para evitar alertas repetidas
    
    operator fun invoke(headPose: HeadPose): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        val isHeadInclined = abs(headPose.pitch) > PITCH_THRESHOLD
        
        if (isHeadInclined) {
            // CABEZA INCLINADA
            if (noddingStartTime == null) {
                noddingStartTime = currentTime
                isCurrentlyNodding = false // Reset flag al iniciar nueva inclinación
            }
            
            val duration = currentTime - (noddingStartTime ?: currentTime)
            
            // ✅ CORRECCIÓN: Solo alerta UNA VEZ cuando alcanza el umbral
            if (duration >= NODDING_DURATION_MS && !isCurrentlyNodding) {
                isCurrentlyNodding = true
                noddingCount++
                noddingDurations.add(duration)
                return Triple(true, noddingCount, noddingDurations)
            }
            
            // Mientras dura el cabeceo, NO alertar repetidamente
            return Triple(false, noddingCount, noddingDurations)
        } else {
            // CABEZA NORMAL - Resetear estado
            noddingStartTime = null
            isCurrentlyNodding = false
        }
        
        return Triple(false, noddingCount, noddingDurations)
    }
    
    fun reset() {
        noddingStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        isCurrentlyNodding = false
    }
}