package com.example.driverdrowsinessdetectorapp.domain.metrics

import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.local.entity.MetricsEntity
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.repository.MetricsRepository
import javax.inject.Inject

/**
 * Caso de Uso: Guardar Métricas en Room Database
 *
 * Guarda métricas de detección cuando hay alertas relevantes.
 */
class SaveMetricsUseCase @Inject constructor(
    private val metricsRepository: MetricsRepository
) {
    companion object {
        private const val TAG = "SaveMetricsUseCase"
    }

    /**
     * Guardar métricas solo si hay alertas relevantes
     *
     * @param sessionId ID de la sesión activa
     * @param metrics Métricas calculadas
     */
    suspend operator fun invoke(sessionId: Long, metrics: MetricasSomnolencia): Result<Long> {
        return try {
            // Solo guardar si hay alerta
            if (shouldSaveMetrics(metrics)) {
                val entity = MetricsEntity(
                    sessionId = sessionId,
                    timestamp = metrics.timestamp,

                    // Métricas de ojos
                    earAverage = metrics.ear,
                    eyesClosed = metrics.isMicrosleep,

                    // Métricas de boca
                    mar = metrics.mar,
                    mouthOpen = metrics.isYawning,

                    // Métricas de cabeza
                    headPitch = metrics.headPose.pitch,
                    headYaw = metrics.headPose.yaw,
                    headRoll = metrics.headPose.roll,
                    noddingDetected = metrics.isNodding,

                    // Contadores
                    blinkCount = metrics.blinkCount,
                    yawnCount = metrics.yawnCount,
                    noddingCount = metrics.noddingCount,
                    eyeRubCount = if (metrics.eyeRubFirstHand.first || metrics.eyeRubSecondHand.first) 1 else 0,

                    // Detección de manos
                    handNearEyes = metrics.eyeRubFirstHand.first || metrics.eyeRubSecondHand.first,

                    // Estado
                    alertLevel = metrics.alertLevel.name,
                    faceDetected = true
                )

                val id = metricsRepository.saveMetrics(entity)

                Log.d(TAG, "Métricas guardadas: ID=$id, AlertLevel=${metrics.alertLevel}")

                Result.success(id)
            } else {
                Log.d(TAG, "Métricas sin alertas - no guardadas")
                Result.success(-1L)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error al guardar métricas: ${e.message}", e)
            Result.failure(e)
        }
    }

    /**
     * Determinar si las métricas deben guardarse
     */
    private fun shouldSaveMetrics(metrics: MetricasSomnolencia): Boolean {
        return metrics.alertLevel != AlertLevel.NORMAL ||
                metrics.isMicrosleep ||
                metrics.isYawning ||
                metrics.isNodding ||
                metrics.eyeRubFirstHand.first ||
                metrics.eyeRubSecondHand.first
    }
}