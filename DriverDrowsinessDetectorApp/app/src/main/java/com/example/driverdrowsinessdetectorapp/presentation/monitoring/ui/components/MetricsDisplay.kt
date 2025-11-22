package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose
import com.example.driverdrowsinessdetectorapp.ui.theme.Orange 

@Composable
fun MetricsDisplay(
    ear: Float, // Eye Aspect Ratio
    mar: Float, // Mouth Aspect Ratio
    headPose: HeadPose,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Black.copy(alpha = 0.6f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // EAR (Detección de ojos)
            MetricItem(
                label = "EAR",
                value = String.format("%.3f", ear),
                color = if (ear < 0.2f) Color.Red else Color.Green
            )

            // MAR (Detección de boca/bostezo)
            MetricItem(
                label = "MAR",
                value = String.format("%.3f", mar),
                color = if (mar > 0.6f) Color.Yellow else Color.Green
            )

            // Head Pose (Pitch)
            MetricItem(
                label = "Pitch",
                value = String.format("%.1f°", headPose.pitch),
                color = if (kotlin.math.abs(headPose.pitch) > 20f) Orange else Color.Green
            )

            // Head Pose (Yaw)
            MetricItem(
                label = "Yaw",
                value = String.format("%.1f°", headPose.yaw),
                color = if (kotlin.math.abs(headPose.yaw) > 30f) Orange else Color.Green
            )
        }
    }
}

@Composable
private fun MetricItem(
    label: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = label,
            fontSize = 10.sp,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .background(color.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = value,
                fontSize = 12.sp,
                color = color,
                fontWeight = FontWeight.Bold
            )
        }
    }
}