package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.*
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject

class DetectDrowsinessUseCase @Inject constructor(
    private val calculateEyeDistancesUseCase: CalculateEyeDistancesUseCase,
    private val calculateMouthDistancesUseCase: CalculateMouthDistancesUseCase,  // ✅ NUEVO
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
        private const val YAWN_THRESHOLD = 10
        private const val EYE_RUB_THRESHOLD = 10
    }
    
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>,
        handLandmarks: List<List<NormalizedLandmark>>?
    ): MetricasSomnolencia {
        try {
            // 1. CALCULAR DISTANCIAS DE OJOS
            val eyeDistances = calculateEyeDistancesUseCase(faceLandmarks)
            
            // 2. ✅ CALCULAR DISTANCIAS DE BOCA
            val mouthDistances = calculateMouthDistancesUseCase(faceLandmarks)
            
            // 3. CALCULAR EAR
            val ear = if (eyeDistances.horizontalRightEye > 0 && eyeDistances.horizontalLeftEye > 0) {
                val earRight = eyeDistances.verticalRightEyelid / eyeDistances.horizontalRightEye
                val earLeft = eyeDistances.verticalLeftEyelid / eyeDistances.horizontalLeftEye
                (earRight + earLeft) / 2f
            } else {
                0f
            }
            
            // 4. CALCULAR MAR (LEGACY - para métricas)
            val mar = calculateMARUseCase(faceLandmarks)
            
            // 5. DETECTAR POSICIÓN DE CABEZA
            val headPosition = detectHeadPositionUseCase(faceLandmarks)
            
            // 6. DETECTAR MANOS CERCA DE OJOS
            val handNearEyes = detectHandNearEyesUseCase(faceLandmarks, handLandmarks)
            
            // 7. ✅ DETECCIONES CON NUEVAS LÓGICAS
            val (isBlinking, blinkCount, isEyeClosed) = detectBlinkUseCase(eyeDistances)
            val (isMicrosleep, microsleepCount, microsleepDurations) = detectMicrosleepUseCase(eyeDistances)
            val (isYawning, yawnCount, yawnDurations) = detectYawnUseCase(mouthDistances)  // ✅ PASAR MouthDistances
            val (isNodding, noddingCount, noddingDurations) = detectNoddingUseCase(headPosition)
            val eyeRubResults = detectEyeRubUseCase(handNearEyes)
            
            Log.d(TAG, "EAR=$ear, Blinking=$isBlinking, Microsleep=$isMicrosleep, Yawning=$isYawning")
            
            // 8. DETERMINAR NIVEL DE ALERTA
            val alertLevel = determineAlertLevel(
                isMicrosleep = isMicrosleep,
                isNodding = isNodding,
                blinkCount = blinkCount,
                yawnCount = yawnCount,
                eyeRubFirstHandCount = eyeRubResults["PRIMERA_MANO"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["SEGUNDA_MANO"]?.second ?: 0
            )
            
            val alertType = determineAlertType(isMicrosleep, isYawning, isNodding)
            
            return MetricasSomnolencia(
                timestamp = System.currentTimeMillis(),
                ear = ear,
                mar = mar,
                headPose = HeadPose(
                    pitch = 0f,
                    yaw = 0f,
                    roll = 0f
                ),
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
                eyeRubFirstHand = eyeRubResults["PRIMERA_MANO"] ?: Triple(false, 0, emptyList()),
                eyeRubSecondHand = eyeRubResults["SEGUNDA_MANO"] ?: Triple(false, 0, emptyList()),
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
            isMicrosleep -> {
                Log.d(TAG, "🚨 CRITICAL: Microsueño detectado")
                AlertLevel.CRITICAL
            }
            isNodding -> {
                Log.d(TAG, "🚨 CRITICAL: Cabeceo detectado")
                AlertLevel.CRITICAL
            }
            blinkCount > BLINK_THRESHOLD -> {
                Log.d(TAG, "⚠️ MEDIUM: Parpadeo excesivo ($blinkCount)")
                AlertLevel.MEDIUM
            }
            yawnCount > YAWN_THRESHOLD -> {
                Log.d(TAG, "⚠️ HIGH: Bostezos excesivos ($yawnCount)")
                AlertLevel.HIGH
            }
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> {
                Log.d(TAG, "⚠️ MEDIUM: Frotamiento excesivo")
                AlertLevel.MEDIUM
            }
            else -> AlertLevel.NORMAL
        }
    }
    
    private fun determineAlertType(
        isMicrosleep: Boolean,
        isYawning: Boolean,
        isNodding: Boolean
    ): AlertType? {
        return when {
            isMicrosleep -> AlertType.MICROSLEEP
            isNodding -> AlertType.HEAD_NODDING
            isYawning -> AlertType.YAWNING
            else -> null
        }
    }
    
    fun reset() {
        detectBlinkUseCase.reset()
        detectMicrosleepUseCase.reset()
        detectYawnUseCase.reset()
        detectNoddingUseCase.reset()
        detectEyeRubUseCase.reset()
        Log.d(TAG, "🔄 Contadores reseteados")
    }
}