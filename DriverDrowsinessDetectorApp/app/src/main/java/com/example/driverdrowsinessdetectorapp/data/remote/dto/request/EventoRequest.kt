package com.example.driverdrowsinessdetectorapp.data.remote.dto.request

import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * DTO para enviar un evento de somnolencia al servidor.
 *
 * Coincide con el schema EventoSomnolenciaCreate del backend FastAPI.
 *
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
data class EventoRequest(
    /**
     * ID del viaje activo (opcional).
     * Corresponde a Viaje.id_viaje en el backend.
     */
    @SerializedName("id_viaje")
    val idViaje: Int? = null,

    /**
     * Tipo de evento detectado.
     * Valores válidos: microsueno, cabeceo, parpadeo_ojos, bostezo, frotamiento_ojos
     */
    @SerializedName("tipo_evento")
    val tipoEvento: String,

    /**
     * Duración del evento en segundos (para microsueño y cabeceo).
     * Máximo 300 segundos (5 minutos).
     */
    @SerializedName("duracion_segundos")
    val duracionSegundos: Float? = null,

    /**
     * Cantidad de eventos en ventana temporal.
     * Para parpadeo (>20 en 60s), bostezo (>3 en 180s), frotamiento (>3 en 300s).
     */
    @SerializedName("cantidad_eventos")
    val cantidadEventos: Int = 1,

    /**
     * Nivel de severidad de la alerta.
     * Valores: NORMAL, MEDIUM, HIGH, CRITICAL
     */
    @SerializedName("nivel_severidad")
    val nivelSeveridad: String,

    /**
     * Latitud GPS donde ocurrió el evento.
     * Rango: -90 a 90
     */
    @SerializedName("latitud")
    val latitud: Double? = null,

    /**
     * Longitud GPS donde ocurrió el evento.
     * Rango: -180 a 180
     */
    @SerializedName("longitud")
    val longitud: Double? = null,

    /**
     * Velocidad del vehículo en km/h al momento del evento.
     * Rango: 0 a 300
     */
    @SerializedName("velocidad_kmh")
    val velocidadKmh: Int? = null,

    /**
     * Timestamp exacto cuando ocurrió el evento.
     * Formato ISO 8601: "2025-11-28T14:23:45"
     */
    @SerializedName("timestamp_evento")
    val timestampEvento: String,

    /**
     * ID único del dispositivo (Android ID o Build.ID).
     */
    @SerializedName("dispositivo_id")
    val dispositivoId: String? = null,

    /**
     * Versión de la aplicación.
     */
    @SerializedName("version_app")
    val versionApp: String? = null,

    /**
     * Indica si el evento se guardó offline primero.
     * true = se sincronizó después de estar offline.
     */
    @SerializedName("sincronizado_offline")
    val sincronizadoOffline: Boolean = false
) {
    companion object {
        private val ISO_DATE_FORMAT = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss",
            Locale.US
        ).apply {
            timeZone = TimeZone.getDefault()
        }

        /**
         * Convierte un timestamp en milisegundos a formato ISO 8601.
         */
        fun formatTimestamp(timestampMs: Long): String {
            return ISO_DATE_FORMAT.format(Date(timestampMs))
        }

        /**
         * Crea un EventoRequest desde una entidad de Room.
         * Útil para sincronización de eventos guardados localmente.
         */
        fun fromEntity(entity: EventoSomnolenciaEntity): EventoRequest {
            return EventoRequest(
                idViaje = entity.idViaje,
                tipoEvento = entity.tipoEvento,
                duracionSegundos = entity.duracionSegundos,
                cantidadEventos = entity.cantidadEventos,
                nivelSeveridad = entity.nivelSeveridad,
                latitud = entity.latitud,
                longitud = entity.longitud,
                velocidadKmh = entity.velocidadKmh,
                timestampEvento = formatTimestamp(entity.timestampEvento),
                dispositivoId = entity.dispositivoId,
                versionApp = entity.versionApp,
                sincronizadoOffline = true // Siempre true cuando viene de Room
            )
        }
    }
}

/**
 * DTO para enviar múltiples eventos en lote (sincronización offline).
 */
data class EventosBatchRequest(
    @SerializedName("eventos")
    val eventos: List<EventoRequest>
) {
    companion object {
        /**
         * Crea un batch request desde una lista de entidades de Room.
         */
        fun fromEntities(entities: List<EventoSomnolenciaEntity>): EventosBatchRequest {
            return EventosBatchRequest(
                eventos = entities.map { EventoRequest.fromEntity(it) }
            )
        }
    }
}