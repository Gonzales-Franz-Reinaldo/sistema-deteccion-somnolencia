package com.example.driverdrowsinessdetectorapp.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import com.example.driverdrowsinessdetectorapp.data.local.converter.Converters
import com.example.driverdrowsinessdetectorapp.data.local.dao.*
import com.example.driverdrowsinessdetectorapp.data.local.entity.*

@Database(
    entities = [
        SessionEntity::class,
        AlertEntity::class,
        LocationEntity::class,
        MetricsEntity::class,
        EventoSomnolenciaEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    // Funciones abstractas para obtener las instancias de los Data Access Objects (DAOs)
    abstract fun sessionDao(): SessionDao
    abstract fun alertDao(): AlertDao
    abstract fun locationDao(): LocationDao
    abstract fun metricsDao(): MetricsDao
    abstract fun eventoSomnolenciaDao(): EventoSomnolenciaDao

    companion object {
        // Nombre del archivo de la base de datos
        const val DATABASE_NAME = "drowsiness_detector.db"

        // Array para futuras migraciones (actualmente vacío)
        val ALL_MIGRATIONS = arrayOf<Migration>()
    }
}