package com.example.driverdrowsinessdetectorapp.data.remote.websocket

import android.util.Log
import com.example.driverdrowsinessdetectorapp.BuildConfig
import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType
import com.google.gson.Gson
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import okhttp3.*
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton
import com.google.gson.annotations.SerializedName

/**
 * Manager de WebSocket para envío de eventos de somnolencia en tiempo real.
 */
@Singleton
class EventoWebSocketManager @Inject constructor(
    private val preferencesManager: PreferencesManager,
    private val gson: Gson
) {
    companion object {
        private const val TAG = "EventoWSManager"  
        private const val RECONNECT_DELAY_MS = 5000L
        private const val MAX_RECONNECT_ATTEMPTS = 5
        private const val PING_INTERVAL_MS = 25000L
    }
    
    // Estado de conexión
    sealed class ConnectionState {
        data object Disconnected : ConnectionState()
        data object Connecting : ConnectionState()
        data object Connected : ConnectionState()
        data class Error(val message: String) : ConnectionState()
    }
    
    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()
    
    private var webSocket: WebSocket? = null
    private var currentViajeId: Int? = null
    private var reconnectAttempts = 0
    private var reconnectJob: Job? = null
    private var pingJob: Job? = null
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .pingInterval(25, TimeUnit.SECONDS)
        .build()
    
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // Cola de eventos pendientes
    private val pendingEvents = mutableListOf<EventoSomnolenciaMessage>()
    private val pendingEventsLock = Any()
    
    /**
     * Conecta al WebSocket para el viaje especificado.
     */
    suspend fun connect(idViaje: Int) {
        Log.i(TAG, "INICIANDO CONEXIÓN EVENTOS WS")
        Log.i(TAG, "   Viaje ID: $idViaje")
        
        if (_connectionState.value is ConnectionState.Connected && currentViajeId == idViaje) {
            Log.w(TAG, "Ya conectado al viaje $idViaje")
            return
        }
        
        // Desconectar si había conexión previa
        disconnect()
        
        currentViajeId = idViaje
        _connectionState.value = ConnectionState.Connecting
        
        // ← IMPORTANTE: Obtener token
        val token = preferencesManager.getAccessToken().first()
        Log.d(TAG, "Token obtenido: ${if (token.isNullOrEmpty()) "VACÍO/NULL" else "${token.take(20)}..."}")
        
        if (token.isNullOrEmpty()) {
            Log.e(TAG, "ERROR: No hay token de autenticación")
            _connectionState.value = ConnectionState.Error("Sin token de autenticación")
            return
        }
        
        // Construir URL
        val baseUrl = BuildConfig.API_BASE_URL
            .replace("http://", "ws://")
            .replace("https://", "wss://")
            .trimEnd('/')
        
        // ←  Endpoint correcto para EVENTOS (no GPS)
        val wsUrl = "$baseUrl/api/v1/ws/chofer/$idViaje?token=$token"
        
        Log.i(TAG, "URL WebSocket Eventos: $wsUrl")
        
        val request = Request.Builder()
            .url(wsUrl)
            .build()
        
        webSocket = client.newWebSocket(request, createWebSocketListener())
    }
    
    /**
     * Desconecta del WebSocket.
     */
    fun disconnect() {
        Log.i(TAG, "Desconectando WebSocket eventos")
        
        pingJob?.cancel()
        reconnectJob?.cancel()
        
        webSocket?.close(1000, "Desconexión manual")
        webSocket = null
        currentViajeId = null
        reconnectAttempts = 0
        
        _connectionState.value = ConnectionState.Disconnected
    }
    
    /**
     * Envía un evento de somnolencia.
     */
    fun sendEvento(evento: EventoSomnolenciaMessage) {
        Log.d(TAG, "sendEvento() llamado - Estado: ${_connectionState.value}")
        
        if (_connectionState.value is ConnectionState.Connected) {
            sendEventoInternal(evento)
        } else {
            Log.w(TAG, "No conectado, guardando en cola de pendientes")
            synchronized(pendingEventsLock) {
                pendingEvents.add(evento)
                Log.d(TAG, "Eventos pendientes: ${pendingEvents.size}")
            }
        }
    }
    
    /**
     * Envía un evento de somnolencia detectado.
     */
    fun sendEventoSomnolencia(
        idViaje: Int,
        idChofer: Int,
        tipoEvento: AlertType,
        nivelSeveridad: String,
        duracionSegundos: Float,
        timestampEvento: String,
        latitud: Double? = null,
        longitud: Double? = null,
        velocidadKmh: Float? = null,
        earPromedio: Float? = null,
        marPromedio: Float? = null
    ) {
        Log.i(TAG, "ENVIANDO EVENTO DE SOMNOLENCIA")
        Log.i(TAG, "   Tipo: ${tipoEvento.name}")
        Log.i(TAG, "   Severidad: $nivelSeveridad")
        Log.i(TAG, "   Viaje: $idViaje, Chofer: $idChofer")
        
        val evento = EventoSomnolenciaMessage(
            idViaje = idViaje,
            idChofer = idChofer,
            tipoEvento = tipoEvento.toBackendString(),
            nivelSeveridad = nivelSeveridad,
            duracionSegundos = duracionSegundos,
            timestampEvento = timestampEvento,
            latitud = latitud,
            longitud = longitud,
            velocidadKmh = velocidadKmh,
            earPromedio = earPromedio,
            marPromedio = marPromedio
        )
        
        sendEvento(evento)
    }
    
    private fun sendEventoInternal(evento: EventoSomnolenciaMessage) {
        try {
            val json = gson.toJson(evento)
            Log.d(TAG, "Enviando JSON: $json")
            
            val sent = webSocket?.send(json) ?: false
            
            if (sent) {
                Log.i(TAG, "Evento enviado exitosamente")
            } else {
                Log.e(TAG, "Error: webSocket.send() retornó false")
                // Guardar en pendientes
                synchronized(pendingEventsLock) {
                    pendingEvents.add(evento)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error enviando evento: ${e.message}", e)
            synchronized(pendingEventsLock) {
                pendingEvents.add(evento)
            }
        }
    }
    
    /**
     * Envía todos los eventos pendientes como batch.
     */
    private fun sendPendingEvents() {
        synchronized(pendingEventsLock) {
            if (pendingEvents.isEmpty()) {
                Log.d(TAG, "No hay eventos pendientes")
                return
            }
            
            Log.i(TAG, "Enviando ${pendingEvents.size} eventos pendientes como batch")
            
            val viajeId = currentViajeId ?: return
            val choferId = pendingEvents.firstOrNull()?.idChofer ?: return
            
            val batch = EventosBatchMessage(
                idViaje = viajeId,
                idChofer = choferId,
                eventos = pendingEvents.toList()
            )
            
            try {
                val json = gson.toJson(batch)
                Log.d(TAG, "Enviando batch: $json")
                
                val sent = webSocket?.send(json) ?: false
                
                if (sent) {
                    Log.i(TAG, "Batch enviado, limpiando cola")
                    pendingEvents.clear()
                } else {
                    Log.e(TAG, "Error enviando batch")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error enviando batch: ${e.message}", e)
            }
        }
    }
    
    private fun createWebSocketListener(): WebSocketListener {
        return object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.i(TAG, "WEBSOCKET EVENTOS CONECTADO")
                Log.i(TAG, "   Response: ${response.code}")
                
                _connectionState.value = ConnectionState.Connected
                reconnectAttempts = 0
                
                // Iniciar ping
                startPing()
                
                // Enviar eventos pendientes
                sendPendingEvents()
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "Mensaje recibido: $text")
                
                // Parsear respuesta
                try {
                    val json = gson.fromJson(text, Map::class.java)
                    when (json["type"]) {
                        "CONNECTION_ESTABLISHED" -> {
                            Log.i(TAG, "Conexión confirmada por servidor")
                        }
                        "EVENTO_RECIBIDO" -> {
                            Log.i(TAG, "Servidor confirmó evento recibido")
                        }
                        "PONG" -> {
                            Log.d(TAG, "Pong recibido")
                        }
                        "ERROR" -> {
                            Log.e(TAG, "Error del servidor: ${json["message"]}")
                        }
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "No se pudo parsear mensaje: $text")
                }
            }
            
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.w(TAG, "WebSocket cerrándose: $code - $reason")
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.i(TAG, "WebSocket cerrado: $code - $reason")
                _connectionState.value = ConnectionState.Disconnected
                pingJob?.cancel()
                
                // Reconectar si no fue cierre manual
                if (code != 1000) {
                    scheduleReconnect()
                }
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "ERROR WebSocket: ${t.message}", t)
                Log.e(TAG, "   Response: ${response?.code} - ${response?.message}")
                
                _connectionState.value = ConnectionState.Error(t.message ?: "Error desconocido")
                pingJob?.cancel()
                
                scheduleReconnect()
            }
        }
    }
    
    private fun startPing() {
        pingJob?.cancel()
        pingJob = scope.launch {
            while (isActive && _connectionState.value is ConnectionState.Connected) {
                delay(PING_INTERVAL_MS)
                try {
                    val pingMsg = """{"type":"PING"}"""
                    webSocket?.send(pingMsg)
                    Log.d(TAG, "Ping enviado")
                } catch (e: Exception) {
                    Log.e(TAG, "Error enviando ping: ${e.message}")
                }
            }
        }
    }
    
    private fun scheduleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Log.e(TAG, "Máximo de reconexiones alcanzado ($MAX_RECONNECT_ATTEMPTS)")
            _connectionState.value = ConnectionState.Error("Máximo de reconexiones alcanzado")
            return
        }
        
        reconnectAttempts++
        Log.i(TAG, "Reconectando en ${RECONNECT_DELAY_MS}ms (intento $reconnectAttempts/$MAX_RECONNECT_ATTEMPTS)")
        
        reconnectJob?.cancel()
        reconnectJob = scope.launch {
            delay(RECONNECT_DELAY_MS)
            
            currentViajeId?.let { viajeId ->
                _connectionState.value = ConnectionState.Disconnected
                connect(viajeId)
            }
        }
    }
    
    /**
     * Obtiene el número de eventos pendientes.
     */
    fun getPendingEventsCount(): Int {
        synchronized(pendingEventsLock) {
            return pendingEvents.size
        }
    }
    
    /**
     * Limpia recursos al destruir.
     */
    fun destroy() {
        Log.i(TAG, "Destruyendo EventoWebSocketManager")
        disconnect()
        scope.cancel()
    }
}

// Data classes (sin cambios)
data class EventoSomnolenciaMessage(
    val type: String = "EVENTO_SOMNOLENCIA",
    @SerializedName("id_viaje") val idViaje: Int,
    @SerializedName("id_chofer") val idChofer: Int,
    @SerializedName("tipo_evento") val tipoEvento: String,
    @SerializedName("nivel_severidad") val nivelSeveridad: String,
    @SerializedName("duracion_segundos") val duracionSegundos: Float,
    @SerializedName("timestamp_evento") val timestampEvento: String,
    val latitud: Double? = null,
    val longitud: Double? = null,
    @SerializedName("velocidad_kmh") val velocidadKmh: Float? = null,
    @SerializedName("ear_promedio") val earPromedio: Float? = null,
    @SerializedName("mar_promedio") val marPromedio: Float? = null
)

data class EventosBatchMessage(
    val type: String = "EVENTOS_BATCH",
    @SerializedName("id_viaje") val idViaje: Int,
    @SerializedName("id_chofer") val idChofer: Int,
    val eventos: List<EventoSomnolenciaMessage>
)

/**
 * Extensión para convertir AlertType a string del backend.
 * Usar los nombres EXACTOS del enum AlertType.kt
 */
fun AlertType.toBackendString(): String {
    return when (this) {
        AlertType.MICROSLEEP -> "microsueño"
        AlertType.HEAD_NODDING -> "cabeceo"
        AlertType.YAWNING -> "bostezo"
        AlertType.EXCESSIVE_BLINKING -> "parpadeo_ojos"
        AlertType.EYE_RUB -> "frotamiento_ojos"
    }
}