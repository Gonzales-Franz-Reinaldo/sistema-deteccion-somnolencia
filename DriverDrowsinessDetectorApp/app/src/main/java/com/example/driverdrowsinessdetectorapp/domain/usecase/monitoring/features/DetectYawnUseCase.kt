package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.MouthDistances
import javax.inject.Inject

class DetectYawnUseCase @Inject constructor() {
    
    companion object {
        private const val TAG = "DetectYawnUseCase"
        private const val YAWN_DURATION_MS = 4000L
    }
    
    private var mouthOpenStartTime: Long? = null
    private var yawnCount = 0
    private val yawnDurations = mutableListOf<Long>()
    private var isCurrentlyYawning = false
    private var isMouthOpen = false // ✅ NUEVO: Estado boca abierta
    
    operator fun invoke(mouthDistances: MouthDistances): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        // ✅ LÓGICA PYTHON EXACTA
        // if distancia_labios > distancia_menton:
        //     self.boca_abierta = True
        if (mouthDistances.distanciaLabios > mouthDistances.distanciaMenton) {
            if (!isMouthOpen) {
                // Boca recién abierta
                mouthOpenStartTime = currentTime
                isCurrentlyYawning = false
                isMouthOpen = true
                Log.d(TAG, "👄 Boca abierta")
            }
            
            val duration = currentTime - (mouthOpenStartTime ?: currentTime)
            Log.d(TAG, "⏱️ Boca abierta: ${duration}ms")
            
        } else {
            // elif distancia_labios < distancia_menton:
            //     self.boca_abierta = False
            if (isMouthOpen) {
                // Boca recién cerrada - CALCULAR DURACIÓN
                val duration = currentTime - (mouthOpenStartTime ?: currentTime)
                isMouthOpen = false
                mouthOpenStartTime = null
                
                // ✅ BOSTEZO = BOCA ABIERTA > 4 SEGUNDOS
                if (duration > YAWN_DURATION_MS && !isCurrentlyYawning) {
                    isCurrentlyYawning = true
                    yawnCount++
                    yawnDurations.add(duration)
                    Log.d(TAG, "🚨 BOSTEZO: ${duration}ms (count=$yawnCount)")
                    return Triple(true, yawnCount, yawnDurations)
                } else {
                    Log.d(TAG, "👄 Boca cerrada (duración: ${duration}ms)")
                }
            }
        }
        
        return Triple(false, yawnCount, yawnDurations)
    }
    
    fun reset() {
        mouthOpenStartTime = null
        yawnCount = 0
        yawnDurations.clear()
        isCurrentlyYawning = false
        isMouthOpen = false
    }
}