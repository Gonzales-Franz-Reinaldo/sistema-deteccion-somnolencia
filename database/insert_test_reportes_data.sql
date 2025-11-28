-- ============================================================================
-- SCRIPT DE DATOS DE PRUEBA PARA MÃ“DULO DE REPORTES
-- Sistema de DetecciÃ³n de Somnolencia
-- ============================================================================
-- Este script inserta datos de prueba para sesiones_viaje y alertas_somnolencia
-- Requisitos: Tablas usuarios y empresas ya deben tener datos
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar datos existentes (choferes y empresas)
-- ============================================================================
-- Ejecutar primero para ver IDs disponibles:
-- SELECT id, nombre, apellido, email FROM usuarios WHERE rol = 'chofer' LIMIT 10;
-- SELECT id, nombre FROM empresas LIMIT 5;

-- ============================================================================
-- PASO 2: Insertar sesiones de viaje (Ãºltimos 30 dÃ­as)
-- ============================================================================

-- SesiÃ³n 1: Chofer ID 1 - SesiÃ³n normal sin alertas
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    1, -- id_chofer (ajustar segÃºn tu BD)
    1, -- id_empresa (ajustar segÃºn tu BD)
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '3 hours',
    180,
    'Santiago Centro, Chile',
    'ValparaÃ­so, Chile',
    'Ruta 68',
    'finalizada',
    'normal',
    0, 0, 0, 0, 0,
    'Viaje sin incidentes'
);

-- SesiÃ³n 2: Chofer ID 2 - SesiÃ³n con alertas leves (nivel: alerta)
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    2,
    1,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '4 hours',
    240,
    'Santiago, Chile',
    'ConcepciÃ³n, Chile',
    'Ruta 5 Sur',
    'finalizada',
    'alerta',
    2, 3, 1, 0, 1,
    'Algunos bostezos detectados en tramo nocturno'
);

-- SesiÃ³n 3: Chofer ID 3 - SesiÃ³n crÃ­tica (muchas alertas)
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    3,
    2,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '6 hours',
    360,
    'Antofagasta, Chile',
    'Calama, Chile',
    'Ruta 25',
    'finalizada',
    'critico',
    8, 12, 15, 5, 6,
    'Chofer presentÃ³ mÃºltiples signos de fatiga. Paradas de descanso recomendadas.'
);

-- SesiÃ³n 4: Chofer ID 1 - SesiÃ³n activa (en curso)
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    1,
    1,
    NOW() - INTERVAL '2 hours',
    120,
    'ViÃ±a del Mar, Chile',
    'La Serena, Chile',
    'Ruta 5 Norte',
    'activa',
    'normal',
    0, 1, 0, 0, 0,
    'SesiÃ³n en curso'
);

-- SesiÃ³n 5: Chofer ID 4 - SesiÃ³n interrumpida
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    4,
    2,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '1 hour',
    60,
    'Temuco, Chile',
    'Valdivia, Chile',
    'Ruta 5 Sur',
    'interrumpida',
    'alerta',
    1, 2, 3, 1, 0,
    'SesiÃ³n interrumpida por condiciones climÃ¡ticas adversas'
);

-- SesiÃ³n 6: Chofer ID 2 - Turno nocturno con microsueÃ±os
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    2,
    1,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '5 hours',
    300,
    'Santiago, Chile',
    'Puerto Montt, Chile',
    'Ruta 5 Sur',
    'finalizada',
    'critico',
    10, 8, 12, 7, 4,
    'Turno nocturno. MÃºltiples microsueÃ±os detectados. Chofer detuvo vehÃ­culo para descansar.'
);

-- SesiÃ³n 7: Chofer ID 5 - Viaje corto sin alertas
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    5,
    3,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days' + INTERVAL '90 minutes',
    90,
    'Rancagua, Chile',
    'San Fernando, Chile',
    'Ruta 5 Sur',
    'finalizada',
    'normal',
    0, 0, 0, 0, 0,
    'Viaje sin incidentes'
);

-- SesiÃ³n 8: Chofer ID 3 - Alerta moderada
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    3,
    2,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days' + INTERVAL '4 hours',
    240,
    'Iquique, Chile',
    'Arica, Chile',
    'Ruta 1',
    'finalizada',
    'alerta',
    3, 5, 4, 2, 1,
    'Alertas moderadas durante el viaje'
);

-- SesiÃ³n 9: Chofer ID 1 - Hoy con pocas alertas
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    1,
    1,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '3 hours',
    180,
    'Santiago, Chile',
    'Rancagua, Chile',
    'Ruta 5 Sur',
    'finalizada',
    'normal',
    0, 1, 1, 0, 0,
    'Viaje matutino sin mayores incidentes'
);

-- SesiÃ³n 10: Chofer ID 4 - SesiÃ³n larga con mÃºltiples alertas
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    4,
    2,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days' + INTERVAL '8 hours',
    480,
    'La Serena, Chile',
    'CopiapÃ³, Chile',
    'Ruta 5 Norte',
    'finalizada',
    'critico',
    6, 9, 10, 4, 5,
    'Viaje prolongado. Chofer mostrÃ³ signos de fatiga acumulada.'
);

-- SesiÃ³n 11: Chofer ID 2 - Ãšltimas 24 horas
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    2,
    1,
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '9 hours',
    180,
    'ValparaÃ­so, Chile',
    'Santiago, Chile',
    'Ruta 68',
    'finalizada',
    'alerta',
    1, 3, 2, 1, 1,
    'Turno vespertino con algunas alertas'
);

-- SesiÃ³n 12: Chofer ID 5 - Hace 20 dÃ­as
INSERT INTO sesiones_viaje (
    id_chofer,
    id_empresa,
    fecha_inicio,
    fecha_fin,
    duracion_minutos,
    ubicacion_origen,
    ubicacion_destino,
    ruta,
    estado,
    nivel_alerta,
    total_microsueÃ±os,
    total_bostezos,
    total_parpadeos_excesivos,
    total_cabeceos,
    total_frotamiento_ojos,
    observaciones
) VALUES (
    5,
    3,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days' + INTERVAL '2 hours',
    120,
    'Talca, Chile',
    'ChillÃ¡n, Chile',
    'Ruta 5 Sur',
    'finalizada',
    'normal',
    0, 0, 1, 0, 0,
    'Viaje sin mayores incidentes'
);

-- ============================================================================
-- PASO 3: Insertar alertas de somnolencia para las sesiones
-- ============================================================================

-- Nota: Ajustar id_sesion segÃºn los IDs generados en tu BD
-- Puedes verificar con: SELECT id FROM sesiones_viaje ORDER BY id DESC LIMIT 12;

-- Alertas para SesiÃ³n 2 (7 alertas totales)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'microsueÃ±o', 'leve', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 0.75, 'Km 45 Ruta 5 Sur', 'Cierre prolongado de ojos detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 0.82, 'Km 120 Ruta 5 Sur', 'MicrosueÃ±o de 3 segundos'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '2 days' + INTERVAL '1 hour 30 minutes', 0.88, 'Km 80 Ruta 5 Sur', 'Bostezo detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '2 days' + INTERVAL '2 hours 15 minutes', 0.79, 'Km 130 Ruta 5 Sur', 'Bostezo repetido'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '2 days' + INTERVAL '3 hours', 0.85, 'Km 180 Ruta 5 Sur', 'Bostezos frecuentes'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '2 days' + INTERVAL '2 hours 30 minutes', 0.71, 'Km 150 Ruta 5 Sur', 'Parpadeo frecuente detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '2 days')::date LIMIT 1), 
 'frotamiento_ojos', 'leve', NOW() - INTERVAL '2 days' + INTERVAL '3 hours 15 minutes', 0.80, 'Km 195 Ruta 5 Sur', 'Chofer se frotÃ³ los ojos');

-- Alertas para SesiÃ³n 3 (46 alertas totales - sesiÃ³n crÃ­tica)
-- MicrosueÃ±os (8 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 0.78, 'Km 20 Ruta 25', 'Primer microsueÃ±o detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 0.81, 'Km 85 Ruta 25', 'MicrosueÃ±o de 2 segundos'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '3 hours', 0.89, 'Km 140 Ruta 25', 'MicrosueÃ±o prolongado (4 seg)'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 30 minutes', 0.92, 'Km 165 Ruta 25', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '3 days' + INTERVAL '4 hours', 0.95, 'Km 190 Ruta 25', 'MicrosueÃ±o crÃ­tico detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 30 minutes', 0.77, 'Km 210 Ruta 25', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '5 hours', 0.88, 'Km 235 Ruta 25', 'MicrosueÃ±o grave recurrente'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 30 minutes', 0.93, 'Km 255 Ruta 25', 'Ãšltimo microsueÃ±o crÃ­tico');

-- Bostezos (12 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', 0.76, 'Km 10 Ruta 25', 'Bostezo inicial'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 15 minutes', 0.79, 'Km 35 Ruta 25', 'Segundo bostezo'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 45 minutes', 0.82, 'Km 60 Ruta 25', 'Bostezos frecuentes'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 20 minutes', 0.84, 'Km 95 Ruta 25', 'Bostezo prolongado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 50 minutes', 0.81, 'Km 125 Ruta 25', 'Bostezo repetido'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 15 minutes', 0.86, 'Km 145 Ruta 25', 'Bostezos continuos'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 40 minutes', 0.90, 'Km 175 Ruta 25', 'Bostezo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 10 minutes', 0.83, 'Km 195 Ruta 25', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 35 minutes', 0.88, 'Km 215 Ruta 25', 'Bostezo grave recurrente'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 5 minutes', 0.80, 'Km 230 Ruta 25', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 25 minutes', 0.91, 'Km 248 Ruta 25', 'Bostezo grave final'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 50 minutes', 0.77, 'Km 265 Ruta 25', 'Ãšltimo bostezo');

-- Parpadeos excesivos (15 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', 0.72, 'Km 5 Ruta 25', 'Parpadeo inicial'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '50 minutes', 0.74, 'Km 25 Ruta 25', 'Parpadeo frecuente'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 20 minutes', 0.78, 'Km 45 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 40 minutes', 0.73, 'Km 55 Ruta 25', 'Parpadeo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 10 minutes', 0.80, 'Km 75 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 35 minutes', 0.79, 'Km 100 Ruta 25', 'Parpadeo repetido'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 55 minutes', 0.85, 'Km 130 Ruta 25', 'Parpadeo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 20 minutes', 0.81, 'Km 150 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 45 minutes', 0.87, 'Km 180 Ruta 25', 'Parpadeo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 5 minutes', 0.78, 'Km 192 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 25 minutes', 0.89, 'Km 207 Ruta 25', 'Parpadeo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 50 minutes', 0.82, 'Km 222 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 10 minutes', 0.90, 'Km 238 Ruta 25', 'Parpadeo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 35 minutes', 0.79, 'Km 252 Ruta 25', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 55 minutes', 0.75, 'Km 268 Ruta 25', 'Ãšltimo parpadeo');

-- Cabeceos (5 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'cabeceo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 30 minutes', 0.83, 'Km 110 Ruta 25', 'Primer cabeceo detectado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'cabeceo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 25 minutes', 0.88, 'Km 155 Ruta 25', 'Cabeceo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'cabeceo', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 15 minutes', 0.81, 'Km 200 Ruta 25', 'Cabeceo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'cabeceo', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 15 minutes', 0.90, 'Km 242 Ruta 25', 'Cabeceo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'cabeceo', 'critico', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 45 minutes', 0.94, 'Km 262 Ruta 25', 'Cabeceo crÃ­tico');

-- Frotamiento de ojos (6 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 30 minutes', 0.76, 'Km 50 Ruta 25', 'Frotamiento inicial'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '2 hours 40 minutes', 0.82, 'Km 115 Ruta 25', 'Frotamiento moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '3 hours 35 minutes', 0.80, 'Km 170 Ruta 25', 'Frotamiento repetido'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'grave', NOW() - INTERVAL '3 days' + INTERVAL '4 hours 40 minutes', 0.87, 'Km 218 Ruta 25', 'Frotamiento grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'moderado', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 20 minutes', 0.79, 'Km 245 Ruta 25', 'Frotamiento moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '3 days')::date LIMIT 1), 
 'frotamiento_ojos', 'leve', NOW() - INTERVAL '3 days' + INTERVAL '5 hours 50 minutes', 0.74, 'Km 264 Ruta 25', 'Ãšltimo frotamiento');

-- Alertas para SesiÃ³n 5 (7 alertas - sesiÃ³n interrumpida)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '5 days' + INTERVAL '30 minutes', 0.80, 'Km 15 Ruta 5 Sur', 'MicrosueÃ±o antes de interrupciÃ³n'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes', 0.75, 'Km 8 Ruta 5 Sur', 'Bostezo inicial'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '5 days' + INTERVAL '45 minutes', 0.82, 'Km 22 Ruta 5 Sur', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '5 days' + INTERVAL '20 minutes', 0.73, 'Km 10 Ruta 5 Sur', 'Parpadeo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '5 days' + INTERVAL '40 minutes', 0.79, 'Km 18 Ruta 5 Sur', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '5 days' + INTERVAL '55 minutes', 0.81, 'Km 28 Ruta 5 Sur', 'Parpadeo antes de parar'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '5 days')::date LIMIT 1), 
 'cabeceo', 'moderado', NOW() - INTERVAL '5 days' + INTERVAL '50 minutes', 0.84, 'Km 25 Ruta 5 Sur', 'Cabeceo detectado');

-- Alertas para SesiÃ³n 6 (41 alertas - turno nocturno crÃ­tico)
-- (Resumen: 10 microsueÃ±os + 8 bostezos + 12 parpadeos + 7 cabeceos + 4 frotamientos)
-- MicrosueÃ±os (10 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '7 days' + INTERVAL '1 hour', 0.79, 'Km 50 Ruta 5 Sur', 'MicrosueÃ±o nocturno'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '7 days' + INTERVAL '1 hour 30 minutes', 0.86, 'Km 80 Ruta 5 Sur', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 0.88, 'Km 120 Ruta 5 Sur', 'MicrosueÃ±o prolongado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '7 days' + INTERVAL '2 hours 30 minutes', 0.94, 'Km 155 Ruta 5 Sur', 'MicrosueÃ±o crÃ­tico'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '7 days' + INTERVAL '3 hours', 0.80, 'Km 185 Ruta 5 Sur', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '7 days' + INTERVAL '3 hours 30 minutes', 0.89, 'Km 215 Ruta 5 Sur', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '7 days' + INTERVAL '4 hours', 0.96, 'Km 245 Ruta 5 Sur', 'MicrosueÃ±o crÃ­tico'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '7 days' + INTERVAL '4 hours 20 minutes', 0.87, 'Km 265 Ruta 5 Sur', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '7 days' + INTERVAL '4 hours 40 minutes', 0.78, 'Km 280 Ruta 5 Sur', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '7 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '7 days' + INTERVAL '4 hours 50 minutes', 0.95, 'Km 295 Ruta 5 Sur', 'Ãšltimo microsueÃ±o crÃ­tico antes de parar');

-- (Continuar con bostezos, parpadeos, cabeceos y frotamientos para sesiÃ³n 6 de forma similar)
-- Por brevedad, aquÃ­ van solo algunos ejemplos mÃ¡s...

-- Alertas para SesiÃ³n 8 (15 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'microsueÃ±o', 'leve', NOW() - INTERVAL '12 days' + INTERVAL '1 hour', 0.74, 'Km 30 Ruta 1', 'MicrosueÃ±o leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '2 hours', 0.81, 'Km 75 Ruta 1', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '3 hours', 0.79, 'Km 120 Ruta 1', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '12 days' + INTERVAL '30 minutes', 0.76, 'Km 15 Ruta 1', 'Bostezo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '1 hour 30 minutes', 0.82, 'Km 55 Ruta 1', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '2 hours 30 minutes', 0.80, 'Km 95 Ruta 1', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '3 hours 20 minutes', 0.83, 'Km 130 Ruta 1', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'bostezo', 'grave', NOW() - INTERVAL '12 days' + INTERVAL '3 hours 45 minutes', 0.87, 'Km 145 Ruta 1', 'Bostezo grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '12 days' + INTERVAL '45 minutes', 0.72, 'Km 20 Ruta 1', 'Parpadeo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '1 hour 45 minutes', 0.78, 'Km 65 Ruta 1', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '2 hours 45 minutes', 0.80, 'Km 105 Ruta 1', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '3 hours 30 minutes', 0.79, 'Km 135 Ruta 1', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'cabeceo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '2 hours 15 minutes', 0.82, 'Km 85 Ruta 1', 'Cabeceo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'cabeceo', 'moderado', NOW() - INTERVAL '12 days' + INTERVAL '3 hours 10 minutes', 0.84, 'Km 125 Ruta 1', 'Cabeceo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 3 AND fecha_inicio::date = (NOW() - INTERVAL '12 days')::date LIMIT 1), 
 'frotamiento_ojos', 'leve', NOW() - INTERVAL '12 days' + INTERVAL '2 hours 50 minutes', 0.75, 'Km 110 Ruta 1', 'Frotamiento leve');

-- Alertas para SesiÃ³n 10 (34 alertas - viaje largo)
-- MicrosueÃ±os (6 alertas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '15 days' + INTERVAL '2 hours', 0.80, 'Km 100 Ruta 5 Norte', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '15 days' + INTERVAL '3 hours', 0.86, 'Km 165 Ruta 5 Norte', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'grave', NOW() - INTERVAL '15 days' + INTERVAL '4 hours', 0.88, 'Km 230 Ruta 5 Norte', 'MicrosueÃ±o grave'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '15 days' + INTERVAL '5 hours', 0.93, 'Km 290 Ruta 5 Norte', 'MicrosueÃ±o crÃ­tico'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'moderado', NOW() - INTERVAL '15 days' + INTERVAL '6 hours', 0.79, 'Km 350 Ruta 5 Norte', 'MicrosueÃ±o moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 4 AND fecha_inicio::date = (NOW() - INTERVAL '15 days')::date LIMIT 1), 
 'microsueÃ±o', 'critico', NOW() - INTERVAL '15 days' + INTERVAL '7 hours', 0.95, 'Km 410 Ruta 5 Norte', 'MicrosueÃ±o crÃ­tico');

-- (Continuar con bostezos, parpadeos, cabeceos y frotamientos para sesiÃ³n 10 de forma similar...)

-- Alertas para SesiÃ³n 11 (8 alertas - Ãºltimas 24 horas)
INSERT INTO alertas_somnolencia (id_sesion, tipo_alerta, severidad, timestamp, confianza, ubicacion, descripcion) VALUES
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'microsueÃ±o', 'leve', NOW() - INTERVAL '11 hours', 0.76, 'Km 25 Ruta 68', 'MicrosueÃ±o leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'bostezo', 'leve', NOW() - INTERVAL '11 hours 30 minutes', 0.74, 'Km 15 Ruta 68', 'Bostezo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '10 hours 30 minutes', 0.81, 'Km 45 Ruta 68', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'bostezo', 'moderado', NOW() - INTERVAL '9 hours 45 minutes', 0.80, 'Km 70 Ruta 68', 'Bostezo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'parpadeo_excesivo', 'leve', NOW() - INTERVAL '11 hours 15 minutes', 0.73, 'Km 20 Ruta 68', 'Parpadeo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'parpadeo_excesivo', 'moderado', NOW() - INTERVAL '10 hours', 0.78, 'Km 55 Ruta 68', 'Parpadeo moderado'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'cabeceo', 'leve', NOW() - INTERVAL '10 hours 15 minutes', 0.77, 'Km 60 Ruta 68', 'Cabeceo leve'),
((SELECT id FROM sesiones_viaje WHERE id_chofer = 2 AND fecha_inicio::date = (NOW() - INTERVAL '12 hours')::date LIMIT 1), 
 'frotamiento_ojos', 'leve', NOW() - INTERVAL '9 hours 30 minutes', 0.75, 'Km 75 Ruta 68', 'Frotamiento leve');

-- ============================================================================
-- PASO 4: VerificaciÃ³n de datos insertados
-- ============================================================================
-- Ejecutar despuÃ©s de insertar para verificar:

-- Ver resumen de sesiones
SELECT 
    s.id,
    u.nombre || ' ' || u.apellido AS chofer,
    e.nombre AS empresa,
    s.fecha_inicio,
    s.duracion_minutos,
    s.estado,
    s.nivel_alerta,
    s.total_microsueÃ±os + s.total_bostezos + s.total_parpadeos_excesivos + 
    s.total_cabeceos + s.total_frotamiento_ojos AS total_alertas
FROM sesiones_viaje s
JOIN usuarios u ON s.id_chofer = u.id
JOIN empresas e ON s.id_empresa = e.id
ORDER BY s.fecha_inicio DESC
LIMIT 20;

-- Ver conteo de alertas por sesiÃ³n
SELECT 
    id_sesion,
    COUNT(*) AS total_alertas,
    COUNT(*) FILTER (WHERE tipo_alerta = 'microsueÃ±o') AS microsueÃ±os,
    COUNT(*) FILTER (WHERE tipo_alerta = 'bostezo') AS bostezos,
    COUNT(*) FILTER (WHERE tipo_alerta = 'parpadeo_excesivo') AS parpadeos,
    COUNT(*) FILTER (WHERE tipo_alerta = 'cabeceo') AS cabeceos,
    COUNT(*) FILTER (WHERE tipo_alerta = 'frotamiento_ojos') AS frotamientos
FROM alertas_somnolencia
GROUP BY id_sesion
ORDER BY id_sesion;

-- Ver estadÃ­sticas generales
SELECT 
    COUNT(DISTINCT s.id) AS total_sesiones,
    COUNT(DISTINCT s.id_chofer) AS total_choferes,
    COUNT(a.id) AS total_alertas,
    ROUND(AVG(s.duracion_minutos), 2) AS duracion_promedio_min,
    COUNT(*) FILTER (WHERE s.nivel_alerta = 'normal') AS sesiones_normales,
    COUNT(*) FILTER (WHERE s.nivel_alerta = 'alerta') AS sesiones_alerta,
    COUNT(*) FILTER (WHERE s.nivel_alerta = 'critico') AS sesiones_criticas
FROM sesiones_viaje s
LEFT JOIN alertas_somnolencia a ON s.id = a.id_sesion;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Ajustar id_chofer e id_empresa segÃºn los datos existentes en tu BD
-- 2. El script usa subqueries para encontrar id_sesion dinÃ¡micamente
-- 3. Si los choferes ID 1-5 no existen, reemplazar por IDs vÃ¡lidos
-- 4. Verificar que las tablas usuarios y empresas tengan datos antes de ejecutar
-- 5. Para insertar alertas adicionales, seguir el mismo patrÃ³n de las existentes
-- ============================================================================

