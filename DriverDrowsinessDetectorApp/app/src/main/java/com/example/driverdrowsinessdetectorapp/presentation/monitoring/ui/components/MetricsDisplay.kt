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
                    value = String.format("%.2f", metrics.ear),
                    isGood = metrics.ear > 0.2f
                )

                MetricItem(
                    label = "MAR",
                    value = String.format("%.2f", metrics.mar),
                    isGood = metrics.mar < 0.6f
                )

                MetricItem(
                    label = "Estado",
                    value = when (metrics.alertLevel) {
                        AlertLevel.NORMAL -> "OK"
                        AlertLevel.MEDIUM -> "⚠️"
                        AlertLevel.HIGH -> "🚨"
                        AlertLevel.CRITICAL -> "🔴"
                    },
                    isGood = metrics.alertLevel == AlertLevel.NORMAL
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // CONTADORES DE EVENTOS
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Parpadeos
                CounterItem(
                    icon = "👁️",
                    label = "Parpadeos",
                    count = metrics.blinkCount,
                    modifier = Modifier.weight(1f)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // Bostezos
                CounterItem(
                    icon = "🥱",
                    label = "Bostezos",
                    count = metrics.yawnCount,
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Microsueños
                CounterItem(
                    icon = "😴",
                    label = "Microsueños",
                    count = metrics.microsleepCount,
                    modifier = Modifier.weight(1f)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // Cabeceos
                CounterItem(
                    icon = "🙇",
                    label = "Cabeceos",
                    count = metrics.noddingCount,
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            //  DOS CONTADORES DE FROTAMIENTO
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // 🆕 MANO IZQUIERDA (del usuario)
                CounterItem(
                    icon = "👈",
                    label = "Mano Izq",  // ← CLARIFICAR
                    count = metrics.eyeRubFirstHandCount,
                    modifier = Modifier.weight(1f)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                // 🆕 MANO DERECHA (del usuario)
                CounterItem(
                    icon = "👉",
                    label = "Mano Der",  // ← CLARIFICAR
                    count = metrics.eyeRubSecondHandCount,
                    modifier = Modifier.weight(1f)
                )
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
        modifier = modifier
            .background(
                color = Color.White.copy(alpha = 0.1f),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = icon,
            fontSize = 24.sp
        )
        
        Text(
            text = count.toString(),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = if (count > 0) Color(0xFFFF9800) else Color.Gray
        )
        
        Text(
            text = label,
            fontSize = 10.sp,
            color = Color.Gray
        )
    }
}