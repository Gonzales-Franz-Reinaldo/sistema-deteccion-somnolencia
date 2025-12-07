package com.example.driverdrowsinessdetectorapp.data.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Observador de conectividad de red.
 * 
 * Detecta cambios en la conectividad y emite eventos cuando:
 * - Se pierde la conexión
 * - Se recupera la conexión (para sincronización inmediata)
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Singleton
class NetworkConnectivityObserver @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "NetworkObserver"
    }
    
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    
    /**
     * Estados de conectividad.
     */
    enum class Status {
        Available,      // Conectado a internet
        Unavailable,    // Sin conexión
        Losing,         // Perdiendo conexión
        Lost            // Conexión perdida
    }
    
    /**
     * Observa cambios en la conectividad como Flow.
     */
    fun observe(): Flow<Status> = callbackFlow {
        Log.d(TAG, "INICIANDO OBSERVACIÓN DE CONECTIVIDAD")
        
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                Log.d(TAG, "CONEXIÓN DISPONIBLE")
                Log.d(TAG, "   Network: $network")
                trySend(Status.Available)
            }
            
            override fun onLosing(network: Network, maxMsToLive: Int) {
                Log.w(TAG, "PERDIENDO CONEXIÓN: $network (${maxMsToLive}ms)")
                trySend(Status.Losing)
            }
            
            override fun onLost(network: Network) {
                Log.w(TAG, "CONEXIÓN PERDIDA")
                Log.w(TAG, "   Network: $network")
                trySend(Status.Lost)
            }
            
            override fun onUnavailable() {
                Log.w(TAG, "RED NO DISPONIBLE")
                trySend(Status.Unavailable)
            }
            
            override fun onCapabilitiesChanged(
                network: Network,
                networkCapabilities: NetworkCapabilities
            ) {
                val hasInternet = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                val validated = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                Log.d(TAG, "Capacidades cambiadas: internet=$hasInternet, validated=$validated")
                
                if (hasInternet && validated) {
                    trySend(Status.Available)
                }
            }
        }
        
        // Configurar request para monitorear todas las redes
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
            .build()
        
        try {
            connectivityManager.registerNetworkCallback(request, callback)
            Log.d(TAG, "Callback de red registrado")
        } catch (e: Exception) {
            Log.e(TAG, "Error registrando callback: ${e.message}", e)
        }
        
        // Emitir estado inicial
        val currentStatus = getCurrentStatus()
        Log.d(TAG, "Estado inicial: $currentStatus")
        trySend(currentStatus)
        
        awaitClose {
            Log.d(TAG, "Deteniendo observación de conectividad")
            try {
                connectivityManager.unregisterNetworkCallback(callback)
            } catch (e: Exception) {
                Log.e(TAG, "Error al desregistrar callback: ${e.message}")
            }
        }
    }.distinctUntilChanged()
    
    /**
     * Obtiene el estado actual de conectividad.
     */
    fun getCurrentStatus(): Status {
        val network = connectivityManager.activeNetwork
        if (network == null) {
            Log.d(TAG, "No hay red activa")
            return Status.Unavailable
        }
        
        val capabilities = connectivityManager.getNetworkCapabilities(network)
        if (capabilities == null) {
            Log.d(TAG, "Sin capacidades de red")
            return Status.Unavailable
        }
        
        val hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        val validated = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        
        Log.d(TAG, "Estado actual: internet=$hasInternet, validated=$validated")
        
        return if (hasInternet && validated) {
            Status.Available
        } else {
            Status.Unavailable
        }
    }
    
    /**
     * Verifica si hay conexión disponible ahora.
     */
    fun isConnected(): Boolean = getCurrentStatus() == Status.Available
}