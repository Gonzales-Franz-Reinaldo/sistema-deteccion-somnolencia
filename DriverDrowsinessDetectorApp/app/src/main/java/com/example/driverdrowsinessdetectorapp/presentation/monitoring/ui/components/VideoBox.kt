package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.driverdrowsinessdetectorapp.ui.theme.PrimaryPurple

/**
 * Componente reutilizable para mostrar videos (Original y Análisis)
 *  Composición sobre duplicación
 */
@Composable
fun VideoBox(
    title: String,
    showContent: Boolean,
    isProcessing: Boolean,
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Column(modifier = modifier.fillMaxWidth()) {
        // Título
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = PrimaryPurple,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        // Card contenedor
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(4f / 3f),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF1E293B)
            )
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (showContent) {
                    content()
                } else {
                    PlaceholderContent(
                        message = "Esperando video...",
                        isAnalysis = title.contains("Análisis")
                    )
                }
            }
        }
    }
}

/**
 * Contenido placeholder cuando no hay video
 */
@Composable
private fun PlaceholderContent(
    message: String,
    isAnalysis: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = if (isAnalysis) Icons.Default.Person else Icons.Default.CameraAlt,
            contentDescription = null,
            tint = Color.Gray,
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = message,
            color = Color.Gray,
            fontSize = 14.sp
        )
    }
}

/**
 * Placeholder para el análisis visual
 */
@Composable
fun AnalysisPlaceholder() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        Icon(
            imageVector = Icons.Default.Person,
            contentDescription = null,
            tint = Color(0xFF4CAF50),
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Analizando puntos faciales...",
            color = Color.White,
            fontSize = 14.sp
        )
    }
}