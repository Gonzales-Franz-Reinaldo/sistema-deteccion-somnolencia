from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func, String, Index
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class PosicionViaje(Base):
    """Posiciones GPS asociadas a una sesión de viaje.

    Indica el rastro de la ruta seguida por el chofer durante la sesión.
    Se recomienda limpiar posiciones muy antiguas según políticas de retención.
    """

    __tablename__ = "posiciones_viaje"
    __table_args__ = (
        Index("ix_posicion_viaje_sesion_timestamp", "id_sesion", "timestamp"),
    )

    id_posicion = Column(Integer, primary_key=True, index=True)
    id_sesion = Column(
        Integer,
        ForeignKey("sesiones_viaje.id_sesion", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Coordenadas
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    velocidad = Column(Float)  # km/h (opcional)
    heading = Column(Float)    # rumbo en grados (opcional)

    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    origen = Column(String(30))  # 'device', 'manual', etc.

    sesion = relationship("SesionViaje", backref="posiciones")

    def __repr__(self):
        return f"<PosicionViaje {self.id_posicion} sesion={self.id_sesion} ({self.lat},{self.lng})>"
