package com.example.driverdrowsinessdetectorapp.data.remote.dto.response

import com.google.gson.annotations.SerializedName

/**
 * DTO para respuesta completa de un evento de somnolencia.
 * 
 * Coincide con el schema EventoSomnolenciaResponse del backend FastAPI.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
data class EventoResponse(
    /**
     * ID del evento asignado por el servidor.
     */
    @SerializedName("id_evento")
    val idEvento: Int,
    
    /**
     * ID del chofer que generó el evento.
     */
    @SerializedName("id_chofer")
    val idChofer: Int,
    
    /**
     * ID del viaje asociado (puede ser null).
     */
    @SerializedName("id_viaje")
    val idViaje: Int? = null,
    
    /**
     * Tipo de evento detectado.
     */
    @SerializedName("tipo_evento")
    val tipoEvento: String,
    
    /**
     * Duración del evento en segundos.
     */
    @SerializedName("duracion_segundos")
    val duracionSegundos: Float? = null,
    
    /**
     * Cantidad de eventos en ventana temporal.
     */
    @SerializedName("cantidad_eventos")
    val cantidadEventos: Int? = null,
    
    /**
     * Nivel de severidad de la alerta.
     */
    @SerializedName("nivel_severidad")
    val nivelSeveridad: String? = null,
    
    /**
     * Latitud GPS donde ocurrió el evento.
     */
    @SerializedName("latitud")
    val latitud: Double? = null,
    
    /**
     * Longitud GPS donde ocurrió el evento.
     */
    @SerializedName("longitud")
    val longitud: Double? = null,
    
    /**
     * Velocidad del vehículo en km/h.
     */
    @SerializedName("velocidad_kmh")
    val velocidadKmh: Int? = null,
    
    /**
     * Timestamp cuando ocurrió el evento.
     */
    @SerializedName("timestamp_evento")
    val timestampEvento: String,
    
    /**
     * Timestamp cuando se sincronizó con el servidor.
     */
    @SerializedName("timestamp_sincronizado")
    val timestampSincronizado: String,
    
    /**
     * ID del dispositivo que generó el evento.
     */
    @SerializedName("dispositivo_id")
    val dispositivoId: String? = null,
    
    /**
     * Versión de la app que generó el evento.
     */
    @SerializedName("version_app")
    val versionApp: String? = null,
    
    /**
     * Indica si se sincronizó después de estar offline.
     */
    @SerializedName("sincronizado_offline")
    val sincronizadoOffline: Boolean = false
)

/**
 * DTO resumido para listados de eventos.
 */
data class EventoResumenResponse(
    @SerializedName("id_evento")
    val idEvento: Int,
    
    @SerializedName("tipo_evento")
    val tipoEvento: String,
    
    @SerializedName("nivel_severidad")
    val nivelSeveridad: String? = null,
    
    @SerializedName("duracion_segundos")
    val duracionSegundos: Float? = null,
    
    @SerializedName("cantidad_eventos")
    val cantidadEventos: Int? = null,
    
    @SerializedName("timestamp_evento")
    val timestampEvento: String,
    
    @SerializedName("latitud")
    val latitud: Double? = null,
    
    @SerializedName("longitud")
    val longitud: Double? = null,
    
    @SerializedName("velocidad_kmh")
    val velocidadKmh: Int? = null
)

/**
 * DTO para estadísticas de un chofer.
 */
data class EstadisticasChoferResponse(
    @SerializedName("id_chofer")
    val idChofer: Int,
    
    @SerializedName("nombre_chofer")
    val nombreChofer: String,
    
    @SerializedName("periodo_dias")
    val periodoDias: Int,
    
    @SerializedName("total_eventos")
    val totalEventos: Int,
    
    @SerializedName("microsuenos")
    val microsuenos: Int,
    
    @SerializedName("cabeceos")
    val cabeceos: Int,
    
    @SerializedName("bostezos")
    val bostezos: Int,
    
    @SerializedName("parpadeo_ojos")
    val parpadeoOjos: Int,
    
    @SerializedName("frotamientos_ojos")
    val frotamientosOjos: Int,
    
    @SerializedName("eventos_critical")
    val eventosCritical: Int,
    
    @SerializedName("eventos_high")
    val eventosHigh: Int,
    
    @SerializedName("eventos_medium")
    val eventosMedium: Int,
    
    @SerializedName("ultimo_evento")
    val ultimoEvento: String? = null
)

/**
 * Wrapper para errores de la API.
 */
data class ApiErrorResponse(
    @SerializedName("detail")
    val detail: String
)