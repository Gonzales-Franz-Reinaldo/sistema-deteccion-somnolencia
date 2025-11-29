package com.example.driverdrowsinessdetectorapp.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad que representa una sesión de monitoreo de somnolencia.
 * 
 * Una sesión comienza cuando el chofer inicia el monitoreo y termina
 * cuando lo detiene o cuando ocurre un evento que la finaliza.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Entity(
    tableName = "sessions",
    indices = [
        Index(value = ["user_id"]),
        Index(value = ["start_time"]),
        Index(value = ["status"]),
        Index(value = ["viaje_id"]),
        Index(value = ["user_id", "status"])
    ]
)
data class SessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    // IDENTIFICACIÓN
    
    /** ID del usuario/chofer que realiza la sesión */
    @ColumnInfo(name = "user_id")
    val userId: Int,

    /** ID del viaje asociado (opcional, puede ser null si no hay viaje activo) */
    @ColumnInfo(name = "viaje_id")
    val viajeId: Int? = null,

    /** UUID único para identificación en sincronización */
    @ColumnInfo(name = "uuid")
    val uuid: String = java.util.UUID.randomUUID().toString(),

    // TIEMPOS
    
    /** Timestamp de inicio de la sesión */
    @ColumnInfo(name = "start_time")
    val startTime: Long = System.currentTimeMillis(),

    /** Timestamp de fin de la sesión (null si está activa) */
    @ColumnInfo(name = "end_time")
    val endTime: Long? = null,

    /** Duración total en milisegundos */
    @ColumnInfo(name = "duration_ms")
    val durationMs: Long? = null,

    // ESTADO
    
    /** Estado actual de la sesión */
    @ColumnInfo(name = "status")
    val status: String = STATUS_ACTIVE,

    // ESTADÍSTICAS ACUMULADAS
    
    /** Total de alertas generadas en la sesión */
    @ColumnInfo(name = "total_alerts")
    val totalAlerts: Int = 0,

    /** Total de microsueños detectados */
    @ColumnInfo(name = "microsleep_count")
    val microsleepCount: Int = 0,

    /** Total de bostezos detectados */
    @ColumnInfo(name = "yawn_count")
    val yawnCount: Int = 0,

    /** Total de cabeceos detectados */
    @ColumnInfo(name = "nodding_count")
    val noddingCount: Int = 0,

    /** Total de parpadeos detectados */
    @ColumnInfo(name = "blink_count")
    val blinkCount: Int = 0,

    /** Total de frotamientos de ojos detectados */
    @ColumnInfo(name = "eye_rub_count")
    val eyeRubCount: Int = 0,

    /** Alerta más severa durante la sesión */
    @ColumnInfo(name = "max_alert_level")
    val maxAlertLevel: String = "NORMAL",

    // UBICACIÓN
    
    /** Latitud al inicio de la sesión */
    @ColumnInfo(name = "start_latitude")
    val startLatitude: Double? = null,

    /** Longitud al inicio de la sesión */
    @ColumnInfo(name = "start_longitude")
    val startLongitude: Double? = null,

    /** Latitud al final de la sesión */
    @ColumnInfo(name = "end_latitude")
    val endLatitude: Double? = null,

    /** Longitud al final de la sesión */
    @ColumnInfo(name = "end_longitude")
    val endLongitude: Double? = null,

    // METADATA DEL DISPOSITIVO
    
    /** ID único del dispositivo */
    @ColumnInfo(name = "device_id")
    val deviceId: String? = null,

    /** Versión de la aplicación */
    @ColumnInfo(name = "app_version")
    val appVersion: String? = null,

    // SINCRONIZACIÓN
    
    /** Indica si la sesión ha sido sincronizada con el servidor */
    @ColumnInfo(name = "synced")
    val synced: Boolean = false,

    /** Timestamp de última sincronización */
    @ColumnInfo(name = "sync_timestamp")
    val syncTimestamp: Long? = null,

    /** Número de intentos de sincronización fallidos */
    @ColumnInfo(name = "sync_attempts")
    val syncAttempts: Int = 0
) {
    companion object {
        // Estados de sesión
        const val STATUS_ACTIVE = "ACTIVE"
        const val STATUS_PAUSED = "PAUSED"
        const val STATUS_COMPLETED = "COMPLETED"
        const val STATUS_CANCELLED = "CANCELLED"
        const val STATUS_ERROR = "ERROR"
    }

    /**
     * Verifica si la sesión está activa
     */
    fun isActive(): Boolean = status == STATUS_ACTIVE

    /**
     * Verifica si la sesión está completada
     */
    fun isCompleted(): Boolean = status == STATUS_COMPLETED

    /**
     * Calcula la duración actual si la sesión está activa
     */
    fun getCurrentDuration(): Long {
        return if (endTime != null) {
            endTime - startTime
        } else {
            System.currentTimeMillis() - startTime
        }
    }
}