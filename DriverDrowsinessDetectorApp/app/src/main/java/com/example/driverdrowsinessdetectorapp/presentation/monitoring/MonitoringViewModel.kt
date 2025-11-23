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
        private const val ALERT_DURATION_MS = 5000L // ✅ 5 segundos de alarma
    }

    private val _uiState = MutableStateFlow<MonitoringUiState>(MonitoringUiState.Idle)
    val uiState: StateFlow<MonitoringUiState> = _uiState.asStateFlow()

    private val _currentMetrics = MutableStateFlow<MetricasSomnolencia?>(null)
    val currentMetrics: StateFlow<MetricasSomnolencia?> = _currentMetrics.asStateFlow()

    private var sessionStartTime: Long = 0
    private var frameCount = 0
    private var isProcessingFrame = false
    private var lastAlertLevel = AlertLevel.NORMAL
    private var lastAlertTime: Long = 0 // ✅ NUEVO: Timestamp de última alerta

    fun startTrip() {
        viewModelScope.launch {
            Log.d(TAG, "🚀 Iniciando viaje...")
            
            _uiState.value = MonitoringUiState.Starting
            detectDrowsinessUseCase.reset()
            
            delay(500)
            
            sessionStartTime = System.currentTimeMillis()
            frameCount = 0
            lastAlertLevel = AlertLevel.NORMAL
            lastAlertTime = 0 // ✅ NUEVO
            
            _uiState.value = MonitoringUiState.Active(
                sessionId = sessionStartTime,
                duration = "00:00:00",
                currentEAR = 0.0f,
                currentMAR = 0.0f,
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
                    handleAlertLevel(metrics.alertLevel)
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
                alertLevel = metrics.alertLevel,
                isProcessing = false
            )
        }
    }

    /**
     * ✅ MANEJO DE ALARMA CON DURACIÓN DE 5 SEGUNDOS
     */
    private fun handleAlertLevel(newAlertLevel: AlertLevel) {
        val currentTime = System.currentTimeMillis()
        
        when (newAlertLevel) {
            AlertLevel.NORMAL -> {
                // Si pasaron >5 segundos desde la última alerta → detener alarma
                if (currentTime - lastAlertTime > ALERT_DURATION_MS) {
                    alarmUtil.stopAlarm()
                    Log.d(TAG, "✅ Estado normal")
                }
            }
            
            AlertLevel.MEDIUM -> {
                if (newAlertLevel != lastAlertLevel) {
                    alarmUtil.playAlarm(newAlertLevel)
                    lastAlertTime = currentTime
                    Log.i(TAG, "⚡ ALERTA MEDIA")
                    
                    // Programar detención automática después de 5s
                    viewModelScope.launch {
                        delay(ALERT_DURATION_MS)
                        if (_currentMetrics.value?.alertLevel == AlertLevel.MEDIUM) {
                            alarmUtil.stopAlarm()
                            Log.d(TAG, "⏰ Alarma MEDIA detenida después de 5s")
                        }
                    }
                }
            }
            
            AlertLevel.HIGH -> {
                if (newAlertLevel != lastAlertLevel) {
                    alarmUtil.playAlarm(newAlertLevel)
                    lastAlertTime = currentTime
                    Log.w(TAG, "⚠️ ALERTA ALTA")
                    
                    viewModelScope.launch {
                        delay(ALERT_DURATION_MS)
                        if (_currentMetrics.value?.alertLevel == AlertLevel.HIGH) {
                            alarmUtil.stopAlarm()
                            Log.d(TAG, "⏰ Alarma ALTA detenida después de 5s")
                        }
                    }
                }
            }
            
            AlertLevel.CRITICAL -> {
                if (newAlertLevel != lastAlertLevel) {
                    alarmUtil.playAlarm(newAlertLevel)
                    lastAlertTime = currentTime
                    Log.w(TAG, "🚨 ALERTA CRÍTICA")
                    
                    viewModelScope.launch {
                        delay(ALERT_DURATION_MS)
                        if (_currentMetrics.value?.alertLevel == AlertLevel.CRITICAL) {
                            alarmUtil.stopAlarm()
                            Log.d(TAG, "⏰ Alarma CRÍTICA detenida después de 5s")
                        }
                    }
                }
            }
        }
        
        lastAlertLevel = newAlertLevel
    }

    fun pauseTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Active) {
                alarmUtil.stopAlarm()
                _uiState.value = MonitoringUiState.Paused(
                    sessionId = currentState.sessionId,
                    duration = currentState.duration
                )
                Log.d(TAG, "⏸️ Viaje pausado")
            }
        }
    }

    fun resumeTrip() {
        viewModelScope.launch {
            Log.d(TAG, "▶️ Reanudando viaje...")
            
            val currentMetrics = _currentMetrics.value
            _uiState.value = MonitoringUiState.Active(
                sessionId = sessionStartTime,
                duration = formatDuration((System.currentTimeMillis() - sessionStartTime) / 1000),
                currentEAR = currentMetrics?.ear ?: 0f,
                currentMAR = currentMetrics?.mar ?: 0f,
                headPose = currentMetrics?.headPose ?: com.example.driverdrowsinessdetectorapp.domain.model.HeadPose.NEUTRAL,
                alertLevel = currentMetrics?.alertLevel ?: AlertLevel.NORMAL,
                gpsEnabled = true,
                isProcessing = false
            )
            
            startTimer()
        }
    }

    fun stopTrip() {
        viewModelScope.launch {
            Log.d(TAG, "⏹️ Deteniendo viaje...")
            
            alarmUtil.stopAlarm()
            detectDrowsinessUseCase.reset()
            
            _uiState.value = MonitoringUiState.Idle
            _currentMetrics.value = null
            
            Log.d(TAG, "✅ Viaje detenido")
        }
    }

    private fun startTimer() {
        viewModelScope.launch {
            while (_uiState.value is MonitoringUiState.Active) {
                delay(1000)
                val currentState = _uiState.value
                if (currentState is MonitoringUiState.Active) {
                    val duration = (System.currentTimeMillis() - sessionStartTime) / 1000
                    _uiState.value = currentState.copy(duration = formatDuration(duration))
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
        alarmUtil.stopAlarm()
        Log.d(TAG, "🧹 ViewModel cleared")
    }
}