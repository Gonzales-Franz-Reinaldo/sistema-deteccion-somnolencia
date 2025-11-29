package com.example.driverdrowsinessdetectorapp.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad para almacenar ubicaciones GPS durante el monitoreo.
 * 
 * Registra la ruta del vehículo durante las sesiones de monitoreo.
 * Útil para análisis de patrones y contexto de alertas.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Entity(
    tableName = "locations",
    foreignKeys = [
        ForeignKey(
            entity = SessionEntity::class,
            parentColumns = ["id"],
            childColumns = ["session_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["session_id"]),
        Index(value = ["timestamp"]),
        Index(value = ["session_id", "timestamp"])
    ]
)
data class LocationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    /** ID de la sesión a la que pertenece */
    @ColumnInfo(name = "session_id")
    val sessionId: Long,

    /** Timestamp de la ubicación */
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    // COORDENADAS
    
    /** Latitud */
    @ColumnInfo(name = "latitude")
    val latitude: Double,

    /** Longitud */
    @ColumnInfo(name = "longitude")
    val longitude: Double,

    /** Altitud en metros (opcional) */
    @ColumnInfo(name = "altitude")
    val altitude: Double? = null,

    // PRECISIÓN Y VELOCIDAD
    
    /** Precisión en metros */
    @ColumnInfo(name = "accuracy")
    val accuracy: Float? = null,

    /** Velocidad en m/s */
    @ColumnInfo(name = "speed")
    val speed: Float? = null,

    /** Velocidad en km/h (calculada) */
    @ColumnInfo(name = "speed_kmh")
    val speedKmh: Float? = null,

    /** Dirección/rumbo en grados (0-360) */
    @ColumnInfo(name = "bearing")
    val bearing: Float? = null,

    // PROVEEDOR Y METADATA
    
    /** Proveedor de ubicación (GPS, Network, Fused) */
    @ColumnInfo(name = "provider")
    val provider: String? = null,

    /** Indica si el vehículo está en movimiento */
    @ColumnInfo(name = "is_moving")
    val isMoving: Boolean = false
) {
    companion object {
        // Proveedores de ubicación
        const val PROVIDER_GPS = "gps"
        const val PROVIDER_NETWORK = "network"
        const val PROVIDER_FUSED = "fused"

        // Umbral de velocidad para considerar "en movimiento" (km/h)
        const val MOVING_THRESHOLD_KMH = 5.0f
    }

    /**
     * Calcula velocidad en km/h desde m/s
     */
    fun getSpeedInKmh(): Float {
        return speed?.times(3.6f) ?: speedKmh ?: 0f
    }

    /**
     * Verifica si está en movimiento basado en velocidad
     */
    fun isInMotion(): Boolean {
        return getSpeedInKmh() > MOVING_THRESHOLD_KMH
    }
}