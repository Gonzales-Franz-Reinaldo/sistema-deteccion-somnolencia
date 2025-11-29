package com.example.driverdrowsinessdetectorapp.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface EventoSomnolenciaDao {

    // INSERCIÓN

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(evento: EventoSomnolenciaEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(eventos: List<EventoSomnolenciaEntity>): List<Long>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIfNotExists(evento: EventoSomnolenciaEntity): Long

    // ACTUALIZACIÓN

    @Update
    suspend fun update(evento: EventoSomnolenciaEntity)

    @Query("""
        UPDATE eventos_somnolencia 
        SET sincronizado = 1, 
            id_servidor = :idServidor, 
            timestamp_sincronizado = :timestampSync,
            intentos_sync = intentos_sync + 1,
            ultimo_intento_sync = :timestampSync,
            ultimo_error_sync = NULL
        WHERE id = :id
    """)
    suspend fun markAsSynced(id: Long, idServidor: Int, timestampSync: Long = System.currentTimeMillis())

    @Query("""
        UPDATE eventos_somnolencia 
        SET intentos_sync = intentos_sync + 1,
            ultimo_error_sync = :error,
            ultimo_intento_sync = :timestamp
        WHERE id = :id
    """)
    suspend fun markSyncFailed(id: Long, error: String, timestamp: Long = System.currentTimeMillis())

    // ELIMINACIÓN

    @Delete
    suspend fun delete(evento: EventoSomnolenciaEntity)

    @Query("DELETE FROM eventos_somnolencia WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM eventos_somnolencia WHERE session_id = :sessionId")
    suspend fun deleteBySessionId(sessionId: Long)

    @Query("DELETE FROM eventos_somnolencia WHERE sincronizado = 1 AND timestamp_evento < :timestamp")
    suspend fun deleteSyncedOlderThan(timestamp: Long): Int

    @Query("DELETE FROM eventos_somnolencia")
    suspend fun deleteAll()

    // CONSULTAS BÁSICAS

    @Query("SELECT * FROM eventos_somnolencia WHERE id = :id")
    suspend fun getById(id: Long): EventoSomnolenciaEntity?

    @Query("SELECT * FROM eventos_somnolencia WHERE uuid = :uuid")
    suspend fun getByUuid(uuid: String): EventoSomnolenciaEntity?

    @Query("SELECT * FROM eventos_somnolencia ORDER BY timestamp_evento DESC")
    fun getAllFlow(): Flow<List<EventoSomnolenciaEntity>>

    @Query("SELECT * FROM eventos_somnolencia ORDER BY timestamp_evento DESC")
    suspend fun getAll(): List<EventoSomnolenciaEntity>

    @Query("SELECT COUNT(*) FROM eventos_somnolencia")
    suspend fun count(): Int

    // CONSULTAS PARA SINCRONIZACIÓN (LO MÁS IMPORTANTE)

    @Query("""
        SELECT * FROM eventos_somnolencia 
        WHERE sincronizado = 0 AND intentos_sync < :maxAttempts
        ORDER BY timestamp_evento ASC
        LIMIT :limit
    """)
    suspend fun getPendingSync(
        limit: Int = 50,
        maxAttempts: Int = 5
    ): List<EventoSomnolenciaEntity>

    @Query("""
        SELECT * FROM eventos_somnolencia 
        WHERE sincronizado = 0 AND intentos_sync < :maxAttempts
        ORDER BY timestamp_evento ASC
    """)
    fun getPendingSyncFlow(maxAttempts: Int = 5): Flow<List<EventoSomnolenciaEntity>>

    @Query("""
        SELECT COUNT(*) FROM eventos_somnolencia 
        WHERE sincronizado = 0 AND intentos_sync < :maxAttempts
    """)
    suspend fun countPendingSync(maxAttempts: Int = 5): Int

    @Query("""
        SELECT COUNT(*) FROM eventos_somnolencia 
        WHERE sincronizado = 0 AND intentos_sync < :maxAttempts
    """)
    fun countPendingSyncFlow(maxAttempts: Int = 5): Flow<Int>

    @Query("""
        SELECT EXISTS(
            SELECT 1 FROM eventos_somnolencia 
            WHERE sincronizado = 0 AND intentos_sync < :maxAttempts
            LIMIT 1
        )
    """)
    suspend fun hasPendingSync(maxAttempts: Int = 5): Boolean

    // CONSULTAS POR SESIÓN

    @Query("SELECT * FROM eventos_somnolencia WHERE session_id = :sessionId ORDER BY timestamp_evento DESC")
    fun getBySessionIdFlow(sessionId: Long): Flow<List<EventoSomnolenciaEntity>>

    @Query("SELECT * FROM eventos_somnolencia WHERE session_id = :sessionId ORDER BY timestamp_evento DESC")
    suspend fun getBySessionId(sessionId: Long): List<EventoSomnolenciaEntity>

    @Query("SELECT COUNT(*) FROM eventos_somnolencia WHERE session_id = :sessionId")
    suspend fun countBySessionId(sessionId: Long): Int

    // CONSULTAS POR CHOFER

    @Query("""
        SELECT * FROM eventos_somnolencia 
        WHERE id_chofer = :idChofer 
        ORDER BY timestamp_evento DESC
        LIMIT :limit
    """)
    suspend fun getByChoferId(idChofer: Int, limit: Int = 100): List<EventoSomnolenciaEntity>

    // CONSULTAS POR TIPO

    @Query("""
        SELECT * FROM eventos_somnolencia 
        WHERE tipo_evento = :tipoEvento 
        ORDER BY timestamp_evento DESC
        LIMIT :limit
    """)
    suspend fun getByTipo(tipoEvento: String, limit: Int = 100): List<EventoSomnolenciaEntity>

    @Query("""
        SELECT * FROM eventos_somnolencia 
        WHERE nivel_severidad IN ('CRITICAL', 'HIGH')
        ORDER BY timestamp_evento DESC
        LIMIT :limit
    """)
    suspend fun getCriticalEvents(limit: Int = 50): List<EventoSomnolenciaEntity>

    // ÚLTIMO EVENTO

    @Query("SELECT * FROM eventos_somnolencia ORDER BY timestamp_evento DESC LIMIT 1")
    suspend fun getLastEvent(): EventoSomnolenciaEntity?
}