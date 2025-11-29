package com.example.driverdrowsinessdetectorapp.domain.usecase.evento

import android.os.Build
import android.util.Log
import com.example.driverdrowsinessdetectorapp.BuildConfig
import com.example.driverdrowsinessdetectorapp.data.local.entity.EventoSomnolenciaEntity
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.domain.usecase.location.GetCurrentLocationUseCase
import javax.inject.Inject

/**
 * Caso de Uso: Guardar Evento de Somnolencia
 * 
 * Encapsula la lógica de negocio para crear y guardar eventos de somnolencia
 * en la base de datos local, incluyendo:
 * - Captura de ubicación GPS
 * - Validación de datos
 * - Generación de metadatos
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
class SaveEventoSomnolenciaUseCase @Inject constructor(
    private val eventoRepository: EventoSomnolenciaRepository,
    private val getCurrentLocationUseCase: GetCurrentLocationUseCase
) {
    companion object {
        private const val TAG = "SaveEventoUseCase"
    }
    
    /**
     * Guarda un evento de somnolencia con todos los datos necesarios.
     * 
     * @param params Parámetros del evento a guardar
     * @return Result con el ID del evento guardado o error
     */
    suspend operator fun invoke(params: EventoParams): Result<Long> {
        return try {
            Log.d(TAG, "📝 Guardando evento: ${params.tipoEvento}, Severidad: ${params.nivelSeveridad}")
            
            // Obtener ubicación GPS actual
            val location = obtenerUbicacion()
            
            // Crear entidad del evento
            val evento = crearEvento(params, location)
            
            // Validar evento
            if (!evento.validar()) {
                Log.e(TAG, "❌ Evento inválido: $evento")
                return Result.failure(IllegalArgumentException("Datos del evento inválidos"))
            }
            
            // Guardar en Room
            val id = eventoRepository.saveEvento(evento)
            
            Log.d(TAG, "✅ Evento guardado exitosamente: ID=$id, Tipo=${params.tipoEvento}")
            
            // Log de ubicación si disponible
            if (location != null) {
                Log.d(TAG, "📍 Con ubicación: ${location.latitude}, ${location.longitude}, " +
                          "Velocidad: ${location.getSpeedInKmh()} km/h")
            } else {
                Log.w(TAG, "⚠️ Sin ubicación GPS disponible")
            }
            
            Result.success(id)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error guardando evento: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    /**
     * Guarda un evento de microsueño.
     */
    suspend fun saveMicrosleep(
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
    
    /**
     * Obtiene la ubicación actual de forma segura.
     */
    private suspend fun obtenerUbicacion(): LocationService.LocationData? {
        return try {
            val result = getCurrentLocationUseCase()
            result.getOrNull()
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ No se pudo obtener ubicación: ${e.message}")
            // Intentar usar última ubicación conocida
            getCurrentLocationUseCase.getLastKnown()
        }
    }
    
    /**
     * Crea la entidad del evento con todos los datos.
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
            require(nivelSeveridad in EventoSomnolenciaEntity.SEVERIDADES_VALIDAS) { 
                "Nivel de severidad inválido: $nivelSeveridad" 
            }
        }
    }
}