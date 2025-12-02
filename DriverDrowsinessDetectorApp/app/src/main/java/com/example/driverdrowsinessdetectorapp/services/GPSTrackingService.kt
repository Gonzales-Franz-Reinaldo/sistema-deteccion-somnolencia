package com.example.driverdrowsinessdetectorapp.services

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.GPSPosition
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.GPSWebSocketManager
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.GPSWebSocketState
import com.example.driverdrowsinessdetectorapp.util.NetworkUtil
import com.google.android.gms.location.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Estado del servicio de tracking GPS
 */
data class GPSTrackingState(
    val isTracking: Boolean = false,
    val isConnected: Boolean = false,
    val currentLocation: Location? = null,
    val lastUpdateTime: String? = null,
    val errorMessage: String? = null
)

/**
 * Servicio de tracking GPS en tiempo real
 * Obtiene la ubicación del dispositivo y la envía al servidor via WebSocket
 */
@Singleton
class GPSTrackingService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gpsWebSocketManager: GPSWebSocketManager,
    private val networkUtil: NetworkUtil  // ← Inyectado correctamente
) {
    companion object {
        private const val TAG = "GPSTrackingService"
        
        // ← CAMBIAR para pruebas (0 metros = envía siempre)
        // En producción usar 5f o 10f
        private const val GPS_MIN_DISPLACEMENT_M = 0f  // ← Cambiar de 5f a 0f para pruebas
        
        private const val GPS_INTERVAL_MS = 2000L  // 2 segundos
        private const val GPS_FASTEST_INTERVAL_MS = 1000L
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var fusedLocationClient: FusedLocationProviderClient? = null
    private var locationCallback: LocationCallback? = null
    private var trackingJob: Job? = null

    private var currentViajeId: Int? = null
    private var currentChoferId: Int? = null
    private var currentToken: String? = null

    // Estado del tracking observable
    private val _trackingState = MutableStateFlow(GPSTrackingState())
    val trackingState: StateFlow<GPSTrackingState> = _trackingState

    // Formato de timestamp ISO 8601
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    /**
     * Iniciar tracking GPS y envío por WebSocket
     */
    fun startTracking(idViaje: Int, idChofer: Int, token: String) {
        if (_trackingState.value.isTracking) {
            Log.w(TAG, "El tracking ya está activo")
            return
        }

        if (!hasLocationPermission()) {
            _trackingState.value = _trackingState.value.copy(
                errorMessage = "Sin permisos de ubicación"
            )
            Log.e(TAG, "Sin permisos de ubicación")
            return
        }

        currentViajeId = idViaje
        currentChoferId = idChofer
        currentToken = token

        Log.i(TAG, "🚀 Iniciando tracking GPS para viaje $idViaje")

        // Conectar WebSocket si hay internet
        if (networkUtil.isNetworkAvailable()) {  // ← Usando método de instancia
            gpsWebSocketManager.connect(idViaje, idChofer, token)
        }

        // Iniciar location updates
        startLocationUpdates()

        // Monitorear estado de conexión WebSocket
        startConnectionMonitoring()

        _trackingState.value = _trackingState.value.copy(
            isTracking = true,
            errorMessage = null
        )
    }

    /**
     * Detener tracking GPS
     */
    fun stopTracking() {
        Log.i(TAG, "🛑 Deteniendo tracking GPS")

        stopLocationUpdates()
        gpsWebSocketManager.disconnect()
        trackingJob?.cancel()

        currentViajeId = null
        currentChoferId = null
        currentToken = null

        _trackingState.value = GPSTrackingState()
    }

    /**
     * Iniciar actualizaciones de ubicación
     */
    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            GPS_INTERVAL_MS
        ).apply {
            setMinUpdateIntervalMillis(GPS_FASTEST_INTERVAL_MS)
            setMinUpdateDistanceMeters(GPS_MIN_DISPLACEMENT_M)
            setWaitForAccurateLocation(false)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    handleLocationUpdate(location)
                }
            }
        }

        try {
            fusedLocationClient?.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                Looper.getMainLooper()
            )
            Log.i(TAG, "✅ Location updates iniciados")
        } catch (e: Exception) {
            Log.e(TAG, "Error iniciando location updates: ${e.message}", e)
            _trackingState.value = _trackingState.value.copy(
                errorMessage = "Error iniciando GPS: ${e.message}"
            )
        }
    }

    /**
     * Detener actualizaciones de ubicación
     */
    private fun stopLocationUpdates() {
        locationCallback?.let { callback ->
            fusedLocationClient?.removeLocationUpdates(callback)
        }
        locationCallback = null
        fusedLocationClient = null
        Log.i(TAG, "Location updates detenidos")
    }

    /**
     * Manejar nueva ubicación recibida
     */
    private fun handleLocationUpdate(location: Location) {
        val timestamp = isoFormat.format(Date())

        Log.d(TAG, "📍 Nueva ubicación: (${location.latitude}, ${location.longitude}) " +
                "speed=${location.speed} bearing=${location.bearing}")

        // Crear objeto de posición
        val position = GPSPosition(
            lat = location.latitude,
            lng = location.longitude,
            velocidadKmh = if (location.hasSpeed()) location.speed * 3.6f else null,
            heading = if (location.hasBearing()) location.bearing else null,
            precisionM = if (location.hasAccuracy()) location.accuracy else null,
            timestamp = timestamp
        )

        // Actualizar estado local
        _trackingState.value = _trackingState.value.copy(
            currentLocation = location,
            lastUpdateTime = timestamp,
            isConnected = gpsWebSocketManager.isConnected()
        )

        // Enviar al servidor si hay conexión
        if (networkUtil.isNetworkAvailable() && gpsWebSocketManager.isConnected()) {
            gpsWebSocketManager.sendPosition(position)
        } else {
            Log.w(TAG, "📵 Sin conexión, posición no enviada")
            // TODO: Guardar en cola local para enviar después
        }
    }

    /**
     * Monitorear estado de conexión y reconectar si es necesario
     */
    private fun startConnectionMonitoring() {
        trackingJob?.cancel()
        trackingJob = scope.launch {
            gpsWebSocketManager.connectionState.collect { state ->
                Log.d(TAG, "📶 Estado WebSocket GPS: $state")
                
                _trackingState.value = _trackingState.value.copy(
                    isConnected = state == GPSWebSocketState.CONNECTED
                )
                
                // Reconectar si se desconectó y hay internet
                if (state == GPSWebSocketState.DISCONNECTED && 
                    _trackingState.value.isTracking &&
                    networkUtil.isNetworkAvailable()) {
                    
                    delay(3000) // Esperar 3 segundos antes de reconectar
                    
                    currentViajeId?.let { viaje ->
                        currentChoferId?.let { chofer ->
                            currentToken?.let { token ->
                                Log.i(TAG, "🔄 Intentando reconectar WebSocket GPS...")
                                gpsWebSocketManager.connect(viaje, chofer, token)
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Verificar permisos de ubicación
     */
    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Limpiar recursos
     */
    fun cleanup() {
        stopTracking()
        scope.cancel()
        gpsWebSocketManager.cleanup()
    }
}