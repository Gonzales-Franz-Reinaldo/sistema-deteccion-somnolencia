package com.example.driverdrowsinessdetectorapp.domain.session

import android.os.Build
import android.util.Log
import com.example.driverdrowsinessdetectorapp.BuildConfig
import com.example.driverdrowsinessdetectorapp.data.local.dao.SessionDao
import com.example.driverdrowsinessdetectorapp.data.local.entity.SessionEntity
import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Gestor de Sesiones de Monitoreo.
 * 
 * Responsabilidades:
 * - Crear nuevas sesiones de monitoreo
 * - Mantener referencia a la sesión activa
 * - Actualizar estadísticas de sesión
 * - Finalizar sesiones
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class SessionManager @Inject constructor(
    private val sessionDao: SessionDao,
    private val preferencesManager: PreferencesManager,
    private val locationService: LocationService
) {
    companion object {
        private const val TAG = "SessionManager"
    }
    
    // Sesión activa actual
    @Volatile
    private var currentSession: SessionEntity? = null
    
    /**
     * Obtiene la sesión activa actual.
     */
    fun getCurrentSession(): SessionEntity? = currentSession
    
    /**
     * Obtiene el ID de la sesión activa.
     */
    fun getCurrentSessionId(): Long? = currentSession?.id
    
    /**
     * Verifica si hay una sesión activa.
     */
    fun hasActiveSession(): Boolean = currentSession?.isActive() == true
    
    /**
     * Inicia una nueva sesión de monitoreo.
     * 
     * @param viajeId ID del viaje asociado (opcional)
     * @return SessionEntity creada
     */
    suspend fun startSession(viajeId: Int? = null): SessionEntity {
        // Obtener usuario actual
        val userId = preferencesManager.getUserId().first() ?: throw IllegalStateException("No hay usuario logueado")
        
        // Obtener ubicación inicial
        val location = try {
            locationService.getCurrentLocation()
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ No se pudo obtener ubicación inicial: ${e.message}")
            null
        }
        
        // Crear nueva sesión
        val session = SessionEntity(
            userId = userId,
            viajeId = viajeId,
            startTime = System.currentTimeMillis(),
            status = SessionEntity.STATUS_ACTIVE,
            startLatitude = location?.latitude,
            startLongitude = location?.longitude,
            deviceId = Build.ID,
            appVersion = BuildConfig.VERSION_NAME
        )
        
        // Guardar en Room
        val sessionId = sessionDao.insert(session)
        
        // Recuperar sesión con ID asignado
        val savedSession = sessionDao.getSessionById(sessionId)
            ?: throw IllegalStateException("Error al recuperar sesión guardada")
        
        currentSession = savedSession
        
        Log.d(TAG, "✅ Sesión iniciada: ID=$sessionId, Usuario=$userId, Viaje=$viajeId")
        
        return savedSession
    }
    
    /**
     * Actualiza las estadísticas de la sesión actual.
     */
    suspend fun updateSessionStats(
        microsleepCount: Int = 0,
        yawnCount: Int = 0,
        noddingCount: Int = 0,
        blinkCount: Int = 0,
        eyeRubCount: Int = 0,
        maxAlertLevel: String = "NORMAL"
    ) {
        val session = currentSession ?: return
        
        val updatedSession = session.copy(
            microsleepCount = session.microsleepCount + microsleepCount,
            yawnCount = session.yawnCount + yawnCount,
            noddingCount = session.noddingCount + noddingCount,
            blinkCount = session.blinkCount + blinkCount,
            eyeRubCount = session.eyeRubCount + eyeRubCount,
            totalAlerts = session.totalAlerts + 1,
            maxAlertLevel = if (isMoreSevere(maxAlertLevel, session.maxAlertLevel)) maxAlertLevel else session.maxAlertLevel
        )
        
        sessionDao.update(updatedSession)
        currentSession = updatedSession
    }
    
    /**
     * Pausa la sesión actual.
     */
    suspend fun pauseSession() {
        val session = currentSession ?: return
        
        val pausedSession = session.copy(status = SessionEntity.STATUS_PAUSED)
        sessionDao.update(pausedSession)
        currentSession = pausedSession
        
        Log.d(TAG, "⏸️ Sesión pausada: ID=${session.id}")
    }
    
    /**
     * Reanuda la sesión actual.
     */
    suspend fun resumeSession() {
        val session = currentSession ?: return
        
        val resumedSession = session.copy(status = SessionEntity.STATUS_ACTIVE)
        sessionDao.update(resumedSession)
        currentSession = resumedSession
        
        Log.d(TAG, "▶️ Sesión reanudada: ID=${session.id}")
    }
    
    /**
     * Finaliza la sesión actual.
     * 
     * @param status Estado final (COMPLETED, CANCELLED, ERROR)
     */
    suspend fun endSession(status: String = SessionEntity.STATUS_COMPLETED) {
        val session = currentSession ?: return
        
        val endTime = System.currentTimeMillis()
        val durationMs = endTime - session.startTime
        
        // Obtener ubicación final
        val location = try {
            locationService.getCurrentLocation()
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ No se pudo obtener ubicación final: ${e.message}")
            null
        }
        
        sessionDao.finishSession(
            sessionId = session.id,
            status = status,
            endTime = endTime,
            durationMs = durationMs
        )
        
        // Actualizar ubicación final si está disponible
        if (location != null) {
            val finalSession = session.copy(
                endLatitude = location.latitude,
                endLongitude = location.longitude,
                endTime = endTime,
                durationMs = durationMs,
                status = status
            )
            sessionDao.update(finalSession)
        }
        
        Log.d(TAG, "🏁 Sesión finalizada: ID=${session.id}, Duración=${durationMs}ms, Estado=$status")
        
        currentSession = null
    }
    
    /**
     * Compara severidad de alertas.
     */
    private fun isMoreSevere(new: String, current: String): Boolean {
        val levels = listOf("NORMAL", "MEDIUM", "HIGH", "CRITICAL")
        return levels.indexOf(new) > levels.indexOf(current)
    }
}