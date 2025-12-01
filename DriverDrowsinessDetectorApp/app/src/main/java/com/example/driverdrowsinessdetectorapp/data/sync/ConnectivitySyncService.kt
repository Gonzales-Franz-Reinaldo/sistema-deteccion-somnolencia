package com.example.driverdrowsinessdetectorapp.data.sync

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.sync.SyncEventosUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Servicio que sincroniza eventos INMEDIATAMENTE cuando se recupera la conexión.
 * 
 * Flujo:
 * 1. Observa cambios de conectividad
 * 2. Cuando Status = Available → Ejecuta sincronización
 * 3. No espera 15 minutos, es INMEDIATO
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Singleton
class ConnectivitySyncService @Inject constructor(
    private val networkObserver: NetworkConnectivityObserver,
    private val syncEventosUseCase: SyncEventosUseCase
) {
    companion object {
        private const val TAG = "ConnectivitySync"
        private const val MIN_SYNC_INTERVAL_MS = 5000L  // Mínimo 5 segundos entre syncs
        private const val SYNC_DELAY_MS = 2000L  // Esperar 2 segundos después de recuperar conexión
    }
    
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var observerJob: Job? = null
    
    @Volatile
    private var isRunning = false
    
    @Volatile
    private var lastSyncTime = 0L
    
    @Volatile
    private var wasDisconnected = false  
    
    /**
     * Inicia el servicio de observación y sincronización.
     */
    fun start() {
        if (isRunning) {
            Log.d(TAG, "⚠️ Servicio ya está corriendo")
            return
        }
        
        isRunning = true
        Log.d(TAG, "═══════════════════════════════════════")
        Log.d(TAG, "🚀 INICIANDO ConnectivitySyncService")
        Log.d(TAG, "═══════════════════════════════════════")
        
        observerJob = scope.launch {
            Log.d(TAG, "📡 Iniciando observación de red...")
            
            networkObserver.observe()
                .catch { e ->
                    Log.e(TAG, "❌ Error en observación de red: ${e.message}", e)
                }
                .collectLatest { status ->
                    Log.d(TAG, "")
                    Log.d(TAG, "═══════════════════════════════════════")
                    Log.d(TAG, "📶 CAMBIO DE CONECTIVIDAD: $status")
                    Log.d(TAG, "   wasDisconnected: $wasDisconnected")
                    Log.d(TAG, "═══════════════════════════════════════")
                    
                    when (status) {
                        NetworkConnectivityObserver.Status.Available -> {
                            Log.d(TAG, "🌐 Conexión DISPONIBLE detectada")
                            
                            // Solo sincronizar si estuvimos desconectados antes
                            // O si es la primera vez que se detecta conexión
                            if (wasDisconnected) {
                                Log.d(TAG, "⚡ Conexión RECUPERADA - Preparando sincronización...")
                                
                                // Pequeño delay para asegurar que la conexión esté estable
                                delay(SYNC_DELAY_MS)
                                
                                syncIfNeeded()
                            } else {
                                Log.d(TAG, "ℹ️ Ya estábamos conectados, verificando eventos pendientes...")
                                // Verificar si hay eventos pendientes de todos modos
                                checkPendingEvents()
                            }
                            
                            wasDisconnected = false
                        }
                        
                        NetworkConnectivityObserver.Status.Lost,
                        NetworkConnectivityObserver.Status.Unavailable -> {
                            Log.w(TAG, "📵 Conexión PERDIDA/NO DISPONIBLE")
                            wasDisconnected = true
                        }
                        
                        NetworkConnectivityObserver.Status.Losing -> {
                            Log.w(TAG, "⚠️ Conexión PERDIENDO...")
                            wasDisconnected = true
                        }
                    }
                }
        }
        
        Log.d(TAG, "✅ Job de observación iniciado: ${observerJob?.isActive}")
    }
    
    /**
     * Verifica si hay eventos pendientes sin sincronizar.
     */
    private suspend fun checkPendingEvents() {
        try {
            val hasPending = syncEventosUseCase.hasPendingEvents()
            Log.d(TAG, "📊 ¿Eventos pendientes? $hasPending")
            
            if (hasPending) {
                syncIfNeeded()
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error verificando eventos pendientes: ${e.message}", e)
        }
    }
    
    /**
     * Sincroniza si hay eventos pendientes y ha pasado suficiente tiempo.
     */
    private suspend fun syncIfNeeded() {
        val currentTime = System.currentTimeMillis()
        
        // Evitar sincronizaciones muy frecuentes
        if (currentTime - lastSyncTime < MIN_SYNC_INTERVAL_MS) {
            Log.d(TAG, "⏳ Muy pronto para sincronizar (${currentTime - lastSyncTime}ms desde última sync)")
            return
        }
        
        // Verificar si hay eventos pendientes
        try {
            val hasPending = syncEventosUseCase.hasPendingEvents()
            if (!hasPending) {
                Log.d(TAG, "✅ No hay eventos pendientes de sincronización")
                return
            }
            
            val stats = syncEventosUseCase.getStats()
            Log.d(TAG, "📊 Eventos pendientes: ${stats.eventosPendientes}")
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error verificando eventos pendientes: ${e.message}", e)
            return
        }
        
        Log.d(TAG, "")
        Log.d(TAG, "═══════════════════════════════════════")
        Log.d(TAG, "⚡ CONEXIÓN RECUPERADA - SINCRONIZANDO")
        Log.d(TAG, "═══════════════════════════════════════")
        
        lastSyncTime = currentTime
        
        try {
            val result = syncEventosUseCase()
            
            when (result) {
                is SyncResult.Success -> {
                    Log.d(TAG, "✅ SYNC EXITOSA: ${result.eventosSincronizados} eventos")
                }
                is SyncResult.PartialSuccess -> {
                    Log.w(TAG, "⚠️ SYNC PARCIAL: ${result.eventosSincronizados} OK, ${result.eventosFallidos} fallidos")
                }
                is SyncResult.NothingToSync -> {
                    Log.d(TAG, "✅ Sin eventos pendientes")
                }
                is SyncResult.NoConnection -> {
                    Log.w(TAG, "📵 Sin conexión durante sync")
                    wasDisconnected = true
                }
                is SyncResult.Error -> {
                    Log.e(TAG, "❌ Error en sync: ${result.descripcion}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción durante sincronización: ${e.message}", e)
        }
        
        Log.d(TAG, "═══════════════════════════════════════")
    }
    
    /**
     * Fuerza una sincronización inmediata.
     */
    fun syncNow() {
        Log.d(TAG, "🔄 Sincronización manual solicitada")
        scope.launch {
            lastSyncTime = 0  // Resetear para permitir sync inmediata
            syncIfNeeded()
        }
    }
    
    /**
     * Verifica si el servicio está corriendo.
     */
    fun isRunning(): Boolean = isRunning && observerJob?.isActive == true
    
    /**
     * Detiene el servicio.
     */
    fun stop() {
        Log.d(TAG, "🛑 Deteniendo ConnectivitySyncService")
        observerJob?.cancel()
        observerJob = null
        isRunning = false
    }
}