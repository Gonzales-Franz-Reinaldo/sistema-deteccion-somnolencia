from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class EventoSomnolencia(Base):
    """
    Modelo para eventos de somnolencia detectados por la app móvil.
    
    Tipos de eventos:
    - microsueno: Ojos cerrados >= 2 segundos
    - cabeceo: Cabeza inclinada >= 3 segundos
    - parpadeo_ojos: > 20 parpadeos en 60 segundos
    - bostezo: > 3 bostezos en 180 segundos
    - frotamiento_ojos: > 3 frotamientos en 300 segundos
    """
    __tablename__ = "eventos_somnolencia"
    
    # ID principal
    id_evento = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    id_chofer = Column(
        Integer, 
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    id_viaje = Column(
        Integer, 
        ForeignKey("viajes.id_viaje", ondelete="SET NULL"), 
        nullable=True,
        index=True
    )
    
    # Tipo de evento
    tipo_evento = Column(
        String(50), 
        nullable=False,
        index=True
    )
    
    # Detalles del evento
    duracion_segundos = Column(DECIMAL(5, 2), nullable=True)
    cantidad_eventos = Column(Integer, default=1)  # Para parpadeo, bostezo, frotamiento
    nivel_severidad = Column(
        String(20),
        nullable=True,
        index=True
    )
    
    # Ubicación GPS
    latitud = Column(DECIMAL(10, 7), nullable=True)
    longitud = Column(DECIMAL(10, 7), nullable=True)
    velocidad_kmh = Column(Integer, nullable=True)
    
    # Timestamps
    timestamp_evento = Column(TIMESTAMP, nullable=False, index=True)
    timestamp_sincronizado = Column(TIMESTAMP, server_default=func.now())
    
    # Metadatos
    dispositivo_id = Column(String(100), nullable=True)
    version_app = Column(String(20), nullable=True)
    sincronizado_offline = Column(Boolean, default=False)
    
    # REALACIONES
    chofer = relationship("Usuario", back_populates="eventos_somnolencia")
    viaje = relationship("Viaje", back_populates="eventos_somnolencia")
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "tipo_evento IN ('microsueno', 'cabeceo', 'parpadeo_ojos', 'bostezo', 'frotamiento_ojos')",
            name='chk_tipo_evento_valido'
        ),
        CheckConstraint(
            "nivel_severidad IN ('NORMAL', 'MEDIUM', 'HIGH', 'CRITICAL')",
            name='chk_nivel_severidad_valido'
        ),
        CheckConstraint(
            'duracion_segundos IS NULL OR duracion_segundos > 0',
            name='chk_duracion_positiva'
        ),
    )
    
    def __repr__(self):
        return f"<EventoSomnolencia(id={self.id_evento}, tipo={self.tipo_evento}, chofer={self.id_chofer})>"