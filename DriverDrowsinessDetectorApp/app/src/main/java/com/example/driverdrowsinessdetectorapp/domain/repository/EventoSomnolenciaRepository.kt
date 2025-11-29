package com.example.driverdrowsinessdetectorapp.domain.repository

import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import kotlinx.coroutines.flow.Flow

/**
 * Repository Interface para Eventos de Somnolencia.
 * 
 * Define las operaciones disponibles para gestionar eventos de somnolencia
 * en la base de datos local (Room).
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
interface EventoSomnolenciaRepository {
    
    // OPERACIONES DE ESCRITURA
    
    /**
     * Guarda un nuevo evento de somnolencia.
     * 
     * @param evento Entidad del evento a guardar
     * @return ID del evento guardado
     */
    suspend fun saveEvento(evento: EventoSomnolenciaEntity): Long
    
    /**
     * Guarda múltiples eventos en una transacción.
     * 
     * @param eventos Lista de eventos a guardar
     * @return Lista de IDs de eventos guardados
     */
    suspend fun saveEventos(eventos: List<EventoSomnolenciaEntity>): List<Long>
    
    /**
     * Actualiza un evento existente.
     * 
     * @param evento Entidad del evento actualizado
     */
    suspend fun updateEvento(evento: EventoSomnolenciaEntity)
    
    /**
     * Marca un evento como sincronizado.
     * 
     * @param id ID local del evento
     * @param idServidor ID asignado por el servidor
     */
    suspend fun markAsSynced(id: Long, idServidor: Int)
    
    /**
     * Marca un evento con error de sincronización.
     * 
     * @param id ID local del evento
     * @param error Mensaje de error
     */
    suspend fun markSyncFailed(id: Long, error: String)
    
    // OPERACIONES DE LECTURA
    
    /**
     * Obtiene un evento por su ID local.
     */
    suspend fun getEventoById(id: Long): EventoSomnolenciaEntity?
    
    /**
     * Obtiene un evento por su UUID.
     */
    suspend fun getEventoByUuid(uuid: String): EventoSomnolenciaEntity?
    
    /**
     * Obtiene todos los eventos de una sesión.
     */
    suspend fun getEventosBySession(sessionId: Long): List<EventoSomnolenciaEntity>
    
    /**
     * Observa eventos de una sesión como Flow.
     */
    fun observeEventosBySession(sessionId: Long): Flow<List<EventoSomnolenciaEntity>>
    
    /**
     * Obtiene eventos de un chofer.
     */
    suspend fun getEventosByChofer(idChofer: Int, limit: Int = 100): List<EventoSomnolenciaEntity>
    
    /**
     * Obtiene eventos por tipo.
     */
    suspend fun getEventosByTipo(tipoEvento: String, limit: Int = 100): List<EventoSomnolenciaEntity>
    
    /**
     * Obtiene eventos críticos recientes.
     */
    suspend fun getCriticalEvents(limit: Int = 50): List<EventoSomnolenciaEntity>
    
    /**
     * Obtiene el último evento registrado.
     */
    suspend fun getLastEvento(): EventoSomnolenciaEntity?
    
    // OPERACIONES DE SINCRONIZACIÓN
    
    /**
     * Obtiene eventos pendientes de sincronización.
     * 
     * @param limit Número máximo de eventos a retornar
     * @return Lista de eventos no sincronizados
     */
    suspend fun getPendingSync(limit: Int = 50): List<EventoSomnolenciaEntity>
    
    /**
     * Observa eventos pendientes de sincronización.
     */
    fun observePendingSync(): Flow<List<EventoSomnolenciaEntity>>
    
    /**
     * Cuenta eventos pendientes de sincronización.
     */
    suspend fun countPendingSync(): Int
    
    /**
     * Observa el conteo de eventos pendientes.
     */
    fun observePendingSyncCount(): Flow<Int>
    
    /**
     * Verifica si hay eventos pendientes.
     */
    suspend fun hasPendingSync(): Boolean
    
    // OPERACIONES DE ELIMINACIÓN
    
    /**
     * Elimina un evento por ID.
     */
    suspend fun deleteEvento(id: Long)
    
    /**
     * Elimina eventos de una sesión.
     */
    suspend fun deleteEventosBySession(sessionId: Long)
    
    /**
     * Elimina eventos sincronizados anteriores a una fecha.
     * 
     * @param timestamp Timestamp límite
     * @return Número de eventos eliminados
     */
    suspend fun deleteSyncedOlderThan(timestamp: Long): Int
    
    /**
     * Elimina todos los eventos.
     */
    suspend fun deleteAllEventos()
    
    // ESTADÍSTICAS
    
    /**
     * Cuenta total de eventos.
     */
    suspend fun countAll(): Int
    
    /**
     * Cuenta eventos por sesión.
     */
    suspend fun countBySession(sessionId: Long): Int
}