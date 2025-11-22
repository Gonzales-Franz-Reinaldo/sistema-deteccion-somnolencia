package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel

@Composable
fun AlertBanner(
    alertLevel: AlertLevel,
    message: String,
    modifier: Modifier = Modifier
) {
    // Animación de parpadeo para alerta crítica
    val infiniteTransition = rememberInfiniteTransition(label = "alert_blink")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (alertLevel == AlertLevel.CRITICAL) 0.3f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alert_alpha"
    )

    val backgroundColor = when (alertLevel) {
        AlertLevel.NORMAL -> Color.Green
        AlertLevel.WARNING -> Color(0xFFFF9800) // Orange
        AlertLevel.CRITICAL -> Color.Red
    }

    AnimatedVisibility(
        visible = alertLevel != AlertLevel.NORMAL,
        enter = slideInVertically() + fadeIn(),
        exit = slideOutVertically() + fadeOut()
    ) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .background(backgroundColor.copy(alpha = alpha))
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = message,
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}