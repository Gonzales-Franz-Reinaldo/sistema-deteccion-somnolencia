package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring

import android.graphics.Bitmap
import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.extraction.ExtractLandmarksUseCase
import javax.inject.Inject

/**
 * Caso de Uso: Procesar Frame Completo
 * 
 * Orquesta:
 * 1. Extracción de landmarks
 * 2. Detección de somnolencia
 * 
 * Este es el punto de entrada principal para procesar cada frame
 */
class ProcessFrameUseCase @Inject constructor(
    private val extractLandmarksUseCase: ExtractLandmarksUseCase,
    private val detectDrowsinessUseCase: DetectDrowsinessUseCase
) {
    companion object {
        private const val TAG = "ProcessFrameUseCase"
    }
    
    /**
     * Procesar un frame de la cámara
     * 
     * @param bitmap Frame capturado por CameraX
     * @return MetricasSomnolencia con resultados completos (o null si no hay rostro)
     */
    operator fun invoke(bitmap: Bitmap): MetricasSomnolencia? {
        return try {
            // 1. Extraer landmarks
            val landmarksResult = extractLandmarksUseCase(bitmap)
            
            // 2. Verificar que haya rostro
            if (!landmarksResult.hasFace || landmarksResult.faceLandmarks == null) {
                Log.w(TAG, "⚠️ Frame sin rostro detectado")
                return null
            }
            
            // 3. Detectar somnolencia
            val metrics = detectDrowsinessUseCase(
                faceLandmarks = landmarksResult.faceLandmarks,
                handLandmarks = landmarksResult.handLandmarks
            )
            
            Log.d(TAG, "✅ Frame procesado: EAR=${metrics.ear}, MAR=${metrics.mar}")
            
            metrics
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al procesar frame: ${e.message}", e)
            null
        }
    }
}