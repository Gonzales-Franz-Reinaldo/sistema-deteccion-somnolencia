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
    private var lastPosition = ""  //  Para tracking de posición
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        //  LOG DE DEBUG cada segundo (con info de roll)
        if (currentTime - lastLogTime > 1000) {
            val rollInfo = if (headPosition.rollAngle != 0f) ", roll=${headPosition.rollAngle.toInt()}°" else ""
            Log.d(TAG, "Estado: isHeadDown=${headPosition.isHeadDown}, pos=${headPosition.position}$rollInfo, startTime=$headDownStartTime")
            lastLogTime = currentTime
        }
        
        //  CABEZA INCLINADA (detectada O sin rostro pero manteniendo estado)
        if (headPosition.isHeadDown) {
            
            // INICIO de nueva inclinación
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                hasAlertedForCurrentNodding = false
                lastPosition = headPosition.position
                
                //  Log más descriptivo según tipo de inclinación
                val emoji = when {
                    headPosition.position.contains("lateral") -> "🙇↘️"
                    headPosition.position.contains("inclinada") -> "🙇↗️"
                    else -> "🙇⬇️"
                }
                Log.w(TAG, "$emoji ═══════ INICIO: ${headPosition.position} ═══════")
            }
            
            val duration = currentTime - (headDownStartTime ?: currentTime)
            
            //  Log de progreso cada 500ms
            if (duration % LOG_INTERVAL_MS < 100) {
                val progress = ((duration.toFloat() / NODDING_DURATION_MS) * 100).toInt().coerceAtMost(100)
                val remaining = ((NODDING_DURATION_MS - duration) / 1000f).coerceAtLeast(0f)
                val rollInfo = if (headPosition.rollAngle != 0f) " [roll=${headPosition.rollAngle.toInt()}°]" else ""
                Log.d(TAG, "Progreso: ${duration}ms / ${NODDING_DURATION_MS}ms ($progress%) - Faltan: ${"%.1f".format(remaining)}s$rollInfo")
            }
            
            //  DETECTAR CABECEO A LOS 3 SEGUNDOS
            if (duration >= NODDING_DURATION_MS && !hasAlertedForCurrentNodding) {
                hasAlertedForCurrentNodding = true
                noddingCount++
                noddingDurations.add(duration)
                
                //  Mensaje personalizado según tipo
                val tipoMsg = when {
                    headPosition.position.contains("lateral") -> "CABECEO LATERAL"
                    headPosition.position.contains("inclinada") -> "CABECEO DIAGONAL"
                    else -> "CABECEO FRONTAL"
                }
                
                
                if (headPosition.rollAngle != 0f) {
                    Log.w(TAG, "Roll: ${headPosition.rollAngle.toInt()}°")
                }
    
                
                return Triple(true, noddingCount, noddingDurations)
            }
            
            //  MANTENER ALERTA mientras sigue inclinada
            if (hasAlertedForCurrentNodding) {
                val seconds = duration / 1000
                if (duration % 1000 < 100) {
                    Log.d(TAG, "CABECEO ACTIVO: ${seconds}s - ${headPosition.position}")
                }
                return Triple(true, noddingCount, noddingDurations)
            }
            
            // Aún no llega a 3 segundos
            return Triple(false, noddingCount, noddingDurations)
            
        } else {
            //  CABEZA EN POSICIÓN NORMAL
            if (headDownStartTime != null) {
                val duration = currentTime - (headDownStartTime ?: currentTime)
                Log.d(TAG, "CABEZA ARRIBA (duración: ${duration}ms, tipo: $lastPosition, alertó: $hasAlertedForCurrentNodding)")
                
                // Reset
                headDownStartTime = null
                hasAlertedForCurrentNodding = false
                lastPosition = ""
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
        lastPosition = ""
        Log.d(TAG, "Contadores reseteados")
    }
}