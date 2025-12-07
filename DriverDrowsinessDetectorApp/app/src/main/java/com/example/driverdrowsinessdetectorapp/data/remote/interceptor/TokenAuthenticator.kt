package com.example.driverdrowsinessdetectorapp.data.remote.interceptor

import android.util.Log
import com.example.driverdrowsinessdetectorapp.BuildConfig
import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.RefreshTokenRequest
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.RefreshTokenResponse
import com.google.gson.Gson
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject

/**
 * Authenticator que maneja automáticamente la renovación del token cuando expira (401).
 * 
 * Flujo:
 * 1. Detecta respuesta 401
 * 2. Usa el refresh token para obtener nuevo access token
 * 3. Reintenta la petición original con el nuevo token
 * 4. Si el refresh también falla, limpia la sesión
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
class TokenAuthenticator @Inject constructor(
    private val preferencesManager: PreferencesManager,
    private val gson: Gson
) : Authenticator {
    
    companion object {
        private const val TAG = "TokenAuthenticator"
    }
    
    //  URL obtenida de BuildConfig (sin el slash final para concatenar endpoints)
    private val baseUrl: String
        get() = BuildConfig.API_BASE_URL.removeSuffix("/")
    
    @Volatile
    private var isRefreshing = false
    
    override fun authenticate(route: Route?, response: Response): Request? {
        Log.w(TAG, "Recibido 401 - Intentando renovar token...")
        
        // Evitar múltiples refreshes simultáneos
        synchronized(this) {
            if (isRefreshing) {
                Log.d(TAG, "Ya hay un refresh en progreso, esperando...")
                return null
            }
            isRefreshing = true
        }
        
        return try {
            val refreshToken = runBlocking {
                preferencesManager.getRefreshToken().first()
            }
            
            if (refreshToken.isNullOrBlank()) {
                Log.e(TAG, "No hay refresh token disponible")
                clearSessionAndReturn()
                return null
            }
            
            // Intentar renovar el token
            val newAccessToken = refreshAccessToken(refreshToken)
            
            if (newAccessToken != null) {
                Log.d(TAG, "Token renovado exitosamente")
                
                // Guardar nuevo token
                runBlocking {
                    preferencesManager.updateAccessToken(newAccessToken)
                }
                
                // Reintentar la petición original con el nuevo token
                response.request.newBuilder()
                    .removeHeader("Authorization")
                    .addHeader("Authorization", "Bearer $newAccessToken")
                    .build()
            } else {
                Log.e(TAG, "No se pudo renovar el token")
                clearSessionAndReturn()
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error renovando token: ${e.message}", e)
            clearSessionAndReturn()
            null
        } finally {
            synchronized(this) {
                isRefreshing = false
            }
        }
    }
    
    /**
     * Realiza la petición de refresh token al backend.
     */
    private fun refreshAccessToken(refreshToken: String): String? {
        return try {
            val client = OkHttpClient.Builder()
                .build()
            
            val requestBody = gson.toJson(RefreshTokenRequest(refreshToken))
                .toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/api/v1/auth/refresh")  //  Usa la variable local
                .post(requestBody)
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val refreshResponse = gson.fromJson(responseBody, RefreshTokenResponse::class.java)
                refreshResponse.accessToken
            } else {
                Log.e(TAG, "Refresh falló: ${response.code}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Excepción en refresh: ${e.message}", e)
            null
        }
    }
    
    /**
     * Limpia la sesión cuando el refresh falla.
     */
    private fun clearSessionAndReturn() {
        runBlocking {
            preferencesManager.clearAuthData()
        }
    }
}