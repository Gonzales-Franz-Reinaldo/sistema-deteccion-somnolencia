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
        
        //  UMBRALES SEGÚN PYTHON
        private const val BLINK_THRESHOLD = 20        // >20 parpadeos/min
        private const val YAWN_THRESHOLD = 3          // >3 bostezos/3min
        private const val EYE_RUB_THRESHOLD = 3       // >3 frotamientos/5min
    }
    
    operator fun invoke(
        faceLandmarks: List<NormalizedLandmark>,
        handLandmarks: List<List<NormalizedLandmark>>?,
        handedness: List<List<Category>>?
    ): MetricasSomnolencia {
        try {
            // 1-6. Cálculos previos (sin cambios)
            val eyeDistances = calculateEyeDistancesUseCase(faceLandmarks)
            val mouthDistances = calculateMouthDistancesUseCase(faceLandmarks)
            val ear = if (eyeDistances.horizontalRightEye > 0 && eyeDistances.horizontalLeftEye > 0) {
                val earRight = eyeDistances.verticalRightEyelid / eyeDistances.horizontalRightEye
                val earLeft = eyeDistances.verticalLeftEyelid / eyeDistances.horizontalLeftEye
                (earRight + earLeft) / 2f
            } else 0f
            val mar = calculateMARUseCase(faceLandmarks)
            val headPosition = detectHeadPositionUseCase(faceLandmarks)
            val handNearEyes = detectHandNearEyesUseCase(faceLandmarks, handLandmarks, handedness)
            
            // 7-11. Detecciones (sin cambios)
            val (isBlinking, blinkCount, _) = detectBlinkUseCase(eyeDistances)
            val (isMicrosleep, microsleepCount, microsleepDurations) = detectMicrosleepUseCase(eyeDistances)
            val (isYawning, yawnCount, yawnDurations) = detectYawnUseCase(mouthDistances)
            val (isNodding, noddingCount, noddingDurations) = detectNoddingUseCase(headPosition)
            val eyeRubResults = detectEyeRubUseCase(handNearEyes)
            
            // 12.  DETERMINAR NIVEL DE ALERTA
            val alertLevel = determineAlertLevel(
                isMicrosleep = isMicrosleep,
                isNodding = isNodding,
                blinkCount = blinkCount,
                yawnCount = yawnCount,
                eyeRubFirstHandCount = eyeRubResults["MANO_IZQUIERDA"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["MANO_DERECHA"]?.second ?: 0
            )
            
            //  DETERMINAR TIPO DE ALERTA (CORREGIDO)
            val alertType = determineAlertType(
                isMicrosleep = isMicrosleep,
                isNodding = isNodding,
                isYawning = isYawning,
                yawnCount = yawnCount,
                blinkCount = blinkCount,
                eyeRubFirstHandCount = eyeRubResults["MANO_IZQUIERDA"]?.second ?: 0,
                eyeRubSecondHandCount = eyeRubResults["MANO_DERECHA"]?.second ?: 0
            )
            
            // 13. Retornar métricas
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
    
    /**
     *  DETERMINAR NIVEL DE ALERTA (SIN CAMBIOS)
     */
    private fun determineAlertLevel(
        isMicrosleep: Boolean,
        isNodding: Boolean,
        blinkCount: Int,
        yawnCount: Int,
        eyeRubFirstHandCount: Int,
        eyeRubSecondHandCount: Int
    ): AlertLevel {
        return when {
            //  CRÍTICO INMEDIATO
            isMicrosleep -> {
                Log.d(TAG, "🚨 CRITICAL: Microsueño detectado")
                AlertLevel.CRITICAL
            }
            isNodding -> {
                Log.d(TAG, "🚨 CRITICAL: Cabeceo detectado")
                AlertLevel.CRITICAL
            }
            
            //  ADVERTENCIAS GRADUALES
            yawnCount > YAWN_THRESHOLD -> {
                Log.d(TAG, "⚠️ HIGH: Bostezos frecuentes ($yawnCount en 3 min)")
                AlertLevel.HIGH
            }
            blinkCount > BLINK_THRESHOLD -> {
                Log.d(TAG, "⚠️ MEDIUM: Parpadeo excesivo ($blinkCount en 1 min)")
                AlertLevel.MEDIUM
            }
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> {
                Log.d(TAG, "⚠️ MEDIUM: Frotamiento frecuente (${eyeRubFirstHandCount + eyeRubSecondHandCount} en 5 min)")
                AlertLevel.MEDIUM
            }
            
            //  NORMAL
            else -> AlertLevel.NORMAL
        }
    }
    
    /**
     * DETERMINAR TIPO DE ALERTA 
     */
    private fun determineAlertType(
        isMicrosleep: Boolean,
        isNodding: Boolean,
        isYawning: Boolean,
        yawnCount: Int,
        blinkCount: Int,
        eyeRubFirstHandCount: Int,
        eyeRubSecondHandCount: Int
    ): AlertType? {
        //  PRIORIDAD 1: CRÍTICOS (Microsueño, Cabeceo)
        return when {
            isMicrosleep -> {
                Log.d(TAG, "🔴 AlertType: MICROSLEEP")
                AlertType.MICROSLEEP
            }
            isNodding -> {
                Log.d(TAG, "🔴 AlertType: HEAD_NODDING")
                AlertType.HEAD_NODDING
            }
            
            //  PRIORIDAD 2: ADVERTENCIAS (Bostezo, Parpadeo, Frotamiento)
            // ORDEN: Bostezo > Frotamiento > Parpadeo
            isYawning && yawnCount > YAWN_THRESHOLD -> {
                Log.d(TAG, "⚠️ AlertType: YAWNING (count=$yawnCount)")
                AlertType.YAWNING
            }
            eyeRubFirstHandCount > EYE_RUB_THRESHOLD || eyeRubSecondHandCount > EYE_RUB_THRESHOLD -> {
                Log.d(TAG, "⚠️ AlertType: EYE_RUB (Izq=$eyeRubFirstHandCount, Der=$eyeRubSecondHandCount)")
                AlertType.EYE_RUB
            }
            blinkCount > BLINK_THRESHOLD -> {
                Log.d(TAG, "⚠️ AlertType: EXCESSIVE_BLINKING (count=$blinkCount)")
                AlertType.EXCESSIVE_BLINKING
            }
            
            //  SIN ALERTA
            else -> {
                Log.d(TAG, "✅ AlertType: NONE")
                null
            }
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