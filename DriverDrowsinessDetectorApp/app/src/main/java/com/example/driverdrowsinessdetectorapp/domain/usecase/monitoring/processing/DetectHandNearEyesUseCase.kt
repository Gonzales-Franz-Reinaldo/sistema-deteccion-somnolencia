package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing

import android.util.Log
import com.google.mediapipe.tasks.components.containers.Category
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject
import kotlin.math.sqrt

/**
 *  Detectar lateralidad de manos (Left/Right)
 */
data class HandDetectionResult(
    val faceLandmarks: List<NormalizedLandmark>,
    val handLandmarks: List<List<NormalizedLandmark>>?,
    val handedness: List<List<Category>>?  
)

class DetectHandNearEyesUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectHandNearEyes"
        private const val THUMB_TIP = 4
        private const val INDEX_FINGER_TIP = 8
        private const val MIDDLE_FINGER_TIP = 12
        private const val RING_FINGER_TIP = 16
        private const val PINKY_TIP = 20
        private const val RIGHT_EYE_CENTER = 33
        private const val LEFT_EYE_CENTER = 263
        private const val PROXIMITY_THRESHOLD_PX = 40f
        private const val IMAGE_WIDTH = 640f
    }
    
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>,
        handLandmarks: List<List<NormalizedLandmark>>?,
        handedness: List<List<Category>>?
    ): Map<String, Boolean> {
        if (faceLandmarks.size < 478 || handLandmarks.isNullOrEmpty()) {
            return mapOf(
                "MANO_IZQUIERDA_OJO_DERECHO" to false,
                "MANO_IZQUIERDA_OJO_IZQUIERDO" to false,
                "MANO_DERECHA_OJO_DERECHO" to false,
                "MANO_DERECHA_OJO_IZQUIERDO" to false
            )
        }
        
        val rightEye = faceLandmarks[33]
        val leftEye = faceLandmarks[263]
        
        val result = mutableMapOf<String, Boolean>()
        
        handLandmarks.forEachIndexed { index, hand ->
            //  OBTENER LATERALIDAD (MediaPipe devuelve desde SU perspectiva)
            val mediaPipeLabel = handedness?.getOrNull(index)?.firstOrNull()?.categoryName() ?: "Unknown"
            
            //  INVERTIR LATERALIDAD (cámara frontal = espejo)
            // MediaPipe "Left" = Mano DERECHA del usuario
            // MediaPipe "Right" = Mano IZQUIERDA del usuario
            val userHandLabel = when (mediaPipeLabel) {
                "Left" -> "DERECHA"   // ← INVERTIDO
                "Right" -> "IZQUIERDA" // ← INVERTIDO
                else -> "Unknown"
            }
            
            val isNearRightEye = isHandNearEye(hand, rightEye)
            val isNearLeftEye = isHandNearEye(hand, leftEye)
            
            when (userHandLabel) {
                "IZQUIERDA" -> {
                    result["MANO_IZQUIERDA_OJO_DERECHO"] = isNearRightEye
                    result["MANO_IZQUIERDA_OJO_IZQUIERDO"] = isNearLeftEye
                    if (isNearRightEye || isNearLeftEye) {
                        Log.d(TAG, "👁️✋ MANO IZQUIERDA (usuario) cerca: Der=$isNearRightEye, Izq=$isNearLeftEye")
                    }
                }
                "DERECHA" -> {
                    result["MANO_DERECHA_OJO_DERECHO"] = isNearRightEye
                    result["MANO_DERECHA_OJO_IZQUIERDO"] = isNearLeftEye
                    if (isNearRightEye || isNearLeftEye) {
                        Log.d(TAG, "👁️🤚 MANO DERECHA (usuario) cerca: Der=$isNearRightEye, Izq=$isNearLeftEye")
                    }
                }
                else -> {
                    Log.w(TAG, "⚠️ Mano desconocida: $mediaPipeLabel -> $userHandLabel")
                }
            }
        }
        
        result.putIfAbsent("MANO_IZQUIERDA_OJO_DERECHO", false)
        result.putIfAbsent("MANO_IZQUIERDA_OJO_IZQUIERDO", false)
        result.putIfAbsent("MANO_DERECHA_OJO_DERECHO", false)
        result.putIfAbsent("MANO_DERECHA_OJO_IZQUIERDO", false)
        
        return result
    }
    
    private fun isHandNearEye(hand: List<NormalizedLandmark>, eye: NormalizedLandmark): Boolean {
        if (hand.size < 21) return false
        
        val fingerTips = listOf(
            hand[THUMB_TIP],
            hand[INDEX_FINGER_TIP],
            hand[MIDDLE_FINGER_TIP],
            hand[RING_FINGER_TIP],
            hand[PINKY_TIP]
        )
        
        val distances = fingerTips.map { finger ->
            val distanceNormalized = euclideanDistance(finger, eye)
            distanceNormalized * IMAGE_WIDTH
        }
        
        val isNear = distances.any { it < PROXIMITY_THRESHOLD_PX }
        
        if (isNear) {
            val minDist = distances.minOrNull() ?: 0f
            Log.d(TAG, "👁️✋ Distancia mínima: ${minDist}px")
        }
        
        return isNear
    }
    
    private fun euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): Float {
        val dx = p1.x() - p2.x()
        val dy = p1.y() - p2.y()
        return sqrt(dx * dx + dy * dy)
    }
}