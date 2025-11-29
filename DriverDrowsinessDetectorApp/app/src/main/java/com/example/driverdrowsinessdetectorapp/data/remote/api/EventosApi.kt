package com.example.driverdrowsinessdetectorapp.data.remote.api

import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.EventoRequest
import com.example.driverdrowsinessdetectorapp.data.remote.dto.request.EventosBatchRequest
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.EstadisticasChoferResponse
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.EventoResponse
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.EventoResumenResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Interface Retrofit para endpoints de eventos de somnolencia.
 * 
 * Base URL: /api/v1/eventos
 * 
 * Todos los endpoints requieren autenticación JWT Bearer Token.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
interface EventosApi {
    
    // ENDPOINTS PARA CREAR EVENTOS (CHOFER)
    
    /**
     * Crear un evento de somnolencia individual.
     * 
     * Usado cuando hay conexión a internet y se puede enviar inmediatamente.
     * 
     * @param evento Datos del evento a crear
     * @return Evento creado con ID asignado por el servidor
     */
    @POST("/api/v1/eventos")
    suspend fun crearEvento(
        @Body evento: EventoRequest
    ): Response<EventoResponse>
    
    /**
     * Crear múltiples eventos en lote (sincronización offline).
     * 
     * Usado cuando el chofer recupera conexión después de estar offline
     * y necesita sincronizar eventos acumulados en Room.
     * 
     * Límites:
     * - Mínimo: 1 evento
     * - Máximo: 100 eventos por request
     * 
     * @param batch Lista de eventos a sincronizar
     * @return Lista de eventos creados con IDs asignados
     */
    @POST("/api/v1/eventos/batch")
    suspend fun crearEventosBatch(
        @Body batch: EventosBatchRequest
    ): Response<List<EventoResponse>>
    
    // ENDPOINTS PARA CONSULTAR EVENTOS
    
    /**
     * Obtener mis eventos (para chofer).
     * 
     * Permite al chofer ver su historial de eventos.
     * 
     * @param limite Número máximo de resultados (1-200, default: 50)
     * @param offset Offset para paginación (default: 0)
     * @param dias Eventos de los últimos X días (1-90, default: 7)
     * @param tipoEvento Filtrar por tipo de evento (opcional)
     * @param nivelSeveridad Filtrar por severidad (opcional)
     * @return Lista de eventos resumidos
     */
    @GET("/api/v1/eventos/mis-eventos")
    suspend fun getMisEventos(
        @Query("limite") limite: Int = 50,
        @Query("offset") offset: Int = 0,
        @Query("dias") dias: Int = 7,
        @Query("tipo_evento") tipoEvento: String? = null,
        @Query("nivel_severidad") nivelSeveridad: String? = null
    ): Response<List<EventoResumenResponse>>
    
    /**
     * Obtener eventos de un viaje específico.
     * 
     * @param idViaje ID del viaje
     * @return Lista de eventos del viaje
     */
    @GET("/api/v1/eventos/viaje/{id_viaje}")
    suspend fun getEventosPorViaje(
        @Path("id_viaje") idViaje: Int
    ): Response<List<EventoResumenResponse>>
    
    // ENDPOINTS DE ESTADÍSTICAS
    
    /**
     * Obtener mis estadísticas (para chofer).
     * 
     * @param dias Estadísticas de los últimos X días (1-90, default: 7)
     * @return Estadísticas del chofer
     */
    @GET("/api/v1/eventos/estadisticas/mis-estadisticas")
    suspend fun getMisEstadisticas(
        @Query("dias") dias: Int = 7
    ): Response<EstadisticasChoferResponse>
}