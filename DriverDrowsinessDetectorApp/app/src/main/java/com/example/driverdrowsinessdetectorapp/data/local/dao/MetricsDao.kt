package com.example.driverdrowsinessdetectorapp.data.local.dao

import androidx.room.*
import com.example.driverdrowsinessdetectorapp.data.local.entity.MetricsEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO: Operaciones CRUD para métricas
 */
@Dao
interface MetricsDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(metrics: MetricsEntity): Long
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(metrics: List<MetricsEntity>)
    
    //  session_id en lugar de sessionId
    @Query("SELECT * FROM metrics WHERE session_id = :sessionId ORDER BY timestamp DESC")
    fun getMetricsBySession(sessionId: Long): Flow<List<MetricsEntity>>
    
    //  session_id y alert_level
    @Query("SELECT * FROM metrics WHERE session_id = :sessionId AND alert_level IN ('HIGH', 'CRITICAL') ORDER BY timestamp DESC")
    fun getCriticalAlertsBySession(sessionId: Long): Flow<List<MetricsEntity>>
    
    @Query("SELECT * FROM metrics WHERE timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    fun getMetricsByTimeRange(startTime: Long, endTime: Long): Flow<List<MetricsEntity>>
    
    //  session_id
    @Query("DELETE FROM metrics WHERE session_id = :sessionId")
    suspend fun deleteBySession(sessionId: Long)
    
    @Query("DELETE FROM metrics WHERE timestamp < :timestamp")
    suspend fun deleteOlderThan(timestamp: Long)
    
    //  session_id y alert_level
    @Query("SELECT COUNT(*) FROM metrics WHERE session_id = :sessionId AND alert_level = 'CRITICAL'")
    suspend fun getCriticalAlertsCount(sessionId: Long): Int
    
    //  Obtener última métrica de una sesión
    @Query("SELECT * FROM metrics WHERE session_id = :sessionId ORDER BY timestamp DESC LIMIT 1")
    suspend fun getLastMetricBySession(sessionId: Long): MetricsEntity?
    
    //  Contar métricas por sesión
    @Query("SELECT COUNT(*) FROM metrics WHERE session_id = :sessionId")
    suspend fun countBySession(sessionId: Long): Int
    
    @Query("DELETE FROM metrics")
    suspend fun deleteAll()
}