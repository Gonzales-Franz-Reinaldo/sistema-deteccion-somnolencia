package com.example.driverdrowsinessdetectorapp.presentation.monitoring

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.MonitoringUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MonitoringViewModel @Inject constructor(
    // TODO: Inyectar casos de uso cuando estén listos
    // private val processFrameUseCase: ProcessFrameUseCase,
    // private val sessionRepository: SessionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<MonitoringUiState>(MonitoringUiState.Idle)
    val uiState: StateFlow<MonitoringUiState> = _uiState.asStateFlow()

    private val _cameraActive = MutableStateFlow(false)
    val cameraActive: StateFlow<Boolean> = _cameraActive.asStateFlow()

    private val _serverConnected = MutableStateFlow(true)
    val serverConnected: StateFlow<Boolean> = _serverConnected.asStateFlow()

    private var sessionStartTime: Long = 0

    /**
     * Inicia el viaje de monitoreo
     */
    fun startTrip() {
        viewModelScope.launch {
            _uiState.value = MonitoringUiState.Starting
            
            // Simular inicialización
            delay(500)
            
            sessionStartTime = System.currentTimeMillis()
            _cameraActive.value = true
            
            _uiState.value = MonitoringUiState.Active(
                sessionId = System.currentTimeMillis(),
                duration = "00:00:00",
                currentEAR = 0.28f,
                currentMAR = 0.35f,
                headPose = HeadPose.NEUTRAL,
                alertLevel = AlertLevel.NORMAL,
                gpsEnabled = true,
                isProcessing = true
            )
            
            // Iniciar actualización de timer
            startTimer()
        }
    }

    /**
     * Pausa el monitoreo
     */
    fun pauseTrip() {
        viewModelScope.launch {
            _uiState.value = MonitoringUiState.Paused
        }
    }

    /**
     * Reanuda el monitoreo
     */
    fun resumeTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Paused) {
                // Restaurar el estado activo
                _uiState.value = MonitoringUiState.Active(
                    sessionId = System.currentTimeMillis(),
                    duration = "00:00:00",
                    currentEAR = 0.28f,
                    currentMAR = 0.35f,
                    headPose = HeadPose.NEUTRAL,
                    alertLevel = AlertLevel.NORMAL,
                    gpsEnabled = true,
                    isProcessing = true
                )
                startTimer()
            }
        }
    }

    /**
     * Detiene el viaje completamente
     */
    fun stopTrip() {
        viewModelScope.launch {
            _cameraActive.value = false
            _uiState.value = MonitoringUiState.Idle
        }
    }

    /**
     * Timer que actualiza la duración cada segundo
     */
    private fun startTimer() {
        viewModelScope.launch {
            while (_uiState.value is MonitoringUiState.Active) {
                delay(1000)
                
                val currentState = _uiState.value
                if (currentState is MonitoringUiState.Active) {
                    val elapsedSeconds = (System.currentTimeMillis() - sessionStartTime) / 1000
                    val duration = formatDuration(elapsedSeconds)
                    
                    _uiState.value = currentState.copy(duration = duration)
                }
            }
        }
    }

    /**
     * Formatea la duración en formato HH:MM:SS
     */
    private fun formatDuration(totalSeconds: Long): String {
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format("%02d:%02d:%02d", hours, minutes, seconds)
    }
}