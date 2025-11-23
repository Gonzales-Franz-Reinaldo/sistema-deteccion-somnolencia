package com.example.driverdrowsinessdetectorapp.util

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import com.example.driverdrowsinessdetectorapp.domain.model.AlertLevel
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AlarmUtil @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "AlarmUtil"
    }

    private var mediaPlayer: MediaPlayer? = null
    private val vibrator: Vibrator by lazy {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    /**
     * Reproducir alarma según el nivel de alerta
     */
    fun playAlarm(alertLevel: AlertLevel) {
        when (alertLevel) {
            AlertLevel.NORMAL -> {
                // Sin alarma
                stopAlarm()
            }
            AlertLevel.MEDIUM -> {
                // playSound(R.raw.alert_sound_medium) // ← COMENTADO TEMPORALMENTE
                vibrate(VibrationPattern.SHORT)
                Log.d(TAG, "🔊 Alarma MEDIUM (solo vibración)")
            }
            AlertLevel.HIGH -> {
                // playSound(R.raw.alert_sound_critical) // ← COMENTADO TEMPORALMENTE
                vibrate(VibrationPattern.LONG)
                Log.d(TAG, "🔊 Alarma HIGH (solo vibración)")
            }
            AlertLevel.CRITICAL -> {
                // playSound(R.raw.alert_sound_critical) // ← COMENTADO TEMPORALMENTE
                vibrate(VibrationPattern.CONTINUOUS)
                Log.d(TAG, "🔊 Alarma CRITICAL (solo vibración)")
            }
        }
    }

    /**
     * Reproducir sonido (DESACTIVADO TEMPORALMENTE)
     */
    private fun playSound(resourceId: Int) {
        // TODO: Implementar cuando se agreguen archivos de audio
        Log.w(TAG, "⚠️ Archivos de audio no disponibles")
    }

    /**
     * Vibrar dispositivo
     */
    private fun vibrate(pattern: VibrationPattern) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                val effect = when (pattern) {
                    VibrationPattern.SHORT -> VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE)
                    VibrationPattern.LONG -> VibrationEffect.createWaveform(longArrayOf(0, 200, 100, 200, 100, 200), -1)
                    VibrationPattern.CONTINUOUS -> VibrationEffect.createWaveform(longArrayOf(0, 500, 200, 500, 200), 0)
                }
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                when (pattern) {
                    VibrationPattern.SHORT -> vibrator.vibrate(500)
                    VibrationPattern.LONG -> vibrator.vibrate(longArrayOf(0, 200, 100, 200, 100, 200), -1)
                    VibrationPattern.CONTINUOUS -> vibrator.vibrate(longArrayOf(0, 500, 200, 500, 200), 0)
                }
            }
            Log.d(TAG, "📳 Vibrando dispositivo")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al vibrar: ${e.message}", e)
        }
    }

    /**
     * Detener alarma
     */
    fun stopAlarm() {
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
            vibrator.cancel()
            Log.d(TAG, "🛑 Alarma detenida")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error al detener alarma: ${e.message}", e)
        }
    }

    /**
     * Limpiar recursos
     */
    fun release() {
        stopAlarm()
    }

    private enum class VibrationPattern {
        SHORT,
        LONG,
        CONTINUOUS
    }
}