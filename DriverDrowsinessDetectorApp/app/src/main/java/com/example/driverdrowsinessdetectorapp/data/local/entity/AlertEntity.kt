package com.example.driverdrowsinessdetectorapp.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad para almacenar alertas de somnolencia generadas.
 * 
 * Registra cada alerta emitida durante el monitoreo,
 * incluyendo el tipo, nivel de severidad y contexto.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Entity(
    tableName = "alerts",
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
        Index(value = ["alert_type"]),
        Index(value = ["severity_level"]),
        Index(value = ["synced"]),
        Index(value = ["session_id", "timestamp"])
    ]
)
data class AlertEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    /** ID de la sesión a la que pertenece la alerta */
    @ColumnInfo(name = "session_id")
    val sessionId: Long,

    /** UUID único para sincronización */
    @ColumnInfo(name = "uuid")
    val uuid: String = java.util.UUID.randomUUID().toString(),

    /** Timestamp cuando se generó la alerta */
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    // TIPO Y SEVERIDAD
    
    /** Tipo de alerta (microsueño, bostezo, cabeceo, etc.) */
    @ColumnInfo(name = "alert_type")
    val alertType: String,

    /** Nivel de severidad (NORMAL, MEDIUM, HIGH, CRITICAL) */
    @ColumnInfo(name = "severity_level")
    val severityLevel: String,

    /** Mensaje descriptivo de la alerta */
    @ColumnInfo(name = "message")
    val message: String? = null,

    // MÉTRICAS AL MOMENTO DE LA ALERTA
    
    /** Duración del evento que causó la alerta (segundos) */
    @ColumnInfo(name = "duration_seconds")
    val durationSeconds: Float? = null,

    /** Cantidad de eventos acumulados (para alertas por ventana) */
    @ColumnInfo(name = "event_count")
    val eventCount: Int? = null,

    /** EAR al momento de la alerta */
    @ColumnInfo(name = "ear_value")
    val earValue: Float? = null,

    /** MAR al momento de la alerta */
    @ColumnInfo(name = "mar_value")
    val marValue: Float? = null,

    /** Ángulo de cabeza al momento de la alerta */
    @ColumnInfo(name = "head_angle")
    val headAngle: Float? = null,

    // UBICACIÓN
    
    /** Latitud donde ocurrió la alerta */
    @ColumnInfo(name = "latitude")
    val latitude: Double? = null,

    /** Longitud donde ocurrió la alerta */
    @ColumnInfo(name = "longitude")
    val longitude: Double? = null,

    /** Velocidad del vehículo (km/h) al momento de la alerta */
    @ColumnInfo(name = "speed_kmh")
    val speedKmh: Float? = null,

    // RESPUESTA DEL USUARIO
    
    /** Indica si el usuario reconoció/descartó la alerta */
    @ColumnInfo(name = "acknowledged")
    val acknowledged: Boolean = false,

    /** Timestamp cuando el usuario reconoció la alerta */
    @ColumnInfo(name = "acknowledged_at")
    val acknowledgedAt: Long? = null,

    // SINCRONIZACIÓN
    
    /** Indica si ha sido sincronizada con el servidor */
    @ColumnInfo(name = "synced")
    val synced: Boolean = false,

    /** Timestamp de sincronización */
    @ColumnInfo(name = "sync_timestamp")
    val syncTimestamp: Long? = null,

    /** Número de intentos de sincronización */
    @ColumnInfo(name = "sync_attempts")
    val syncAttempts: Int = 0
) {
    companion object {
        // Tipos de alerta (coinciden con backend)
        const val TYPE_MICROSLEEP = "microsueno"
        const val TYPE_YAWN = "bostezo"
        const val TYPE_NODDING = "cabeceo"
        const val TYPE_BLINK = "parpadeo_ojos"
        const val TYPE_EYE_RUB = "frotamiento_ojos"

        // Niveles de severidad (coinciden con backend)
        const val SEVERITY_NORMAL = "NORMAL"
        const val SEVERITY_MEDIUM = "MEDIUM"
        const val SEVERITY_HIGH = "HIGH"
        const val SEVERITY_CRITICAL = "CRITICAL"
    }

    /**
     * Verifica si es una alerta crítica
     */
    fun isCritical(): Boolean = severityLevel == SEVERITY_CRITICAL

    /**
     * Verifica si requiere sincronización
     */
    fun needsSync(): Boolean = !synced
}