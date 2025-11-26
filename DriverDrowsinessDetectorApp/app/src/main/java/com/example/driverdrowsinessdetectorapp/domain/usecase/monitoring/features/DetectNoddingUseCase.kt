package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.HeadPosition
import javax.inject.Inject

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectNodding"
        private const val NODDING_DURATION_MS = 3000L  // 3 segundos
        private const val LOG_INTERVAL_MS = 500L       // Log cada 500ms
    }
    
    private var headDownStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var hasAlertedForCurrentNodding = false
    private var lastLogTime = 0L
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        //  LOG DE DEBUG cada segundo
        if (currentTime - lastLogTime > 1000) {
            Log.d(TAG, "📊 Estado: isHeadDown=${headPosition.isHeadDown}, noFace=${headPosition.noFaceDetected}, startTime=$headDownStartTime")
            lastLogTime = currentTime
        }
        
        //  CABEZA INCLINADA (detectada O sin rostro pero manteniendo estado)
        if (headPosition.isHeadDown) {
            
            // INICIO de nueva inclinación
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                hasAlertedForCurrentNodding = false
                Log.w(TAG, "🙇 ═══════ INICIO CABEZA INCLINADA ═══════")
            }
            
            val duration = currentTime - (headDownStartTime ?: currentTime)
            
            //  Log de progreso cada 500ms
            if (duration % LOG_INTERVAL_MS < 100) {
                val progress = ((duration.toFloat() / NODDING_DURATION_MS) * 100).toInt().coerceAtMost(100)
                val remaining = ((NODDING_DURATION_MS - duration) / 1000f).coerceAtLeast(0f)
                Log.d(TAG, "⏱️ Progreso: ${duration}ms / ${NODDING_DURATION_MS}ms ($progress%) - Faltan: ${"%.1f".format(remaining)}s")
            }
            
            //  DETECTAR CABECEO A LOS 3 SEGUNDOS
            if (duration >= NODDING_DURATION_MS && !hasAlertedForCurrentNodding) {
                hasAlertedForCurrentNodding = true
                noddingCount++
                noddingDurations.add(duration)
                
                Log.w(TAG, "")
                Log.w(TAG, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨")
                Log.w(TAG, "🚨   CABECEO #$noddingCount DETECTADO!   🚨")
                Log.w(TAG, "🚨   Duración: ${duration}ms            🚨")
                Log.w(TAG, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨")
                Log.w(TAG, "")
                
                return Triple(true, noddingCount, noddingDurations)
            }
            
            //  MANTENER ALERTA mientras sigue inclinada
            if (hasAlertedForCurrentNodding) {
                val seconds = duration / 1000
                if (duration % 1000 < 100) {
                    Log.d(TAG, "⚠️ CABECEO ACTIVO: ${seconds}s - Alerta en curso")
                }
                return Triple(true, noddingCount, noddingDurations)
            }
            
            // Aún no llega a 3 segundos
            return Triple(false, noddingCount, noddingDurations)
            
        } else {
            //  CABEZA EN POSICIÓN NORMAL
            if (headDownStartTime != null) {
                val duration = currentTime - (headDownStartTime ?: currentTime)
                Log.d(TAG, "⬆️ ═══════ CABEZA ARRIBA ═══════ (duración: ${duration}ms, alertó: $hasAlertedForCurrentNodding)")
                
                // Reset
                headDownStartTime = null
                hasAlertedForCurrentNodding = false
            }
            
            return Triple(false, noddingCount, noddingDurations)
        }
    }
    
    fun reset() {
        headDownStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        hasAlertedForCurrentNodding = false
        lastLogTime = 0L
        Log.d(TAG, "🔄 Contadores reseteados")
    }
}