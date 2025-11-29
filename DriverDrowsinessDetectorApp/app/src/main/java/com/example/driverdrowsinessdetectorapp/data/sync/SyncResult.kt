package com.example.driverdrowsinessdetectorapp.data.sync

/**
 * Resultado de una operación de sincronización.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
sealed class SyncResult {
    /**
     * Sincronización exitosa.
     */
    data class Success(
        val eventosSincronizados: Int,
        val descripcion: String = "Sincronización completada"
    ) : SyncResult()
    
    /**
     * Sincronización parcial (algunos eventos fallaron).
     */
    data class PartialSuccess(
        val eventosSincronizados: Int,
        val eventosFallidos: Int,
        val errores: List<String>
    ) : SyncResult()
    
    /**
     * Sin eventos pendientes.
     */
    data object NothingToSync : SyncResult()
    
    /**
     * Sin conexión a internet.
     */
    data object NoConnection : SyncResult()
    
    /**
     * Error durante la sincronización.
     */
    data class Error(
        val descripcion: String,
        val exception: Throwable? = null
    ) : SyncResult()
    
    /**
     * Verifica si la sincronización fue exitosa.
     */
    fun isSuccess(): Boolean = this is Success || this is NothingToSync
    
    /**
     * Obtiene el mensaje descriptivo del resultado.
     */
    fun getDisplayMessage(): String = when (this) {
        is Success -> descripcion
        is PartialSuccess -> "Sincronizados: $eventosSincronizados, Fallidos: $eventosFallidos"
        is NothingToSync -> "No hay eventos pendientes"
        is NoConnection -> "Sin conexión a internet"
        is Error -> descripcion
    }
}

/**
 * Estadísticas de sincronización.
 */
data class SyncStats(
    val eventosPendientes: Int = 0,
    val eventosEnviados: Int = 0,
    val eventosExitosos: Int = 0,
    val eventosFallidos: Int = 0,
    val ultimaSync: Long? = null
)