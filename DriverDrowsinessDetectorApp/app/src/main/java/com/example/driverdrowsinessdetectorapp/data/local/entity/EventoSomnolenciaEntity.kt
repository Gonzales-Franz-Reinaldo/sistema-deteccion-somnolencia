package com.example.driverdrowsinessdetectorapp.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * Entidad Room para eventos de somnolencia detectados.
 * 
 * Esta entidad representa un evento de somnolencia que:
 * 1. Se guarda INMEDIATAMENTE cuando se detecta (offline-first)
 * 2. Se sincroniza con el servidor cuando hay conexión
 * 3. Mantiene estado de sincronización para retry logic
 * 
 * Tipos de eventos soportados:
 * - microsueno: Ojos cerrados >= 2 segundos
 * - cabeceo: Cabeza inclinada >= 3 segundos
 * - parpadeo_ojos: > 20 parpadeos en 60 segundos
 * - bostezo: > 3 bostezos en 180 segundos
 * - frotamiento_ojos: > 3 frotamientos en 300 segundos
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Entity(
    tableName = "eventos_somnolencia",
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
        Index(value = ["sincronizado"]),
        Index(value = ["tipo_evento"]),
        Index(value = ["timestamp_evento"]),
        Index(value = ["id_chofer"]),
        Index(value = ["uuid"], unique = true),
        Index(value = ["nivel_severidad"])
    ]
)
data class EventoSomnolenciaEntity(
    
    // IDENTIFICADORES
    
    /**
     * ID local auto-generado por Room.
     */
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    /**
     * UUID único para identificación global.
     * Permite evitar duplicados durante sincronización.
     */
    @ColumnInfo(name = "uuid")
    val uuid: String = UUID.randomUUID().toString(),
    
    /**
     * ID asignado por el servidor después de sincronización.
     * NULL si aún no se ha sincronizado.
     */
    @ColumnInfo(name = "id_servidor")
    val idServidor: Int? = null,
    
    // RELACIONES
    
    /**
     * ID del chofer que generó el evento.
     * Corresponde a Usuario.id_usuario en el backend.
     */
    @ColumnInfo(name = "id_chofer")
    val idChofer: Int,
    
    /**
     * ID del viaje activo (opcional).
     * Corresponde a Viaje.id_viaje en el backend.
     */
    @ColumnInfo(name = "id_viaje")
    val idViaje: Int? = null,
    
    /**
     * ID de la sesión local de monitoreo.
     * Foreign key a SessionEntity.
     */
    @ColumnInfo(name = "session_id")
    val sessionId: Long,
    
    // DATOS DEL EVENTO
    
    /**
     * Tipo de evento detectado.
     * Valores válidos: microsueno, cabeceo, parpadeo_ojos, bostezo, frotamiento_ojos
     */
    @ColumnInfo(name = "tipo_evento")
    val tipoEvento: String,
    
    /**
     * Duración del evento en segundos (para microsueño y cabeceo).
     */
    @ColumnInfo(name = "duracion_segundos")
    val duracionSegundos: Float? = null,
    
    /**
     * Cantidad de eventos en ventana temporal (para parpadeo, bostezo, frotamiento).
     */
    @ColumnInfo(name = "cantidad_eventos")
    val cantidadEventos: Int = 1,
    
    /**
     * Nivel de severidad de la alerta.
     * Valores: NORMAL, MEDIUM, HIGH, CRITICAL
     */
    @ColumnInfo(name = "nivel_severidad")
    val nivelSeveridad: String,
    
    // UBICACIÓN GPS
    
    /**
     * Latitud GPS donde ocurrió el evento.
     */
    @ColumnInfo(name = "latitud")
    val latitud: Double? = null,
    
    /**
     * Longitud GPS donde ocurrió el evento.
     */
    @ColumnInfo(name = "longitud")
    val longitud: Double? = null,
    
    /**
     * Velocidad del vehículo en km/h al momento del evento.
     */
    @ColumnInfo(name = "velocidad_kmh")
    val velocidadKmh: Int? = null,
    
    // TIMESTAMPS
    
    /**
     * Timestamp exacto cuando ocurrió el evento (epoch millis).
     */
    @ColumnInfo(name = "timestamp_evento")
    val timestampEvento: Long,
    
    /**
     * Timestamp cuando se creó el registro local.
     */
    @ColumnInfo(name = "timestamp_creacion")
    val timestampCreacion: Long = System.currentTimeMillis(),
    
    /**
     * Timestamp cuando se sincronizó con el servidor.
     * NULL si aún no se ha sincronizado.
     */
    @ColumnInfo(name = "timestamp_sincronizado")
    val timestampSincronizado: Long? = null,
    
    // METADATOS DEL DISPOSITIVO
    
    /**
     * ID único del dispositivo (Android ID o similar).
     */
    @ColumnInfo(name = "dispositivo_id")
    val dispositivoId: String? = null,
    
    /**
     * Versión de la aplicación.
     */
    @ColumnInfo(name = "version_app")
    val versionApp: String? = null,
    
    // ESTADO DE SINCRONIZACIÓN
    
    /**
     * Indica si el evento ya fue sincronizado con el servidor.
     */
    @ColumnInfo(name = "sincronizado")
    val sincronizado: Boolean = false,
    
    /**
     * Número de intentos de sincronización realizados.
     */
    @ColumnInfo(name = "intentos_sync")
    val intentosSync: Int = 0,
    
    /**
     * Timestamp del último intento de sincronización.
     */
    @ColumnInfo(name = "ultimo_intento_sync")
    val ultimoIntentoSync: Long? = null,
    
    /**
     * Mensaje del último error de sincronización.
     */
    @ColumnInfo(name = "ultimo_error_sync")
    val ultimoErrorSync: String? = null
    
) {
    
    companion object {
        // TIPOS DE EVENTO (deben coincidir con el backend)
        const val TIPO_MICROSUENO = "microsueno"
        const val TIPO_CABECEO = "cabeceo"
        const val TIPO_PARPADEO_OJOS = "parpadeo_ojos"
        const val TIPO_BOSTEZO = "bostezo"
        const val TIPO_FROTAMIENTO_OJOS = "frotamiento_ojos"
        
        // NIVELES DE SEVERIDAD
        const val SEVERIDAD_NORMAL = "NORMAL"
        const val SEVERIDAD_MEDIUM = "MEDIUM"
        const val SEVERIDAD_HIGH = "HIGH"
        const val SEVERIDAD_CRITICAL = "CRITICAL"
        
        // CONFIGURACIÓN DE SINCRONIZACIÓN
        const val MAX_INTENTOS_SYNC = 5
        const val MAX_EVENTOS_POR_BATCH = 50
        
        /**
         * Lista de tipos de evento válidos.
         */
        val TIPOS_VALIDOS = listOf(
            TIPO_MICROSUENO,
            TIPO_CABECEO,
            TIPO_PARPADEO_OJOS,
            TIPO_BOSTEZO,
            TIPO_FROTAMIENTO_OJOS
        )
        
        /**
         * Lista de niveles de severidad válidos.
         */
        val SEVERIDADES_VALIDAS = listOf(
            SEVERIDAD_NORMAL,
            SEVERIDAD_MEDIUM,
            SEVERIDAD_HIGH,
            SEVERIDAD_CRITICAL
        )
    }
    
    // PROPIEDADES COMPUTADAS
    
    /**
     * Verifica si el evento es crítico (requiere atención inmediata).
     */
    val esCritico: Boolean
        get() = nivelSeveridad == SEVERIDAD_CRITICAL || nivelSeveridad == SEVERIDAD_HIGH
    
    /**
     * Verifica si el evento puede ser reintentado para sincronización.
     */
    val puedeReintentar: Boolean
        get() = !sincronizado && intentosSync < MAX_INTENTOS_SYNC
    
    /**
     * Verifica si el evento tiene ubicación GPS válida.
     */
    val tieneUbicacion: Boolean
        get() = latitud != null && longitud != null
    
    /**
     * Obtiene una descripción legible del tipo de evento.
     */
    val tipoEventoDescripcion: String
        get() = when (tipoEvento) {
            TIPO_MICROSUENO -> "Microsueño"
            TIPO_CABECEO -> "Cabeceo"
            TIPO_PARPADEO_OJOS -> "Parpadeo excesivo"
            TIPO_BOSTEZO -> "Bostezo"
            TIPO_FROTAMIENTO_OJOS -> "Frotamiento de ojos"
            else -> tipoEvento
        }
    
    /**
     * Obtiene el emoji correspondiente al tipo de evento.
     */
    val tipoEventoEmoji: String
        get() = when (tipoEvento) {
            TIPO_MICROSUENO -> "😴"
            TIPO_CABECEO -> "🙇"
            TIPO_PARPADEO_OJOS -> "👁️"
            TIPO_BOSTEZO -> "🥱"
            TIPO_FROTAMIENTO_OJOS -> "🤦"
            else -> "⚠️"
        }
    
    // MÉTODOS DE UTILIDAD
    
    /**
     * Valida que los datos del evento sean correctos.
     */
    fun validar(): Boolean {
        return tipoEvento in TIPOS_VALIDOS &&
               nivelSeveridad in SEVERIDADES_VALIDAS &&
               idChofer > 0 &&
               sessionId > 0 &&
               timestampEvento > 0
    }
    
    /**
     * Crea una copia marcada como sincronizada.
     */
    fun marcarComoSincronizado(idServidorAsignado: Int): EventoSomnolenciaEntity {
        return copy(
            idServidor = idServidorAsignado,
            sincronizado = true,
            timestampSincronizado = System.currentTimeMillis(),
            intentosSync = intentosSync + 1,
            ultimoIntentoSync = System.currentTimeMillis(),
            ultimoErrorSync = null
        )
    }
    
    /**
     * Crea una copia con error de sincronización registrado.
     */
    fun marcarErrorSync(error: String): EventoSomnolenciaEntity {
        return copy(
            intentosSync = intentosSync + 1,
            ultimoIntentoSync = System.currentTimeMillis(),
            ultimoErrorSync = error
        )
    }
    
    override fun toString(): String {
        return "EventoSomnolencia(" +
               "id=$id, " +
               "tipo=$tipoEvento, " +
               "severidad=$nivelSeveridad, " +
               "sincronizado=$sincronizado, " +
               "intentos=$intentosSync)"
    }
}