package com.example.driverdrowsinessdetectorapp.domain.usecase.gps

import com.example.driverdrowsinessdetectorapp.services.GPSTrackingService
import javax.inject.Inject

/**
 * Use case para detener el tracking GPS
 */
class StopGPSTrackingUseCase @Inject constructor(
    private val gpsTrackingService: GPSTrackingService
) {
    /**
     * Detener tracking GPS
     */
    operator fun invoke() {
        gpsTrackingService.stopTracking()
    }
}