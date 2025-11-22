package com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

@Composable
fun PermissionRequestDialog(
    permissionName: String,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = Color(0xFFFF9800)
            )
        },
        title = {
            Text("Permiso Requerido")
        },
        text = {
            Text("Se requiere permiso de $permissionName para continuar con el monitoreo.")
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("Conceder")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}