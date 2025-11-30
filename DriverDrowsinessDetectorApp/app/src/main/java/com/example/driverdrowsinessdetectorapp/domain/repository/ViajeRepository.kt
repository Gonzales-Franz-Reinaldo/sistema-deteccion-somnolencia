package com.example.driverdrowsinessdetectorapp.domain.repository

import com.example.driverdrowsinessdetectorapp.domain.model.Viaje

/**
 * Repositorio para gestión de viajes.
 */
interface ViajeRepository {
    
    /**
     * Obtiene el viaje activo (pendiente o en_curso) del chofer.
     */
    suspend fun getViajeActivo(idChofer: Int): Result<Viaje?>
    
    /**
     * Inicia un viaje (cambia estado a en_curso).
     */
    suspend fun iniciarViaje(idViaje: Int): Result<Viaje>
    
    /**
     * Finaliza un viaje (cambia estado a completada).
     */
    suspend fun finalizarViaje(idViaje: Int): Result<Viaje>
}