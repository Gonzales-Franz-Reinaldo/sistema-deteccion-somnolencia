package com.example.driverdrowsinessdetectorapp.util

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Utilidad para verificar estado de conectividad de red.
 * 
 * Puede usarse de dos formas:
 * 1. Inyectada con Hilt: @Inject constructor(networkUtil: NetworkUtil)
 * 2. Estáticamente: NetworkUtil.isNetworkAvailable(context)
 */
@Singleton
class NetworkUtil @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    /**
     * Verifica si hay conexión a internet disponible (método de instancia).
     */
    fun isNetworkAvailable(): Boolean = Companion.isNetworkAvailable(context)
    
    /**
     * Verifica si hay conexión WiFi específicamente (método de instancia).
     */
    fun isWifiConnected(): Boolean = Companion.isWifiConnected(context)
    
    companion object {
        /**
         * Verifica si hay conexión a internet disponible (método estático).
         * 
         * @param context Contexto de la aplicación
         * @return true si hay conexión a internet, false si no
         */
        @JvmStatic
        fun isNetworkAvailable(context: Context): Boolean {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork ?: return false
                val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
                
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
            } else {
                @Suppress("DEPRECATION")
                val networkInfo = connectivityManager.activeNetworkInfo
                networkInfo != null && networkInfo.isConnected
            }
        }
        
        /**
         * Verifica si hay conexión WiFi específicamente (método estático).
         */
        @JvmStatic
        fun isWifiConnected(context: Context): Boolean {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork ?: return false
                val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
                
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
            } else {
                @Suppress("DEPRECATION")
                val networkInfo = connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI)
                networkInfo != null && networkInfo.isConnected
            }
        }
    }
}
