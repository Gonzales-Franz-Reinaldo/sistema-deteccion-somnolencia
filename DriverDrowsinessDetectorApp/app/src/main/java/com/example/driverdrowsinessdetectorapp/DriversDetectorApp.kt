package com.example.driverdrowsinessdetectorapp

import android.app.Application
import android.util.Log
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.example.driverdrowsinessdetectorapp.data.sync.ConnectivitySyncService
import com.example.driverdrowsinessdetectorapp.data.sync.SyncManager
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * Clase Application principal de la app.
 *
 * Inicializa:
 * - Hilt para inyección de dependencias
 * - WorkManager para sincronización periódica (backup)
 * - ConnectivitySyncService para sincronización INMEDIATA al recuperar conexión
 *
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@HiltAndroidApp
class DriversDetectorApp : Application(), Configuration.Provider {

    companion object {
        private const val TAG = "DriversDetectorApp"
    }

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var syncManager: SyncManager
    
    @Inject
    lateinit var connectivitySyncService: ConnectivitySyncService

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .setMinimumLoggingLevel(Log.DEBUG)
            .build()

    override fun onCreate() {
        super.onCreate()

        Log.d(TAG, "")
        Log.d(TAG, " INICIANDO APLICACIÓN")

        // Iniciar servicios de sincronización
        initializeSync()
    }

    /**
     * Inicializa todos los servicios de sincronización.
     */
    private fun initializeSync() {
        try {
            Log.d(TAG, "")
            Log.d(TAG, " Inicializando servicios de sincronización...")
            
            // 1. WorkManager: Sincronización periódica cada 15 min (backup)
            syncManager.startPeriodicSync()
            Log.d(TAG, "WorkManager iniciado (cada 15 min - backup)")
            
            // 2. ConnectivitySyncService - Sincronización INMEDIATA al recuperar conexión
            connectivitySyncService.start()
            Log.d(TAG, "ConnectivitySyncService iniciado")
            Log.d(TAG, "   ├── isRunning: ${connectivitySyncService.isRunning()}")

            // 3. Sincronización inicial con delay (por si hay eventos pendientes)
            syncManager.scheduleSyncWithDelay()
            Log.d(TAG, "Sincronización inicial programada")
            
            Log.d(TAG, "")
            Log.d(TAG, "TODOS LOS SERVICIOS DE SYNC INICIADOS")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error inicializando sync: ${e.message}", e)
        }
    }
}