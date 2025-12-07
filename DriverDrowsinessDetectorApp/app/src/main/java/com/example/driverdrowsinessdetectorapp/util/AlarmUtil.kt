package com.example.driverdrowsinessdetectorapp.util

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import com.example.driverdrowsinessdetectorapp.R
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
    private val audioManager: AudioManager by lazy {
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }
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
     *  Reproducir alarma según el nivel de alerta
     */
    fun playAlarm(alertLevel: AlertLevel) {
        when (alertLevel) {
            AlertLevel.NORMAL -> {
                stopAlarm()
            }
            
            AlertLevel.MEDIUM -> {
                //  Solo vibración para advertencias leves
                vibrateShort()
                Log.d(TAG, "Vibración MEDIUM activada")
            }
            
            AlertLevel.HIGH -> {
                //  Solo vibración para advertencias moderadas
                vibrateLong()
                Log.d(TAG, "Vibración HIGH activada")
            }
            
            AlertLevel.CRITICAL -> {
                //  ALARMA SONORA + VIBRACIÓN para microsueño/cabeceo
                playCriticalAlarm()
                Log.d(TAG, "ALARMA CRÍTICA ACTIVADA - Volumen máximo + Sirena")
            }
        }
    }

    /**
     *  Reproducir alarma crítica (microsueño/cabeceo)
     */
    private fun playCriticalAlarm() {
        try {
            // Detener cualquier reproducción anterior
            stopAlarm()
            
            // Configurar volumen al MÁXIMO
            setMaxVolume()
            
            // Reproducir alarma_sonora.mp3 en loop
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer.create(context, R.raw.alarma_sonora).apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
                isLooping = true  // ← Repetir hasta que se detenga manualmente
                setOnErrorListener { _, what, extra ->
                    Log.e(TAG, "Error MediaPlayer: what=$what, extra=$extra")
                    false
                }
                start()
            }
            
            // Vibrar continuamente
            vibrateContinuous()
            
            Log.d(TAG, "Alarma sonora iniciada (alarma_sonora.mp3)")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error al reproducir alarma crítica: ${e.message}", e)
        }
    }

    /**
     *  Configurar volumen al MÁXIMO (100%)
     */
    private fun setMaxVolume() {
        try {
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0)
            Log.d(TAG, "Volumen configurado al MÁXIMO: $maxVolume")
        } catch (e: Exception) {
            Log.e(TAG, "Error al configurar volumen: ${e.message}", e)
        }
    }

    /**
     *  Vibración corta (500ms) - Para MEDIUM
     */
    private fun vibrateShort() {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE)
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(500)
            }
            Log.d(TAG, "Vibración corta")
        } catch (e: Exception) {
            Log.e(TAG, "Error al vibrar: ${e.message}", e)
        }
    }

    /**
     *  Vibración larga (patrón intermitente) - Para HIGH
     */
    private fun vibrateLong() {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(
                    longArrayOf(0, 300, 100, 300, 100, 300), // Patrón: espera, vibra, pausa, vibra...
                    -1  // No repetir
                )
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(longArrayOf(0, 300, 100, 300, 100, 300), -1)
            }
            Log.d(TAG, "Vibración larga")
        } catch (e: Exception) {
            Log.e(TAG, "Error al vibrar: ${e.message}", e)
        }
    }

    /**
     *  Vibración continua (bucle) - Para CRITICAL
     */
    private fun vibrateContinuous() {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(
                    longArrayOf(0, 500, 200, 500, 200), // Patrón fuerte
                    0  // ← Repetir desde el índice 0 (bucle infinito)
                )
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(longArrayOf(0, 500, 200, 500, 200), 0)
            }
            Log.d(TAG, "Vibración continua iniciada")
        } catch (e: Exception) {
            Log.e(TAG, "Error al vibrar: ${e.message}", e)
        }
    }

    /**
     *  Detener alarma
     */
    fun stopAlarm() {
        try {
            // Detener MediaPlayer
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                }
                release()
            }
            mediaPlayer = null
            
            // Detener vibración
            vibrator.cancel()
            
            Log.d(TAG, "Alarma detenida")
        } catch (e: Exception) {
            Log.e(TAG, "Error al detener alarma: ${e.message}", e)
        }
    }

    /**
     *  Limpiar recursos
     */
    fun release() {
        stopAlarm()
    }
}