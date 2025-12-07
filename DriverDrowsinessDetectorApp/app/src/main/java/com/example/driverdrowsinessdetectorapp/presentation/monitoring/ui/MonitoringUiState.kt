package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui

import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType
import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose

sealed class MonitoringUiState {
    
    /** Estado inicial, sin monitoreo activo */
    data object Idle : MonitoringUiState()
    
    /** Iniciando el monitoreo */
    data object Starting : MonitoringUiState()
    
    /** Estado de carga */
    data object Loading : MonitoringUiState()
    
    /** Monitoreo activo*/
    data class Active(
        val sessionId: Long,
        val duration: String = "00:00:00",
        val currentEAR: Float = 0f,
        val currentMAR: Float = 0f,
        val headPose: HeadPose = HeadPose.NEUTRAL,
        val alertLevel: AlertLevel = AlertLevel.NORMAL,
        val alertType: AlertType? = null,
        val gpsEnabled: Boolean = true,
        val isProcessing: Boolean = false,
        val eventosGuardados: EventosStats = EventosStats()
    ) : MonitoringUiState()
    
    /** Monitoreo pausado */
    data class Paused(
        val sessionId: Long,
        val duration: String = "00:00:00",
        val eventosGuardados: EventosStats = EventosStats()
    ) : MonitoringUiState()
    
    /** Error en el monitoreo */
    data class Error(val message: String) : MonitoringUiState()
}

/**
 * Estadísticas de eventos durante la sesión.
 */
data class EventosStats(
    val microsueños: Int = 0,
    val cabeceos: Int = 0,
    val bostezos: Int = 0,
    val parpadeos: Int = 0,
    val frotamientos: Int = 0
) {
    val total: Int get() = microsueños + cabeceos + bostezos + parpadeos + frotamientos
    val totalEventos: Int get() = total  // Alias para compatibilidad
    val criticos: Int get() = microsueños + cabeceos
}