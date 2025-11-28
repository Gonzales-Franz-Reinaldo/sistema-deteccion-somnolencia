-- ============================================
-- SISTEMA DE DETECCIÓN DE SOMNOLENCIA
-- Base de Datos PostgreSQL - Versión Corregida
-- ============================================

-- ============================================
-- 1. TABLA: empresas
-- Empresas de transporte (opcional para choferes)
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL UNIQUE,
    ruc VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TABLA: usuarios
-- Usuarios del sistema (ADMIN y CHOFER)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    
    -- Credenciales (Compartidas por ambos roles)
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'chofer')) NOT NULL,
    
    -- Datos Personales (Completos para CHOFER, básicos para ADMIN)
    nombre_completo VARCHAR(200) NOT NULL,
    dni_ci VARCHAR(20) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    
    -- Datos adicionales para CHOFER (NULL para admin)
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro')),
    nacionalidad VARCHAR(100),
    fecha_nacimiento DATE,
    direccion TEXT,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    
    -- Información Laboral (Solo para CHOFER)
    tipo_chofer VARCHAR(20) CHECK (tipo_chofer IN ('individual', 'empresa')),
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE SET NULL,
    numero_licencia VARCHAR(50),
    categoria_licencia VARCHAR(50),
    
    -- Estado y Control
    activo BOOLEAN DEFAULT TRUE,
    primer_inicio BOOLEAN DEFAULT TRUE, -- Para forzar cambio de contraseña
    
    -- Metadatos
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT chk_chofer_empresa CHECK (
        (rol = 'chofer' AND tipo_chofer = 'empresa' AND id_empresa IS NOT NULL) OR
        (rol = 'chofer' AND tipo_chofer = 'individual') OR
        (rol = 'admin')
    ),
    CONSTRAINT chk_chofer_datos CHECK (
        (rol = 'chofer' AND dni_ci IS NOT NULL AND genero IS NOT NULL AND tipo_chofer IS NOT NULL) OR
        (rol = 'admin')
    )
);



-- ============================================
-- TABLA: token_blacklist
-- Tokens JWT invalidados (logout)
-- ============================================
CREATE TABLE IF NOT EXISTS token_blacklist  (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_invalidacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL
);

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expiracion ON token_blacklist(fecha_expiracion);


-- ============================================
-- . TABLA: viajes
-- Asignación de viajes/rutas a choferes
-- ============================================
CREATE TABLE IF NOT EXISTS viajes (
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
    
    -- Validaciones
    CONSTRAINT chk_viaje_origen_destino CHECK (origen != destino)
);


-- ============================================
-- TRIGGER: Validar que id_chofer realmente sea un chofer
-- ============================================
CREATE OR REPLACE FUNCTION validar_chofer_viaje()
RETURNS TRIGGER AS $$
DECLARE
    es_chofer BOOLEAN;
BEGIN
    SELECT rol = 'chofer' INTO es_chofer
    FROM usuarios
    WHERE id_usuario = NEW.id_chofer;

    IF NOT es_chofer THEN
        RAISE EXCEPTION 'El usuario asignado al viaje no es un chofer.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_chofer_viaje
BEFORE INSERT OR UPDATE ON viajes
FOR EACH ROW
EXECUTE FUNCTION validar_chofer_viaje();



-- ============================================
-- TABLA: eventos_somnolencia
-- Registro de todos los eventos detectados por la app
-- ============================================
CREATE TABLE eventos_somnolencia (
    id_evento SERIAL PRIMARY KEY,
    
    -- Relaciones
    id_chofer INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_viaje INTEGER REFERENCES viajes(id_viaje) ON DELETE SET NULL,
    
    -- Tipo de evento
    tipo_evento VARCHAR(50) CHECK (tipo_evento IN (
        'microsueno', 
        'cabeceo', 
        'parpadeo_ojos', 
        'bostezo', 
        'frotamiento_ojos'
    )) NOT NULL,
    
    -- Detalles del evento
    duracion_segundos DECIMAL(5, 2),  -- Duración del evento (ej: 3.2s)
    cantidad_eventos INTEGER DEFAULT 1,
    nivel_severidad VARCHAR(20) CHECK (nivel_severidad IN ('NORMAL', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Ubicación GPS
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    velocidad_kmh INTEGER,
    
    -- Timestamps
    timestamp_evento TIMESTAMP NOT NULL,  -- Cuándo ocurrió el evento
    timestamp_sincronizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Cuándo llegó al servidor
    
    -- Metadatos
    dispositivo_id VARCHAR(100),  -- ID único del tablet
    version_app VARCHAR(20),
    sincronizado_offline BOOLEAN DEFAULT FALSE,  -- TRUE si se guardó offline y se sincronizó después
    
    -- Índices
    CONSTRAINT chk_duracion_positiva CHECK (duracion_segundos > 0)
);


-- Índices
CREATE INDEX IF NOT EXISTS idx_eventos_chofer ON eventos_somnolencia(id_chofer);
CREATE INDEX IF NOT EXISTS idx_eventos_viaje ON eventos_somnolencia(id_viaje);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos_somnolencia(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_timestamp ON eventos_somnolencia(timestamp_evento DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_severidad ON eventos_somnolencia(nivel_severidad);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_somnolencia(DATE(timestamp_evento));

-- Índices usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(id_empresa);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_chofer ON usuarios(tipo_chofer);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Índices viajes
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

-- Comentarios
COMMENT ON TABLE eventos_somnolencia IS 'Registro de eventos de somnolencia detectados por la app móvil';
COMMENT ON COLUMN eventos_somnolencia.sincronizado_offline IS 'Indica si el evento se guardó localmente y se sincronizó después';



-- ============================================
-- DATOS INICIALES
-- ============================================

-- Empresas de ejemplo
INSERT INTO empresas (nombre_empresa, ruc, telefono, email, direccion)
VALUES 
    ('TransCorp SA', '1234567890', '+591 4-4123456', 'contacto@transcorp.com', 'Av. América #123, Cochabamba'),
    ('FleetPro', '0987654321', '+591 2-2987654', 'info@fleetpro.com', 'Calle Comercio #456, La Paz'),
    ('Expreso del Sur', '1122334455', '+591 3-3445566', 'info@expresodelsur.com', 'Av. Montes #789, Santa Cruz');

-- Usuario ADMIN por defecto
-- Usuario: admin | Password: admin123
INSERT INTO usuarios (usuario, password_hash, rol, nombre_completo, email, telefono, activo, primer_inicio)
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5L2xOVLcKKVIa', 'admin', 'Administrador del Sistema', 'admin@sistema.com', '+591 70000000', TRUE, FALSE);

-- Chofer INDIVIDUAL de ejemplo
-- Usuario: jperez | Password: chofer123
INSERT INTO usuarios (
    usuario, password_hash, rol, nombre_completo, dni_ci, email, telefono,
    genero, nacionalidad, fecha_nacimiento, direccion, ciudad, codigo_postal,
    tipo_chofer, numero_licencia, categoria_licencia, activo, primer_inicio
)
VALUES (
    'jperez', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chofer', 
    'Juan Carlos Pérez', '12345678', 'juan.perez@email.com', '+591 70123456',
    'masculino', 'Boliviana', '1985-03-15', 'Av. Principal #123', 'La Paz', '00000',
    'individual', 'LIC-123456', 'Categoría C - Vehículos Pesados', TRUE, TRUE
);

-- Chofer de EMPRESA de ejemplo
-- Usuario: franz | Password: franz123
INSERT INTO usuarios (
    usuario, password_hash, rol, nombre_completo, dni_ci, email, telefono,
    genero, nacionalidad, fecha_nacimiento, direccion, ciudad, codigo_postal,
    tipo_chofer, id_empresa, numero_licencia, categoria_licencia, activo, primer_inicio
)
VALUES (
    'franz', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chofer',
    'Franz González', '87654321', 'franz.gonzalez@transcorp.com', '+591 70987654',
    'femenino', 'Boliviana', '1990-07-22', 'Calle Comercio #456', 'Cochabamba', '00001',
    'empresa', 1, 'LIC-789012', 'Categoría D - Transporte Público', TRUE, TRUE
);
