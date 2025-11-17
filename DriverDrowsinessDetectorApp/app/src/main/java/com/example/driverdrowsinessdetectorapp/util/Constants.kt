package com.example.driverdrowsinessdetectorapp.util

object Constants {
    // =========================================
    // 🔧 CONFIGURACIÓN DE RED
    // =========================================
    
    /**
     * BASE_URL del backend FastAPI
     * 
     * IMPORTANTE: Cambiar según tu entorno de desarrollo
     * 
     * OPCIONES:
     * 
     * 1️⃣ EMULADOR DE ANDROID STUDIO (backend en la misma PC):
     *    const val BASE_URL = "http://10.0.2.2:8000/"
     *    ✅ Usa 10.0.2.2 que apunta al localhost de tu PC
     * 
     * 2️⃣ DISPOSITIVO FÍSICO conectado por USB o WiFi (backend en PC local):
     *    const val BASE_URL = "http://192.168.1.XXX:8000/"
     *    ✅ Reemplaza 192.168.1.XXX con la IP de tu PC en la red local
     *    ⚠️  Para obtener tu IP en Linux: hostname -I | awk '{print $1}'
     * 
     * 3️⃣ SERVIDOR REMOTO EN PRODUCCIÓN:
     *    const val BASE_URL = "https://api.tu-dominio.com/"
     *    ✅ Cambia http:// por https:// en producción
     */
    
    // 👇 CAMBIA ESTA LÍNEA SEGÚN TU CASO
    const val BASE_URL = "http://192.168.1.17:8000/"  // ← REEMPLAZA 192.168.1.100 CON TU IP
    
    // =========================================
    // ⏱️ CONFIGURACIÓN DE TIMEOUTS
    // =========================================
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
    const val WRITE_TIMEOUT = 30L
    
    // =========================================
    // 💾 DATASTORE KEYS
    // =========================================
    const val PREFS_NAME = "driver_drowsiness_prefs"
    const val KEY_AUTH_TOKEN = "auth_token"
    const val KEY_USER_ID = "user_id"
    const val KEY_USERNAME = "username"
    const val KEY_FULL_NAME = "full_name"
    const val KEY_ROLE = "role"
}