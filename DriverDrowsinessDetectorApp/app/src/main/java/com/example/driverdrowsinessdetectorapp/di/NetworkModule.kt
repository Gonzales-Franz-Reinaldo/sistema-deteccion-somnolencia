package com.example.driverdrowsinessdetectorapp.di

import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.remote.api.AuthApi
import com.example.driverdrowsinessdetectorapp.data.remote.api.EventosApi
import com.example.driverdrowsinessdetectorapp.data.remote.api.ViajesApi
import com.example.driverdrowsinessdetectorapp.data.remote.interceptor.AuthInterceptor
import com.example.driverdrowsinessdetectorapp.data.remote.interceptor.LoggingInterceptor
import com.example.driverdrowsinessdetectorapp.data.remote.interceptor.TokenAuthenticator
import com.example.driverdrowsinessdetectorapp.data.repository.AuthRepositoryImpl
import com.example.driverdrowsinessdetectorapp.data.repository.ViajeRepositoryImpl
import com.example.driverdrowsinessdetectorapp.domain.repository.AuthRepository
import com.example.driverdrowsinessdetectorapp.domain.repository.ViajeRepository
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * Módulo Hilt para configuración de red (Retrofit, OkHttp).
 * 
 * Proporciona:
 * - OkHttpClient configurado con interceptores
 * - Retrofit configurado
 * - APIs: AuthApi, EventosApi
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    // URL base del backend - cambiar según entorno
    private const val BASE_URL = "http://192.168.1.17:8000/"  // Para emulador Android
    // private const val BASE_URL = "http://192.168.X.X:8000/"  // Para dispositivo físico

    // CONFIGURACIÓN BASE

    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .setLenient()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .create()
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(
        preferencesManager: PreferencesManager
    ): AuthInterceptor {
        return AuthInterceptor(preferencesManager)
    }
    
    // Proveer TokenAuthenticator
    @Provides
    @Singleton
    fun provideTokenAuthenticator(
        preferencesManager: PreferencesManager,
        gson: Gson
    ): TokenAuthenticator {
        return TokenAuthenticator(preferencesManager, gson)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        tokenAuthenticator: TokenAuthenticator  
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(LoggingInterceptor.create())
            .authenticator(tokenAuthenticator)  
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, gson: Gson): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    // APIs

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }

    /**
     *  Provee EventosApi para sincronización de eventos.
     */
    @Provides
    @Singleton
    fun provideEventosApi(retrofit: Retrofit): EventosApi {
        return retrofit.create(EventosApi::class.java)
    }

    @Provides
    @Singleton
    fun provideViajesApi(retrofit: Retrofit): ViajesApi {
        return retrofit.create(ViajesApi::class.java)
    }

    // REPOSITORIES

    @Provides
    @Singleton
    fun provideAuthRepository(
        authApi: AuthApi,
        preferencesManager: PreferencesManager
    ): AuthRepository {
        return AuthRepositoryImpl(authApi, preferencesManager)
    }

    @Provides
    @Singleton
    fun provideViajeRepository(
        viajesApi: ViajesApi
    ): ViajeRepository {
        return ViajeRepositoryImpl(viajesApi)
    }
}

