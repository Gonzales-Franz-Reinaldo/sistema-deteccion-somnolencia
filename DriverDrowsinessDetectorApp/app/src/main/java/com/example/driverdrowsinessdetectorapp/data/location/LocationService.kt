package com.example.driverdrowsinessdetectorapp.data.location

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Servicio de ubicación GPS usando FusedLocationProviderClient.
 * 
 * Proporciona:
 * - Obtención de ubicación actual (una vez)
 * - Flujo continuo de ubicaciones
 * - Cálculo de velocidad
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class LocationService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "LocationService"
        
        // Configuración de ubicación
        private const val UPDATE_INTERVAL_MS = 10_000L      // 10 segundos
        private const val FASTEST_INTERVAL_MS = 5_000L      // 5 segundos mínimo
        private const val MAX_WAIT_TIME_MS = 15_000L        // 15 segundos máximo
        
        // Timeout para obtener ubicación única
        private const val SINGLE_LOCATION_TIMEOUT_MS = 10_000L
    }
    
    private val fusedLocationClient: FusedLocationProviderClient by lazy {
        LocationServices.getFusedLocationProviderClient(context)
    }
    
    // Última ubicación conocida (caché)
    @Volatile
    private var lastKnownLocation: LocationData? = null
    
    /**
     * Modelo de datos para ubicación.
     */
    data class LocationData(
        val latitude: Double,
        val longitude: Double,
        val altitude: Double? = null,
        val accuracy: Float? = null,
        val speed: Float? = null,           // m/s
        val speedKmh: Float? = null,        // km/h
        val bearing: Float? = null,
        val timestamp: Long = System.currentTimeMillis(),
        val provider: String? = null
    ) {
        /**
         * Verifica si la ubicación es válida.
         */
        fun isValid(): Boolean {
            return latitude != 0.0 && longitude != 0.0 &&
                   latitude >= -90 && latitude <= 90 &&
                   longitude >= -180 && longitude <= 180
        }
        
        /**
         * Verifica si la ubicación es reciente (menos de 30 segundos).
         */
        fun isRecent(): Boolean {
            return System.currentTimeMillis() - timestamp < 30_000
        }
        
        /**
         * Convierte velocidad de m/s a km/h.
         */
        fun getSpeedInKmh(): Int {
            return ((speed ?: 0f) * 3.6f).toInt()
        }
    }
    
    /**
     * Verifica si los permisos de ubicación están concedidos.
     */
    fun hasLocationPermission(): Boolean {
        val fineLocation = ContextCompat.checkSelfPermission(
            context, 
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        
        val coarseLocation = ContextCompat.checkSelfPermission(
            context, 
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        
        return fineLocation || coarseLocation
    }
    
    /**
     * Obtiene la ubicación actual (una sola vez).
     * 
     * Estrategia:
     * 1. Intenta obtener última ubicación conocida (rápido)
     * 2. Si no existe o es antigua, solicita ubicación fresca
     * 
     * @return LocationData con la ubicación actual o null si falla
     */
    suspend fun getCurrentLocation(): LocationData? {
        if (!hasLocationPermission()) {
            Log.w(TAG, " Sin permisos de ubicación")
            return null
        }
        
        return try {
            // Primero intentar última ubicación conocida (caché del sistema)
            val lastLocation = getLastKnownLocation()
            
            if (lastLocation != null && lastLocation.isRecent()) {
                Log.d(TAG, "Usando última ubicación conocida: ${lastLocation.latitude}, ${lastLocation.longitude}")
                lastKnownLocation = lastLocation
                return lastLocation
            }
            
            // Si no hay ubicación reciente, solicitar una fresca
            Log.d(TAG, "Solicitando ubicación fresca...")
            val freshLocation = requestFreshLocation()
            
            if (freshLocation != null) {
                lastKnownLocation = freshLocation
                Log.d(TAG, "Ubicación fresca obtenida: ${freshLocation.latitude}, ${freshLocation.longitude}")
            }
            
            freshLocation
        } catch (e: Exception) {
            Log.e(TAG, " Error obteniendo ubicación: ${e.message}", e)
            // Retornar última ubicación conocida como fallback
            lastKnownLocation
        }
    }
    
    /**
     * Obtiene la última ubicación conocida del sistema (sin solicitar GPS).
     */
    @Suppress("MissingPermission")
    private suspend fun getLastKnownLocation(): LocationData? {
        if (!hasLocationPermission()) return null
        
        return suspendCancellableCoroutine { continuation ->
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location: Location? ->
                    if (location != null) {
                        continuation.resume(location.toLocationData())
                    } else {
                        continuation.resume(null)
                    }
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Error obteniendo última ubicación: ${exception.message}")
                    continuation.resume(null)
                }
        }
    }
    
    /**
     * Solicita una ubicación fresca del GPS.
     */
    @Suppress("MissingPermission")
    private suspend fun requestFreshLocation(): LocationData? {
        if (!hasLocationPermission()) return null
        
        return suspendCancellableCoroutine { continuation ->
            val locationRequest = LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                UPDATE_INTERVAL_MS
            )
                .setMinUpdateIntervalMillis(FASTEST_INTERVAL_MS)
                .setMaxUpdates(1)
                .build()
            
            val locationCallback = object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    fusedLocationClient.removeLocationUpdates(this)
                    val location = result.lastLocation
                    if (location != null) {
                        continuation.resume(location.toLocationData())
                    } else {
                        continuation.resume(null)
                    }
                }
            }
            
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            
            // Timeout handler
            continuation.invokeOnCancellation {
                fusedLocationClient.removeLocationUpdates(locationCallback)
            }
        }
    }
    
    /**
     * Flujo continuo de actualizaciones de ubicación.
     * 
     * Útil para monitoreo continuo durante sesiones de conducción.
     */
    @Suppress("MissingPermission")
    fun getLocationUpdates(): Flow<LocationData> = callbackFlow {
        if (!hasLocationPermission()) {
            close(SecurityException("Sin permisos de ubicación"))
            return@callbackFlow
        }
        
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            UPDATE_INTERVAL_MS
        )
            .setMinUpdateIntervalMillis(FASTEST_INTERVAL_MS)
            .setMaxUpdateDelayMillis(MAX_WAIT_TIME_MS)
            .build()
        
        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    val locationData = location.toLocationData()
                    lastKnownLocation = locationData
                    trySend(locationData)
                    
                    Log.d(TAG, "Ubicación actualizada: ${locationData.latitude}, ${locationData.longitude}, " +
                              "Velocidad: ${locationData.getSpeedInKmh()} km/h")
                }
            }
        }
        
        Log.d(TAG, "Iniciando actualizaciones de ubicación")
        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
        
        awaitClose {
            Log.d(TAG, "Deteniendo actualizaciones de ubicación")
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
    
    /**
     * Obtiene la última ubicación conocida (caché local).
     */
    fun getLastCachedLocation(): LocationData? = lastKnownLocation
    
    /**
     * Extensión para convertir Location de Android a LocationData.
     */
    private fun Location.toLocationData(): LocationData {
        return LocationData(
            latitude = latitude,
            longitude = longitude,
            altitude = if (hasAltitude()) altitude else null,
            accuracy = if (hasAccuracy()) accuracy else null,
            speed = if (hasSpeed()) speed else null,
            speedKmh = if (hasSpeed()) speed * 3.6f else null,
            bearing = if (hasBearing()) bearing else null,
            timestamp = time,
            provider = provider
        )
    }
}