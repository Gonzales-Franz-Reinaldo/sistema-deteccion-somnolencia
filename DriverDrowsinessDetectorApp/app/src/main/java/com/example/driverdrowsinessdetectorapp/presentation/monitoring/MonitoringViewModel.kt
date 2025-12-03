package com.example.driverdrowsinessdetectorapp.presentation.monitoring

import android.graphics.Bitmap
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.driverdrowsinessdetectorapp.data.local.entity.SessionEntity
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia
import com.example.driverdrowsinessdetectorapp.domain.repository.ViajeRepository
import com.example.driverdrowsinessdetectorapp.domain.session.SessionManager
import com.example.driverdrowsinessdetectorapp.domain.usecase.evento.SaveEventoSomnolenciaUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.evento.SendEventoRealtimeUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.DetectDrowsinessUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.ProcessFrameUseCase
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.EventosStats
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.MonitoringUiState
import com.example.driverdrowsinessdetectorapp.util.AlarmUtil

import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.domain.usecase.gps.StartGPSTrackingUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.gps.StopGPSTrackingUseCase
import com.example.driverdrowsinessdetectorapp.services.GPSTrackingState
import kotlinx.coroutines.flow.first

import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MonitoringViewModel @Inject constructor(
    private val processFrameUseCase: ProcessFrameUseCase,
    private val detectDrowsinessUseCase: DetectDrowsinessUseCase,
    private val alarmUtil: AlarmUtil,
    private val sessionManager: SessionManager,
    private val saveEventoSomnolenciaUseCase: SaveEventoSomnolenciaUseCase,
    private val viajeRepository: ViajeRepository,
    
    // ═══ DEPENDENCIAS PARA GPS ═══
    private val startGPSTrackingUseCase: StartGPSTrackingUseCase,
    private val stopGPSTrackingUseCase: StopGPSTrackingUseCase,
    private val preferencesManager: PreferencesManager,
    
    // ═══ NUEVO: DEPENDENCIA PARA WEBSOCKET DE EVENTOS ═══
    private val sendEventoRealtimeUseCase: SendEventoRealtimeUseCase
) : ViewModel() {

    companion object {
        private const val TAG = "MonitoringViewModel"
        private const val FRAME_SKIP_COUNT = 2
        
        // DURACIONES DE ALERTAS
        private const val CRITICAL_ALERT_DURATION_MS = 5000L  // 5 segundos
        private const val WARNING_ALERT_DURATION_MS = 3000L   // 3 segundos
        
        // COOLDOWN para evitar guardar eventos duplicados
        private const val EVENT_SAVE_COOLDOWN_MS = 5000L  // 5 segundos entre eventos del mismo tipo
    }

    private val _uiState = MutableStateFlow<MonitoringUiState>(MonitoringUiState.Idle)
    val uiState: StateFlow<MonitoringUiState> = _uiState.asStateFlow()

    private val _currentMetrics = MutableStateFlow<MetricasSomnolencia?>(null)
    val currentMetrics: StateFlow<MetricasSomnolencia?> = _currentMetrics.asStateFlow()
    
    //  Estado para finalización de viaje
    private val _finalizarViajeState = MutableStateFlow<FinalizarViajeState>(FinalizarViajeState.Idle)
    val finalizarViajeState: StateFlow<FinalizarViajeState> = _finalizarViajeState.asStateFlow()

    private var sessionStartTime: Long = 0
    private var frameCount = 0
    private var isProcessingFrame = false
    
    //  ID del viaje actual
    private var currentViajeId: Int? = null
    
    // Control de alertas
    private var activeAlertLevel: AlertLevel = AlertLevel.NORMAL
    private var alertStartTime: Long = 0
    private var alertTimerJob: Job? = null
    private var lastCriticalAlertTime: Long = 0
    
    // Control de guardado de eventos
    private var lastMicrosleepSaveTime: Long = 0
    private var lastNoddingSaveTime: Long = 0
    private var lastYawnSaveTime: Long = 0
    private var lastBlinkSaveTime: Long = 0
    private var lastEyeRubSaveTime: Long = 0
    
    // Estadísticas de eventos en sesión
    private var eventosStats = EventosStats()
    
    // ═══ Estado del GPS tracking ═══
    private val _gpsTrackingState = MutableStateFlow(GPSTrackingState())
    val gpsTrackingState: StateFlow<GPSTrackingState> = _gpsTrackingState.asStateFlow()
    
    // ═══ Job para observar estado GPS ═══
    private var gpsObserverJob: Job? = null

    /**
     *  Establece el ID del viaje actual
     */
    fun setViajeId(idViaje: Int) {
        currentViajeId = idViaje
        Log.d(TAG, "📋 Viaje establecido: $idViaje")
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS PARA GPS TRACKING
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Inicia el tracking GPS via WebSocket
     */
    private suspend fun startGPSTracking() {
        val viajeId = currentViajeId
        if (viajeId == null) {
            Log.w(TAG, "⚠️ No hay viaje ID para iniciar GPS tracking")
            return
        }
        
        try {
            val choferId = preferencesManager.getUserId().first()
            val token = preferencesManager.getAuthToken().first()
            
            if (choferId == null || token == null) {
                Log.e(TAG, "❌ No hay chofer ID ($choferId) o token para GPS tracking")
                return
            }
            
            Log.d(TAG, "🛰️ Iniciando GPS tracking para viaje $viajeId, chofer $choferId")
            
            startGPSTrackingUseCase(viajeId, choferId, token)
            
            gpsObserverJob?.cancel()
            gpsObserverJob = viewModelScope.launch {
                startGPSTrackingUseCase.getTrackingState().collect { state ->
                    _gpsTrackingState.value = state
                    
                    val currentState = _uiState.value
                    if (currentState is MonitoringUiState.Active) {
                        _uiState.value = currentState.copy(
                            gpsEnabled = state.isTracking && state.isConnected
                        )
                    }
                    
                    Log.d(TAG, "📶 GPS State: tracking=${state.isTracking}, connected=${state.isConnected}")
                }
            }
            
            Log.d(TAG, "✅ GPS tracking iniciado correctamente")
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error iniciando GPS tracking: ${e.message}", e)
        }
    }
    
    /**
     * Detiene el tracking GPS
     */
    private fun stopGPSTracking() {
        Log.d(TAG, "🛑 Deteniendo GPS tracking...")
        gpsObserverJob?.cancel()
        gpsObserverJob = null
        stopGPSTrackingUseCase()
    }

    // ═══════════════════════════════════════════════════════════════
    // ← NUEVO: MÉTODOS PARA WEBSOCKET DE EVENTOS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Inicia la conexión WebSocket para eventos de somnolencia.
     */
    private suspend fun startEventosWebSocket() {
        val viajeId = currentViajeId ?: run {
            Log.e(TAG, "❌ No hay viaje ID para conectar WebSocket eventos")
            return
        }
        
        try {
            Log.d(TAG, "🔌 Conectando WebSocket de eventos para viaje $viajeId")
            sendEventoRealtimeUseCase.connect(viajeId)
            Log.d(TAG, "✅ WebSocket de eventos conectado")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error conectando WebSocket de eventos: ${e.message}", e)
        }
    }
    
    /**
     * Detiene la conexión WebSocket de eventos.
     */
    private fun stopEventosWebSocket() {
        Log.d(TAG, "🔌 Desconectando WebSocket de eventos")
        sendEventoRealtimeUseCase.disconnect()
    }

    /**
     * Inicia el viaje/sesión de monitoreo.
     */
    fun startTrip() {
        viewModelScope.launch {
            Log.d(TAG, "🚀 Iniciando viaje...")
            
            _uiState.value = MonitoringUiState.Starting
            detectDrowsinessUseCase.reset()
            resetEventCooldowns()
            eventosStats = EventosStats()
            
            try {
                //  Crear sesión en Room
                val session = sessionManager.startSession()
                
                delay(500)
                
                sessionStartTime = System.currentTimeMillis()
                frameCount = 0

                // Iniciar GPS Tracking WebSocket
                startGPSTracking()
                
                // ← NUEVO: Iniciar WebSocket de eventos
                startEventosWebSocket()
                
                _uiState.value = MonitoringUiState.Active(
                    sessionId = session.id,
                    duration = "00:00:00",
                    currentEAR = 0f,
                    currentMAR = 0f,
                    headPose = com.example.driverdrowsinessdetectorapp.domain.model.HeadPose.NEUTRAL,
                    alertLevel = AlertLevel.NORMAL,
                    gpsEnabled = true,
                    isProcessing = false,
                    eventosGuardados = eventosStats
                )
                
                startTimer()
                
                Log.d(TAG, "✅ Sesión iniciada: ID=${session.id}, ViajeID=$currentViajeId")
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error al iniciar sesión: ${e.message}", e)
                _uiState.value = MonitoringUiState.Error("Error al iniciar: ${e.message}")
            }
        }
    }

    /**
     * Procesa un frame de la cámara.
     */
    fun processFrame(bitmap: Bitmap) {
        if (isProcessingFrame) return

        frameCount++
        if (frameCount % (FRAME_SKIP_COUNT + 1) != 0) return

        viewModelScope.launch {
            isProcessingFrame = true
            try {
                val metrics = withContext(Dispatchers.Default) {
                    processFrameUseCase(bitmap)
                }

                if (metrics != null) {
                    _currentMetrics.value = metrics
                    updateUiStateWithMetrics(metrics)
                    handleAlertWithDuration(metrics)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error procesando frame: ${e.message}")
            } finally {
                isProcessingFrame = false
            }
        }
    }

    /**
     * Actualiza el estado UI con las métricas actuales.
     */
    private fun updateUiStateWithMetrics(metrics: MetricasSomnolencia) {
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(
                currentEAR = metrics.ear,
                currentMAR = metrics.mar,
                headPose = metrics.headPose,
                alertLevel = metrics.alertLevel,
                isProcessing = true,
                eventosGuardados = eventosStats
            )
        }
    }

    /**
     *  Manejo de alerta MEJORADO con guardado de eventos
     */
    private fun handleAlertWithDuration(metrics: MetricasSomnolencia) {
        val currentTime = System.currentTimeMillis()
        val newAlertLevel = metrics.alertLevel
        
        // MICROSUEÑO O CABECEO (CRÍTICO)
        if (newAlertLevel == AlertLevel.CRITICAL) {
            val timeSinceLastCritical = currentTime - lastCriticalAlertTime
            
            if (timeSinceLastCritical >= EVENT_SAVE_COOLDOWN_MS) {
                if (activeAlertLevel != AlertLevel.CRITICAL) {
                    lastCriticalAlertTime = currentTime
                    startAlert(AlertLevel.CRITICAL)
                    
                    // GUARDAR EVENTO CRÍTICO
                    saveEventoSomnolencia(metrics)
                }
            }
            return
        }
        
        // ADVERTENCIAS (MEDIUM/HIGH)
        if (newAlertLevel == AlertLevel.HIGH || newAlertLevel == AlertLevel.MEDIUM) {
            if (activeAlertLevel == AlertLevel.NORMAL) {
                startAlert(newAlertLevel)
                
                // GUARDAR EVENTO DE ADVERTENCIA
                saveEventoSomnolencia(metrics)
            }
            return
        }
        
        // NORMAL: Verificar si la alerta actual debe continuar
        if (newAlertLevel == AlertLevel.NORMAL && activeAlertLevel != AlertLevel.NORMAL) {
            val alertDuration = currentTime - alertStartTime
            val requiredDuration = getAlertDuration(activeAlertLevel)
            
            if (alertDuration >= requiredDuration) {
                stopAlert()
            }
        }
    }

    /**
     *  Guarda un evento de somnolencia en Room + intenta sync inmediato
     *  + envía notificación en tiempo real via WebSocket
     */
    private fun saveEventoSomnolencia(metrics: MetricasSomnolencia) {
        val sessionId = sessionManager.getCurrentSessionId() ?: return
        val currentTime = System.currentTimeMillis()
        
        viewModelScope.launch {
            try {
                val alertType = metrics.alertType ?: return@launch
                
                // LOG ANTES DE VERIFICAR COOLDOWN
                Log.d(TAG, "🔔 Intentando guardar evento: ${alertType.name}")
                
                if (!shouldSaveEvent(alertType, currentTime)) {
                    Log.d(TAG, "⏭️ Evento ${alertType.name} en cooldown, no guardado")
                    return@launch
                }
                
                val userId = sessionManager.getCurrentSession()?.userId ?: run {
                    Log.e(TAG, "❌ No hay userId disponible")
                    return@launch
                }
                
                // LOG CON ID DE VIAJE
                Log.d(TAG, "💾 Guardando evento: tipo=${alertType.name}, userId=$userId, sessionId=$sessionId, viajeId=$currentViajeId")
                
                //  TODOS LOS MÉTODOS AHORA INCLUYEN idViaje
                val result = when (alertType) {
                    AlertType.MICROSLEEP -> {
                        lastMicrosleepSaveTime = currentTime
                        saveEventoSomnolenciaUseCase.saveMicrosleep(
                            idChofer = userId,
                            sessionId = sessionId,
                            idViaje = currentViajeId,  
                            duracionSegundos = metrics.microsleepDurations.lastOrNull()?.div(1000f) ?: 2.5f,
                            nivelSeveridad = metrics.alertLevel
                        )
                    }
                    
                    AlertType.HEAD_NODDING -> {
                        lastNoddingSaveTime = currentTime
                        saveEventoSomnolenciaUseCase.saveNodding(
                            idChofer = userId,
                            sessionId = sessionId,
                            idViaje = currentViajeId,  
                            duracionSegundos = metrics.noddingDurations.lastOrNull()?.div(1000f) ?: 3.0f,
                            nivelSeveridad = metrics.alertLevel
                        )
                    }
                    
                    AlertType.YAWNING -> {
                        lastYawnSaveTime = currentTime
                        saveEventoSomnolenciaUseCase.saveYawn(
                            idChofer = userId,
                            sessionId = sessionId,
                            idViaje = currentViajeId,  
                            cantidadBostezos = metrics.yawnCount,
                            nivelSeveridad = metrics.alertLevel
                        )
                    }
                    
                    AlertType.EXCESSIVE_BLINKING -> {
                        lastBlinkSaveTime = currentTime
                        saveEventoSomnolenciaUseCase.saveExcessiveBlink(
                            idChofer = userId,
                            sessionId = sessionId,
                            idViaje = currentViajeId,  
                            cantidadParpadeos = metrics.blinkCount,
                            nivelSeveridad = metrics.alertLevel
                        )
                    }
                    
                    AlertType.EYE_RUB -> {
                        lastEyeRubSaveTime = currentTime
                        saveEventoSomnolenciaUseCase.saveEyeRub(
                            idChofer = userId,
                            sessionId = sessionId,
                            idViaje = currentViajeId,  
                            cantidadFrotamientos = metrics.eyeRubSecondHandCount,
                            nivelSeveridad = metrics.alertLevel
                        )
                    }
                }
                
                result.onSuccess { eventoId ->
                    Log.d(TAG, "✅ Evento guardado exitosamente: ID=$eventoId")
                    updateEventosStats(alertType)
                    
                    // ═══════════════════════════════════════════════════════════════
                    // ← NUEVO: Enviar evento via WebSocket para notificar al admin
                    // ═══════════════════════════════════════════════════════════════
                    currentViajeId?.let { viajeId ->
                        try {
                            val duracion = when (alertType) {
                                AlertType.MICROSLEEP -> metrics.microsleepDurations.lastOrNull()?.div(1000f) ?: 2.5f
                                AlertType.HEAD_NODDING -> metrics.noddingDurations.lastOrNull()?.div(1000f) ?: 3.0f
                                else -> 1.0f
                            }
                            
                            sendEventoRealtimeUseCase(
                                idViaje = viajeId,
                                idChofer = userId,
                                tipoEvento = alertType,
                                nivelSeveridad = metrics.alertLevel,
                                duracionSegundos = duracion,
                                earPromedio = metrics.ear,
                                marPromedio = metrics.mar
                            )
                            Log.i(TAG, "📤 Evento enviado via WebSocket: ${alertType.name}")
                        } catch (e: Exception) {
                            Log.w(TAG, "⚠️ Error enviando via WebSocket: ${e.message}")
                        }
                    }
                    // ═══════════════════════════════════════════════════════════════
                    
                }.onFailure { error ->
                    Log.e(TAG, "❌ Error guardando evento: ${error.message}")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ Excepción guardando evento: ${e.message}", e)
            }
        }
    }
    
    /**
     *  Verifica si se puede guardar un evento (cooldown)
     */
    private fun shouldSaveEvent(alertType: AlertType, currentTime: Long): Boolean {
        val lastSaveTime = when (alertType) {
            AlertType.MICROSLEEP -> lastMicrosleepSaveTime
            AlertType.HEAD_NODDING -> lastNoddingSaveTime
            AlertType.YAWNING -> lastYawnSaveTime
            AlertType.EXCESSIVE_BLINKING -> lastBlinkSaveTime
            AlertType.EYE_RUB -> lastEyeRubSaveTime
        }
        
        return (currentTime - lastSaveTime) >= EVENT_SAVE_COOLDOWN_MS
    }
    
    /**
     *  Actualiza las estadísticas de eventos
     */
    private fun updateEventosStats(alertType: AlertType) {
        eventosStats = when (alertType) {
            AlertType.MICROSLEEP -> eventosStats.copy(
                microsueños = eventosStats.microsueños + 1
            )
            AlertType.HEAD_NODDING -> eventosStats.copy(
                cabeceos = eventosStats.cabeceos + 1
            )
            AlertType.YAWNING -> eventosStats.copy(
                bostezos = eventosStats.bostezos + 1
            )
            AlertType.EXCESSIVE_BLINKING -> eventosStats.copy(
                parpadeos = eventosStats.parpadeos + 1
            )
            AlertType.EYE_RUB -> eventosStats.copy(
                frotamientos = eventosStats.frotamientos + 1
            )
        }
        
        // Actualizar UI
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(eventosGuardados = eventosStats)
        }
    }
    
    /**
     *  Actualiza estadísticas de la sesión
     */
    private fun updateSessionStats(alertType: AlertType) {
        viewModelScope.launch {
            try {
                when (alertType) {
                    AlertType.MICROSLEEP -> sessionManager.updateSessionStats(
                        microsleepCount = 1,
                        maxAlertLevel = "CRITICAL"
                    )
                    AlertType.HEAD_NODDING -> sessionManager.updateSessionStats(
                        noddingCount = 1,
                        maxAlertLevel = "CRITICAL"
                    )
                    AlertType.YAWNING -> sessionManager.updateSessionStats(
                        yawnCount = 1,
                        maxAlertLevel = "HIGH"
                    )
                    AlertType.EXCESSIVE_BLINKING -> sessionManager.updateSessionStats(
                        blinkCount = 1,
                        maxAlertLevel = "MEDIUM"
                    )
                    AlertType.EYE_RUB -> sessionManager.updateSessionStats(
                        eyeRubCount = 1,
                        maxAlertLevel = "MEDIUM"
                    )
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error actualizando stats de sesión: ${e.message}")
            }
        }
    }
    
    /**
     *  Resetea los cooldowns de guardado
     */
    private fun resetEventCooldowns() {
        lastMicrosleepSaveTime = 0
        lastNoddingSaveTime = 0
        lastYawnSaveTime = 0
        lastBlinkSaveTime = 0
        lastEyeRubSaveTime = 0
    }

    /**
     * Inicia una alerta con temporizador.
     */
    private fun startAlert(level: AlertLevel) {
        alertTimerJob?.cancel()
        
        activeAlertLevel = level
        alertStartTime = System.currentTimeMillis()
        
        // Reproducir alarma INMEDIATAMENTE
        alarmUtil.playAlarm(level)
        
        val duration = getAlertDuration(level)
        val emoji = when(level) {
            AlertLevel.CRITICAL -> "🔴"
            AlertLevel.HIGH -> "🟠"
            AlertLevel.MEDIUM -> "🟡"
            AlertLevel.NORMAL -> "🟢"
        }
        
        Log.w(TAG, "$emoji ALERTA ${level.name} INICIADA (duración: ${duration}ms)")
        
        // Programar detención automática
        alertTimerJob = viewModelScope.launch {
            delay(duration)
            if (activeAlertLevel == level) {
                stopAlert()
            }
        }
        
        // Actualizar UI
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(alertLevel = level)
        }
    }

    /**
     * Detiene la alerta activa.
     */
    private fun stopAlert() {
        alertTimerJob?.cancel()
        alarmUtil.stopAlarm()
        activeAlertLevel = AlertLevel.NORMAL
        alertStartTime = 0
        
        // Actualizar UI
        val currentState = _uiState.value
        if (currentState is MonitoringUiState.Active) {
            _uiState.value = currentState.copy(alertLevel = AlertLevel.NORMAL)
        }
        
        Log.d(TAG, "🟢 Alerta detenida")
    }

    /**
     * Obtiene la duración de alerta según nivel.
     */
    private fun getAlertDuration(level: AlertLevel): Long {
        return when (level) {
            AlertLevel.CRITICAL -> CRITICAL_ALERT_DURATION_MS
            AlertLevel.HIGH -> WARNING_ALERT_DURATION_MS
            AlertLevel.MEDIUM -> WARNING_ALERT_DURATION_MS
            AlertLevel.NORMAL -> 0L
        }
    }

    /**
     *  PAUSAR VIAJE - Solo pausa localmente, NO cambia estado en backend
     * El viaje sigue en "en_curso" en el servidor
     */
    fun pauseTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Active) {
                // Pausar sesión en Room
                sessionManager.pauseSession()
                
                _uiState.value = MonitoringUiState.Paused(
                    sessionId = currentState.sessionId,
                    duration = currentState.duration,
                    eventosGuardados = eventosStats
                )
                
                stopAlert()
                Log.d(TAG, "⏸️ Viaje PAUSADO (estado en servidor sigue en_curso)")
            }
        }
    }

    /**
     * Reanuda el viaje.
     */
    fun resumeTrip() {
        viewModelScope.launch {
            val currentState = _uiState.value
            if (currentState is MonitoringUiState.Paused) {
                // Reanudar sesión en Room
                sessionManager.resumeSession()
                
                _uiState.value = MonitoringUiState.Active(
                    sessionId = currentState.sessionId,
                    duration = currentState.duration,
                    currentEAR = 0f,
                    currentMAR = 0f,
                    headPose = com.example.driverdrowsinessdetectorapp.domain.model.HeadPose.NEUTRAL,
                    alertLevel = AlertLevel.NORMAL,
                    gpsEnabled = true,
                    isProcessing = false,
                    eventosGuardados = eventosStats
                )
                
                Log.d(TAG, "▶️ Viaje reanudado")
            }
        }
    }

    /**
     *  FINALIZAR VIAJE - Llama al backend para cambiar estado a "completada"
     */
    fun finalizarViaje(onSuccess: () -> Unit, onError: (String) -> Unit) {
        val viajeId = currentViajeId
        
        if (viajeId == null) {
            Log.e(TAG, "❌ No hay viaje ID para finalizar")
            onError("No se encontró el viaje activo")
            return
        }
        
        viewModelScope.launch {
            _finalizarViajeState.value = FinalizarViajeState.Loading
            
            Log.d(TAG, "🏁 Finalizando viaje ID: $viajeId")

            // Detener GPS Tracking 
            stopGPSTracking()
            
            // ← NUEVO: Detener WebSocket de eventos
            stopEventosWebSocket()
            
            viajeRepository.finalizarViaje(viajeId)
                .onSuccess { viaje ->
                    Log.d(TAG, "✅ Viaje finalizado exitosamente: ${viaje.estado}")
                    
                    // Finalizar sesión local
                    stopAlert()
                    detectDrowsinessUseCase.reset()
                    resetEventCooldowns()
                    sessionManager.endSession()
                    
                    _finalizarViajeState.value = FinalizarViajeState.Success
                    _uiState.value = MonitoringUiState.Idle
                    
                    onSuccess()
                }
                .onFailure { error ->
                    Log.e(TAG, "❌ Error finalizando viaje: ${error.message}")
                    _finalizarViajeState.value = FinalizarViajeState.Error(error.message ?: "Error desconocido")
                    onError(error.message ?: "Error al finalizar viaje")
                }
        }
    }

    /**
     * DETENER VIAJE SIN FINALIZAR - Para cuando se pausa y vuelve al dashboard
     */
    fun stopTripWithoutFinalize() {
        viewModelScope.launch {
            try {
                stopAlert()
                // NO finalizar sesión, solo pausar
                sessionManager.pauseSession()
                
                _uiState.value = MonitoringUiState.Idle
                
                Log.d(TAG, "⏹️ Monitoreo detenido (viaje sigue en_curso)")
            } catch (e: Exception) {
                Log.e(TAG, "Error al detener monitoreo: ${e.message}")
                _uiState.value = MonitoringUiState.Idle
            }
        }
    }

    /**
     * Detiene el viaje completamente (para cancelaciones).
     */
    fun stopTrip() {
        viewModelScope.launch {
            try {
                // Finalizar sesión en Room
                sessionManager.endSession()
                
                stopAlert()
                detectDrowsinessUseCase.reset()
                resetEventCooldowns()
                
                // ← NUEVO: Detener WebSocket de eventos
                stopEventosWebSocket()
                
                _uiState.value = MonitoringUiState.Idle
                
                Log.d(TAG, "⏹️ Viaje detenido completamente")
            } catch (e: Exception) {
                Log.e(TAG, "Error al detener viaje: ${e.message}")
                _uiState.value = MonitoringUiState.Idle
            }
        }
    }

    /**
     * Inicia el timer de duración.
     */
    private fun startTimer() {
        viewModelScope.launch {
            while (true) {
                delay(1000)
                val currentState = _uiState.value
                if (currentState is MonitoringUiState.Active) {
                    val totalSeconds = (System.currentTimeMillis() - sessionStartTime) / 1000
                    _uiState.value = currentState.copy(
                        duration = formatDuration(totalSeconds)
                    )
                } else if (currentState !is MonitoringUiState.Paused) {
                    break
                }
            }
        }
    }

    /**
     * Formatea duración en HH:MM:SS.
     */
    private fun formatDuration(totalSeconds: Long): String {
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format("%02d:%02d:%02d", hours, minutes, seconds)
    }

    override fun onCleared() {
        super.onCleared()
        stopGPSTracking()
        stopEventosWebSocket()  // ← NUEVO
        stopAlert()

        gpsObserverJob?.cancel()
        
        // Finalizar sesión si está activa
        viewModelScope.launch {
            if (sessionManager.hasActiveSession()) {
                sessionManager.endSession(SessionEntity.STATUS_CANCELLED)
            }
        }
        
        Log.d(TAG, "🧹 ViewModel cleared")
    }
}

/**
 * Estados para finalización de viaje
 */
sealed class FinalizarViajeState {
    data object Idle : FinalizarViajeState()
    data object Loading : FinalizarViajeState()
    data object Success : FinalizarViajeState()
    data class Error(val message: String) : FinalizarViajeState()
}