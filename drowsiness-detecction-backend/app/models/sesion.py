from sqlalchemy import (
    Column, Integer, String, DateTime, DECIMAL, Text, CheckConstraint, ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class SesionViaje(Base):
    """
    Modelo de Sesión de Viaje
    
    Representa una sesión de monitoreo de somnolencia durante un viaje.
    Registra el tiempo, ubicación y contadores de eventos de somnolencia.
    """
    
    __tablename__ = "sesiones_viaje"
    
    # Primary Key
    id_sesion = Column(Integer, primary_key=True, index=True)
    
    # RELACIÓN CON USUARIO (Chofer)
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # INFORMACIÓN TEMPORAL
    fecha_inicio = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    fecha_fin = Column(DateTime(timezone=True))
    duracion_minutos = Column(Integer)
    
    # UBICACIÓN
    ruta_nombre = Column(String(200))
    ubicacion_inicio = Column(String(300))
    ubicacion_fin = Column(String(300))
    
    # ESTADO DE LA SESIÓN
    estado = Column(
        String(20),
        CheckConstraint("estado IN ('activa', 'finalizada', 'interrumpida')"),
        default='activa',
        nullable=False,
        index=True
    )
    nivel_alerta = Column(
        String(20),
        CheckConstraint("nivel_alerta IN ('normal', 'alerta', 'critico')"),
        default='normal',
        nullable=False,
        index=True
    )
    
    # CONTADORES DE EVENTOS
    total_microsuenos = Column(Integer, default=0)
    total_bostezos = Column(Integer, default=0)
    total_parpadeos_excesivos = Column(Integer, default=0)
    total_cabeceos = Column(Integer, default=0)
    total_frotamiento_ojos = Column(Integer, default=0)
    
    # NOTAS
    observaciones = Column(Text)
    
    # RELACIONES
    usuario = relationship("Usuario", foreign_keys=[id_usuario], backref="sesiones")
    alertas = relationship("AlertaSomnolencia", back_populates="sesion", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SesionViaje {self.id_sesion}: {self.usuario.nombre_completo if self.usuario else 'N/A'} ({self.estado})>"
    
    @property
    def total_alertas(self) -> int:
        """Calcular total de alertas"""
        return (
            (self.total_microsuenos or 0) +
            (self.total_bostezos or 0) +
            (self.total_parpadeos_excesivos or 0) +
            (self.total_cabeceos or 0) +
            (self.total_frotamiento_ojos or 0)
        )
    
    @property
    def nombre_chofer(self) -> str:
        """Obtener nombre del chofer"""
        return self.usuario.nombre_completo if self.usuario else "N/A"
    
    @property
    def email_chofer(self) -> str:
        """Obtener email del chofer"""
        return self.usuario.email if self.usuario else "N/A"
    
    @property
    def empresa_chofer(self) -> str:
        """Obtener nombre de empresa del chofer"""
        if self.usuario and self.usuario.tipo_chofer == 'empresa' and self.usuario.empresa:
            return self.usuario.empresa.nombre_empresa
        return "Individual"


class AlertaSomnolencia(Base):
    """
    Modelo de Alerta de Somnolencia
    
    Representa un evento de somnolencia detectado durante una sesión.
    Incluye tipo, severidad, duración y detalles adicionales.
    """
    
    __tablename__ = "alertas_somnolencia"
    
    # Primary Key
    id_alerta = Column(Integer, primary_key=True, index=True)
    
    # RELACIÓN CON SESIÓN
    id_sesion = Column(
        Integer,
        ForeignKey("sesiones_viaje.id_sesion", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # INFORMACIÓN DEL EVENTO
    timestamp_alerta = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    tipo_alerta = Column(
        String(50),
        CheckConstraint("tipo_alerta IN ('microsueño', 'bostezo', 'parpadeo_excesivo', 'cabeceo', 'frotamiento_ojos')"),
        nullable=False,
        index=True
    )
    
    # SEVERIDAD
    severidad = Column(
        String(20),
        CheckConstraint("severidad IN ('leve', 'moderado', 'grave', 'critico')"),
        nullable=False,
        index=True
    )
    
    # DURACIÓN EN SEGUNDOS
    duracion_segundos = Column(DECIMAL(5, 2))
    
    # DETALLES ADICIONALES (JSON)
    detalles = Column(Text)  # Puede almacenar JSON como string
    
    # ACCIÓN TOMADA
    accion_tomada = Column(String(200))
    
    # RELACIONES
    sesion = relationship("SesionViaje", back_populates="alertas")
    
    def __repr__(self):
        return f"<AlertaSomnolencia {self.id_alerta}: {self.tipo_alerta} ({self.severidad})>"
    
    @property
    def nombre_chofer(self) -> str:
        """Obtener nombre del chofer desde la sesión"""
        return self.sesion.nombre_chofer if self.sesion else "N/A"

