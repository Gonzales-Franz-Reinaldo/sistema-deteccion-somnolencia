package com.example.driverdrowsinessdetectorapp.data.remote.api

import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.ViajeListResponse
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.ViajeResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Interface Retrofit para endpoints de viajes.
 */
interface ViajesApi {
    
    /**
     * Obtener viajes asignados al chofer actual.
     * Filtra por estado pendiente o en_curso.
     */
    @GET("/api/v1/viajes/chofer/{id_chofer}")
    suspend fun getViajesChofer(
        @Path("id_chofer") idChofer: Int,
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 10
    ): Response<ViajeListResponse>
    
    /**
     * Obtener un viaje específico por ID.
     */
    @GET("/api/v1/viajes/{id_viaje}")
    suspend fun getViaje(
        @Path("id_viaje") idViaje: Int
    ): Response<ViajeResponse>
    
    /**
     * Iniciar un viaje (cambiar estado a en_curso).
     * PATCH porque solo actualiza el estado, no reemplaza todo el recurso.
     */
    @PATCH("/api/v1/viajes/{id_viaje}/iniciar")
    suspend fun iniciarViaje(
        @Path("id_viaje") idViaje: Int
    ): Response<ViajeResponse>
    
    /**
     * Finalizar un viaje (cambiar estado a completada).
     * PATCH porque solo actualiza el estado, no reemplaza todo el recurso.
     */
    @PATCH("/api/v1/viajes/{id_viaje}/finalizar")
    suspend fun finalizarViaje(
        @Path("id_viaje") idViaje: Int
    ): Response<ViajeResponse>
}