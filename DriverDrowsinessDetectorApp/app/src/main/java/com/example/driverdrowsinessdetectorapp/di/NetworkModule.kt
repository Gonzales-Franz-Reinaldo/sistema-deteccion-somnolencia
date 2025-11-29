package com.example.driverdrowsinessdetectorapp.di

import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.remote.api.AuthApi
import com.example.driverdrowsinessdetectorapp.data.remote.api.EventosApi
import com.example.driverdrowsinessdetectorapp.data.remote.interceptor.AuthInterceptor
import com.example.driverdrowsinessdetectorapp.data.remote.interceptor.LoggingInterceptor
import com.example.driverdrowsinessdetectorapp.data.repository.AuthRepositoryImpl
import com.example.driverdrowsinessdetectorapp.domain.repository.AuthRepository
import com.example.driverdrowsinessdetectorapp.util.Constants
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

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(LoggingInterceptor.create())
            .connectTimeout(Constants.CONNECT_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(Constants.READ_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(Constants.WRITE_TIMEOUT, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        gson: Gson
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(Constants.BASE_URL)
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

    // REPOSITORIES

    @Provides
    @Singleton
    fun provideAuthRepository(
        authApi: AuthApi,
        preferencesManager: PreferencesManager
    ): AuthRepository {
        return AuthRepositoryImpl(authApi, preferencesManager)
    }
}

