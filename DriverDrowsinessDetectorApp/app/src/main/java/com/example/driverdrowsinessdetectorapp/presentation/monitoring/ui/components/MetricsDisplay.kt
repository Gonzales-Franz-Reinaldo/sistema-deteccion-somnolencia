package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import com.example.driverdrowsinessdetectorapp.domain.model.MetricasSomnolencia

@Composable
fun MetricsDisplay(
    metrics: MetricasSomnolencia,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.Black.copy(alpha = 0.7f)
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Título
            Text(
                text = "Análisis de Puntos",
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Grid de métricas principales
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                MetricItem(
                    label = "EAR",
                    value = String.format("%.3f", metrics.ear),
                    isGood = metrics.ear >= 0.20f
                )

                MetricItem(
                    label = "MAR",
                    value = String.format("%.3f", metrics.mar),
                    isGood = metrics.mar <= 0.6f
                )

                MetricItem(
                    label = "Pitch",
                    value = String.format("%.1f°", metrics.headPose.pitch),
                    isGood = kotlin.math.abs(metrics.headPose.pitch) <= 30f
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Contadores (Grid 2x2)
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Fila 1
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    CounterItem(
                        icon = "👁️",
                        label = "Parpadeos",
                        count = metrics.blinkCount,
                        modifier = Modifier.weight(1f)
                    )

                    CounterItem(
                        icon = "😴",
                        label = "Microsueños",
                        count = metrics.microsleepCount,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Fila 2
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    CounterItem(
                        icon = "🥱",
                        label = "Bostezos",
                        count = metrics.yawnCount,
                        modifier = Modifier.weight(1f)
                    )

                    CounterItem(
                        icon = "🙇",
                        label = "Cabeceos",
                        count = metrics.noddingCount,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Estado actual
            if (metrics.isBlinking || metrics.isMicrosleep || metrics.isYawning || metrics.isNodding) {
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    val statusText = when {
                        metrics.isMicrosleep -> "⚠️ Ojos cerrados prolongadamente"
                        metrics.isBlinking -> "👁️ Parpadeo detectado"
                        metrics.isYawning -> "🥱 Boca abierta (bostezo)"
                        metrics.isNodding -> "🙇 Cabeza inclinada"
                        else -> "Analizando..."
                    }
                    
                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Yellow
                    )
                }
            }
        }
    }
}

@Composable
private fun MetricItem(
    label: String,
    value: String,
    isGood: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.7f),
            fontSize = 10.sp
        )
        
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = if (isGood) Color.Green else Color.Red,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun CounterItem(
    icon: String,
    label: String,
    count: Int,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
    ) {
        Text(
            text = icon,
            fontSize = 20.sp
        )
        
        Text(
            text = "$count",
            style = MaterialTheme.typography.titleMedium,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.7f),
            fontSize = 10.sp
        )
    }
}