package com.example.driverdrowsinessdetectorapp.data.remote.dto.response

import com.google.gson.annotations.SerializedName

/**
 * DTO para respuesta de viaje asignado al chofer.
 */
data class ViajeResponse(
    @SerializedName("id_viaje")
    val idViaje: Int,
    
    @SerializedName("id_chofer")
    val idChofer: Int,
    
    @SerializedName("id_empresa")
    val idEmpresa: Int,
    
    @SerializedName("origen")
    val origen: String,
    
    @SerializedName("destino")
    val destino: String,
    
    @SerializedName("fecha_viaje_programada")
    val fechaViajeProgramada: String,
    
    @SerializedName("hora_viaje_programada")
    val horaViajeProgramada: String,
    
    @SerializedName("duracion_estimada")
    val duracionEstimada: String,
    
    @SerializedName("distancia_km")
    val distanciaKm: Double? = null,
    
    @SerializedName("estado")
    val estado: String,
    
    @SerializedName("observaciones")
    val observaciones: String? = null,
    
    @SerializedName("nombre_chofer")
    val nombreChofer: String? = null,
    
    @SerializedName("nombre_empresa")
    val nombreEmpresa: String? = null
)

/**
 * DTO para listado de viajes.
 */
data class ViajeListResponse(
    @SerializedName("total")
    val total: Int,
    
    @SerializedName("skip")
    val skip: Int,
    
    @SerializedName("limit")
    val limit: Int,
    
    @SerializedName("viajes")
    val viajes: List<ViajeResponse>
)