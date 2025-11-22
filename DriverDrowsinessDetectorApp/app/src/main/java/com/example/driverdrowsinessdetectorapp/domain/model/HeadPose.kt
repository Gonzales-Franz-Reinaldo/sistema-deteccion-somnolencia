package com.example.driverdrowsinessdetectorapp.domain.model

/**
 * Representa la pose/orientación de la cabeza en 3D
 *
 * @param pitch Rotación vertical (arriba/abajo) en grados
 *              - Valores negativos: cabeza hacia abajo
 *              - Valores positivos: cabeza hacia arriba
 *              - Rango: -90° a +90°
 *
 * @param yaw Rotación horizontal (izquierda/derecha) en grados
 *            - Valores negativos: cabeza girada a la izquierda
 *            - Valores positivos: cabeza girada a la derecha
 *            - Rango: -90° a +90°
 *
 * @param roll Inclinación lateral en grados
 *             - Valores negativos: cabeza inclinada a la izquierda
 *             - Valores positivos: cabeza inclinada a la derecha
 *             - Rango: -180° a +180°
 */
data class HeadPose(
    val pitch: Float = 0f,
    val yaw: Float = 0f,
    val roll: Float = 0f
) {
    /**
     * Verifica si la cabeza está inclinada hacia abajo (pitch negativo)
     *
     * @param threshold Umbral en grados (por defecto 20°)
     * @return true si la cabeza está hacia abajo más allá del umbral
     */
    fun isHeadDown(threshold: Float = 20f): Boolean {
        return pitch < -threshold
    }

    /**
     * Verifica si la cabeza está girada hacia un lado (yaw alto)
     *
     * @param threshold Umbral en grados (por defecto 30°)
     * @return true si la cabeza está girada más allá del umbral
     */
    fun isHeadTurned(threshold: Float = 30f): Boolean {
        return kotlin.math.abs(yaw) > threshold
    }

    /**
     * Verifica si la cabeza está en posición neutral (centrada)
     *
     * @param pitchTolerance Tolerancia para pitch (por defecto 15°)
     * @param yawTolerance Tolerancia para yaw (por defecto 20°)
     * @return true si la cabeza está en posición neutral
     */
    fun isNeutral(pitchTolerance: Float = 15f, yawTolerance: Float = 20f): Boolean {
        return kotlin.math.abs(pitch) <= pitchTolerance && kotlin.math.abs(yaw) <= yawTolerance
    }

    companion object {
        /**
         * HeadPose por defecto (cabeza centrada)
         */
        val NEUTRAL = HeadPose(pitch = 0f, yaw = 0f, roll = 0f)
    }
}

