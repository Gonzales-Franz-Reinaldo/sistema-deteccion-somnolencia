package com.example.driverdrowsinessdetectorapp.presentation.monitoring

import android.graphics.Bitmap
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.DetectDrowsinessUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.ProcessFrameUseCase
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.MonitoringUiState
import com.example.driverdrowsinessdetectorapp.util.AlarmUtil
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MonitoringViewModel @Inject constructor(
    private val processFrameUseCase: ProcessFrameUseCase,
    private val detectDrowsinessUseCase: DetectDrowsinessUseCase,
    private val alarmUtil: AlarmUtil
) : ViewModel() {

    companion object {
        private const val TAG = "MonitoringViewModel"
        private const val FRAME_SKIP_COUNT = 2
        
        // ✅ DURACIONES DE ALERTAS
        private const val CRITICAL_ALERT_DURATION_MS = 5000L  // 5 segundos
        private const val WARNING_ALERT_DURATION_MS = 3000L   // 3 segundos
    }

    private val _uiState = MutableStateFlow<MonitoringUiState>(MonitoringUiState.Idle)
    val uiState: StateFlow<MonitoringUiState> = _uiState.asStateFlow()

    private val _currentMetrics = MutableStateFlow<MetricasSomnolencia?>(null)
    val currentMetrics: StateFlow<MetricasSomnolencia?> = _currentMetrics.asStateFlow()

    private var sessionStartTime: Long = 0
    private var frameCount = 0
    private var isProcessingFrame = false
    
    // ✅ NUEVO: Control de alertas con temporizador
    private var activeAlertLevel: AlertLevel = AlertLevel.NORMAL
    private var alertStartTime: Long = 0
    private var alertTimerJob: Job? = null

    fun startTrip() {
        viewModelScope.launch {
            Log.d(TAG, "🚀 Iniciando viaje...")
            
            _uiState.value = MonitoringUiState.Starting
            detectDrowsinessUseCase.reset()
            
            delay(500)
            
            sessionStartTime = System.currentTimeMillis()
            frameCount = 0
            activeAlertLevel = AlertLevel.NORMAL
            alertStartTime = 0
            
            _uiState.value = MonitoringUiState.Active(
                sessionId = sessionStartTime,
                duration = "00:00:00",
                currentEAR = 0f,
                currentMAR = 0f,
                headPose = com.example.driverdrowsinessdetectorapp.domain.model.HeadPose.NEUTRAL,
                alertLevel = AlertLevel.NORMAL,
                gpsEnabled = true,
                isProcessing = false
            )
            
            startTimer()
            
            Log.d(TAG, "✅ Viaje iniciado")
        }
    }

    fun processFrame(bitmap: Bitmap) {
        if (isProcessingFrame) return

        frameCount++
        if (frameCount % (FRAME_SKIP_COUNT + 1) != 0) return

        viewModelScope.launch {
            isProcessingFrame = true
            
            try {
                val metrics = withContext(Dispatchers.Default) {
                    processFrameUseCase(bitmap)
                }
                
                if (metrics != null) {
                    _currentMetrics.value = metrics
                    updateUiStateWithMetrics(metrics)
                    handleAlertWithDuration(metrics.alertLevel)
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error al procesar frame: ${e.message}", e)
            } finally {
                isProcessingFrame = false
            }
        }
    }

    private fun updateUiStateWithMetrics(metrics: MetricasSomnolencia) {
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(
                currentEAR = metrics.ear,
                currentMAR = metrics.mar,
                headPose = metrics.headPose,
                alertLevel = activeAlertLevel, 
                isProcessing = true
            )
        }
    }

    /**
     *  Manejo de alerta con duración garantizada
     */
    private fun handleAlertWithDuration(newAlertLevel: AlertLevel) {
        val currentTime = System.currentTimeMillis()
        
        when (newAlertLevel) {
            AlertLevel.NORMAL -> {
                // NO detener alerta inmediatamente si hay una activa
                if (activeAlertLevel != AlertLevel.NORMAL) {
                    val elapsedTime = currentTime - alertStartTime
                    val requiredDuration = getAlertDuration(activeAlertLevel)
                    
                    if (elapsedTime >= requiredDuration) {
                        //  Duración cumplida, detener alerta
                        stopAlert()
                        Log.d(TAG, "✅ Alerta completada: ${elapsedTime}ms")
                    } else {
                        Log.d(TAG, "⏱️ Manteniendo alerta: ${elapsedTime}ms / ${requiredDuration}ms")
                    }
                }
            }
            
            AlertLevel.MEDIUM, AlertLevel.HIGH, AlertLevel.CRITICAL -> {
                // NUEVA ALERTA o NIVEL MÁS ALTO
                if (newAlertLevel != activeAlertLevel || activeAlertLevel == AlertLevel.NORMAL) {
                    startAlert(newAlertLevel)
                }
            }
        }
    }

    /**
     *  Iniciar alerta con temporizador
     */
    private fun startAlert(level: AlertLevel) {
        // Cancelar temporizador anterior
        alertTimerJob?.cancel()
        
        activeAlertLevel = level
        alertStartTime = System.currentTimeMillis()
        
        // Reproducir alarma
        alarmUtil.playAlarm(level)
        
        val duration = getAlertDuration(level)
        val emoji = when(level) {
            AlertLevel.MEDIUM -> "⚠️"
            AlertLevel.HIGH -> "🚨"
            AlertLevel.CRITICAL -> "🔴"
            else -> ""
        }
        
        Log.w(TAG, "$emoji ALERTA ${level.name} INICIADA (duración: ${duration}ms)")
        
        //  Programar detención automática después de la duración
        alertTimerJob = viewModelScope.launch {
            delay(duration)
            stopAlert()
            Log.d(TAG, "⏰ Temporizador de alerta expirado")
        }
        
        // Actualizar UI
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(alertLevel = level)
        }
    }

    /**
     *  Detener alerta
     */
    private fun stopAlert() {
        alertTimerJob?.cancel()
        alarmUtil.stopAlarm()
        activeAlertLevel = AlertLevel.NORMAL
        alertStartTime = 0
        
        // Actualizar UI
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(alertLevel = AlertLevel.NORMAL)
        }
    }

    /**
     *  Obtener duración según nivel
     */
    private fun getAlertDuration(level: AlertLevel): Long {
        return when (level) {
            AlertLevel.CRITICAL -> CRITICAL_ALERT_DURATION_MS  // 5 segundos
            AlertLevel.HIGH, AlertLevel.MEDIUM -> WARNING_ALERT_DURATION_MS  // 3 segundos
            AlertLevel.NORMAL -> 0L
        }
    }

    private fun getAlertMessage(metrics: MetricasSomnolencia?): String {
        if (metrics == null) return "Desconocido"
        
        return when {
            metrics.isMicrosleep -> "😴 Microsueño detectado (${metrics.microsleepCount}x)"
            metrics.isNodding -> "🙇 Cabeceo detectado (${metrics.noddingCount}x)"
            metrics.isYawning -> "🥱 Bostezo prolongado (${metrics.yawnCount}x)"
            metrics.blinkCount > 20 -> "👁️ Parpadeo excesivo (${metrics.blinkCount}/min)" 
            metrics.eyeRubFirstHand.first -> "🤲 Frotamiento ojos - Mano izquierda"
            metrics.eyeRubSecondHand.first -> "🤲 Frotamiento ojos - Mano derecha"
            else -> "⚠️ Fatiga general"
        }
    }

    fun pauseTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Active) {
                _uiState.value = MonitoringUiState.Paused(
                    sessionId = currentState.sessionId,
                    duration = currentState.duration
                )
                stopAlert() // ← Detener alerta al pausar
                Log.d(TAG, "⏸️ Viaje pausado")
            }
        }
    }

    fun resumeTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Paused) {
                _uiState.value = MonitoringUiState.Active(
                    sessionId = currentState.sessionId,
                    duration = currentState.duration,
                    currentEAR = 0f,
                    currentMAR = 0f,
                    headPose = com.example.driverdrowsinessdetectorapp.domain.model.HeadPose.NEUTRAL,
                    alertLevel = AlertLevel.NORMAL,
                    gpsEnabled = true,
                    isProcessing = false
                )
                Log.d(TAG, "▶️ Viaje reanudado")
            }
        }
    }

    fun stopTrip() {
        viewModelScope.launch {
            stopAlert()
            detectDrowsinessUseCase.reset()
            _uiState.value = MonitoringUiState.Idle
            _currentMetrics.value = null
            Log.d(TAG, "⏹️ Viaje finalizado")
        }
    }

    private fun startTimer() {
        viewModelScope.launch {
            while (_uiState.value is MonitoringUiState.Active) {
                delay(1000)
                val elapsed = (System.currentTimeMillis() - sessionStartTime) / 1000
                val formatted = formatDuration(elapsed)
                
                val currentState = _uiState.value
                if (currentState is MonitoringUiState.Active) {
                    _uiState.value = currentState.copy(duration = formatted)
                }
            }
        }
    }

    private fun formatDuration(totalSeconds: Long): String {
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format("%02d:%02d:%02d", hours, minutes, seconds)
    }

    override fun onCleared() {
        super.onCleared()
        stopAlert()
        Log.d(TAG, "🧹 ViewModel cleared")
    }
}