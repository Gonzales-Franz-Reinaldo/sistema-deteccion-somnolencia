package com.example.driverdrowsinessdetectorapp.data.local.converter

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Converters para Room Database.
 * 
 * Permite almacenar tipos complejos como JSON en SQLite:
 * - List<Long> para duraciones de eventos
 * - Otros tipos que se necesiten en el futuro
 * 
 * @author Sistema de Detección de Somnolencia
 * @version 1.0
 */
class Converters {
    private val gson = Gson()
    
    // CONVERSORES PARA List<Long>
    
    @TypeConverter
    fun fromLongList(value: List<Long>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toLongList(value: String?): List<Long>? {
        return value?.let {
            val listType = object : TypeToken<List<Long>>() {}.type
            gson.fromJson(it, listType)
        }
    }
    
    // CONVERSORES PARA List<String> (futuro uso)
    
    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        return value?.let {
            val listType = object : TypeToken<List<String>>() {}.type
            gson.fromJson(it, listType)
        }
    }
    
    // CONVERSORES PARA Map<String, Any> (futuro uso para metadata)
    
    @TypeConverter
    fun fromMap(value: Map<String, Any>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toMap(value: String?): Map<String, Any>? {
        return value?.let {
            val mapType = object : TypeToken<Map<String, Any>>() {}.type
            gson.fromJson(it, mapType)
        }
    }
}