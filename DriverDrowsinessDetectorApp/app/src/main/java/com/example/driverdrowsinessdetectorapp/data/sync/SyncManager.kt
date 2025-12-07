package com.example.driverdrowsinessdetectorapp.data.sync

import android.content.Context
import android.util.Log
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Gestor de Sincronización con WorkManager.
 * 
 * Responsabilidades:
 * - Programar sincronización periódica
 * - Ejecutar sincronización inmediata
 * - Monitorear estado de sincronización
 * - Cancelar trabajos pendientes
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class SyncManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "SyncManager"
        
        // Nombres de trabajos
        const val PERIODIC_SYNC_WORK = "periodic_sync_eventos"
        const val IMMEDIATE_SYNC_WORK = "immediate_sync_eventos"
        
        // Configuración
        private const val SYNC_INTERVAL_MINUTES = 15L  // Cada 15 minutos
        private const val SYNC_FLEX_MINUTES = 5L       // Flexibilidad de 5 minutos
        private const val INITIAL_DELAY_SECONDS = 30L  // Delay inicial
    }
    
    private val workManager = WorkManager.getInstance(context)
    
    /**
     * Constraints para sincronización.
     * Requiere conexión a internet.
     */
    private val syncConstraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(false)  // Permitir con batería baja
        .build()
    
    /**
     * Inicia la sincronización periódica.
     * Se ejecuta cada 15 minutos cuando hay conexión.
     */
    fun startPeriodicSync() {
        Log.d(TAG, "Iniciando sincronización periódica cada $SYNC_INTERVAL_MINUTES minutos")
        
        val periodicSyncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            SYNC_INTERVAL_MINUTES, TimeUnit.MINUTES,
            SYNC_FLEX_MINUTES, TimeUnit.MINUTES
        )
            .setConstraints(syncConstraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                1, TimeUnit.MINUTES
            )
            .addTag("sync")
            .addTag("eventos")
            .build()
        
        workManager.enqueueUniquePeriodicWork(
            PERIODIC_SYNC_WORK,
            ExistingPeriodicWorkPolicy.KEEP,  
            periodicSyncRequest
        )
        
        Log.d(TAG, "Sincronización periódica programada")
    }
    
    /**
     * Ejecuta sincronización inmediata.
     * Útil cuando se detecta conexión o al iniciar sesión.
     */
    fun syncNow() {
        Log.d(TAG, "⚡ Ejecutando sincronización inmediata")
        
        val immediateSyncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(syncConstraints)
            .setBackoffCriteria(
                BackoffPolicy.LINEAR,
                30, TimeUnit.SECONDS
            )
            .addTag("sync")
            .addTag("immediate")
            .build()
        
        workManager.enqueueUniqueWork(
            IMMEDIATE_SYNC_WORK,
            ExistingWorkPolicy.REPLACE,  
            immediateSyncRequest
        )
    }
    
    /**
     * Programa sincronización con delay inicial.
     * Útil al iniciar la app.
     */
    fun scheduleSyncWithDelay() {
        Log.d(TAG, "Programando sincronización con delay de $INITIAL_DELAY_SECONDS segundos")
        
        val delayedSyncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(syncConstraints)
            .setInitialDelay(INITIAL_DELAY_SECONDS, TimeUnit.SECONDS)
            .addTag("sync")
            .addTag("delayed")
            .build()
        
        workManager.enqueueUniqueWork(
            "delayed_sync_eventos",
            ExistingWorkPolicy.KEEP,
            delayedSyncRequest
        )
    }
    
    /**
     * Detiene la sincronización periódica.
     */
    fun stopPeriodicSync() {
        Log.d(TAG, "Deteniendo sincronización periódica")
        workManager.cancelUniqueWork(PERIODIC_SYNC_WORK)
    }
    
    /**
     * Cancela todos los trabajos de sincronización.
     */
    fun cancelAllSync() {
        Log.d(TAG, "Cancelando todas las sincronizaciones")
        workManager.cancelAllWorkByTag("sync")
    }
    
    /**
     * Observa el estado del trabajo de sincronización periódica.
     */
    fun observePeriodicSyncState(): Flow<SyncState> {
        return workManager.getWorkInfosForUniqueWorkFlow(PERIODIC_SYNC_WORK)
            .map { workInfos ->
                val workInfo = workInfos.firstOrNull()
                when (workInfo?.state) {
                    WorkInfo.State.RUNNING -> SyncState.Syncing
                    WorkInfo.State.SUCCEEDED -> SyncState.Success
                    WorkInfo.State.FAILED -> SyncState.Failed
                    WorkInfo.State.ENQUEUED -> SyncState.Pending
                    WorkInfo.State.BLOCKED -> SyncState.Blocked
                    WorkInfo.State.CANCELLED -> SyncState.Cancelled
                    null -> SyncState.Idle
                }
            }
    }
    
    /**
     * Observa el estado del trabajo de sincronización inmediata.
     */
    fun observeImmediateSyncState(): Flow<SyncState> {
        return workManager.getWorkInfosForUniqueWorkFlow(IMMEDIATE_SYNC_WORK)
            .map { workInfos ->
                val workInfo = workInfos.firstOrNull()
                when (workInfo?.state) {
                    WorkInfo.State.RUNNING -> SyncState.Syncing
                    WorkInfo.State.SUCCEEDED -> SyncState.Success
                    WorkInfo.State.FAILED -> SyncState.Failed
                    WorkInfo.State.ENQUEUED -> SyncState.Pending
                    WorkInfo.State.BLOCKED -> SyncState.Blocked
                    WorkInfo.State.CANCELLED -> SyncState.Cancelled
                    null -> SyncState.Idle
                }
            }
    }
    
    /**
     * Verifica si hay sincronización en progreso.
     */
    suspend fun isSyncing(): Boolean {
        val workInfos = workManager.getWorkInfosByTag("sync").get()
        return workInfos.any { it.state == WorkInfo.State.RUNNING }
    }
    
    /**
     * Estados posibles de sincronización.
     */
    sealed class SyncState {
        data object Idle : SyncState()
        data object Pending : SyncState()
        data object Syncing : SyncState()
        data object Success : SyncState()
        data object Failed : SyncState()
        data object Blocked : SyncState()
        data object Cancelled : SyncState()
    }
}