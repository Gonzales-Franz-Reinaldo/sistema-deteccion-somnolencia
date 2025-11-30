package com.example.driverdrowsinessdetectorapp.presentation.main.navigation

import java.net.URLEncoder
import java.nio.charset.StandardCharsets

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Dashboard : Screen("dashboard")
    
    //  Ruta con 3 parámetros
    data object Monitoring : Screen("monitoring/{idViaje}/{origen}/{destino}") {
        fun createRoute(idViaje: Int, origen: String, destino: String): String {
            val origenEncoded = URLEncoder.encode(origen, StandardCharsets.UTF_8.toString())
            val destinoEncoded = URLEncoder.encode(destino, StandardCharsets.UTF_8.toString())
            return "monitoring/$idViaje/$origenEncoded/$destinoEncoded"
        }
    }
}