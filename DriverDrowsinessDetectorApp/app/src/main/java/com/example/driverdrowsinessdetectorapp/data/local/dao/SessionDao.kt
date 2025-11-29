package com.example.driverdrowsinessdetectorapp.data.local.dao

import androidx.room.*
import com.example.driverdrowsinessdetectorapp.data.local.entity.SessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(session: SessionEntity): Long
    
    @Update
    suspend fun update(session: SessionEntity)
    
    @Query("SELECT * FROM sessions WHERE id = :sessionId")
    suspend fun getSessionById(sessionId: Long): SessionEntity?
    
    @Query("SELECT * FROM sessions WHERE status = 'ACTIVE' LIMIT 1")
    suspend fun getActiveSession(): SessionEntity?
    
    // user_id en lugar de userId
    @Query("SELECT * FROM sessions WHERE user_id = :userId ORDER BY start_time DESC")
    fun getSessionsByUser(userId: Int): Flow<List<SessionEntity>>
    
    // start_time en lugar de startTime
    @Query("SELECT * FROM sessions ORDER BY start_time DESC LIMIT 10")
    fun getRecentSessions(): Flow<List<SessionEntity>>
    
    @Query("UPDATE sessions SET status = :status WHERE id = :sessionId")
    suspend fun updateSessionStatus(sessionId: Long, status: String)
    
    // end_time y duration_ms
    @Query("""
        UPDATE sessions 
        SET status = :status, 
            end_time = :endTime, 
            duration_ms = :durationMs 
        WHERE id = :sessionId
    """)
    suspend fun finishSession(sessionId: Long, status: String, endTime: Long, durationMs: Long)
    
    // Obtener sesión activa por usuario
    @Query("SELECT * FROM sessions WHERE user_id = :userId AND status = 'ACTIVE' LIMIT 1")
    suspend fun getActiveSessionByUser(userId: Int): SessionEntity?
    
    // Contar sesiones de un usuario
    @Query("SELECT COUNT(*) FROM sessions WHERE user_id = :userId")
    suspend fun countByUser(userId: Int): Int
    
    @Delete
    suspend fun delete(session: SessionEntity)
    
    @Query("DELETE FROM sessions WHERE id = :sessionId")
    suspend fun deleteById(sessionId: Long)
    
    @Query("DELETE FROM sessions")
    suspend fun deleteAll()
}