package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.*
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import javax.inject.Inject

class DetectDrowsinessUseCase @Inject constructor(
    private val calculateEARUseCase: CalculateEARUseCase,
    private val calculateMARUseCase: CalculateMARUseCase,
    private val detectHeadPoseUseCase: DetectHeadPoseUseCase,
    private val detectHandNearEyesUseCase: DetectHandNearEyesUseCase,
    private val detectBlinkUseCase: DetectBlinkUseCase, // ✅ NUEVO
    private val detectMicrosleepUseCase: DetectMicrosleepUseCase,
    private val detectYawnUseCase: DetectYawnUseCase,
    private val detectNoddingUseCase: DetectNoddingUseCase,
    private val detectEyeRubUseCase: DetectEyeRubUseCase
) {
    companion object {
        private const val TAG = "DetectDrowsinessUseCase"
        
        // ✅ UMBRALES DE VENTANA TEMPORAL
        private const val BLINK_THRESHOLD = 20     // >20 parpadeos en 1 min
        private const val YAWN_THRESHOLD = 10      // >10 bostezos en 3 min
        private const val EYE_RUB_THRESHOLD = 10   // >10 frotamientos en 5 min
    }
    
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>,
        handLandmarks: List<List<NormalizedLandmark>>?
    ): MetricasSomnolencia {
        try {
            // 1. CÁLCULO DE MÉTRICAS
            val ear = calculateEARUseCase(faceLandmarks)
            val mar = calculateMARUseCase(faceLandmarks)
            val headPose = detectHeadPoseUseCase(faceLandmarks)
            val handNearEyes = detectHandNearEyesUseCase(faceLandmarks, handLandmarks)
            
            // 2. DETECCIÓN DE CARACTERÍSTICAS
            val (isBlinking, blinkCount, isEyeClosed) = detectBlinkUseCase(ear) // ✅ NUEVO
            val (isMicrosleep, microsleepCount, microsleepDurations) = detectMicrosleepUseCase(ear)
            val (isYawning, yawnCount, yawnDurations) = detectYawnUseCase(mar)
            val (isNodding, noddingCount, noddingDurations) = detectNoddingUseCase(headPose)
            val eyeRubResults = detectEyeRubUseCase(handNearEyes)
            
            // 3. DETERMINAR NIVEL DE ALERTA
            val alertLevel = determineAlertLevel(
                isMicrosleep = isMicrosleep,
                isYawning = isYawning,
                yawnCount = yawnCount,
                isNodding = isNodding,
                blinkCount = blinkCount, // ✅ NUEVO
                eyeRubFirstHandCount = eyeRubResults["PRIMERA_MANO"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["SEGUNDA_MANO"]?.second ?: 0
            )
            
            val alertType = determineAlertType(
                isMicrosleep = isMicrosleep,
                isYawning = isYawning,
                isNodding = isNodding
            )
            
            // 4. RETORNAR MÉTRICAS COMPLETAS
            return MetricasSomnolencia(
                timestamp = System.currentTimeMillis(),
                ear = ear,
                mar = mar,
                headPose = headPose,
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
            Log.e(TAG, "❌ Error al detectar somnolencia: ${e.message}", e)
            return MetricasSomnolencia.empty()
        }
    }
    
    private fun determineAlertLevel(
        isMicrosleep: Boolean,
        isYawning: Boolean,
        yawnCount: Int,
        isNodding: Boolean,
        blinkCount: Int, // ✅ NUEVO
        eyeRubFirstHandCount: Int,
        eyeRubSecondHandCount: Int
    ): AlertLevel {
        return when {
            // CRÍTICO: Microsueño (inmediato)
            isMicrosleep -> {
                Log.w(TAG, "🚨 CRÍTICO: Microsueño detectado")
                AlertLevel.CRITICAL
            }
            
            // ALTO: Cabeceo (inmediato)
            isNodding -> {
                Log.w(TAG, "⚠️ ALTO: Cabeceo detectado")
                AlertLevel.HIGH
            }
            
            // MEDIO: Parpadeo excede umbral ✅ NUEVO
            blinkCount > BLINK_THRESHOLD -> {
                Log.w(TAG, "⚡ MEDIO: $blinkCount parpadeos en 1 min (umbral: $BLINK_THRESHOLD)")
                AlertLevel.MEDIUM
            }
            
            // MEDIO: Bostezo excede umbral
            yawnCount > YAWN_THRESHOLD -> {
                Log.w(TAG, "⚡ MEDIO: $yawnCount bostezos en 3 min (umbral: $YAWN_THRESHOLD)")
                AlertLevel.MEDIUM
            }
            
            // MEDIO: Frotamiento excede umbral
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> {
                Log.w(TAG, "⚡ MEDIO: Frotamiento ojos (Primera: $eyeRubFirstHandCount, Segunda: $eyeRubSecondHandCount)")
                AlertLevel.MEDIUM
            }
            
            // NORMAL
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
        detectBlinkUseCase.reset() // ✅ NUEVO
        detectMicrosleepUseCase.reset()
        detectYawnUseCase.reset()
        detectNoddingUseCase.reset()
        detectEyeRubUseCase.reset()
        Log.d(TAG, "🔄 Contadores reseteados")
    }
}