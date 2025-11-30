package com.example.driverdrowsinessdetectorapp.domain.model

/**
 * Modelo de dominio para Viaje.
 */
data class Viaje(
    val idViaje: Int,
    val idChofer: Int,
    val origen: String,
    val destino: String,
    val fechaProgramada: String,
    val horaProgramada: String,
    val duracionEstimada: String,
    val distanciaKm: Double?,
    val estado: EstadoViaje,
    val observaciones: String?,
    val nombreEmpresa: String?
)

/**
 * Estados posibles de un viaje.
 */
enum class EstadoViaje(val valor: String) {
    PENDIENTE("pendiente"),
    EN_CURSO("en_curso"),
    COMPLETADA("completada"),
    CANCELADA("cancelada");
    
    companion object {
        fun fromString(valor: String): EstadoViaje {
            return entries.find { it.valor == valor } ?: PENDIENTE
        }
    }
}