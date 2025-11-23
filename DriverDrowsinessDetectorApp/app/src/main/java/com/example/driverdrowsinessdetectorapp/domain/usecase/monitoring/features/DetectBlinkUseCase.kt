package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import javax.inject.Inject

/**
 * Caso de Uso: Detectar Parpadeo
 *
 * Equivalente a: drowsiness_processor/drowsiness_features/flicker_and_microsleep/processing.py
 *
 * Detección de parpadeo basada en cambios de EAR:
 * - EAR cae de >0.20 a <0.20 = Ojo cerró
 * - EAR sube de <0.20 a >0.20 = Ojo abrió (PARPADEO COMPLETADO)
 *
 * Umbral: >20 parpadeos en 60 segundos
 */
class DetectBlinkUseCase @Inject constructor(
    private val windowedCounter: WindowedCounterUseCase
) {

    companion object {
        private const val EAR_THRESHOLD = 0.20f

        // ✅ VENTANA TEMPORAL: 60 segundos (1 minuto)
        private const val BLINK_WINDOW_MS = 60_000L
        private const val BLINK_COUNT_THRESHOLD = 20
    }

    private var wasEyeClosed = false

    /**
     * Detectar parpadeo basado en transiciones de EAR
     *
     * @param ear Eye Aspect Ratio actual
     * @return Triple<Boolean, Int, Boolean> - (isBlinking, blinkCount, isEyeClosed)
     */
    operator fun invoke(ear: Float): Triple<Boolean, Int, Boolean> {
        val currentTime = System.currentTimeMillis()
        val isEyeClosed = ear < EAR_THRESHOLD

        // Detectar parpadeo: transición de cerrado → abierto
        var isBlinking = false

        if (wasEyeClosed && !isEyeClosed) {
            // OJO SE ABRIÓ → Parpadeo completado
            windowedCounter.addEvent(
                currentTime,
                WindowedCounterUseCase.WindowConfig(
                    windowDurationMs = BLINK_WINDOW_MS,
                    threshold = BLINK_COUNT_THRESHOLD
                )
            )
            isBlinking = true
        }

        // Actualizar estado anterior
        wasEyeClosed = isEyeClosed

        val blinkCount = getBlinkCount(currentTime)

        return Triple(isBlinking, blinkCount, isEyeClosed)
    }

    private fun getBlinkCount(currentTime: Long): Int {
        return windowedCounter.getCurrentCount(currentTime, BLINK_WINDOW_MS)
    }

    fun reset() {
        wasEyeClosed = false
        windowedCounter.reset()
    }
}