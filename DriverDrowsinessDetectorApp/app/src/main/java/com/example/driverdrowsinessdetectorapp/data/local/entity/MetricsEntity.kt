package com.example.driverdrowsinessdetectorapp.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entidad para almacenar métricas de detección en tiempo real.
 * 
 * Almacena snapshots de las métricas de MediaPipe durante el monitoreo.
 * Útil para análisis posterior y debugging.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Entity(
    tableName = "metrics",
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
data class MetricsEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "session_id")
    val sessionId: Long,

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    // MÉTRICAS DE OJOS (EAR - Eye Aspect Ratio)
    
    /** EAR del ojo izquierdo (0.0 - 1.0) */
    @ColumnInfo(name = "ear_left")
    val earLeft: Float? = null,

    /** EAR del ojo derecho (0.0 - 1.0) */
    @ColumnInfo(name = "ear_right")
    val earRight: Float? = null,

    /** EAR promedio de ambos ojos */
    @ColumnInfo(name = "ear_average")
    val earAverage: Float? = null,

    /** Indica si los ojos están cerrados en este frame */
    @ColumnInfo(name = "eyes_closed")
    val eyesClosed: Boolean = false,

    /** Duración acumulada con ojos cerrados (ms) */
    @ColumnInfo(name = "eyes_closed_duration_ms")
    val eyesClosedDurationMs: Long? = null,

    // MÉTRICAS DE BOCA (MAR - Mouth Aspect Ratio)
    
    /** MAR - Relación de aspecto de la boca (0.0 - 1.0) */
    @ColumnInfo(name = "mar")
    val mar: Float? = null,

    /** Indica si la boca está abierta (posible bostezo) */
    @ColumnInfo(name = "mouth_open")
    val mouthOpen: Boolean = false,

    /** Duración acumulada con boca abierta (ms) */
    @ColumnInfo(name = "mouth_open_duration_ms")
    val mouthOpenDurationMs: Long? = null,

    // MÉTRICAS DE CABEZA (Head Pose)
    
    /** Ángulo de inclinación vertical (pitch) en grados */
    @ColumnInfo(name = "head_pitch")
    val headPitch: Float? = null,

    /** Ángulo de rotación horizontal (yaw) en grados */
    @ColumnInfo(name = "head_yaw")
    val headYaw: Float? = null,

    /** Ángulo de inclinación lateral (roll) en grados */
    @ColumnInfo(name = "head_roll")
    val headRoll: Float? = null,

    /** Indica si se detectó cabeceo */
    @ColumnInfo(name = "nodding_detected")
    val noddingDetected: Boolean = false,

    // CONTADORES DE EVENTOS
    
    /** Número de parpadeos en ventana de tiempo */
    @ColumnInfo(name = "blink_count")
    val blinkCount: Int = 0,

    /** Número de bostezos en ventana de tiempo */
    @ColumnInfo(name = "yawn_count")
    val yawnCount: Int = 0,

    /** Número de cabeceos en ventana de tiempo */
    @ColumnInfo(name = "nodding_count")
    val noddingCount: Int = 0,

    /** Número de frotamientos de ojos en ventana de tiempo */
    @ColumnInfo(name = "eye_rub_count")
    val eyeRubCount: Int = 0,

    // DETECCIÓN DE MANOS
    
    /** Indica si se detectó mano cerca de los ojos */
    @ColumnInfo(name = "hand_near_eyes")
    val handNearEyes: Boolean = false,

    // ESTADO GENERAL
    
    /** Nivel de alerta calculado (NORMAL, MEDIUM, HIGH, CRITICAL) */
    @ColumnInfo(name = "alert_level")
    val alertLevel: String = "NORMAL",

    /** Indica si se detectó rostro en este frame */
    @ColumnInfo(name = "face_detected")
    val faceDetected: Boolean = true,

    /** Confianza de la detección facial (0.0 - 1.0) */
    @ColumnInfo(name = "face_confidence")
    val faceConfidence: Float? = null
) {
    companion object {
        // Constantes para niveles de alerta
        const val ALERT_NORMAL = "NORMAL"
        const val ALERT_MEDIUM = "MEDIUM"
        const val ALERT_HIGH = "HIGH"
        const val ALERT_CRITICAL = "CRITICAL"
    }
}