package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.MonitoringViewModel
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components.*
import com.example.driverdrowsinessdetectorapp.ui.theme.PrimaryPurple

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonitoringScreen(
    onBack: () -> Unit,
    viewModel: MonitoringViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val cameraActive by viewModel.cameraActive.collectAsState()
    val serverConnected by viewModel.serverConnected.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Monitoreo en Vivo", color = Color.White)
                        Text(
                            "Procesamiento en tiempo real con IA",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Volver al Dashboard",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryPurple
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color.White)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ============================================
            // VIDEO ORIGINAL (Arriba)
            // ============================================
            VideoBox(
                title = "Video Original",
                showContent = cameraActive,
                isProcessing = uiState is MonitoringUiState.Active,
                content = {
                    CameraPreview()
                    if (uiState is MonitoringUiState.Active) {
                        FaceLandmarksOverlay()
                    }
                }
            )

            // ============================================
            // ANÁLISIS DE PUNTOS (Abajo)
            // ============================================
            VideoBox(
                title = "Análisis de Puntos",
                showContent = uiState is MonitoringUiState.Active,
                isProcessing = uiState is MonitoringUiState.Active,
                content = {
                    // TODO: Aquí irá el análisis visual de MediaPipe
                    AnalysisPlaceholder()
                }
            )

            // ============================================
            // BOTONES DE CONTROL
            // ============================================
            when (uiState) {
                is MonitoringUiState.Idle -> {
                    // Botón "Iniciar Viaje"
                    Button(
                        onClick = { viewModel.startTrip() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Text(
                            text = "🚗 Iniciar Viaje",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                is MonitoringUiState.Active, is MonitoringUiState.Paused -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Botón Pausar/Reanudar
                        Button(
                            onClick = {
                                if (uiState is MonitoringUiState.Active) {
                                    viewModel.pauseTrip()
                                } else {
                                    viewModel.resumeTrip()
                                }
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (uiState is MonitoringUiState.Paused)
                                    Color(0xFF4CAF50) else Color(0xFFFF9800)
                            )
                        ) {
                            Text(
                                text = if (uiState is MonitoringUiState.Paused)
                                    "▶ Reanudar" else "⏸ Pausar",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Botón Detener
                        Button(
                            onClick = { viewModel.stopTrip() },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFFF5722)
                            )
                        ) {
                            Text(
                                text = "⏹ Detener",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                is MonitoringUiState.Starting -> {
                    CircularProgressIndicator(modifier = Modifier.fillMaxWidth())
                }

                is MonitoringUiState.Error -> {
                    Text(
                        text = (uiState as MonitoringUiState.Error).message,
                        color = Color.Red
                    )
                }

                else -> {}
            }

            // ============================================
            // INDICADORES DE ESTADO
            // ============================================
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                StatusChip(
                    label = if (cameraActive) "Cámara Activa" else "Cámara Inactiva",
                    isActive = cameraActive,
                    activeColor = Color(0xFF4CAF50),
                    inactiveColor = Color.Gray
                )

                StatusChip(
                    label = if (serverConnected) "Servidor Conectado" else "Servidor Desconectado",
                    isActive = serverConnected,
                    activeColor = Color(0xFF2196F3),
                    inactiveColor = Color.Red
                )
            }

            // ============================================
            // MÉTRICAS (Solo en estado activo)
            // ============================================
            if (uiState is MonitoringUiState.Active) {
                val activeState = uiState as MonitoringUiState.Active

                Text(
                    text = "Métricas en Tiempo Real",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryPurple
                )

                MetricsDisplay(
                    ear = activeState.currentEAR,
                    mar = activeState.currentMAR,
                    headPose = activeState.headPose
                )

                // Timer
                TimerDisplay(duration = activeState.duration)
            }
        }
    }
}