package com.example.driverdrowsinessdetectorapp.domain.usecase.evento

import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.EventoWebSocketManager
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType
import java.time.Instant
import java.time.format.DateTimeFormatter
import javax.inject.Inject

/**
 * UseCase para enviar eventos de somnolencia en tiempo real via WebSocket.
 * 
 * Responsabilidades:
 * - Formatear datos del evento
 * - Obtener ubicación actual
 * - Enviar via WebSocket si hay conexión
 * - Si no hay conexión, EventoWebSocketManager los guarda en cola
 */
class SendEventoRealtimeUseCase @Inject constructor(
    private val eventoWebSocketManager: EventoWebSocketManager,
    private val locationService: LocationService
) {
    companion object {
        private const val TAG = "SendEventoRealtimeUC"
    }
    
    /**
     * Envía un evento de somnolencia en tiempo real.
     * 
     * @param idViaje ID del viaje actual
     * @param idChofer ID del chofer
     * @param tipoEvento Tipo de evento detectado
     * @param nivelSeveridad Nivel de severidad
     * @param duracionSegundos Duración del evento
     * @param earPromedio EAR promedio durante el evento
     * @param marPromedio MAR promedio durante el evento
     */
    suspend operator fun invoke(
        idViaje: Int,
        idChofer: Int,
        tipoEvento: AlertType,
        nivelSeveridad: AlertLevel,
        duracionSegundos: Float,
        earPromedio: Float? = null,
        marPromedio: Float? = null
    ) {
        try {
            // ← FIX: Usar getLastCachedLocation() que es público
            // O usar getCurrentLocation() que también es público
            val location = try {
                locationService.getLastCachedLocation()
            } catch (e: Exception) {
                Log.w(TAG, "No se pudo obtener ubicación: ${e.message}")
                null
            }
            
            // Timestamp en formato ISO 8601
            val timestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
            
            Log.d(TAG, "Enviando evento: tipo=${tipoEvento.name}, severidad=${nivelSeveridad.name}")
            
            // Enviar via WebSocket
            eventoWebSocketManager.sendEventoSomnolencia(
                idViaje = idViaje,
                idChofer = idChofer,
                tipoEvento = tipoEvento,
                nivelSeveridad = nivelSeveridad.name,
                duracionSegundos = duracionSegundos,
                timestampEvento = timestamp,
                latitud = location?.latitude,
                longitud = location?.longitude,
                velocidadKmh = location?.speed?.times(3.6f), // m/s a km/h
                earPromedio = earPromedio,
                marPromedio = marPromedio
            )
            
            Log.d(TAG, "Evento enviado/encolado correctamente")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error enviando evento: ${e.message}", e)
        }
    }
    
    /**
     * Conecta al WebSocket para el viaje especificado.
     */
    suspend fun connect(idViaje: Int) {
        eventoWebSocketManager.connect(idViaje)
    }
    
    /**
     * Desconecta del WebSocket.
     */
    fun disconnect() {
        eventoWebSocketManager.disconnect()
    }
    
    /**
     * Verifica si está conectado.
     */
    fun isConnected(): Boolean {
        return eventoWebSocketManager.connectionState.value is EventoWebSocketManager.ConnectionState.Connected
    }
    
    /**
     * Obtiene el número de eventos pendientes en cola.
     */
    fun getPendingEventsCount(): Int {
        return eventoWebSocketManager.getPendingEventsCount()
    }
}