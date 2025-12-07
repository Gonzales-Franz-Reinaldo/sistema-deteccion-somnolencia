package com.example.driverdrowsinessdetectorapp.data.sync

import android.content.Context
import android.util.Log
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.driverdrowsinessdetectorapp.domain.usecase.sync.SyncEventosUseCase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

/**
 * Worker para sincronización de eventos con WorkManager.
 * 
 * Se ejecuta:
 * - Cada 15 minutos (periódico)
 * - Inmediatamente cuando se solicita
 * - Cuando hay conexión a internet disponible
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val syncEventosUseCase: SyncEventosUseCase
) : CoroutineWorker(context, workerParams) {
    
    companion object {
        private const val TAG = "SyncWorker"
    }
    
    override suspend fun doWork(): Result {
        val startTime = System.currentTimeMillis()
        Log.d(TAG, "INICIANDO SINCRONIZACIÓN")
        Log.d(TAG, "   Attempt: $runAttemptCount")
        
        return try {
            // Ejecutar sincronización
            val result = syncEventosUseCase()
            
            val duration = System.currentTimeMillis() - startTime
            
            when (result) {
                is SyncResult.Success -> {
                    Log.d(TAG, "SYNC EXITOSA")
                    Log.d(TAG, "   Eventos sincronizados: ${result.eventosSincronizados}")
                    Log.d(TAG, "   Mensaje: ${result.descripcion}")
                    Log.d(TAG, "   Duración: ${duration}ms")
                    Result.success()
                }
                
                is SyncResult.NothingToSync -> {
                    Log.d(TAG, "SIN EVENTOS PENDIENTES")
                    Log.d(TAG, "   Duración: ${duration}ms")
                    Result.success()
                }
                
                is SyncResult.PartialSuccess -> {
                    Log.w(TAG, "SYNC PARCIAL")
                    Log.w(TAG, "   Sincronizados: ${result.eventosSincronizados}")
                    Log.w(TAG, "   Fallidos: ${result.eventosFallidos}")
                    Log.w(TAG, "   Errores: ${result.errores.take(3)}")
                    // Reintentar para los fallidos
                    if (runAttemptCount < 3) Result.retry() else Result.success()
                }
                
                is SyncResult.NoConnection -> {
                    Log.w(TAG, "SIN CONEXIÓN - Reintentando después")
                    Result.retry()
                }
                
                is SyncResult.Error -> {
                    Log.e(TAG, "ERROR EN SYNC")
                    Log.e(TAG, "   Mensaje: ${result.descripcion}")
                    Log.e(TAG, "   Excepción: ${result.exception?.message}")
                    
                    // Reintentar hasta 3 veces
                    if (runAttemptCount < 3) {
                        Result.retry()
                    } else {
                        Result.failure()
                    }
                }
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "EXCEPCIÓN EN WORKER: ${e.message}", e)
            
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}