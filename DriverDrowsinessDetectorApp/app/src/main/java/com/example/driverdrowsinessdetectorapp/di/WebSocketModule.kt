package com.example.driverdrowsinessdetectorapp.di

import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.EventoWebSocketManager
import com.example.driverdrowsinessdetectorapp.domain.usecase.evento.SendEventoRealtimeUseCase
import com.google.gson.Gson
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Módulo Hilt para proveer dependencias relacionadas con WebSocket.
 */
@Module
@InstallIn(SingletonComponent::class)
object WebSocketModule {
    
    @Provides
    @Singleton
    fun provideEventoWebSocketManager(
        preferencesManager: PreferencesManager,
        gson: Gson
    ): EventoWebSocketManager {
        return EventoWebSocketManager(preferencesManager, gson)
    }
    
    @Provides
    @Singleton
    fun provideSendEventoRealtimeUseCase(
        eventoWebSocketManager: EventoWebSocketManager,
        locationService: LocationService
    ): SendEventoRealtimeUseCase {
        return SendEventoRealtimeUseCase(eventoWebSocketManager, locationService)
    }
}