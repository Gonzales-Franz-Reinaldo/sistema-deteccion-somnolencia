package com.example.driverdrowsinessdetectorapp.data.repository

import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.local.dao.EventoSomnolenciaDao
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementación del Repository para Eventos de Somnolencia.
 * 
 * Actúa como capa de abstracción entre el DAO y los UseCases.
 * Maneja la lógica de persistencia y recuperación de eventos.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class EventoSomnolenciaRepositoryImpl @Inject constructor(
    private val eventoSomnolenciaDao: EventoSomnolenciaDao
) : EventoSomnolenciaRepository {
    
    companion object {
        private const val TAG = "EventoSomnolenciaRepo"
        private const val MAX_SYNC_ATTEMPTS = 5
    }
    
    // OPERACIONES DE ESCRITURA
    
    override suspend fun saveEvento(evento: EventoSomnolenciaEntity): Long {
        return try {
            // Validar evento antes de guardar
            require(evento.validar()) { "Evento inválido: $evento" }
            
            val id = eventoSomnolenciaDao.insert(evento)
            Log.d(TAG, "✅ Evento guardado: ID=$id, Tipo=${evento.tipoEvento}, " +
                      "Severidad=${evento.nivelSeveridad}")
            id
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error guardando evento: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun saveEventos(eventos: List<EventoSomnolenciaEntity>): List<Long> {
        return try {
            // Validar todos los eventos
            eventos.forEach { evento ->
                require(evento.validar()) { "Evento inválido: $evento" }
            }
            
            val ids = eventoSomnolenciaDao.insertAll(eventos)
            Log.d(TAG, "✅ ${eventos.size} eventos guardados")
            ids
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error guardando eventos en batch: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun updateEvento(evento: EventoSomnolenciaEntity) {
        try {
            eventoSomnolenciaDao.update(evento)
            Log.d(TAG, "✅ Evento actualizado: ID=${evento.id}")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error actualizando evento: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun markAsSynced(id: Long, idServidor: Int) {
        try {
            eventoSomnolenciaDao.markAsSynced(
                id = id,
                idServidor = idServidor,
                timestampSync = System.currentTimeMillis()
            )
            Log.d(TAG, "✅ Evento marcado como sincronizado: ID=$id, ServerID=$idServidor")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error marcando evento como sincronizado: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun markSyncFailed(id: Long, error: String) {
        try {
            eventoSomnolenciaDao.markSyncFailed(
                id = id,
                error = error,
                timestamp = System.currentTimeMillis()
            )
            Log.w(TAG, "⚠️ Evento marcado con error de sync: ID=$id, Error=$error")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error marcando fallo de sync: ${e.message}", e)
            throw e
        }
    }
    
    // OPERACIONES DE LECTURA
    
    override suspend fun getEventoById(id: Long): EventoSomnolenciaEntity? {
        return eventoSomnolenciaDao.getById(id)
    }
    
    override suspend fun getEventoByUuid(uuid: String): EventoSomnolenciaEntity? {
        return eventoSomnolenciaDao.getByUuid(uuid)
    }
    
    override suspend fun getEventosBySession(sessionId: Long): List<EventoSomnolenciaEntity> {
        return eventoSomnolenciaDao.getBySessionId(sessionId)
    }
    
    override fun observeEventosBySession(sessionId: Long): Flow<List<EventoSomnolenciaEntity>> {
        return eventoSomnolenciaDao.getBySessionIdFlow(sessionId)
    }
    
    override suspend fun getEventosByChofer(idChofer: Int, limit: Int): List<EventoSomnolenciaEntity> {
        return eventoSomnolenciaDao.getByChoferId(idChofer, limit)
    }
    
    override suspend fun getEventosByTipo(tipoEvento: String, limit: Int): List<EventoSomnolenciaEntity> {
        return eventoSomnolenciaDao.getByTipo(tipoEvento, limit)
    }
    
    override suspend fun getCriticalEvents(limit: Int): List<EventoSomnolenciaEntity> {
        return eventoSomnolenciaDao.getCriticalEvents(limit)
    }
    
    override suspend fun getLastEvento(): EventoSomnolenciaEntity? {
        return eventoSomnolenciaDao.getLastEvent()
    }
    
    // OPERACIONES DE SINCRONIZACIÓN
    
    override suspend fun getPendingSync(limit: Int): List<EventoSomnolenciaEntity> {
        return eventoSomnolenciaDao.getPendingSync(limit, MAX_SYNC_ATTEMPTS)
    }
    
    override fun observePendingSync(): Flow<List<EventoSomnolenciaEntity>> {
        return eventoSomnolenciaDao.getPendingSyncFlow(MAX_SYNC_ATTEMPTS)
    }
    
    override suspend fun countPendingSync(): Int {
        return eventoSomnolenciaDao.countPendingSync(MAX_SYNC_ATTEMPTS)
    }
    
    override fun observePendingSyncCount(): Flow<Int> {
        return eventoSomnolenciaDao.countPendingSyncFlow(MAX_SYNC_ATTEMPTS)
    }
    
    override suspend fun hasPendingSync(): Boolean {
        return eventoSomnolenciaDao.hasPendingSync(MAX_SYNC_ATTEMPTS)
    }
    
    // OPERACIONES DE ELIMINACIÓN
    
    override suspend fun deleteEvento(id: Long) {
        try {
            eventoSomnolenciaDao.deleteById(id)
            Log.d(TAG, "✅ Evento eliminado: ID=$id")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error eliminando evento: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun deleteEventosBySession(sessionId: Long) {
        try {
            eventoSomnolenciaDao.deleteBySessionId(sessionId)
            Log.d(TAG, "✅ Eventos de sesión eliminados: SessionID=$sessionId")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error eliminando eventos de sesión: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun deleteSyncedOlderThan(timestamp: Long): Int {
        return try {
            val count = eventoSomnolenciaDao.deleteSyncedOlderThan(timestamp)
            Log.d(TAG, "✅ $count eventos antiguos sincronizados eliminados")
            count
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error eliminando eventos antiguos: ${e.message}", e)
            throw e
        }
    }
    
    override suspend fun deleteAllEventos() {
        try {
            eventoSomnolenciaDao.deleteAll()
            Log.d(TAG, "✅ Todos los eventos eliminados")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error eliminando todos los eventos: ${e.message}", e)
            throw e
        }
    }
    
    // ESTADÍSTICAS
    
    override suspend fun countAll(): Int {
        return eventoSomnolenciaDao.count()
    }
    
    override suspend fun countBySession(sessionId: Long): Int {
        return eventoSomnolenciaDao.countBySessionId(sessionId)
    }
}