package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel

@Composable
fun StatusIndicator(
    alertLevel: AlertLevel,
    modifier: Modifier = Modifier
) {
    // Animación de pulso
    val infiniteTransition = rememberInfiniteTransition(label = "status_pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "status_scale"
    )

    val (color, text) = when (alertLevel) {
        AlertLevel.NORMAL -> Color.Green to "Normal"
        AlertLevel.WARNING -> Color(0xFFFF9800) to "Alerta"
        AlertLevel.CRITICAL -> Color.Red to "¡CRÍTICO!"
    }

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Indicador circular parpadeante
        Box(
            modifier = Modifier
                .size(16.dp)
                .scale(if (alertLevel == AlertLevel.CRITICAL) scale else 1f)
                .background(color, CircleShape)
        )

        Text(
            text = text,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}