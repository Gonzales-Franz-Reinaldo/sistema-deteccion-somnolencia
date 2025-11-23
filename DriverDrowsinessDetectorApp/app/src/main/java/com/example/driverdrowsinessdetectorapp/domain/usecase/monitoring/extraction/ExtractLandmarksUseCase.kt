package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.extraction

import android.graphics.Bitmap
import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.mediapipe.FaceLandmarkerHelper
import com.example.driverdrowsinessdetectorapp.data.mediapipe.HandLandmarkerHelper
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject

/**
 * Caso de Uso: Extraer Landmarks Faciales y de Manos
 * 
 * Equivalente a: drowsiness_processor/extract_points/point_extractor.py
 */
data class LandmarksResult(
    val faceLandmarks: List<NormalizedLandmark>?,
    val handLandmarks: List<List<NormalizedLandmark>>?,
    val hasFace: Boolean,
    val hasHands: Boolean
)

class ExtractLandmarksUseCase @Inject constructor(
    private val faceLandmarkerHelper: FaceLandmarkerHelper,
    private val handLandmarkerHelper: HandLandmarkerHelper
) {
    companion object {
        private const val TAG = "ExtractLandmarksUseCase"
    }
    
    /**
     * Extraer landmarks de un frame
     * 
     * @param bitmap Frame de la cámara
     * @return LandmarksResult con landmarks faciales y de manos
     */
    operator fun invoke(bitmap: Bitmap): LandmarksResult {
        // Detectar rostro
        val faceResult = faceLandmarkerHelper.detect(bitmap)
        val faceLandmarks = faceResult?.faceLandmarks()?.firstOrNull()
        
        // Detectar manos
        val handResult = handLandmarkerHelper.detect(bitmap)
        val handLandmarks = handResult?.landmarks()
        
        val hasFace = faceLandmarks != null && faceLandmarks.isNotEmpty()
        val hasHands = handLandmarks?.isNotEmpty() == true
        
        if (!hasFace) {
            Log.w(TAG, "⚠️ No se detectó rostro en el frame")
        }
        
        return LandmarksResult(
            faceLandmarks = faceLandmarks,
            handLandmarks = handLandmarks,
            hasFace = hasFace,
            hasHands = hasHands
        )
    }
}