package com.example.driverdrowsinessdetectorapp.data.repository

import android.util.Log
import com.example.driverdrowsinessdetectorapp.data.remote.api.ViajesApi
import com.example.driverdrowsinessdetectorapp.data.remote.dto.response.ViajeResponse
import com.example.driverdrowsinessdetectorapp.domain.model.EstadoViaje
import com.example.driverdrowsinessdetectorapp.domain.model.Viaje
import com.example.driverdrowsinessdetectorapp.domain.repository.ViajeRepository
import javax.inject.Inject

class ViajeRepositoryImpl @Inject constructor(
    private val viajesApi: ViajesApi
) : ViajeRepository {
    
    companion object {
        private const val TAG = "ViajeRepository"
    }
    
    override suspend fun getViajeActivo(idChofer: Int): Result<Viaje?> {
        return try {
            Log.d(TAG, "Buscando viaje activo para chofer: $idChofer")
            
            val response = viajesApi.getViajesChofer(idChofer)
            
            if (response.isSuccessful) {
                val viajeList = response.body()
                
                // Buscar viaje pendiente o en_curso
                val viajeActivo = viajeList?.viajes?.find { viaje ->
                    viaje.estado == "pendiente" || viaje.estado == "en_curso"
                }
                
                if (viajeActivo != null) {
                    Log.d(TAG, "Viaje activo encontrado: ${viajeActivo.idViaje} - Estado: ${viajeActivo.estado}")
                    Result.success(viajeActivo.toDomain())
                } else {
                    Log.d(TAG, "No hay viajes activos para el chofer")
                    Result.success(null)
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Error obteniendo viajes: ${response.code()} - $errorBody")
                Result.failure(Exception("Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Excepción obteniendo viaje activo: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    override suspend fun iniciarViaje(idViaje: Int): Result<Viaje> {
        return try {
            Log.d(TAG, "Iniciando viaje: $idViaje")
            
            // Usar el nuevo endpoint PATCH /viajes/{id}/iniciar
            val response = viajesApi.iniciarViaje(idViaje)
            
            if (response.isSuccessful) {
                val viaje = response.body()!!
                Log.d(TAG, "Viaje iniciado: ${viaje.idViaje}")
                Result.success(viaje.toDomain())
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Error iniciando viaje: ${response.code()} - $errorBody")
                Result.failure(Exception("Error al iniciar viaje: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Excepción iniciando viaje: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    override suspend fun finalizarViaje(idViaje: Int): Result<Viaje> {
        return try {
            Log.d(TAG, "Finalizando viaje: $idViaje")
            
            // Usar el nuevo endpoint PATCH /viajes/{id}/finalizar
            val response = viajesApi.finalizarViaje(idViaje)
            
            if (response.isSuccessful) {
                val viaje = response.body()!!
                Log.d(TAG, "Viaje finalizado: ${viaje.idViaje}")
                Result.success(viaje.toDomain())
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Error finalizando viaje: ${response.code()} - $errorBody")
                Result.failure(Exception("Error al finalizar viaje: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Excepción finalizando viaje: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    /**
     * Extensión para convertir DTO a modelo de dominio.
     */
    private fun ViajeResponse.toDomain(): Viaje {
        return Viaje(
            idViaje = this.idViaje,
            idChofer = this.idChofer,
            origen = this.origen,
            destino = this.destino,
            fechaProgramada = this.fechaViajeProgramada,
            horaProgramada = this.horaViajeProgramada,
            duracionEstimada = this.duracionEstimada,
            distanciaKm = this.distanciaKm,
            estado = EstadoViaje.fromString(this.estado),
            observaciones = this.observaciones,
            nombreEmpresa = this.nombreEmpresa
        )
    }
}