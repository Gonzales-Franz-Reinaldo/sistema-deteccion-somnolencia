package com.example.driverdrowsinessdetectorapp.domain.usecase.location

import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import javax.inject.Inject

/**
 * Caso de Uso: Obtener Ubicación Actual
 * 
 * Encapsula la lógica para obtener la ubicación GPS actual
 * al momento de detectar un evento de somnolencia.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
class GetCurrentLocationUseCase @Inject constructor(
    private val locationService: LocationService
) {
    companion object {
        private const val TAG = "GetCurrentLocationUseCase"
    }
    
    /**
     * Obtiene la ubicación actual.
     * 
     * @return LocationResult con los datos de ubicación o error
     */
    suspend operator fun invoke(): LocationResult {
        return try {
            // Verificar permisos primero
            if (!locationService.hasLocationPermission()) {
                Log.w(TAG, "Sin permisos de ubicación")
                return LocationResult.NoPermission
            }
            
            // Obtener ubicación
            val location = locationService.getCurrentLocation()
            
            if (location != null && location.isValid()) {
                Log.d(TAG, "Ubicación obtenida: ${location.latitude}, ${location.longitude}")
                LocationResult.Success(location)
            } else {
                Log.w(TAG, "No se pudo obtener ubicación válida")
                LocationResult.Unavailable
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Error de permisos: ${e.message}")
            LocationResult.NoPermission
        } catch (e: Exception) {
            Log.e(TAG, "Error obteniendo ubicación: ${e.message}", e)
            LocationResult.Error(e.message ?: "Error desconocido")
        }
    }
    
    /**
     * Obtiene la última ubicación conocida (sin solicitar GPS).
     * Más rápido pero puede ser menos preciso.
     */
    fun getLastKnown(): LocationService.LocationData? {
        return locationService.getLastCachedLocation()
    }
    
    /**
     * Verifica si hay permisos de ubicación.
     */
    fun hasPermission(): Boolean {
        return locationService.hasLocationPermission()
    }
    
    /**
     * Resultado de la operación de ubicación.
     */
    sealed class LocationResult {
        data class Success(val location: LocationService.LocationData) : LocationResult()
        data object Unavailable : LocationResult()
        data object NoPermission : LocationResult()
        data class Error(val message: String) : LocationResult()
        
        /**
         * Obtiene la ubicación si está disponible, null en caso contrario.
         */
        fun getOrNull(): LocationService.LocationData? {
            return when (this) {
                is Success -> location
                else -> null
            }
        }
        
        /**
         * Verifica si la operación fue exitosa.
         */
        fun isSuccess(): Boolean = this is Success
    }
}