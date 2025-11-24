package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import javax.inject.Inject

class DetectEyeRubUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectEyeRubUseCase"
        private const val EYE_RUB_DURATION_MS = 1000L
        private const val EYE_RUB_WINDOW_MS = 300_000L  // ← 300 segundos (5 minutos)
    }
    
    //  MANO IZQUIERDA
    private var firstHandStartTime: Long? = null
    private val firstHandTimestamps = mutableListOf<Long>() 
    private val firstHandDurations = mutableListOf<Long>()
    
    // MANO DERECHA
    private var secondHandStartTime: Long? = null
    private val secondHandTimestamps = mutableListOf<Long>() 
    private val secondHandDurations = mutableListOf<Long>()
    
    operator fun invoke(handNearEyes: Map<String, Boolean>): Map<String, Triple<Boolean, Int, List<Long>>> {
        val currentTime = System.currentTimeMillis()
        
        val isLeftHandNear = handNearEyes["MANO_IZQUIERDA_OJO_DERECHO"] == true || 
                             handNearEyes["MANO_IZQUIERDA_OJO_IZQUIERDO"] == true
        
        val isRightHandNear = handNearEyes["MANO_DERECHA_OJO_DERECHO"] == true || 
                              handNearEyes["MANO_DERECHA_OJO_IZQUIERDO"] == true
        
        //  PROCESAR MANO IZQUIERDA
        val leftHandDetected = processHand(
            isNear = isLeftHandNear,
            currentTime = currentTime,
            startTimeRef = { firstHandStartTime },
            setStartTime = { firstHandStartTime = it },
            timestamps = firstHandTimestamps,
            durations = firstHandDurations,
            handLabel = "MANO_IZQUIERDA"
        )
        
        //  PROCESAR MANO DERECHA
        val rightHandDetected = processHand(
            isNear = isRightHandNear,
            currentTime = currentTime,
            startTimeRef = { secondHandStartTime },
            setStartTime = { secondHandStartTime = it },
            timestamps = secondHandTimestamps,
            durations = secondHandDurations,
            handLabel = "MANO_DERECHA"
        )
        
        return mapOf(
            "MANO_IZQUIERDA" to Triple(leftHandDetected, firstHandTimestamps.size, firstHandDurations.toList()),
            "MANO_DERECHA" to Triple(rightHandDetected, secondHandTimestamps.size, secondHandDurations.toList())
        )
    }
    
    private fun processHand(
        isNear: Boolean,
        currentTime: Long,
        startTimeRef: () -> Long?,
        setStartTime: (Long?) -> Unit,
        timestamps: MutableList<Long>,
        durations: MutableList<Long>,
        handLabel: String
    ): Boolean {
        if (isNear) {
            if (startTimeRef() == null) {
                setStartTime(currentTime)
                Log.d(TAG, "👁️✋ $handLabel cerca de ojos")
            }
            return false
        } else {
            if (startTimeRef() != null) {
                val duration = currentTime - (startTimeRef() ?: currentTime)
                setStartTime(null)
                
                // FROTAMIENTO = MANO CERCA > 1 SEGUNDO
                if (duration > EYE_RUB_DURATION_MS) {
                    timestamps.add(currentTime) 
                    durations.add(duration)
                    Log.d(TAG, "🚨 FROTAMIENTO DETECTADO ($handLabel): ${duration}ms")
                    
                    //  LIMPIAR timestamps fuera de ventana (últimos 5 minutos)
                    val cutoffTime = currentTime - EYE_RUB_WINDOW_MS
                    timestamps.removeAll { it < cutoffTime }
                    
                    val count = timestamps.size
                    
                    //  LOG cuando excede umbral
                    if (count > 3) {
                        Log.w(TAG, "⚠️ EXCEDE UMBRAL ($handLabel): $count frotamientos en 5 minutos")
                    }
                    
                    return true
                }
            }
            return false
        }
    }
    
    fun reset() {
        firstHandStartTime = null
        firstHandTimestamps.clear()
        firstHandDurations.clear()
        secondHandStartTime = null
        secondHandTimestamps.clear()
        secondHandDurations.clear()
    }
}