package com.example.driverdrowsinessdetectorapp.di

import android.content.Context
import com.example.driverdrowsinessdetectorapp.data.location.LocationService
import com.example.driverdrowsinessdetectorapp.data.local.dao.EventoSomnolenciaDao
import com.example.driverdrowsinessdetectorapp.data.local.dao.SessionDao
import com.example.driverdrowsinessdetectorapp.data.local.preferences.PreferencesManager
import com.example.driverdrowsinessdetectorapp.data.repository.EventoSomnolenciaRepositoryImpl
import com.example.driverdrowsinessdetectorapp.domain.repository.EventoSomnolenciaRepository
import com.example.driverdrowsinessdetectorapp.domain.session.SessionManager
import com.example.driverdrowsinessdetectorapp.domain.usecase.evento.SaveEventoSomnolenciaUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.location.GetCurrentLocationUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Módulo Hilt para inyección de dependencias de ubicación, eventos y sesiones.
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 2.0
 */
@Module
@InstallIn(SingletonComponent::class)
object LocationModule {

    // SERVICIOS DE UBICACIÓN
    
    @Provides
    @Singleton
    fun provideLocationService(
        @ApplicationContext context: Context
    ): LocationService {
        return LocationService(context)
    }
    
    @Provides
    @Singleton
    fun provideGetCurrentLocationUseCase(
        locationService: LocationService
    ): GetCurrentLocationUseCase {
        return GetCurrentLocationUseCase(locationService)
    }
    
    // REPOSITORY DE EVENTOS
    
    @Provides
    @Singleton
    fun provideEventoSomnolenciaRepository(
        eventoSomnolenciaDao: EventoSomnolenciaDao
    ): EventoSomnolenciaRepository {
        return EventoSomnolenciaRepositoryImpl(eventoSomnolenciaDao)
    }
    
    // USE CASES DE EVENTOS
    
    @Provides
    @Singleton
    fun provideSaveEventoSomnolenciaUseCase(
        eventoRepository: EventoSomnolenciaRepository,
        getCurrentLocationUseCase: GetCurrentLocationUseCase
    ): SaveEventoSomnolenciaUseCase {
        return SaveEventoSomnolenciaUseCase(eventoRepository, getCurrentLocationUseCase)
    }
    
    //: SESSION MANAGER
    
    @Provides
    @Singleton
    fun provideSessionManager(
        sessionDao: SessionDao,
        preferencesManager: PreferencesManager,
        locationService: LocationService
    ): SessionManager {
        return SessionManager(sessionDao, preferencesManager, locationService)
    }
}