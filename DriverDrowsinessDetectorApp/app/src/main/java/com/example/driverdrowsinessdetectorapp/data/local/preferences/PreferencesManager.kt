package com.example.driverdrowsinessdetectorapp.data.local.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.driverdrowsinessdetectorapp.domain.model.User
import com.example.driverdrowsinessdetectorapp.util.Constants
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
    name = Constants.PREFS_NAME
)

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore

    // ═══════════════════════════════════════════════════════════════
    // KEYS
    // ═══════════════════════════════════════════════════════════════
    private val KEY_TOKEN = stringPreferencesKey(Constants.KEY_AUTH_TOKEN)
    private val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token") 
    private val KEY_USER_ID = intPreferencesKey(Constants.KEY_USER_ID)
    private val KEY_USERNAME = stringPreferencesKey(Constants.KEY_USERNAME)
    private val KEY_FULL_NAME = stringPreferencesKey(Constants.KEY_FULL_NAME)
    private val KEY_ROLE = stringPreferencesKey(Constants.KEY_ROLE)
    private val KEY_EMAIL = stringPreferencesKey("user_email")
    private val KEY_ACTIVE = booleanPreferencesKey("user_active")

    // ═══════════════════════════════════════════════════════════════
    // GUARDAR DATOS DE AUTENTICACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Guarda todos los datos de autenticación (con refresh token).
     */
    suspend fun saveAuthData(accessToken: String, refreshToken: String, user: User) {
        dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = accessToken
            prefs[KEY_REFRESH_TOKEN] = refreshToken
            prefs[KEY_USER_ID] = user.id
            prefs[KEY_USERNAME] = user.username
            prefs[KEY_FULL_NAME] = user.fullName
            prefs[KEY_ROLE] = user.role
            user.email?.let { prefs[KEY_EMAIL] = it }
            prefs[KEY_ACTIVE] = user.active
        }
    }
    
    /**
     * Método de compatibilidad (sin refresh token).
     */
    suspend fun saveAuthData(token: String, user: User) {
        saveAuthData(token, "", user)
    }

    /**
     * Actualiza solo el access token (para refresh).
     */
    suspend fun updateAccessToken(newToken: String) {
        dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = newToken
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // OBTENER DATOS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Obtiene el token de autenticación.
     * ← USADO POR: AuthInterceptor, SyncUseCase, etc.
     */
    fun getAuthToken(): Flow<String?> = dataStore.data.map { prefs ->
        prefs[KEY_TOKEN]
    }
    
    /**
     * Obtiene el token de acceso (ALIAS de getAuthToken para compatibilidad).
     * ← USADO POR: EventoWebSocketManager, GPSWebSocketManager
     */
    fun getAccessToken(): Flow<String?> = dataStore.data.map { prefs ->
        prefs[KEY_TOKEN]
    }
    
    /**
     * Obtiene el refresh token.
     */
    fun getRefreshToken(): Flow<String?> = dataStore.data.map { prefs ->
        prefs[KEY_REFRESH_TOKEN]
    }

    /**
     * Obtiene el ID del usuario.
     */
    fun getUserId(): Flow<Int?> = dataStore.data.map { prefs ->
        prefs[KEY_USER_ID]
    }

    /**
     * Obtiene el nombre completo.
     */
    fun getFullName(): Flow<String?> = dataStore.data.map { prefs ->
        prefs[KEY_FULL_NAME]
    }

    /**
     * Obtiene el rol.
     */
    fun getRole(): Flow<String?> = dataStore.data.map { prefs ->
        prefs[KEY_ROLE]
    }

    /**
     * Obtiene todos los datos del usuario.
     */
    fun getUserData(): Flow<User?> = dataStore.data.map { prefs ->
        val userId = prefs[KEY_USER_ID]
        val username = prefs[KEY_USERNAME]
        val fullName = prefs[KEY_FULL_NAME]
        val role = prefs[KEY_ROLE]

        if (userId != null && username != null && fullName != null && role != null) {
            User(
                id = userId,
                username = username,
                fullName = fullName,
                role = role,
                email = prefs[KEY_EMAIL],
                active = prefs[KEY_ACTIVE] ?: true
            )
        } else {
            null
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LIMPIAR DATOS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Limpia todos los datos de autenticación.
     */
    suspend fun clearAuthData() {
        dataStore.edit { prefs ->
            prefs.clear()
        }
    }
    
    /**
     * Limpia solo el token de acceso.
     */
    suspend fun clearAccessToken() {
        dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // VERIFICACIONES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Verifica si el usuario está logueado.
     */
    fun isLoggedIn(): Flow<Boolean> = dataStore.data.map { prefs ->
        !prefs[KEY_TOKEN].isNullOrBlank()
    }
    
    /**
     * Guarda el token de acceso (para compatibilidad).
     */
    suspend fun saveAccessToken(token: String) {
        dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
        }
    }
}