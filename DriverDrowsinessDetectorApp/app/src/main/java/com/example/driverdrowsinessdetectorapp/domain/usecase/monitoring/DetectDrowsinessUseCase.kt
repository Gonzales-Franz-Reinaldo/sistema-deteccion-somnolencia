package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.*
import com.google.mediapipe.tasks.components.containers.Category
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject

class DetectDrowsinessUseCase @Inject constructor(
    private val calculateEyeDistancesUseCase: CalculateEyeDistancesUseCase,
    private val calculateMouthDistancesUseCase: CalculateMouthDistancesUseCase,
    private val calculateMARUseCase: CalculateMARUseCase,
    private val detectHeadPositionUseCase: DetectHeadPositionUseCase,
    private val detectHandNearEyesUseCase: DetectHandNearEyesUseCase,
    private val detectBlinkUseCase: DetectBlinkUseCase,
    private val detectMicrosleepUseCase: DetectMicrosleepUseCase,
    private val detectYawnUseCase: DetectYawnUseCase,
    private val detectNoddingUseCase: DetectNoddingUseCase,
    private val detectEyeRubUseCase: DetectEyeRubUseCase
) {
    companion object {
        private const val TAG = "DetectDrowsinessUseCase"
        private const val BLINK_THRESHOLD = 20
        private const val YAWN_THRESHOLD = 3
        private const val EYE_RUB_THRESHOLD = 3
    }
    
    /**
     *  Versión que acepta landmarks nullables para manejar sin rostro
     */
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>?,
        handLandmarks: List<List<NormalizedLandmark>>?,
        handedness: List<List<Category>>?
    ): MetricasSomnolencia {
        try {
            // SIEMPRE detectar posición de cabeza (incluso sin rostro)
            val headPosition = detectHeadPositionUseCase(faceLandmarks)
            
            // SIEMPRE detectar cabeceo
            val (isNodding, noddingCount, noddingDurations) = detectNoddingUseCase(headPosition)
            
            // Si no hay rostro, solo retornar métricas de cabeceo
            if (faceLandmarks == null || faceLandmarks.size < 468) {
                Log.d(TAG, "⚠️ Sin rostro - Solo procesando cabeceo: isNodding=$isNodding")
                
                val alertLevel = if (isNodding) AlertLevel.CRITICAL else AlertLevel.NORMAL
                val alertType = if (isNodding) AlertType.HEAD_NODDING else null
                
                return MetricasSomnolencia(
                    timestamp = System.currentTimeMillis(),
                    ear = 0f,
                    mar = 0f,
                    headPose = HeadPose.NEUTRAL,
                    isBlinking = false,
                    blinkCount = 0,
                    isMicrosleep = false,
                    microsleepCount = 0,
                    microsleepDurations = emptyList(),
                    isYawning = false,
                    yawnCount = 0,
                    yawnDurations = emptyList(),
                    isNodding = isNodding,
                    noddingCount = noddingCount,
                    noddingDurations = noddingDurations,
                    eyeRubFirstHand = Triple(false, 0, emptyList()),
                    eyeRubSecondHand = Triple(false, 0, emptyList()),
                    alertLevel = alertLevel,
                    alertType = alertType
                )
            }
            
            // Cálculos normales cuando hay rostro
            val eyeDistances = calculateEyeDistancesUseCase(faceLandmarks)
            val mouthDistances = calculateMouthDistancesUseCase(faceLandmarks)
            
            val ear = if (eyeDistances.horizontalRightEye > 0 && eyeDistances.horizontalLeftEye > 0) {
                val earRight = eyeDistances.verticalRightEyelid / eyeDistances.horizontalRightEye
                val earLeft = eyeDistances.verticalLeftEyelid / eyeDistances.horizontalLeftEye
                (earRight + earLeft) / 2f
            } else 0f
            
            val mar = calculateMARUseCase(faceLandmarks)
            val handNearEyes = detectHandNearEyesUseCase(faceLandmarks, handLandmarks, handedness)
            
            val (isBlinking, blinkCount, _) = detectBlinkUseCase(eyeDistances)
            val (isMicrosleep, microsleepCount, microsleepDurations) = detectMicrosleepUseCase(eyeDistances)
            val (isYawning, yawnCount, yawnDurations) = detectYawnUseCase(mouthDistances)
            val eyeRubResults = detectEyeRubUseCase(handNearEyes)
            
            val alertLevel = determineAlertLevel(
                isMicrosleep = isMicrosleep,
                isNodding = isNodding,
                blinkCount = blinkCount,
                yawnCount = yawnCount,
                eyeRubFirstHandCount = eyeRubResults["MANO_IZQUIERDA"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["MANO_DERECHA"]?.second ?: 0
            )
            
            val alertType = determineAlertType(
                isMicrosleep = isMicrosleep,
                isNodding = isNodding,
                isYawning = isYawning,
                yawnCount = yawnCount,
                blinkCount = blinkCount,
                eyeRubFirstHandCount = eyeRubResults["MANO_IZQUIERDA"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["MANO_DERECHA"]?.second ?: 0
            )
            
            return MetricasSomnolencia(
                timestamp = System.currentTimeMillis(),
                ear = ear,
                mar = mar,
                headPose = HeadPose(pitch = 0f, yaw = 0f, roll = 0f),
                isBlinking = isBlinking,
                blinkCount = blinkCount,
                isMicrosleep = isMicrosleep,
                microsleepCount = microsleepCount,
                microsleepDurations = microsleepDurations,
                isYawning = isYawning,
                yawnCount = yawnCount,
                yawnDurations = yawnDurations,
                isNodding = isNodding,
                noddingCount = noddingCount,
                noddingDurations = noddingDurations,
                eyeRubFirstHand = Triple(
                    eyeRubResults["MANO_IZQUIERDA"]?.first ?: false,
                    eyeRubResults["MANO_IZQUIERDA"]?.second ?: 0,
                    eyeRubResults["MANO_IZQUIERDA"]?.third ?: emptyList()
                ),
                eyeRubSecondHand = Triple(
                    eyeRubResults["MANO_DERECHA"]?.first ?: false,
                    eyeRubResults["MANO_DERECHA"]?.second ?: 0,
                    eyeRubResults["MANO_DERECHA"]?.third ?: emptyList()
                ),
                alertLevel = alertLevel,
                alertType = alertType
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error: ${e.message}", e)
            return MetricasSomnolencia.empty()
        }
    }
    
    private fun determineAlertLevel(
        isMicrosleep: Boolean,
        isNodding: Boolean,
        blinkCount: Int,
        yawnCount: Int,
        eyeRubFirstHandCount: Int,
        eyeRubSecondHandCount: Int
    ): AlertLevel {
        return when {
            isMicrosleep -> AlertLevel.CRITICAL
            isNodding -> AlertLevel.CRITICAL
            yawnCount > YAWN_THRESHOLD -> AlertLevel.HIGH
            blinkCount > BLINK_THRESHOLD -> AlertLevel.MEDIUM
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> AlertLevel.MEDIUM
            else -> AlertLevel.NORMAL
        }
    }
    
    private fun determineAlertType(
        isMicrosleep: Boolean,
        isNodding: Boolean,
        isYawning: Boolean,
        yawnCount: Int,
        blinkCount: Int,
        eyeRubFirstHandCount: Int,
        eyeRubSecondHandCount: Int
    ): AlertType? {
        return when {
            isMicrosleep -> AlertType.MICROSLEEP
            isNodding -> AlertType.HEAD_NODDING
            isYawning && yawnCount > YAWN_THRESHOLD -> AlertType.YAWNING
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> AlertType.EYE_RUB
            blinkCount > BLINK_THRESHOLD -> AlertType.EXCESSIVE_BLINKING
            else -> null
        }
    }
    
    fun reset() {
        detectBlinkUseCase.reset()
        detectMicrosleepUseCase.reset()
        detectYawnUseCase.reset()
        detectNoddingUseCase.reset()
        detectEyeRubUseCase.reset()
        detectHeadPositionUseCase.reset()
        Log.d(TAG, "🔄 Contadores reseteados")
    }
}