package com.example.driverdrowsinessdetectorapp.di

import android.content.Context
import com.example.driverdrowsinessdetectorapp.data.remote.websocket.GPSWebSocketManager
import com.example.driverdrowsinessdetectorapp.domain.usecase.gps.StartGPSTrackingUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.gps.StopGPSTrackingUseCase
import com.example.driverdrowsinessdetectorapp.services.GPSTrackingService
import com.example.driverdrowsinessdetectorapp.util.NetworkUtil
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object GPSModule {

    @Provides
    @Singleton
    fun provideGPSWebSocketManager(): GPSWebSocketManager {
        return GPSWebSocketManager()
    }

    @Provides
    @Singleton
    fun provideNetworkUtil(
        @ApplicationContext context: Context
    ): NetworkUtil {
        return NetworkUtil(context)
    }

    @Provides
    @Singleton
    fun provideGPSTrackingService(
        @ApplicationContext context: Context,
        gpsWebSocketManager: GPSWebSocketManager,
        networkUtil: NetworkUtil
    ): GPSTrackingService {
        return GPSTrackingService(context, gpsWebSocketManager, networkUtil)
    }

    @Provides
    fun provideStartGPSTrackingUseCase(
        gpsTrackingService: GPSTrackingService
    ): StartGPSTrackingUseCase {
        return StartGPSTrackingUseCase(gpsTrackingService)
    }

    @Provides
    fun provideStopGPSTrackingUseCase(
        gpsTrackingService: GPSTrackingService
    ): StopGPSTrackingUseCase {
        return StopGPSTrackingUseCase(gpsTrackingService)
    }
}