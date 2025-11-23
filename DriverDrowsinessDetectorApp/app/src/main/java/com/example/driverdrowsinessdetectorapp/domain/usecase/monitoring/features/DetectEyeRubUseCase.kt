package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import javax.inject.Inject

/**
 * : Detectar Frotamiento de Ojos
 * 
 * Equivalente a: eye_rub/processing.py
 * 
 *  LÓGICA PYTHON EXACTA:
 * - Frotamiento = Mano cerca de ojos por >1 segundo
 * - Detecta cuando la mano SE ALEJA (no mientras está cerca)
 */
class DetectEyeRubUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectEyeRubUseCase"
        private const val EYE_RUB_DURATION_MS = 1000L
    }
    
    //  PRIMERA MANO (INDEPENDIENTE)
    private var firstHandStartTime: Long? = null
    private var firstHandCount = 0
    private val firstHandDurations = mutableListOf<Long>()
    
    //  SEGUNDA MANO (INDEPENDIENTE)
    private var secondHandStartTime: Long? = null
    private var secondHandCount = 0
    private val secondHandDurations = mutableListOf<Long>()
    
    operator fun invoke(handNearEyes: Map<String, Boolean>): Map<String, Triple<Boolean, Int, List<Long>>> {
        val currentTime = System.currentTimeMillis()
        
        Log.d(TAG, "🔍 Claves recibidas: ${handNearEyes.keys}")
        Log.d(TAG, "🔍 Valores: $handNearEyes")
        
        // 🆕 VERIFICAR MANO IZQUIERDA
        val isLeftHandNear = handNearEyes["MANO_IZQUIERDA_OJO_DERECHO"] == true || 
                             handNearEyes["MANO_IZQUIERDA_OJO_IZQUIERDO"] == true
        
        // 🆕 VERIFICAR MANO DERECHA
        val isRightHandNear = handNearEyes["MANO_DERECHA_OJO_DERECHO"] == true || 
                           handNearEyes["MANO_DERECHA_OJO_IZQUIERDO"] == true
        
        Log.d(TAG, "🔍 isLeftHandNear=$isLeftHandNear, isRightHandNear=$isRightHandNear")
        
        //  PROCESAR PRIMERA MANO (USA firstHandStartTime, firstHandCount, firstHandDurations)
        val leftHandDetected = processHand(
            isNear = isLeftHandNear,
            currentTime = currentTime,
            startTimeRef = { firstHandStartTime },
            setStartTime = { firstHandStartTime = it },
            countRef = { firstHandCount },
            incrementCount = { firstHandCount++ },
            durations = firstHandDurations,
            handLabel = "MANO_IZQUIERDA"
        )
        
        //  PROCESAR SEGUNDA MANO (USA secondHandStartTime, secondHandCount, secondHandDurations)
        val rightHandDetected = processHand(
            isNear = isRightHandNear,
            currentTime = currentTime,
            startTimeRef = { secondHandStartTime },
            setStartTime = { secondHandStartTime = it },
            countRef = { secondHandCount },
            incrementCount = { secondHandCount++ },
            durations = secondHandDurations,
            handLabel = "MANO_DERECHA"
        )
        
        return mapOf(
            "MANO_IZQUIERDA" to Triple(leftHandDetected, firstHandCount, firstHandDurations.toList()),
            "MANO_DERECHA" to Triple(rightHandDetected, secondHandCount, secondHandDurations.toList())
        )
    }
    
    /**
     *  NUEVA IMPLEMENTACIÓN: Funciones lambda para mantener estado independiente
     */
    private fun processHand(
        isNear: Boolean,
        currentTime: Long,
        startTimeRef: () -> Long?,
        setStartTime: (Long?) -> Unit,
        countRef: () -> Int,
        incrementCount: () -> Unit,
        durations: MutableList<Long>,
        handLabel: String
    ): Boolean {
        if (isNear) {
            // Mano cerca de ojos
            if (startTimeRef() == null) {
                setStartTime(currentTime)
                Log.d(TAG, "👁️✋ $handLabel cerca de ojos")
            } else {
                val elapsed = currentTime - (startTimeRef() ?: currentTime)
                if (elapsed > 500 && elapsed % 100 < 50) {
                    Log.d(TAG, "⏱️ $handLabel cerca: ${elapsed}ms / ${EYE_RUB_DURATION_MS}ms")
                }
            }
            return false
        } else {
            // Mano alejada
            if (startTimeRef() != null) {
                val duration = currentTime - (startTimeRef() ?: currentTime)
                setStartTime(null)
                
                if (duration > EYE_RUB_DURATION_MS) {
                    incrementCount()
                    durations.add(duration)
                    Log.d(TAG, "🚨 FROTAMIENTO DETECTADO ($handLabel): ${duration}ms (count=${countRef()})")
                    return true
                } else {
                    Log.d(TAG, "👁️✋ $handLabel se alejó (duración: ${duration}ms)")
                    Log.d(TAG, "⏭️ Frotamiento muy corto: ${duration}ms <= ${EYE_RUB_DURATION_MS}ms")
                }
            }
            return false
        }
    }
    
    fun reset() {
        firstHandStartTime = null
        firstHandCount = 0
        firstHandDurations.clear()
        secondHandStartTime = null
        secondHandCount = 0
        secondHandDurations.clear()
    }
}