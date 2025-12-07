package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui

import android.Manifest
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.FinalizarViajeState
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.MonitoringViewModel
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components.*
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MonitoringScreen(
    idViaje: Int,
    origen: String,
    destino: String,
    onNavigateBack: () -> Unit,
    onViajeCompletado: () -> Unit,
    onViajePausado: () -> Unit,
    viewModel: MonitoringViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val currentMetrics by viewModel.currentMetrics.collectAsState()
    val finalizarState by viewModel.finalizarViajeState.collectAsState()

    // Estado para diálogos
    var showFinalizarDialog by remember { mutableStateOf(false) }
    var showPausarDialog by remember { mutableStateOf(false) }

    // Permisos necesarios
    val permissionsState = rememberMultiplePermissionsState(
        permissions = listOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
    )

    // Establecer el ID del viaje al entrar
    LaunchedEffect(idViaje) {
        viewModel.setViajeId(idViaje)  
        Log.d("MonitoringScreen", "Viaje ID establecido: $idViaje")
    }

    // Solicitar permisos e iniciar
    LaunchedEffect(Unit) {
        if (!permissionsState.allPermissionsGranted) {
            permissionsState.launchMultiplePermissionRequest()
        } else {
            viewModel.startTrip()
        }
    }

    // Mostrar diálogo si no hay permisos
    if (!permissionsState.allPermissionsGranted) {
        PermissionRequestDialog(
            onRequestPermissions = {
                permissionsState.launchMultiplePermissionRequest()
            },
            onDismiss = onNavigateBack
        )
        return
    }

    // UI Principal
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // CÁMARA
        CameraPreview(
            modifier = Modifier.fillMaxSize(),
            onFrameCaptured = { bitmap ->
                viewModel.processFrame(bitmap)
            }
        )

        // UI OVERLAY
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // HEADER
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = {
                        // Mostrar diálogo para pausar
                        showPausarDialog = true
                    }
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Volver",
                        tint = Color.White
                    )
                }

                Text(
                    text = "Monitoreo en Vivo",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )

                GPSIndicator(isActive = true)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Ruta actual
            Text(
                text = "$origen → $destino",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // TIMER
            if (uiState is MonitoringUiState.Active) {
                TimerDisplay(
                    formattedTime = (uiState as MonitoringUiState.Active).duration
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // STATUS INDICATOR
            currentMetrics?.let { metrics ->
                StatusIndicator(alertLevel = metrics.alertLevel)
            }

            Spacer(modifier = Modifier.weight(1f))

            // ALERT BANNER
            currentMetrics?.let { metrics ->
                if (metrics.alertLevel != AlertLevel.NORMAL) {
                    AlertBanner(
                        alertLevel = metrics.alertLevel,
                        alertType = metrics.alertType
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            // METRICS DISPLAY
            if (uiState is MonitoringUiState.Active) {
                currentMetrics?.let { metrics ->
                    MetricsDisplay(metrics = metrics)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            //  CONTROLES ACTUALIZADOS
            MonitoringControls(
                isPaused = uiState is MonitoringUiState.Paused,
                onPauseResume = {
                    if (uiState is MonitoringUiState.Paused) {
                        viewModel.resumeTrip()
                    } else {
                        viewModel.pauseTrip()
                    }
                },
                onPausarViaje = {
                    showPausarDialog = true
                },
                onFinalizarViaje = {
                    showFinalizarDialog = true
                }
            )
        }
    }

    //  DIÁLOGO PAUSAR VIAJE
    if (showPausarDialog) {
        PausarViajeDialog(
            onConfirm = {
                showPausarDialog = false
                viewModel.stopTripWithoutFinalize()
                onViajePausado()
            },
            onDismiss = {
                showPausarDialog = false
            }
        )
    }

    //  DIÁLOGO FINALIZAR VIAJE
    if (showFinalizarDialog) {
        val activeState = uiState as? MonitoringUiState.Active

        FinalizarViajeDialog(
            origen = origen,
            destino = destino,
            duracion = activeState?.duration ?: "00:00:00",
            eventosDetectados = activeState?.eventosGuardados?.total ?: 0,
            isLoading = finalizarState is FinalizarViajeState.Loading,
            onConfirm = {
                viewModel.finalizarViaje(
                    onSuccess = {
                        showFinalizarDialog = false
                        Toast.makeText(context, " Viaje finalizado", Toast.LENGTH_SHORT).show()
                        onViajeCompletado()
                    },
                    onError = { error ->
                        Toast.makeText(context, "$error", Toast.LENGTH_LONG).show()
                    }
                )
            },
            onDismiss = {
                if (finalizarState !is FinalizarViajeState.Loading) {
                    showFinalizarDialog = false
                }
            }
        )
    }
}