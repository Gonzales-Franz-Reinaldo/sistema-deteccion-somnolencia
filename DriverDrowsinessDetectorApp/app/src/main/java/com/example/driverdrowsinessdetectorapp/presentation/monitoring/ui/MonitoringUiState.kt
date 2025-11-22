package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui

import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose

sealed class MonitoringUiState {
    data object Idle : MonitoringUiState()
    data object RequestingPermissions : MonitoringUiState()
    data object Starting : MonitoringUiState()
    
    data class Active(
        val sessionId: Long,
        val duration: String, // Formato: "00:05:23"
        val currentEAR: Float, // Eye Aspect Ratio (0.0 - 1.0)
        val currentMAR: Float, // Mouth Aspect Ratio (0.0 - 1.0)
        val headPose: HeadPose,
        val alertLevel: AlertLevel, // NORMAL, WARNING, CRITICAL
        val gpsEnabled: Boolean,
        val isProcessing: Boolean = true
    ) : MonitoringUiState()
    
    data object Paused : MonitoringUiState()
    
    data class Error(val message: String) : MonitoringUiState()
}