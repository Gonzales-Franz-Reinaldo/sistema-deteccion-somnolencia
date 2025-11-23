package com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features

import com.example.driverdrowsinessdetectorapp.domain.model.HeadPose
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.HeadPosition
import javax.inject.Inject
import kotlin.math.abs

class DetectNoddingUseCase @Inject constructor() {
    
    companion object {
        private const val NODDING_DURATION_MS = 3000L
    }
    
    private var headDownStartTime: Long? = null
    private var noddingCount = 0
    private val noddingDurations = mutableListOf<Long>()
    private var isCurrentlyNodding = false
    
    operator fun invoke(headPosition: HeadPosition): Triple<Boolean, Int, List<Long>> {
        val currentTime = System.currentTimeMillis()
        
        if (headPosition.isHeadDown) {
            if (headDownStartTime == null) {
                headDownStartTime = currentTime
                isCurrentlyNodding = false
            }
            
            val duration = currentTime - (headDownStartTime ?: currentTime)
            
            if (duration >= NODDING_DURATION_MS && !isCurrentlyNodding) {
                isCurrentlyNodding = true
                noddingCount++
                noddingDurations.add(duration)
                return Triple(true, noddingCount, noddingDurations)
            }
            
            return Triple(false, noddingCount, noddingDurations)
        } else {
            headDownStartTime = null
            isCurrentlyNodding = false
        }
        
        return Triple(false, noddingCount, noddingDurations)
    }
    
    fun reset() {
        headDownStartTime = null
        noddingCount = 0
        noddingDurations.clear()
        isCurrentlyNodding = false
    }
}