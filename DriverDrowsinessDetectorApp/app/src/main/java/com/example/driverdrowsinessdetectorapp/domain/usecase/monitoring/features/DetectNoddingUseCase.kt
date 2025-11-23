package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.HeadPosition
import javax.inject.Inject

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectNoddingUseCase"
        private const val NODDING_DURATION_MS = 3000L //  3 SEGUNDOS
    }
    
    private var headDownStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var wasDetecting = false //  FLAG PARA EVITAR DOBLE DETECCIÓN
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        //  LÓGICA PYTHON EXACTA
        if (headPosition.isHeadDown) {
            // Cabeza se acaba de inclinar
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                wasDetecting = false
                Log.d(TAG, "🙇 Cabeza inclinada: ${headPosition.position}")
            }
            
            //  OPCIONAL: Mostrar progreso
            val currentDuration = currentTime - (headDownStartTime ?: currentTime)
            if (currentDuration > 1000 && currentDuration % 1000 < 100) {
                Log.d(TAG, "⏱️ Cabeza inclinada: ${currentDuration}ms / ${NODDING_DURATION_MS}ms")
            }
            
        } else {
            // elif not cabeza_abajo and self.bandera:
            // Cabeza volvió arriba - CALCULAR DURACIÓN TOTAL
            if (headDownStartTime != null) {
                val duration = currentTime - (headDownStartTime ?: currentTime)
                headDownStartTime = null //  RESETEAR
                
                Log.d(TAG, "🙇 Cabeza volvió arriba (duración: ${duration}ms)")
                
                // if duracion_inclinacion >= 3.0:
                if (duration >= NODDING_DURATION_MS && !wasDetecting) {
                    wasDetecting = true
                    noddingCount++
                    noddingDurations.add(duration)
                    Log.d(TAG, "🚨 CABECEO DETECTADO: ${duration}ms (count=$noddingCount)")
                    return Triple(true, noddingCount, noddingDurations)
                } else if (duration < NODDING_DURATION_MS) {
                    Log.d(TAG, "⏭️ Cabeceo muy corto: ${duration}ms < ${NODDING_DURATION_MS}ms")
                }
            }
        }
        
        return Triple(false, noddingCount, noddingDurations)
    }
    
    fun reset() {
        headDownStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        wasDetecting = false
    }
}