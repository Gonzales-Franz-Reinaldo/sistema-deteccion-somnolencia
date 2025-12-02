package com.example.driverdrowsinessdetectorapp.domain.usecase.gps

import com.example.driverdrowsinessdetectorapp.services.GPSTrackingService
import com.example.driverdrowsinessdetectorapp.services.GPSTrackingState
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

/**
 * Use case para iniciar el tracking GPS en tiempo real
 */
class StartGPSTrackingUseCase @Inject constructor(
    private val gpsTrackingService: GPSTrackingService
) {
    /**
     * Iniciar tracking GPS
     * @param idViaje ID del viaje activo
     * @param idChofer ID del chofer
     * @param token Token de autenticación
     */
    operator fun invoke(idViaje: Int, idChofer: Int, token: String) {
        gpsTrackingService.startTracking(idViaje, idChofer, token)
    }

    /**
     * Obtener estado del tracking
     */
    fun getTrackingState(): StateFlow<GPSTrackingState> {
        return gpsTrackingService.trackingState
    }
}