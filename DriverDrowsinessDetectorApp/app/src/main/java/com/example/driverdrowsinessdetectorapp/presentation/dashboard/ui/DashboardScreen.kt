package com.example.driverdrowsinessdetectorapp.presentation.dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.driverdrowsinessdetectorapp.domain.model.EstadoViaje
import com.example.driverdrowsinessdetectorapp.domain.model.Viaje
import com.example.driverdrowsinessdetectorapp.presentation.dashboard.DashboardViewModel
import com.example.driverdrowsinessdetectorapp.ui.theme.GreenSuccess
import com.example.driverdrowsinessdetectorapp.ui.theme.Orange
import com.example.driverdrowsinessdetectorapp.ui.theme.PrimaryPurple
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    onStartMonitoring: (idViaje: Int, origen: String, destino: String) -> Unit,  
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    val viajeAsignado by viewModel.viajeAsignado.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val showIniciarViajeDialog by viewModel.showIniciarViajeDialog.collectAsState()
    
    var showLogoutDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Dashboard",
                        fontWeight = FontWeight.Bold
                    ) 
                },
                actions = {
                    // Botón refresh
                    IconButton(onClick = { viewModel.refreshViaje() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Actualizar"
                        )
                    }
                    
                    // Menú usuario
                    Box {
                        IconButton(onClick = { showLogoutDialog = true }) {
                            Icon(
                                imageVector = Icons.Default.AccountCircle,
                                contentDescription = "Menú usuario"
                            )
                        }
                        DropdownMenu(
                            expanded = showLogoutDialog,
                            onDismissRequest = { showLogoutDialog = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Cerrar Sesión") },
                                onClick = {
                                    showLogoutDialog = false
                                    showLogoutDialog = true
                                },
                                leadingIcon = {
                                    Icon(Icons.Default.ExitToApp, null)
                                }
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryPurple,
                    titleContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Card de información del usuario
            user?.let { currentUser ->
                UserInfoCard(user = currentUser)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Estado de carga o viaje
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                // Mostrar estado del viaje
                ViajeStatusCard(
                    viaje = viajeAsignado,
                    onRefresh = { viewModel.refreshViaje() }
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Botón para iniciar monitoreo
            StartMonitoringButton(
                viaje = viajeAsignado,
                onClick = {
                    if (viewModel.canStartMonitoring()) {
                        if (viewModel.isViajePendiente()) {
                            // Mostrar diálogo de confirmación para iniciar viaje
                            viewModel.showIniciarViajeDialog()
                        } else if (viewModel.isViajeEnCurso()) {
                            viajeAsignado?.let { viaje ->
                                onStartMonitoring(viaje.idViaje, viaje.origen, viaje.destino)
                            }
                        }
                    }
                }
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Información de la sesión
            SessionInfoCard()
            
            // Mostrar error si existe
            errorMessage?.let { error ->
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color.Red
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = error,
                            color = Color.Red,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }

    // Dialog de confirmación de logout
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Cerrar Sesión") },
            text = { Text("¿Estás seguro que deseas cerrar sesión?") },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                        onLogout()
                    }
                ) {
                    Text("Sí, cerrar sesión")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
    
    // Dialog para iniciar viaje - ACTUALIZAR el onSuccess
    if (showIniciarViajeDialog && viajeAsignado != null) {
        IniciarViajeDialog(
            viaje = viajeAsignado!!,
            isLoading = isLoading,
            onConfirm = {
                viewModel.iniciarViaje {
                    // Pasar datos del viaje
                    viajeAsignado?.let { viaje ->
                        onStartMonitoring(viaje.idViaje, viaje.origen, viaje.destino)
                    }
                }
            },
            onDismiss = { viewModel.hideIniciarViajeDialog() }
        )
    }
}

// COMPONENTES

@Composable
fun UserInfoCard(user: com.example.driverdrowsinessdetectorapp.domain.model.User) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(PrimaryPurple),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.fullName.take(2).uppercase(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column {
                Text(
                    text = "Bienvenido,",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = user.fullName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Conductor",
                    fontSize = 12.sp,
                    color = PrimaryPurple
                )
            }
        }
    }
}

@Composable
fun ViajeStatusCard(
    viaje: Viaje?,
    onRefresh: () -> Unit
) {
    if (viaje != null) {
        ViajeAsignadoCard(viaje = viaje)
    } else {
        NoViajeCard(onRefresh = onRefresh)
    }
}

@Composable
fun ViajeAsignadoCard(viaje: Viaje) {
    val estadoColor = when (viaje.estado) {
        EstadoViaje.PENDIENTE -> Orange
        EstadoViaje.EN_CURSO -> GreenSuccess
        else -> Color.Gray
    }
    
    val estadoTexto = when (viaje.estado) {
        EstadoViaje.PENDIENTE -> "⏳ Pendiente"
        EstadoViaje.EN_CURSO -> "🚗 En Curso"
        EstadoViaje.COMPLETADA -> "✅ Completado"
        EstadoViaje.CANCELADA -> "❌ Cancelado"
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header con estado
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🚗 Viaje Asignado",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                
                Card(
                    colors = CardDefaults.cardColors(containerColor = estadoColor.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = estadoTexto,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        color = estadoColor,
                        fontWeight = FontWeight.Medium,
                        fontSize = 12.sp
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Divider()
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Detalles del viaje
            ViajeDetailRow(
                icon = Icons.Default.LocationOn,
                label = "Origen:",
                value = viaje.origen
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ViajeDetailRow(
                icon = Icons.Default.Place,
                label = "Destino:",
                value = viaje.destino
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ViajeDetailRow(
                icon = Icons.Default.DateRange,
                label = "Fecha:",
                value = viaje.fechaProgramada
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ViajeDetailRow(
                icon = Icons.Default.AccessTime,
                label = "Hora:",
                value = viaje.horaProgramada
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ViajeDetailRow(
                icon = Icons.Default.Timer,
                label = "Duración Est.:",
                value = viaje.duracionEstimada
            )
            
            viaje.nombreEmpresa?.let { empresa ->
                Spacer(modifier = Modifier.height(8.dp))
                ViajeDetailRow(
                    icon = Icons.Default.Business,
                    label = "Empresa:",
                    value = empresa
                )
            }
        }
    }
}

@Composable
fun ViajeDetailRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PrimaryPurple,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = label,
            fontSize = 14.sp,
            color = Color.Gray
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun NoViajeCard(onRefresh: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF8E1)),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = null,
                tint = Orange,
                modifier = Modifier.size(48.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Sin viaje asignado",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF795548)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "No tienes ningún viaje pendiente. Contacta con tu administrador para que te asigne un viaje.",
                fontSize = 14.sp,
                color = Color(0xFF8D6E63),
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedButton(onClick = onRefresh) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Actualizar")
            }
        }
    }
}

@Composable
fun StartMonitoringButton(
    viaje: Viaje?,
    onClick: () -> Unit
) {
    val isEnabled = viaje != null && 
        (viaje.estado == EstadoViaje.PENDIENTE || viaje.estado == EstadoViaje.EN_CURSO)
    
    val buttonText = when {
        viaje == null -> "Sin viaje asignado"
        viaje.estado == EstadoViaje.PENDIENTE -> "🚀 Iniciar Viaje"
        viaje.estado == EstadoViaje.EN_CURSO -> "▶️ Continuar Monitoreo"
        viaje.estado == EstadoViaje.COMPLETADA -> "✅ Viaje Completado"
        else -> "Viaje finalizado"
    }
    
    val buttonColor = when {
        viaje?.estado == EstadoViaje.EN_CURSO -> Color(0xFF2196F3) 
        isEnabled -> GreenSuccess
        else -> Color.Gray
    }
    
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp),
        enabled = isEnabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = buttonColor,
            disabledContainerColor = Color.LightGray
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (isEnabled) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
            }
            Text(
                text = buttonText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = if (isEnabled) Color.White else Color.DarkGray
            )
        }
    }
}

@Composable
fun SessionInfoCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "📊 Información",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = Color(0xFF1565C0),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "El sistema detectará signos de somnolencia durante el viaje.",
                    fontSize = 14.sp,
                    color = Color(0xFF1565C0)
                )
            }
        }
    }
}


@Composable
fun IniciarViajeDialog(
    viaje: Viaje,
    isLoading: Boolean,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        icon = {
            Icon(
                imageVector = Icons.Default.DirectionsCar,
                contentDescription = null,
                tint = GreenSuccess,
                modifier = Modifier.size(48.dp)
            )
        },
        title = {
            Text(
                text = "¿Iniciar Viaje?",
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Estás a punto de iniciar el siguiente viaje:",
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally  
                    ) {
                        Text(
                            text = "${viaje.origen} → ${viaje.destino}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = "Duración estimada: ${viaje.duracionEstimada}",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "⚠️ Una vez iniciado, el sistema comenzará a monitorear signos de somnolencia.",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = GreenSuccess)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text("🚀 Iniciar Viaje")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isLoading
            ) {
                Text("Cancelar")
            }
        }
    )
}