package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import javax.inject.Inject

/**
 * Caso de Uso: Detectar Frotamiento de Ojos
 * 
 * Equivalente a: drowsiness_processor/drowsiness_features/eye_rub/processing.py
 * 
 * Frotamiento = Mano cerca de ojos por >1.5 segundos
 */
class DetectEyeRubUseCase @Inject constructor() {
    
    companion object {
        private const val EYE_RUB_DURATION_MS = 1500L
    }
    
    private var firstHandStartTime: Long? = null
    private var secondHandStartTime: Long? = null
    private var firstHandCount = 0
    private var secondHandCount = 0
    private val firstHandDurations = mutableListOf<Long>()
    private val secondHandDurations = mutableListOf<Long>()
    
    //  Flags para evitar registro múltiple
    private var isFirstHandRubbing = false
    private var isSecondHandRubbing = false
    
    /**
     * Detectar frotamiento de ojos
     * 
     * @param handNearEyes Par (isNear, whichHand)
     * @return Map con resultados para ambas manos
     */
    operator fun invoke(handNearEyes: Pair<Boolean, String?>): Map<String, Triple<Boolean, Int, List<Long>>> {
        val currentTime = System.currentTimeMillis()
        val (isNear, whichHand) = handNearEyes
        
        // Procesar primera mano
        val firstHandResult = processHand(
            isNear && whichHand == "PRIMERA_MANO",
            currentTime,
            firstHandStartTime,
            firstHandCount,
            firstHandDurations,
            isFirstHandRubbing
        )
        firstHandStartTime = firstHandResult.fourth
        isFirstHandRubbing = firstHandResult.fifth
        
        // Procesar segunda mano
        val secondHandResult = processHand(
            isNear && whichHand == "SEGUNDA_MANO",
            currentTime,
            secondHandStartTime,
            secondHandCount,
            secondHandDurations,
            isSecondHandRubbing
        )
        secondHandStartTime = secondHandResult.fourth
        isSecondHandRubbing = secondHandResult.fifth
        
        return mapOf(
            "PRIMERA_MANO" to Triple(firstHandResult.first, firstHandCount, firstHandDurations),
            "SEGUNDA_MANO" to Triple(secondHandResult.first, secondHandCount, secondHandDurations)
        )
    }
    
    /**
     * Procesar detección para una mano específica
     */
    private fun processHand(
        isNear: Boolean,
        currentTime: Long,
        startTime: Long?,
        count: Int,
        durations: MutableList<Long>,
        isCurrentlyRubbing: Boolean
    ): Quintuple<Boolean, Int, List<Long>, Long?, Boolean> {
        var newStartTime = startTime
        var newCount = count
        var newIsRubbing = isCurrentlyRubbing
        
        if (isNear) {
            // MANO CERCA DE OJOS
            if (newStartTime == null) {
                newStartTime = currentTime
                newIsRubbing = false
            }
            
            val duration = currentTime - (newStartTime ?: currentTime)
            
            // : Solo registra UNA VEZ cuando alcanza umbral
            if (duration >= EYE_RUB_DURATION_MS && !newIsRubbing) {
                newIsRubbing = true
                newCount++
                durations.add(duration)
                return Quintuple(true, newCount, durations, newStartTime, newIsRubbing)
            }
            
            return Quintuple(false, newCount, durations, newStartTime, newIsRubbing)
        } else {
            // MANO ALEJADA - Resetear
            newStartTime = null
            newIsRubbing = false
        }
        
        return Quintuple(false, newCount, durations, newStartTime, newIsRubbing)
    }
    
    /**
     * Resetear contadores
     */
    fun reset() {
        firstHandStartTime = null
        secondHandStartTime = null
        firstHandCount = 0
        secondHandCount = 0
        firstHandDurations.clear()
        secondHandDurations.clear()
        isFirstHandRubbing = false
        isSecondHandRubbing = false
    }
    
    //  Clase auxiliar para retornar 5 valores
    private data class Quintuple<A, B, C, D, E>(
        val first: A,
        val second: B,
        val third: C,
        val fourth: D,
        val fifth: E
    )
}