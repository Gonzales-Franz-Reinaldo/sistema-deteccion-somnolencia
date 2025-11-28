-- ============================================================================
-- SCRIPT DE DATOS DE PRUEBA PARA MÓDULO DE REPORTES
-- Ajustado con IDs reales de la base de datos
-- ============================================================================

-- Choferes disponibles: 9, 16, 18
-- Se crearán 12 sesiones de viaje con alertas

-- ============================================================================
-- SESIONES DE VIAJE
-- ============================================================================

-- Sesión 1: Chofer 9 - Normal (hace 1 día)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    9, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 hours', 180,
    'La Paz Centro', 'Cochabamba Norte', 'Ruta 1',
    'finalizada', 'normal',
    0, 0, 0, 0, 0, 'Viaje sin incidentes'
);

-- Sesión 2: Chofer 16 - Alerta (hace 2 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    16, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours', 240,
    'Cochabamba', 'Santa Cruz', 'Ruta 7',
    'finalizada', 'alerta',
    2, 3, 1, 0, 1, 'Bostezos detectados en tramo nocturno'
);

-- Sesión 3: Chofer 18 - Crítica (hace 3 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    18, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 hours', 300,
    'La Paz', 'Oruro', 'Ruta 1',
    'finalizada', 'critico',
    8, 12, 15, 10, 5, 'Múltiples signos de fatiga severa'
);

-- Sesión 4: Chofer 9 - Activa (hoy)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    9, NOW() - INTERVAL '2 hours', NULL, NULL,
    'Cochabamba Sur', NULL, 'Ruta 4',
    'activa', 'normal',
    0, 1, 0, 0, 0, 'Sesión en curso'
);

-- Sesión 5: Chofer 16 - Interrumpida (hace 5 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    16, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', 120,
    'Santa Cruz', 'Trinidad', 'Ruta 9',
    'interrumpida', 'alerta',
    3, 2, 5, 1, 2, 'Interrupida por condiciones climáticas'
);

-- Sesión 6: Chofer 18 - Crítica (hace 7 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    18, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '6 hours', 360,
    'Potosí', 'Sucre', 'Ruta 6',
    'finalizada', 'critico',
    15, 20, 25, 18, 10, 'Turno nocturno con múltiples microsueños'
);

-- Sesión 7: Chofer 9 - Normal (hace 10 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    9, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 120,
    'Oruro', 'La Paz', 'Ruta 1',
    'finalizada', 'normal',
    0, 0, 1, 0, 0, 'Viaje corto sin incidentes'
);

-- Sesión 8: Chofer 16 - Alerta (hace 12 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    16, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '3 hours 30 minutes', 210,
    'Tarija', 'Potosí', 'Ruta 11',
    'finalizada', 'alerta',
    4, 6, 8, 2, 3, 'Alertas moderadas durante el viaje'
);

-- Sesión 9: Chofer 18 - Normal (hace 15 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    18, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '2 hours 45 minutes', 165,
    'Cochabamba', 'Sucre', 'Ruta 5',
    'finalizada', 'normal',
    0, 2, 0, 1, 0, 'Viaje matutino sin mayores incidentes'
);

-- Sesión 10: Chofer 9 - Alerta (hace 18 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    9, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '8 hours', 480,
    'Santa Cruz', 'La Paz', 'Ruta 7',
    'finalizada', 'alerta',
    5, 8, 10, 4, 6, 'Viaje prolongado con signos de fatiga'
);

-- Sesión 11: Chofer 16 - Crítica (hace 20 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    16, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '7 hours', 420,
    'Beni', 'Pando', 'Ruta 8',
    'finalizada', 'critico',
    12, 18, 20, 15, 8, 'Viaje nocturno con alta fatiga acumulada'
);

-- Sesión 12: Chofer 18 - Normal (hace 25 días)
INSERT INTO sesiones_viaje (
    id_usuario, fecha_inicio, fecha_fin, duracion_minutos,
    ubicacion_inicio, ubicacion_fin, ruta_nombre,
    estado, nivel_alerta,
    total_microsuenos, total_bostezos, total_parpadeos_excesivos,
    total_cabeceos, total_frotamiento_ojos, observaciones
) VALUES (
    18, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '1 hour 30 minutes', 90,
    'La Paz', 'El Alto', 'Ruta 2',
    'finalizada', 'normal',
    0, 0, 0, 0, 0, 'Viaje corto urbano'
);

-- ============================================================================
-- ALERTAS DE SOMNOLENCIA
-- ============================================================================
-- Nota: Insertaremos algunas alertas para las sesiones con nivel_alerta != 'normal'

-- Obtener IDs de sesiones para insertar alertas
DO $$
DECLARE
    sesion2_id INT;
    sesion3_id INT;
    sesion5_id INT;
    sesion6_id INT;
    sesion8_id INT;
    sesion10_id INT;
    sesion11_id INT;
BEGIN
    -- Obtener IDs de las sesiones recién creadas
    SELECT id_sesion INTO sesion2_id FROM sesiones_viaje WHERE id_usuario = 16 AND ruta_nombre = 'Ruta 7' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion3_id FROM sesiones_viaje WHERE id_usuario = 18 AND ruta_nombre = 'Ruta 1' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion5_id FROM sesiones_viaje WHERE id_usuario = 16 AND ruta_nombre = 'Ruta 9' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion6_id FROM sesiones_viaje WHERE id_usuario = 18 AND ruta_nombre = 'Ruta 6' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion8_id FROM sesiones_viaje WHERE id_usuario = 16 AND ruta_nombre = 'Ruta 11' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion10_id FROM sesiones_viaje WHERE id_usuario = 9 AND ruta_nombre = 'Ruta 7' ORDER BY fecha_inicio DESC LIMIT 1;
    SELECT id_sesion INTO sesion11_id FROM sesiones_viaje WHERE id_usuario = 16 AND ruta_nombre = 'Ruta 8' ORDER BY fecha_inicio DESC LIMIT 1;

    -- Alertas para Sesión 2 (Chofer 16 - Alerta)
    IF sesion2_id IS NOT NULL THEN
        INSERT INTO alertas_somnolencia (id_sesion, timestamp_alerta, tipo_alerta, severidad, duracion_segundos)
        VALUES 
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'bostezo', 'leve', 2.5),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 'microsueno', 'moderado', 1.2),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '2 hours 30 minutes', 'bostezo', 'leve', 3.0),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '3 hours', 'parpadeo_excesivo', 'leve', 8.5),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '3 hours 15 minutes', 'bostezo', 'moderado', 2.8),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '3 hours 45 minutes', 'microsueno', 'moderado', 1.5),
            (sesion2_id, NOW() - INTERVAL '2 days' + INTERVAL '3 hours 50 minutes', 'frotamiento_ojos', 'leve', 5.0);
    END IF;

    -- Alertas para Sesión 3 (Chofer 18 - Crítica)
    IF sesion3_id IS NOT NULL THEN
        INSERT INTO alertas_somnolencia (id_sesion, timestamp_alerta, tipo_alerta, severidad, duracion_segundos)
        VALUES 
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', 'bostezo', 'moderado', 3.2),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'microsueno', 'grave', 2.5),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '1 hour 20 minutes', 'parpadeo_excesivo', 'moderado', 12.0),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 'cabeceo', 'grave', 3.5),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '2 hours 30 minutes', 'microsueno', 'critico', 3.8),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '3 hours', 'bostezo', 'grave', 4.0),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '3 hours 15 minutes', 'parpadeo_excesivo', 'grave', 15.5),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '3 hours 45 minutes', 'cabeceo', 'critico', 4.2),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '4 hours', 'microsueno', 'critico', 4.5),
            (sesion3_id, NOW() - INTERVAL '3 days' + INTERVAL '4 hours 20 minutes', 'frotamiento_ojos', 'moderado', 8.0);
    END IF;

    -- Alertas para Sesión 6 (Chofer 18 - Crítica - Nocturna)
    IF sesion6_id IS NOT NULL THEN
        INSERT INTO alertas_somnolencia (id_sesion, timestamp_alerta, tipo_alerta, severidad, duracion_segundos)
        VALUES 
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '30 minutes', 'parpadeo_excesivo', 'moderado', 10.0),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '1 hour', 'microsueno', 'grave', 2.8),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '1 hour 30 minutes', 'bostezo', 'grave', 3.5),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 'cabeceo', 'critico', 4.0),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '2 hours 20 minutes', 'microsueno', 'critico', 4.2),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '3 hours', 'parpadeo_excesivo', 'grave', 18.0),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '3 hours 30 minutes', 'frotamiento_ojos', 'grave', 10.5),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '4 hours', 'microsueno', 'critico', 5.0),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '4 hours 30 minutes', 'bostezo', 'critico', 4.5),
            (sesion6_id, NOW() - INTERVAL '7 days' + INTERVAL '5 hours', 'cabeceo', 'critico', 4.8);
    END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Datos de prueba insertados correctamente' AS resultado;
SELECT COUNT(*) AS total_sesiones FROM sesiones_viaje;
SELECT COUNT(*) AS total_alertas FROM alertas_somnolencia;
