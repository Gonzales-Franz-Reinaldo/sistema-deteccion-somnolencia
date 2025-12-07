package com.example.driverdrowsinessdetectorapp.domain.usecase.sync

import android.content.Context
import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.example.driverdrowsinessdetectorapp.data.remote.api.EventosApi
import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.EventoRequest
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.util.NetworkUtil
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Caso de Uso: Sincronización Inmediata de un Evento.
 * 
 * Implementa la Estrategia C (Híbrida):
 * 1. El evento YA está guardado en Room (sincronizado = false)
 * 2. Si hay internet, intenta enviarlo inmediatamente
 * 3. Si tiene éxito, marca como sincronizado
 * 4. Si falla, queda pendiente para WorkManager
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
@Singleton
class SyncImmediateUseCase @Inject constructor(
    @ApplicationContext private val context: Context,
    private val eventoRepository: EventoSomnolenciaRepository,
    private val eventosApi: EventosApi
) {
    companion object {
        private const val TAG = "SyncImmediateUseCase"
    }
    
    /**
     * Intenta sincronizar un evento inmediatamente después de guardarlo.
     * 
     * @param eventoId ID del evento recién guardado en Room
     * @return true si se sincronizó exitosamente, false si queda pendiente
     */
    suspend operator fun invoke(eventoId: Long): Boolean = withContext(Dispatchers.IO) {
        try {
            // 1. Verificar conectividad
            if (!NetworkUtil.isNetworkAvailable(context)) {
                Log.d(TAG, "Sin conexión - Evento $eventoId queda pendiente")
                return@withContext false
            }
            
            // 2. Obtener evento de Room
            val evento = eventoRepository.getEventoById(eventoId)
            if (evento == null) {
                Log.e(TAG, "Evento $eventoId no encontrado en Room")
                return@withContext false
            }
            
            // 3. Si ya está sincronizado, no hacer nada
            if (evento.sincronizado) {
                Log.d(TAG, "Evento $eventoId ya estaba sincronizado")
                return@withContext true
            }
            
            // 4. Convertir a DTO y enviar al backend
            val request = EventoRequest.fromEntity(evento)
            Log.d(TAG, "Enviando evento $eventoId al servidor...")
            
            val response = eventosApi.crearEvento(request)
            
            if (response.isSuccessful && response.body() != null) {
                val eventoServidor = response.body()!!
                
                // 5. Marcar como sincronizado en Room
                eventoRepository.markAsSynced(eventoId, eventoServidor.idEvento)
                
                Log.d(TAG, "Evento $eventoId sincronizado → ID servidor: ${eventoServidor.idEvento}")
                return@withContext true
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Error del servidor: ${response.code()} - $errorBody")
                
                // Marcar intento fallido
                eventoRepository.markSyncFailed(eventoId, "HTTP ${response.code()}: $errorBody")
                return@withContext false
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Excepción en sincronización inmediata: ${e.message}", e)
            
            // Marcar intento fallido (el evento queda en Room para retry)
            try {
                eventoRepository.markSyncFailed(eventoId, e.message ?: "Error desconocido")
            } catch (roomError: Exception) {
                Log.e(TAG, "Error actualizando Room: ${roomError.message}")
            }
            
            return@withContext false
        }
    }
}