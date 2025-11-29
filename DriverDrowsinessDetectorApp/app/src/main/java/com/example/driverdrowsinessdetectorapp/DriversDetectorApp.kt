package com.example.driverdrowsinessdetectorapp

import android.app.Application
import android.util.Log
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.example.driverdrowsinessdetectorapp.data.sync.SyncManager
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * Clase Application principal de la app.
 *
 * Inicializa:
 * - Hilt para inyección de dependencias
 * - WorkManager para sincronización en background
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

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .setMinimumLoggingLevel(Log.DEBUG)
            .build()

    override fun onCreate() {
        super.onCreate()

        Log.d(TAG, "═══════════════════════════════════════")
        Log.d(TAG, "🚀 INICIANDO APLICACIÓN")
        Log.d(TAG, "═══════════════════════════════════════")

        // Iniciar sincronización periódica
        initializeSync()
    }

    /**
     * Inicializa la sincronización de eventos.
     */
    private fun initializeSync() {
        try {
            // Iniciar sincronización periódica
            syncManager.startPeriodicSync()

            // Programar sincronización inicial con delay
            syncManager.scheduleSyncWithDelay()

            Log.d(TAG, "✅ Sincronización inicializada")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error inicializando sync: ${e.message}", e)
        }
    }
}