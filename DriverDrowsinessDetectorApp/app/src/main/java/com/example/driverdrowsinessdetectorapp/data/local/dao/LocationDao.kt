package com.example.driverdrowsinessdetectorapp.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.driverdrowsinessdetectorapp.data.local.entity.LocationEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO para operaciones de ubicaciones GPS.
 */
@Dao
interface LocationDao {

    /**
     * Inserta una nueva ubicación.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(location: LocationEntity): Long

    /**
     * Inserta múltiples ubicaciones.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(locations: List<LocationEntity>): List<Long>

    /**
     * Obtiene una ubicación por ID.
     */
    @Query("SELECT * FROM locations WHERE id = :id")
    suspend fun getById(id: Long): LocationEntity?

    /**
     * Obtiene todas las ubicaciones de una sesión.
     */
    @Query("SELECT * FROM locations WHERE session_id = :sessionId ORDER BY timestamp ASC")
    suspend fun getBySessionId(sessionId: Long): List<LocationEntity>

    /**
     * Observa ubicaciones de una sesión como Flow.
     */
    @Query("SELECT * FROM locations WHERE session_id = :sessionId ORDER BY timestamp ASC")
    fun observeBySessionId(sessionId: Long): Flow<List<LocationEntity>>

    /**
     * Obtiene la última ubicación de una sesión.
     */
    @Query("SELECT * FROM locations WHERE session_id = :sessionId ORDER BY timestamp DESC LIMIT 1")
    suspend fun getLastBySessionId(sessionId: Long): LocationEntity?

    /**
     * Observa la última ubicación como Flow.
     */
    @Query("SELECT * FROM locations WHERE session_id = :sessionId ORDER BY timestamp DESC LIMIT 1")
    fun observeLastBySessionId(sessionId: Long): Flow<LocationEntity?>

    /**
     * Obtiene ubicaciones en un rango de tiempo.
     */
    @Query("""
        SELECT * FROM locations 
        WHERE session_id = :sessionId 
        AND timestamp BETWEEN :startTime AND :endTime 
        ORDER BY timestamp ASC
    """)
    suspend fun getByTimeRange(
        sessionId: Long,
        startTime: Long,
        endTime: Long
    ): List<LocationEntity>

    /**
     * Cuenta ubicaciones de una sesión.
     */
    @Query("SELECT COUNT(*) FROM locations WHERE session_id = :sessionId")
    suspend fun countBySession(sessionId: Long): Int

    /**
     * Obtiene la velocidad promedio de una sesión.
     */
    @Query("SELECT AVG(speed_kmh) FROM locations WHERE session_id = :sessionId AND speed_kmh IS NOT NULL")
    suspend fun getAverageSpeedKmh(sessionId: Long): Float?

    /**
     * Obtiene la velocidad máxima de una sesión.
     */
    @Query("SELECT MAX(speed_kmh) FROM locations WHERE session_id = :sessionId")
    suspend fun getMaxSpeedKmh(sessionId: Long): Int?

    /**
     * Elimina ubicaciones anteriores a una fecha.
     */
    @Query("DELETE FROM locations WHERE timestamp < :beforeTimestamp")
    suspend fun deleteOlderThan(beforeTimestamp: Long): Int

    /**
     * Elimina todas las ubicaciones de una sesión.
     */
    @Query("DELETE FROM locations WHERE session_id = :sessionId")
    suspend fun deleteBySession(sessionId: Long)

    /**
     * Elimina todas las ubicaciones.
     */
    @Query("DELETE FROM locations")
    suspend fun deleteAll()
}