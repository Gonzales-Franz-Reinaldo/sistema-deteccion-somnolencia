package com.example.driverdrowsinessdetectorapp.domain.usecase.sync

import android.content.Context
import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.example.driverdrowsinessdetectorapp.data.remote.api.EventosApi
import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.EventoRequest
import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.EventosBatchRequest
import com.example.driverdrowsinessdetectorapp.data.sync.SyncResult
import com.example.driverdrowsinessdetectorapp.data.sync.SyncStats
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.util.NetworkUtil
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Caso de Uso: Sincronizar Eventos de Somnolencia con el Servidor.
 * 
 * Responsabilidades:
 * - Obtener eventos pendientes de Room
 * - Enviar en batches al servidor
 * - Actualizar estado de sincronización en Room
 * - Manejar errores y reintentos
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class SyncEventosUseCase @Inject constructor(
    @ApplicationContext private val context: Context,
    private val eventoRepository: EventoSomnolenciaRepository,
    private val eventosApi: EventosApi
) {
    companion object {
        private const val TAG = "SyncEventosUseCase"
        
        // Configuración de batches
        private const val BATCH_SIZE = 50  // Máximo eventos por request
        private const val MAX_RETRIES = 3  // Reintentos por batch
    }
    
    /**
     * Ejecuta la sincronización de eventos pendientes.
     * 
     * @return SyncResult con el resultado de la operación
     */
    suspend operator fun invoke(): SyncResult {
        Log.d(TAG, "Iniciando sincronización de eventos...")
        
        // 1. Verificar conexión a internet
        if (!NetworkUtil.isNetworkAvailable(context)) {
            Log.w(TAG, "Sin conexión a internet")
            return SyncResult.NoConnection
        }
        
        // 2. Obtener eventos pendientes
        val eventosPendientes = eventoRepository.getPendingSync(limit = BATCH_SIZE * 2)
        
        if (eventosPendientes.isEmpty()) {
            Log.d(TAG, "No hay eventos pendientes de sincronización")
            return SyncResult.NothingToSync
        }
        
        Log.d(TAG, "Eventos pendientes: ${eventosPendientes.size}")
        
        // 3. Procesar en batches
        var totalSincronizados = 0
        var totalFallidos = 0
        val errores = mutableListOf<String>()
        
        eventosPendientes.chunked(BATCH_SIZE).forEach { batch ->
            val result = syncBatch(batch)
            
            when (result) {
                is BatchResult.Success -> {
                    totalSincronizados += result.count
                    Log.d(TAG, "Batch sincronizado: ${result.count} eventos")
                }
                is BatchResult.PartialSuccess -> {
                    totalSincronizados += result.successCount
                    totalFallidos += result.failedCount
                    errores.addAll(result.errors)
                }
                is BatchResult.Failed -> {
                    totalFallidos += batch.size
                    errores.add(result.error)
                    Log.e(TAG, "Batch fallido: ${result.error}")
                }
            }
        }
        
        // 4. Retornar resultado
        return when {
            totalFallidos == 0 && totalSincronizados > 0 -> {
                Log.d(TAG, "Sincronización completada: $totalSincronizados eventos")
                SyncResult.Success(
                    eventosSincronizados = totalSincronizados,
                    descripcion = "Sincronizados $totalSincronizados eventos exitosamente"
                )
            }
            totalSincronizados > 0 && totalFallidos > 0 -> {
                Log.w(TAG, "Sincronización parcial: $totalSincronizados OK, $totalFallidos fallidos")
                SyncResult.PartialSuccess(
                    eventosSincronizados = totalSincronizados,
                    eventosFallidos = totalFallidos,
                    errores = errores
                )
            }
            else -> {
                Log.e(TAG, "Sincronización fallida")
                SyncResult.Error(
                    descripcion = errores.firstOrNull() ?: "Error desconocido",
                    exception = null
                )
            }
        }
    }
    
    /**
     * Sincroniza un batch de eventos.
     */
    private suspend fun syncBatch(eventos: List<EventoSomnolenciaEntity>): BatchResult {
        var retries = 0
        
        while (retries < MAX_RETRIES) {
            try {
                // Convertir a DTOs
                val eventosRequest = eventos.map { EventoRequest.fromEntity(it) }
                val batchRequest = EventosBatchRequest(eventosRequest)
                
                Log.d(TAG, "Enviando batch: ${eventos.size} eventos (intento ${retries + 1})")
                
                // Enviar al servidor
                val response = eventosApi.crearEventosBatch(batchRequest)
                
                if (response.isSuccessful) {
                    val eventosResponse = response.body() ?: emptyList()
                    
                    Log.d(TAG, "Servidor respondió con ${eventosResponse.size} eventos")
                    
                    // Marcar como sincronizados en Room
                    var successCount = 0
                    eventos.forEachIndexed { index, evento ->
                        try {
                            val serverEvento = eventosResponse.getOrNull(index)
                            if (serverEvento != null) {
                                eventoRepository.markAsSynced(
                                    id = evento.id,
                                    idServidor = serverEvento.idEvento
                                )
                                successCount++
                                Log.d(TAG, "Evento ${evento.id} marcado como sincronizado → Server ID: ${serverEvento.idEvento}")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error marcando evento ${evento.id}: ${e.message}")
                        }
                    }
                    
                    return if (successCount == eventos.size) {
                        BatchResult.Success(successCount)
                    } else {
                        BatchResult.PartialSuccess(
                            successCount = successCount,
                            failedCount = eventos.size - successCount,
                            errors = listOf("Algunos eventos no se pudieron marcar como sincronizados")
                        )
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Error desconocido"
                    Log.e(TAG, "Error del servidor: ${response.code()} - $errorBody")
                    
                    // Si es error 4xx (cliente), no reintentar
                    if (response.code() in 400..499) {
                        // Marcar error en eventos
                        eventos.forEach { evento ->
                            try {
                                eventoRepository.markSyncFailed(evento.id, "HTTP ${response.code()}: $errorBody")
                            } catch (e: Exception) {
                                Log.e(TAG, "Error marcando fallo: ${e.message}")
                            }
                        }
                        return BatchResult.Failed("Error del servidor: ${response.code()}")
                    }
                    
                    // Si es error 5xx, reintentar
                    retries++
                    if (retries < MAX_RETRIES) {
                        Log.d(TAG, "Reintentando en 1 segundo...")
                        kotlinx.coroutines.delay(1000L * retries)
                    }
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Excepción en batch: ${e.message}", e)
                retries++
                
                if (retries >= MAX_RETRIES) {
                    // Marcar error en eventos
                    eventos.forEach { evento ->
                        try {
                            eventoRepository.markSyncFailed(evento.id, e.message ?: "Error de red")
                        } catch (ex: Exception) {
                            Log.e(TAG, "Error marcando fallo: ${ex.message}")
                        }
                    }
                    return BatchResult.Failed(e.message ?: "Error de conexión")
                }
                
                // Esperar antes de reintentar
                kotlinx.coroutines.delay(1000L * retries)
            }
        }
        
        return BatchResult.Failed("Máximo de reintentos alcanzado")
    }
    
    /**
     * Obtiene estadísticas de sincronización.
     */
    suspend fun getStats(): SyncStats {
        val pendientes = eventoRepository.countPendingSync()
        return SyncStats(
            eventosPendientes = pendientes,
            ultimaSync = System.currentTimeMillis()
        )
    }
    
    /**
     * Verifica si hay eventos pendientes de sincronización.
     */
    suspend fun hasPendingEvents(): Boolean {
        return eventoRepository.hasPendingSync()
    }
    
    /**
     * Resultado interno de sincronización de batch.
     */
    private sealed class BatchResult {
        data class Success(val count: Int) : BatchResult()
        data class PartialSuccess(
            val successCount: Int,
            val failedCount: Int,
            val errors: List<String>
        ) : BatchResult()
        data class Failed(val error: String) : BatchResult()
    }
}