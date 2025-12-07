package com.example.driverdrowsinessdetectorapp.data.remote.websocket

import android.util.Log
import com.example.driverdrowsinessdetectorapp.util.Constants
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton
import com.example.driverdrowsinessdetectorapp.BuildConfig

/**
 * Estado de conexión del WebSocket GPS
 */
enum class GPSWebSocketState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    ERROR
}

/**
 * Datos de posición GPS para enviar
 */
data class GPSPosition(
    val lat: Double,
    val lng: Double,
    val velocidadKmh: Float?,
    val heading: Float?,
    val precisionM: Float?,
    val timestamp: String
)

/**
 * Manager para conexión WebSocket GPS en tiempo real
 * Envía la ubicación del chofer al servidor cada 2 segundos
 */
@Singleton
class GPSWebSocketManager @Inject constructor() {

    companion object {
        private const val TAG = "GPSWebSocketManager"
        private const val RECONNECT_DELAY_MS = 3000L
        private const val MAX_RECONNECT_ATTEMPTS = 5
        private const val PING_INTERVAL_MS = 30000L
    }

    private var webSocket: WebSocket? = null
    private var client: OkHttpClient? = null
    private var currentViajeId: Int? = null
    private var currentChoferId: Int? = null
    private var currentToken: String? = null
    private var reconnectAttempts = 0
    private var isManuallyDisconnected = false
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var pingJob: Job? = null
    private var reconnectJob: Job? = null

    // Estado de conexión observable
    private val _connectionState = MutableStateFlow(GPSWebSocketState.DISCONNECTED)
    val connectionState: StateFlow<GPSWebSocketState> = _connectionState

    // Última posición enviada
    private val _lastSentPosition = MutableStateFlow<GPSPosition?>(null)
    val lastSentPosition: StateFlow<GPSPosition?> = _lastSentPosition

    /**
     * Conectar al WebSocket del servidor
     */
    fun connect(idViaje: Int, idChofer: Int, token: String) {
        if (_connectionState.value == GPSWebSocketState.CONNECTED ||
            _connectionState.value == GPSWebSocketState.CONNECTING) {
            Log.w(TAG, "Ya existe una conexión activa o en proceso")
            return
        }

        currentViajeId = idViaje
        currentChoferId = idChofer
        currentToken = token
        isManuallyDisconnected = false
        reconnectAttempts = 0

        _connectionState.value = GPSWebSocketState.CONNECTING
        
        // Construir URL del WebSocket
        val wsUrl = buildWebSocketUrl(idViaje, token)
        Log.d(TAG, "Conectando a WebSocket: $wsUrl")

        // Crear cliente OkHttp
        client = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .pingInterval(30, TimeUnit.SECONDS)
            .build()

        val request = Request.Builder()
            .url(wsUrl)
            .build()

        webSocket = client?.newWebSocket(request, createWebSocketListener())
    }

    /**
     * Construir URL del WebSocket
     */
    private fun buildWebSocketUrl(idViaje: Int, token: String): String {
        val baseUrl = BuildConfig.API_BASE_URL
            .replace("http://", "ws://")
            .replace("https://", "wss://")
            .trimEnd('/')
        return "${baseUrl}/api/v1/gps/chofer/$idViaje?token=$token"
    }

    /**
     * Crear listener del WebSocket
     */
    private fun createWebSocketListener(): WebSocketListener {
        return object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i(TAG, "WebSocket GPS conectado")
                _connectionState.value = GPSWebSocketState.CONNECTED
                reconnectAttempts = 0
                startPingJob()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "Mensaje recibido: $text")
                handleMessage(text)
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.w(TAG, "WebSocket cerrándose: $code - $reason")
                webSocket.close(1000, null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.i(TAG, "WebSocket cerrado: $code - $reason")
                _connectionState.value = GPSWebSocketState.DISCONNECTED
                stopPingJob()
                
                if (!isManuallyDisconnected) {
                    scheduleReconnect()
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "Error WebSocket: ${t.message}", t)
                _connectionState.value = GPSWebSocketState.ERROR
                stopPingJob()
                
                if (!isManuallyDisconnected) {
                    scheduleReconnect()
                }
            }
        }
    }

    /**
     * Manejar mensajes recibidos del servidor
     */
    private fun handleMessage(text: String) {
        try {
            val json = JSONObject(text)
            when (json.optString("type")) {
                "PONG" -> Log.d(TAG, "Pong recibido")
                "ACK" -> Log.d(TAG, "Posición recibida por servidor")
                "ERROR" -> {
                    val errorMsg = json.optJSONObject("data")?.optString("mensaje") ?: "Error desconocido"
                    Log.e(TAG, "Error del servidor: $errorMsg")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parseando mensaje: ${e.message}")
        }
    }

    /**
     * Enviar posición GPS al servidor
     */
    fun sendPosition(position: GPSPosition) {
        if (_connectionState.value != GPSWebSocketState.CONNECTED) {
            Log.w(TAG, "No conectado, no se puede enviar posición")
            return
        }

        val viajeId = currentViajeId ?: return
        val choferId = currentChoferId ?: return

        try {
            val message = JSONObject().apply {
                put("type", "GPS_UPDATE")
                put("data", JSONObject().apply {
                    put("id_viaje", viajeId)
                    put("id_chofer", choferId)
                    put("lat", position.lat)
                    put("lng", position.lng)
                    put("velocidad_kmh", position.velocidadKmh ?: JSONObject.NULL)
                    put("heading", position.heading ?: JSONObject.NULL)
                    put("precision_m", position.precisionM ?: JSONObject.NULL)
                    put("timestamp", position.timestamp)
                })
            }

            val success = webSocket?.send(message.toString()) ?: false
            
            if (success) {
                _lastSentPosition.value = position
                Log.d(TAG, "Posición enviada: (${position.lat}, ${position.lng})")
            } else {
                Log.e(TAG, "Error enviando posición")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error construyendo mensaje: ${e.message}", e)
        }
    }

    /**
     * Desconectar WebSocket
     */
    fun disconnect() {
        Log.i(TAG, "Desconectando WebSocket GPS...")
        isManuallyDisconnected = true
        stopPingJob()
        reconnectJob?.cancel()
        
        webSocket?.close(1000, "Desconexión manual")
        webSocket = null
        client?.dispatcher?.executorService?.shutdown()
        client = null
        
        currentViajeId = null
        currentChoferId = null
        currentToken = null
        
        _connectionState.value = GPSWebSocketState.DISCONNECTED
    }

    /**
     * Iniciar job de ping para mantener conexión viva
     */
    private fun startPingJob() {
        pingJob?.cancel()
        pingJob = scope.launch {
            while (isActive && _connectionState.value == GPSWebSocketState.CONNECTED) {
                delay(PING_INTERVAL_MS)
                sendPing()
            }
        }
    }

    /**
     * Detener job de ping
     */
    private fun stopPingJob() {
        pingJob?.cancel()
        pingJob = null
    }

    /**
     * Enviar ping al servidor
     */
    private fun sendPing() {
        try {
            val pingMessage = JSONObject().apply {
                put("type", "PING")
            }
            webSocket?.send(pingMessage.toString())
            Log.d(TAG, "Ping enviado")
        } catch (e: Exception) {
            Log.e(TAG, "Error enviando ping: ${e.message}")
        }
    }

    /**
     * Programar reconexión automática
     */
    private fun scheduleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Log.e(TAG, "Máximo de intentos de reconexión alcanzado")
            _connectionState.value = GPSWebSocketState.ERROR
            return
        }

        reconnectAttempts++
        _connectionState.value = GPSWebSocketState.RECONNECTING
        
        Log.i(TAG, "Reconectando en ${RECONNECT_DELAY_MS}ms (intento $reconnectAttempts/$MAX_RECONNECT_ATTEMPTS)")
        
        reconnectJob?.cancel()
        reconnectJob = scope.launch {
            delay(RECONNECT_DELAY_MS)
            
            val viajeId = currentViajeId
            val choferId = currentChoferId
            val token = currentToken
            
            if (viajeId != null && choferId != null && token != null && !isManuallyDisconnected) {
                _connectionState.value = GPSWebSocketState.DISCONNECTED
                connect(viajeId, choferId, token)
            }
        }
    }

    /**
     * Verificar si está conectado
     */
    fun isConnected(): Boolean = _connectionState.value == GPSWebSocketState.CONNECTED

    /**
     * Limpiar recursos
     */
    fun cleanup() {
        disconnect()
        scope.cancel()
    }
}