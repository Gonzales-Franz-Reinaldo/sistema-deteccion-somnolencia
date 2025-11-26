-- ============================================
-- SISTEMA DE DETECCIÓN DE SOMNOLENCIA
-- Base de Datos PostgreSQL - Versión Refactorizada
-- ============================================

-- ============================================
-- 1. TABLA: empresas
-- Empresas de transporte (opcional para choferes)
-- ============================================
CREATE TABLE empresas (
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
CREATE TABLE usuarios (
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
CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_invalidacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL
);

-- Índice para búsqueda rápida
CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);
CREATE INDEX idx_token_blacklist_expiracion ON token_blacklist(fecha_expiracion);

-- Comentario
COMMENT ON TABLE token_blacklist IS 'Tokens JWT invalidados por logout o revocación manual';


-- ============================================
-- . TABLA: viajes
-- Asignación de viajes/rutas a choferes
-- ============================================
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
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    
    -- Notas adicionales
    observaciones TEXT,
    
    -- Validaciones
    CONSTRAINT chk_viaje_origen_destino CHECK (origen != destino),
    CONSTRAINT chk_viaje_chofer_rol CHECK (
        EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = id_chofer AND rol = 'chofer')
    )
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices en usuarios
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_empresa ON usuarios(id_empresa);
CREATE INDEX idx_usuarios_tipo_chofer ON usuarios(tipo_chofer);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_dni ON usuarios(dni_ci);


-- Índices en viajes
CREATE INDEX idx_viajes_chofer ON viajes(id_chofer);
CREATE INDEX idx_viajes_empresa ON viajes(id_empresa);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha_asignacion ON viajes(fecha_asignacion DESC);
CREATE INDEX idx_viajes_origen ON viajes(origen);
CREATE INDEX idx_viajes_destino ON viajes(destino);

