package com.example.driverdrowsinessdetectorapp.di

import android.content.Context
import com.example.driverdrowsinessdetectorapp.data.remote.api.EventosApi
import com.example.driverdrowsinessdetectorapp.data.sync.ConnectivitySyncService
import com.example.driverdrowsinessdetectorapp.data.sync.NetworkConnectivityObserver
import com.example.driverdrowsinessdetectorapp.data.sync.SyncManager
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.domain.usecase.sync.SyncEventosUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Módulo Hilt para inyección de dependencias de sincronización.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Module
@InstallIn(SingletonComponent::class)
object WorkerModule {
    
    @Provides
    @Singleton
    fun provideSyncEventosUseCase(
        @ApplicationContext context: Context,
        eventoRepository: EventoSomnolenciaRepository,
        eventosApi: EventosApi
    ): SyncEventosUseCase {
        return SyncEventosUseCase(context, eventoRepository, eventosApi)
    }
    
    @Provides
    @Singleton
    fun provideSyncManager(
        @ApplicationContext context: Context
    ): SyncManager {
        return SyncManager(context)
    }
    
    // NetworkConnectivityObserver
    @Provides
    @Singleton
    fun provideNetworkConnectivityObserver(
        @ApplicationContext context: Context
    ): NetworkConnectivityObserver {
        return NetworkConnectivityObserver(context)
    }
    
    // ConnectivitySyncService
    @Provides
    @Singleton
    fun provideConnectivitySyncService(
        networkObserver: NetworkConnectivityObserver,
        syncEventosUseCase: SyncEventosUseCase
    ): ConnectivitySyncService {
        return ConnectivitySyncService(networkObserver, syncEventosUseCase)
    }
}