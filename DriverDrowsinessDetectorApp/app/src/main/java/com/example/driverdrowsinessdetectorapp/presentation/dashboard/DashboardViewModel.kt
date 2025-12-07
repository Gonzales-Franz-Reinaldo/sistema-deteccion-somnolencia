package com.example.driverdrowsinessdetectorapp.presentation.dashboard

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.driverdrowsinessdetectorapp.domain.model.User
import com.example.driverdrowsinessdetectorapp.domain.model.Viaje
import com.example.driverdrowsinessdetectorapp.domain.model.EstadoViaje
import com.example.driverdrowsinessdetectorapp.domain.usecase.auth.LogoutUseCase
import com.example.driverdrowsinessdetectorapp.domain.repository.ViajeRepository
import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val logoutUseCase: LogoutUseCase,
    private val viajeRepository: ViajeRepository,
    preferencesManager: PreferencesManager
) : ViewModel() {
    
    companion object {
        private const val TAG = "DashboardViewModel"
    }

    val user: StateFlow<User?> = preferencesManager.getUserData()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )
    
    // Estado del viaje asignado
    private val _viajeAsignado = MutableStateFlow<Viaje?>(null)
    val viajeAsignado: StateFlow<Viaje?> = _viajeAsignado.asStateFlow()
    
    // Estado de carga
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    // Mensaje de error
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    // Estado para mostrar diálogo de inicio de viaje
    private val _showIniciarViajeDialog = MutableStateFlow(false)
    val showIniciarViajeDialog: StateFlow<Boolean> = _showIniciarViajeDialog.asStateFlow()
    
    init {
        // Cargar viaje asignado cuando el usuario esté disponible
        viewModelScope.launch {
            user.collect { currentUser ->
                currentUser?.let {
                    cargarViajeAsignado(it.id)
                }
            }
        }
    }
    
    /**
     * Carga el viaje activo del chofer.
     */
    fun cargarViajeAsignado(idChofer: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            
            Log.d(TAG, "Cargando viaje para chofer: $idChofer")
            
            viajeRepository.getViajeActivo(idChofer)
                .onSuccess { viaje ->
                    _viajeAsignado.value = viaje
                    if (viaje != null) {
                        Log.d(TAG, "Viaje cargado: ${viaje.origen} → ${viaje.destino} (${viaje.estado})")
                    } else {
                        Log.d(TAG, "ℹNo hay viaje asignado")
                    }
                }
                .onFailure { error ->
                    Log.e(TAG, "Error cargando viaje: ${error.message}")
                    _errorMessage.value = "Error al cargar viaje: ${error.message}"
                }
            
            _isLoading.value = false
        }
    }
    
    /**
     * Refresca el viaje asignado.
     */
    fun refreshViaje() {
        user.value?.let { currentUser ->
            cargarViajeAsignado(currentUser.id)
        }
    }
    
    /**
     * Verifica si el monitoreo puede iniciarse.
     */
    fun canStartMonitoring(): Boolean {
        val viaje = _viajeAsignado.value
        return viaje != null && (viaje.estado == EstadoViaje.PENDIENTE || viaje.estado == EstadoViaje.EN_CURSO)
    }
    
    /**
     * Verifica si el viaje está pendiente (requiere confirmación para iniciar).
     */
    fun isViajePendiente(): Boolean {
        return _viajeAsignado.value?.estado == EstadoViaje.PENDIENTE
    }
    
    /**
     * Verifica si el viaje ya está en curso.
     */
    fun isViajeEnCurso(): Boolean {
        return _viajeAsignado.value?.estado == EstadoViaje.EN_CURSO
    }
    
    /**
     * Muestra el diálogo para iniciar viaje.
     */
    fun showIniciarViajeDialog() {
        _showIniciarViajeDialog.value = true
    }
    
    /**
     * Oculta el diálogo para iniciar viaje.
     */
    fun hideIniciarViajeDialog() {
        _showIniciarViajeDialog.value = false
    }
    
    /**
     * Inicia el viaje (cambia estado a en_curso).
     */
    fun iniciarViaje(onSuccess: () -> Unit) {
        val viaje = _viajeAsignado.value ?: return
        
        viewModelScope.launch {
            _isLoading.value = true
            
            Log.d(TAG, "Iniciando viaje: ${viaje.idViaje}")
            
            viajeRepository.iniciarViaje(viaje.idViaje)
                .onSuccess { viajeActualizado ->
                    _viajeAsignado.value = viajeActualizado
                    Log.d(TAG, "Viaje iniciado exitosamente")
                    _showIniciarViajeDialog.value = false
                    onSuccess()
                }
                .onFailure { error ->
                    Log.e(TAG, "Error iniciando viaje: ${error.message}")
                    _errorMessage.value = "Error al iniciar viaje: ${error.message}"
                }
            
            _isLoading.value = false
        }
    }
    
    /**
     * Limpia el mensaje de error.
     */
    fun clearError() {
        _errorMessage.value = null
    }

    fun logout() {
        viewModelScope.launch {
            logoutUseCase()
        }
    }
    
    /**
     *  Maneja el click en el botón de monitoreo
     */
    fun onMonitoringClick(onNavigate: (Int, String, String) -> Unit) {
        val viaje = _viajeAsignado.value ?: return
        
        when (viaje.estado) {
            EstadoViaje.PENDIENTE -> {
                // Mostrar diálogo de confirmación para iniciar viaje
                _showIniciarViajeDialog.value = true
            }
            EstadoViaje.EN_CURSO -> {
                // Ya está en curso, ir directamente a monitoreo
                onNavigate(viaje.idViaje, viaje.origen, viaje.destino)
            }
            else -> {
                // No hacer nada para otros estados
            }
        }
    }
}