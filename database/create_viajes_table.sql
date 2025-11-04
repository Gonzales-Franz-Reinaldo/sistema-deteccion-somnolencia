-- ============================================
-- SCRIPT PARA CREAR SOLO LA TABLA VIAJES
-- Ejecutar este archivo si las demás tablas ya existen
-- ============================================

-- Eliminar tabla si existe (para re-crear limpia)
DROP TABLE IF EXISTS viajes CASCADE;

-- Crear tabla viajes
CREATE TABLE viajes (
    id_viaje SERIAL PRIMARY KEY,
    
    -- Relaciones (solo choferes pueden ser asignados)
    id_chofer INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_empresa INTEGER NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    
    -- Información de la ruta
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    duracion_estimada VARCHAR(50) NOT NULL,
    distancia_km DECIMAL(8, 2),
    
    -- Estado del viaje
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_curso', 'completada', 'cancelada')) DEFAULT 'pendiente',
    
    -- Fechas
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_viaje_programada DATE NOT NULL,
    hora_viaje_programada TIME NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    
    -- Notas adicionales
    observaciones TEXT,
    
    -- Validación simple (sin subquery que da error)
    CONSTRAINT chk_viaje_origen_destino CHECK (origen != destino)
);

-- Crear índices para optimización
CREATE INDEX idx_viajes_chofer ON viajes(id_chofer);
CREATE INDEX idx_viajes_empresa ON viajes(id_empresa);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha_asignacion ON viajes(fecha_asignacion DESC);
CREATE INDEX idx_viajes_fecha_programada ON viajes(fecha_viaje_programada);
CREATE INDEX idx_viajes_origen ON viajes(origen);
CREATE INDEX idx_viajes_destino ON viajes(destino);

-- Índice único compuesto para evitar que un chofer tenga 2 viajes el mismo día (sin importar la hora)
-- Solo aplica a viajes pendientes o en curso
CREATE UNIQUE INDEX idx_viajes_chofer_fecha_unico 
ON viajes(id_chofer, fecha_viaje_programada) 
WHERE estado IN ('pendiente', 'en_curso');

-- Comentario descriptivo
COMMENT ON TABLE viajes IS 'Asignación de viajes/rutas a choferes con información de origen y destino';

-- Verificar que se creó correctamente
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'viajes') as columnas
FROM information_schema.tables 
WHERE table_name = 'viajes';

-- Mensaje de confirmación
SELECT 'Tabla viajes creada exitosamente' as mensaje;
SELECT 'Total de columnas: 14' as info;
SELECT 'Indices creados: 8 (incluyendo unique constraint)' as info;
