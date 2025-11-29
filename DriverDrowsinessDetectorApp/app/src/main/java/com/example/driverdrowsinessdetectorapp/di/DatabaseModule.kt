package com.example.driverdrowsinessdetectorapp.di

import android.content.Context
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.driverdrowsinessdetectorapp.data.local.dao.*
import com.example.driverdrowsinessdetectorapp.data.local.database.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context
    ): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            AppDatabase.DATABASE_NAME
        )
            .addMigrations(*AppDatabase.ALL_MIGRATIONS)
            // Usar fallback destructivo SOLO en desarrollo
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideSessionDao(database: AppDatabase): SessionDao {
        return database.sessionDao()
    }

    @Provides
    @Singleton
    fun provideAlertDao(database: AppDatabase): AlertDao {
        return database.alertDao()
    }

    @Provides
    @Singleton
    fun provideLocationDao(database: AppDatabase): LocationDao {
        return database.locationDao()
    }

    @Provides
    @Singleton
    fun provideMetricsDao(database: AppDatabase): MetricsDao {
        return database.metricsDao()
    }

    @Provides
    @Singleton
    fun provideEventoSomnolenciaDao(database: AppDatabase): EventoSomnolenciaDao {
        return database.eventoSomnolenciaDao()
    }
}