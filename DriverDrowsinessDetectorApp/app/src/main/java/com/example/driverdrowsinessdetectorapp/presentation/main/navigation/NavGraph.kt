package com.example.driverdrowsinessdetectorapp.presentation.main.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.driverdrowsinessdetectorapp.presentation.auth.ui.LoginScreen
import com.example.driverdrowsinessdetectorapp.presentation.dashboard.ui.DashboardScreen
import com.example.driverdrowsinessdetectorapp.presentation.monitoring.ui.MonitoringScreen
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // LOGIN
        composable(route = Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        // DASHBOARD
        composable(route = Screen.Dashboard.route) {
            DashboardScreen(
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onStartMonitoring = { idViaje, origen, destino ->
                    navController.navigate(
                        Screen.Monitoring.createRoute(idViaje, origen, destino)
                    )
                }
            )
        }
        
        // MONITORING con parámetros
        composable(
            route = Screen.Monitoring.route,
            arguments = listOf(
                navArgument("idViaje") { type = NavType.IntType },
                navArgument("origen") { type = NavType.StringType },
                navArgument("destino") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val idViaje = backStackEntry.arguments?.getInt("idViaje") ?: 0
            val origen = URLDecoder.decode(
                backStackEntry.arguments?.getString("origen") ?: "",
                StandardCharsets.UTF_8.toString()
            )
            val destino = URLDecoder.decode(
                backStackEntry.arguments?.getString("destino") ?: "",
                StandardCharsets.UTF_8.toString()
            )
            
            MonitoringScreen(
                idViaje = idViaje,
                origen = origen,
                destino = destino,
                onNavigateBack = {
                    navController.popBackStack()
                },
                onViajeCompletado = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                },
                onViajePausado = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                }
            )
        }
    }
}