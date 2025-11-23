package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.AlertType

@Composable
fun AlertBanner(
    alertLevel: AlertLevel,
    alertType: AlertType?,
    modifier: Modifier = Modifier
) {
    val isVisible = alertLevel != AlertLevel.NORMAL

    // Animación de parpadeo
    val infiniteTransition = rememberInfiniteTransition(label = "alert_blink")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (alertLevel == AlertLevel.CRITICAL) 0.3f else 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = if (alertLevel == AlertLevel.CRITICAL) 500 else 1000,
                easing = LinearEasing
            ),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha_animation"
    )

    AnimatedVisibility(
        visible = isVisible,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .alpha(if (alertLevel == AlertLevel.CRITICAL) alpha else 1f)
                .background(
                    color = getAlertColor(alertLevel),
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Alerta",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = getAlertTitle(alertLevel),
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )

                    alertType?.let {
                        Text(
                            text = getAlertMessage(it),
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

private fun getAlertColor(alertLevel: AlertLevel): Color {
    return when (alertLevel) {
        AlertLevel.NORMAL -> Color.Transparent
        AlertLevel.MEDIUM -> Color(0xFFFFA726) // Naranja
        AlertLevel.HIGH -> Color(0xFFFF5722)   // Rojo-Naranja
        AlertLevel.CRITICAL -> Color(0xFFD32F2F) // Rojo intenso
    }
}

private fun getAlertTitle(alertLevel: AlertLevel): String {
    return when (alertLevel) {
        AlertLevel.NORMAL -> ""
        AlertLevel.MEDIUM -> "⚠️ Advertencia"
        AlertLevel.HIGH -> "🚨 Alerta Alta"
        AlertLevel.CRITICAL -> "🔴 ALERTA CRÍTICA"
    }
}

private fun getAlertMessage(alertType: AlertType): String {
    return when (alertType) {
        AlertType.MICROSLEEP -> "Microsueño detectado - Manténgase alerta"
        AlertType.YAWNING -> "Bostezo prolongado - Considere descansar"
        AlertType.HEAD_NODDING -> "Cabeceo detectado - ¡DETENGA EL VEHÍCULO!"
        AlertType.EYE_RUB -> "Frotamiento de ojos - Señal de fatiga"
    }
}