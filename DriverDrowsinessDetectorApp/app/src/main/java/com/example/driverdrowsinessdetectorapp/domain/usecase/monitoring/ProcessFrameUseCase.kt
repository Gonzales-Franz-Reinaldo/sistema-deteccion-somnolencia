package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring

import android.graphics.Bitmap
import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.extraction.ExtractLandmarksUseCase
import javax.inject.Inject

class ProcessFrameUseCase @Inject constructor(
    private val extractLandmarksUseCase: ExtractLandmarksUseCase,
    private val detectDrowsinessUseCase: DetectDrowsinessUseCase
) {
    companion object {
        private const val TAG = "ProcessFrameUseCase"
    }
    
    operator fun invoke(bitmap: Bitmap): MetricasSomnolencia? {
        return try {
            // 1. Extraer landmarks
            val landmarksResult = extractLandmarksUseCase(bitmap)
            
            // 2. Verificar que haya rostro
            if (!landmarksResult.hasFace || landmarksResult.faceLandmarks == null) {
                Log.w(TAG, "⚠️ Frame sin rostro detectado")
                return null
            }
            
            // 3. Detectar somnolencia (AHORA CON HANDEDNESS)
            val metrics = detectDrowsinessUseCase(
                faceLandmarks = landmarksResult.faceLandmarks,
                handLandmarks = landmarksResult.handLandmarks,
                handedness = landmarksResult.handedness  
            )
            
            Log.d(TAG, "✅ Frame procesado: EAR=${metrics.ear}, MAR=${metrics.mar}")
            
            metrics
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al procesar frame: ${e.message}", e)
            null
        }
    }
}