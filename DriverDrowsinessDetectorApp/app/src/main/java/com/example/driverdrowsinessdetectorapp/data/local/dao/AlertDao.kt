package com.example.driverdrowsinessdetectorapp.data.local.dao

import androidx.room.*
import com.example.driverdrowsinessdetectorapp.data.local.entity.AlertEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AlertDao {

    /**
     * Inserta una nueva alerta.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(alert: AlertEntity): Long

    /**
     * Inserta múltiples alertas.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(alerts: List<AlertEntity>): List<Long>

    /**
     * Actualiza una alerta existente.
     */
    @Update
    suspend fun update(alert: AlertEntity)

    /**
     * Obtiene una alerta por ID.
     */
    @Query("SELECT * FROM alerts WHERE id = :id")
    suspend fun getById(id: Long): AlertEntity?

    /**
     * Obtiene todas las alertas de una sesión.
     */
    @Query("SELECT * FROM alerts WHERE session_id = :sessionId ORDER BY timestamp DESC")
    suspend fun getBySessionId(sessionId: Long): List<AlertEntity>

    /**
     * Observa alertas de una sesión como Flow.
     */
    @Query("SELECT * FROM alerts WHERE session_id = :sessionId ORDER BY timestamp DESC")
    fun observeBySessionId(sessionId: Long): Flow<List<AlertEntity>>

    /**
     * Obtiene alertas por tipo.
     */
    @Query("SELECT * FROM alerts WHERE alert_type = :alertType ORDER BY timestamp DESC")
    suspend fun getByType(alertType: String): List<AlertEntity>

    /**
     * Obtiene alertas por nivel.
     */
    @Query("SELECT * FROM alerts WHERE severity_level = :severityLevel ORDER BY timestamp DESC")
    suspend fun getByLevel(severityLevel: String): List<AlertEntity>

    /**
     * Obtiene alertas no reconocidas.
     */
    @Query("SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC")
    suspend fun getUnacknowledged(): List<AlertEntity>

    /**
     * Marca una alerta como reconocida.
     */
    @Query("UPDATE alerts SET acknowledged = 1 WHERE id = :id")
    suspend fun acknowledge(id: Long)

    /**
     * Marca todas las alertas de una sesión como reconocidas.
     */
    @Query("UPDATE alerts SET acknowledged = 1 WHERE session_id = :sessionId")
    suspend fun acknowledgeAllBySession(sessionId: Long)

    /**
     * Cuenta alertas de una sesión.
     */
    @Query("SELECT COUNT(*) FROM alerts WHERE session_id = :sessionId")
    suspend fun countBySession(sessionId: Long): Int

    /**
     * Cuenta alertas por tipo en una sesión.
     */
    @Query("SELECT COUNT(*) FROM alerts WHERE session_id = :sessionId AND alert_type = :alertType")
    suspend fun countByTypeInSession(sessionId: Long, alertType: String): Int

    /**
     * Obtiene las últimas N alertas.
     */
    @Query("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecent(limit: Int): List<AlertEntity>

    /**
     * Observa las últimas alertas como Flow.
     */
    @Query("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT :limit")
    fun observeRecent(limit: Int): Flow<List<AlertEntity>>

    /**
     * Elimina alertas anteriores a una fecha.
     */
    @Query("DELETE FROM alerts WHERE timestamp < :beforeTimestamp")
    suspend fun deleteOlderThan(beforeTimestamp: Long): Int

    /**
     * Elimina todas las alertas de una sesión.
     */
    @Query("DELETE FROM alerts WHERE session_id = :sessionId")
    suspend fun deleteBySession(sessionId: Long)

    /**
     * Elimina todas las alertas.
     */
    @Query("DELETE FROM alerts")
    suspend fun deleteAll()
}