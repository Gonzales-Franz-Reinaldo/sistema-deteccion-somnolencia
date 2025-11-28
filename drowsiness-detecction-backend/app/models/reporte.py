from sqlalchemy import (
    Column, Integer, String, DateTime, Date, ForeignKey, CheckConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Reporte(Base):
    """
    Modelo de Reporte
    
    Representa metadata de reportes generados por el administrador.
    Almacena información sobre el tipo, período y archivo generado.
    """
    
    __tablename__ = "reportes"
    
    # Primary Key
    id_reporte = Column(Integer, primary_key=True, index=True)
    
    # USUARIO QUE GENERÓ EL REPORTE (Admin)
    id_usuario_generador = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="SET NULL"),
        index=True
    )
    
    # RELACIONADO CON
    id_sesion = Column(
        Integer,
        ForeignKey("sesiones_viaje.id_sesion", ondelete="SET NULL"),
        index=True
    )
    id_usuario_chofer = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="SET NULL"),
        index=True
    )
    id_empresa = Column(
        Integer,
        ForeignKey("empresas.id_empresa", ondelete="SET NULL"),
        index=True
    )
    
    # INFORMACIÓN DEL REPORTE
    tipo_reporte = Column(
        String(50),
        CheckConstraint("tipo_reporte IN ('sesion', 'chofer', 'empresa', 'general')"),
        nullable=False,
        index=True
    )
    fecha_generacion = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    periodo_inicio = Column(Date)
    periodo_fin = Column(Date)
    
    # ARCHIVO GENERADO
    nombre_archivo = Column(String(300), nullable=False)
    ruta_archivo = Column(String(500), nullable=False)
    formato = Column(
        String(10),
        CheckConstraint("formato IN ('PDF', 'CSV', 'XLSX')"),
        default='PDF'
    )
    tamaño_kb = Column(Integer)
    
    # RELACIONES
    generador = relationship("Usuario", foreign_keys=[id_usuario_generador])
    sesion = relationship("SesionViaje", foreign_keys=[id_sesion])
    chofer = relationship("Usuario", foreign_keys=[id_usuario_chofer])
    empresa = relationship("Empresa", foreign_keys=[id_empresa])
    
    def __repr__(self):
        return f"<Reporte {self.id_reporte}: {self.tipo_reporte} ({self.formato})>"
    
    @property
    def nombre_generador(self) -> str:
        """Obtener nombre del admin que generó el reporte"""
        return self.generador.nombre_completo if self.generador else "Sistema"

