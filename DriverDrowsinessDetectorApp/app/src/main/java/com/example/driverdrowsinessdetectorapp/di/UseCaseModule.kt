package com.example.driverdrowsinessdetectorapp.di

import com.example.driverdrowsinessdetectorapp.data.mediapipe.FaceLandmarkerHelper
import com.example.driverdrowsinessdetectorapp.data.mediapipe.HandLandmarkerHelper
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.extraction.ExtractLandmarksUseCase
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.features.*
import com.example.driverdrowsinessdetectorapp.domain.usecase.monitoring.processing.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {
    
    // ========================================
    // ✅ WINDOWED COUNTER
    // ========================================
    
    @Provides
    @Singleton
    fun provideWindowedCounterUseCase(): WindowedCounterUseCase {
        return WindowedCounterUseCase()
    }
    
    // ========================================
    // EXTRACTION USE CASES
    // ========================================
    
    @Provides
    @Singleton
    fun provideExtractLandmarksUseCase(
        faceLandmarkerHelper: FaceLandmarkerHelper,
        handLandmarkerHelper: HandLandmarkerHelper
    ): ExtractLandmarksUseCase {
        return ExtractLandmarksUseCase(faceLandmarkerHelper, handLandmarkerHelper)
    }
    
    // ========================================
    // PROCESSING USE CASES
    // ========================================
    
    @Provides
    @Singleton
    fun provideCalculateEARUseCase(): CalculateEARUseCase {
        return CalculateEARUseCase()
    }
    
    @Provides
    @Singleton
    fun provideCalculateMARUseCase(): CalculateMARUseCase {
        return CalculateMARUseCase()
    }
    
    @Provides
    @Singleton
    fun provideDetectHeadPoseUseCase(): DetectHeadPoseUseCase {
        return DetectHeadPoseUseCase()
    }
    
    @Provides
    @Singleton
    fun provideDetectHandNearEyesUseCase(): DetectHandNearEyesUseCase {
        return DetectHandNearEyesUseCase()
    }
    
    // ========================================
    // FEATURES USE CASES
    // ========================================
    
    // ✅ NUEVO: Detección de parpadeo
    @Provides
    @Singleton
    fun provideDetectBlinkUseCase(
        windowedCounter: WindowedCounterUseCase
    ): DetectBlinkUseCase {
        return DetectBlinkUseCase(windowedCounter)
    }
    
    @Provides
    @Singleton
    fun provideDetectMicrosleepUseCase(): DetectMicrosleepUseCase {
        return DetectMicrosleepUseCase()
    }
    
    @Provides
    @Singleton
    fun provideDetectYawnUseCase(
        windowedCounter: WindowedCounterUseCase
    ): DetectYawnUseCase {
        return DetectYawnUseCase(windowedCounter)
    }
    
    @Provides
    @Singleton
    fun provideDetectNoddingUseCase(): DetectNoddingUseCase {
        return DetectNoddingUseCase()
    }
    
    @Provides
    @Singleton
    fun provideDetectEyeRubUseCase(): DetectEyeRubUseCase {
        return DetectEyeRubUseCase()
    }
    
    // ========================================
    // MAIN ORCHESTRATORS
    // ========================================
    
    @Provides
    @Singleton
    fun provideDetectDrowsinessUseCase(
        calculateEARUseCase: CalculateEARUseCase,
        calculateMARUseCase: CalculateMARUseCase,
        detectHeadPoseUseCase: DetectHeadPoseUseCase,
        detectHandNearEyesUseCase: DetectHandNearEyesUseCase,
        detectBlinkUseCase: DetectBlinkUseCase, // ✅ NUEVO
        detectMicrosleepUseCase: DetectMicrosleepUseCase,
        detectYawnUseCase: DetectYawnUseCase,
        detectNoddingUseCase: DetectNoddingUseCase,
        detectEyeRubUseCase: DetectEyeRubUseCase
    ): DetectDrowsinessUseCase {
        return DetectDrowsinessUseCase(
            calculateEARUseCase,
            calculateMARUseCase,
            detectHeadPoseUseCase,
            detectHandNearEyesUseCase,
            detectBlinkUseCase, // ✅ NUEVO
            detectMicrosleepUseCase,
            detectYawnUseCase,
            detectNoddingUseCase,
            detectEyeRubUseCase
        )
    }
    
    @Provides
    @Singleton
    fun provideProcessFrameUseCase(
        extractLandmarksUseCase: ExtractLandmarksUseCase,
        detectDrowsinessUseCase: DetectDrowsinessUseCase
    ): ProcessFrameUseCase {
        return ProcessFrameUseCase(extractLandmarksUseCase, detectDrowsinessUseCase)
    }
}