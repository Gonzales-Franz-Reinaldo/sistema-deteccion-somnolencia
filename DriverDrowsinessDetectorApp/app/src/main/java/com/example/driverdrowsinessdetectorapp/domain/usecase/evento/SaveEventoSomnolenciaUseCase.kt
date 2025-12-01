package com.example.driverdrowsinessdetectorapp.domain.usecase.evento

import android.os.Build
import android.util.Log
import com.example.driverdrowsinessdetectorapp.BuildConfig
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.domain.usecase.location.GetCurrentLocationUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.sync.SyncImmediateUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Caso de Uso: Guardar Evento de Somnolencia
 * 
 * Implementa la Estrategia C (Híbrida):
 * 1. SIEMPRE guarda en Room primero (garantía local)
 * 2. Intenta sincronizar inmediatamente si hay conexión
 * 3. Si falla, queda pendiente para WorkManager
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
class SaveEventoSomnolenciaUseCase @Inject constructor(
    private val eventoRepository: EventoSomnolenciaRepository,
    private val getCurrentLocationUseCase: GetCurrentLocationUseCase,
    private val syncImmediateUseCase: SyncImmediateUseCase 
) {
    companion object {
        private const val TAG = "SaveEventoUseCase"
    }
    
    /**
     * Guarda un evento de somnolencia con todos los datos necesarios.
     * 
     * Flujo:
     * 1. Obtener ubicación GPS
     * 2. Crear entidad con todos los datos
     * 3. Guardar en Room (sincronizado = false)
     * 4. Intentar sincronización inmediata (async, no bloquea)
     * 
     * @param params Parámetros del evento a guardar
     * @return Result con el ID del evento guardado o error
     */
    suspend operator fun invoke(params: EventoParams): Result<Long> {
        return try {
            Log.d(TAG, "📝 Guardando evento: ${params.tipoEvento}, Severidad: ${params.nivelSeveridad}")
            
            // 1. Obtener ubicación GPS actual
            val location = obtenerUbicacion()
            
            // 2. Crear entidad del evento
            val evento = crearEvento(params, location)
            
            // 3. SIEMPRE guardar en Room primero (offline-first)
            val id = eventoRepository.saveEvento(evento)
            
            Log.d(TAG, "✅ Evento guardado en Room: ID=$id, GPS=${location != null}")
            
            // 4. Intentar sincronización inmediata (NO bloquea el flujo principal)
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val synced = syncImmediateUseCase(id)
                    if (synced) {
                        Log.d(TAG, "⚡ Sincronización inmediata exitosa para evento $id")
                    } else {
                        Log.d(TAG, "📵 Evento $id pendiente de sincronización (WorkManager lo reintentará)")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "⚠️ Error en sync inmediata: ${e.message} - WorkManager lo reintentará")
                }
            }
            
            Result.success(id)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error guardando evento: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    // ========== MÉTODOS ESPECÍFICOS POR TIPO DE EVENTO ==========
    
    /**
     * Guarda un evento de microsueño.
     */
    suspend fun saveMicrosleep(
        idChofer: Int,
        sessionId: Long,
        idViaje: Int? = null,  // ✅ Ahora se usa
        duracionSegundos: Float,
        nivelSeveridad: AlertLevel = AlertLevel.CRITICAL
    ): Result<Long> {
        return invoke(
            EventoParams(
                idChofer = idChofer,
                sessionId = sessionId,
                idViaje = idViaje,
                tipoEvento = EventoSomnolenciaEntity.TIPO_MICROSUENO,
                duracionSegundos = duracionSegundos,
                cantidadEventos = 1,
                nivelSeveridad = nivelSeveridad.name
            )
        )
    }
    
    /**
     * Guarda un evento de cabeceo.
     */
    suspend fun saveNodding(
        idChofer: Int,
        sessionId: Long,
        idViaje: Int? = null,
        duracionSegundos: Float,
        nivelSeveridad: AlertLevel = AlertLevel.CRITICAL
    ): Result<Long> {
        return invoke(
            EventoParams(
                idChofer = idChofer,
                sessionId = sessionId,
                idViaje = idViaje,
                tipoEvento = EventoSomnolenciaEntity.TIPO_CABECEO,
                duracionSegundos = duracionSegundos,
                cantidadEventos = 1,
                nivelSeveridad = nivelSeveridad.name
            )
        )
    }
    
    /**
     * Guarda un evento de parpadeo excesivo.
     */
    suspend fun saveExcessiveBlink(
        idChofer: Int,
        sessionId: Long,
        idViaje: Int? = null,
        cantidadParpadeos: Int,
        nivelSeveridad: AlertLevel = AlertLevel.MEDIUM
    ): Result<Long> {
        return invoke(
            EventoParams(
                idChofer = idChofer,
                sessionId = sessionId,
                idViaje = idViaje,
                tipoEvento = EventoSomnolenciaEntity.TIPO_PARPADEO_OJOS,
                duracionSegundos = null,
                cantidadEventos = cantidadParpadeos,
                nivelSeveridad = nivelSeveridad.name
            )
        )
    }
    
    /**
     * Guarda un evento de bostezo.
     */
    suspend fun saveYawn(
        idChofer: Int,
        sessionId: Long,
        idViaje: Int? = null,
        cantidadBostezos: Int,
        nivelSeveridad: AlertLevel = AlertLevel.HIGH
    ): Result<Long> {
        return invoke(
            EventoParams(
                idChofer = idChofer,
                sessionId = sessionId,
                idViaje = idViaje,
                tipoEvento = EventoSomnolenciaEntity.TIPO_BOSTEZO,
                duracionSegundos = null,
                cantidadEventos = cantidadBostezos,
                nivelSeveridad = nivelSeveridad.name
            )
        )
    }
    
    /**
     * Guarda un evento de frotamiento de ojos.
     */
    suspend fun saveEyeRub(
        idChofer: Int,
        sessionId: Long,
        idViaje: Int? = null,
        cantidadFrotamientos: Int,
        nivelSeveridad: AlertLevel = AlertLevel.MEDIUM
    ): Result<Long> {
        return invoke(
            EventoParams(
                idChofer = idChofer,
                sessionId = sessionId,
                idViaje = idViaje,
                tipoEvento = EventoSomnolenciaEntity.TIPO_FROTAMIENTO_OJOS,
                duracionSegundos = null,
                cantidadEventos = cantidadFrotamientos,
                nivelSeveridad = nivelSeveridad.name
            )
        )
    }
    
    // ========== MÉTODOS PRIVADOS ==========
    
    /**
     * Obtiene la ubicación GPS actual.
     */
    private suspend fun obtenerUbicacion(): LocationService.LocationData? {
        return try {
            val result = getCurrentLocationUseCase()
            when (result) {
                is GetCurrentLocationUseCase.LocationResult.Success -> {
                    Log.d(TAG, "📍 GPS: ${result.location.latitude}, ${result.location.longitude}")
                    result.location
                }
                else -> {
                    Log.w(TAG, "⚠️ No se pudo obtener ubicación GPS")
                    null
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error obteniendo GPS: ${e.message}")
            null
        }
    }
    
    /**
     * Crea la entidad EventoSomnolenciaEntity con todos los datos.
     */
    private fun crearEvento(
        params: EventoParams,
        location: LocationService.LocationData?
    ): EventoSomnolenciaEntity {
        return EventoSomnolenciaEntity(
            // Relaciones
            idChofer = params.idChofer,
            idViaje = params.idViaje,
            sessionId = params.sessionId,
            
            // Datos del evento
            tipoEvento = params.tipoEvento,
            duracionSegundos = params.duracionSegundos,
            cantidadEventos = params.cantidadEventos,
            nivelSeveridad = params.nivelSeveridad,
            
            // Ubicación GPS
            latitud = location?.latitude,
            longitud = location?.longitude,
            velocidadKmh = location?.getSpeedInKmh(),
            
            // Timestamps
            timestampEvento = params.timestampEvento ?: System.currentTimeMillis(),
            
            // Metadatos del dispositivo
            dispositivoId = Build.ID,
            versionApp = BuildConfig.VERSION_NAME,
            
            // Estado de sincronización (nuevo, pendiente)
            sincronizado = false,
            intentosSync = 0
        )
    }
    
    /**
     * Parámetros para crear un evento de somnolencia.
     */
    data class EventoParams(
        val idChofer: Int,
        val sessionId: Long,
        val idViaje: Int? = null,
        val tipoEvento: String,
        val duracionSegundos: Float? = null,
        val cantidadEventos: Int = 1,
        val nivelSeveridad: String,
        val timestampEvento: Long? = null
    ) {
        init {
            require(idChofer > 0) { "ID de chofer debe ser positivo" }
            require(sessionId > 0) { "ID de sesión debe ser positivo" }
            require(tipoEvento in EventoSomnolenciaEntity.TIPOS_VALIDOS) { 
                "Tipo de evento inválido: $tipoEvento" 
            }
        }
    }
}