from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sesion import SesionViaje, AlertaSomnolencia
from app.models.user import Usuario


def obtener_metricas_monitoreo(db: Session) -> dict:
    """Calcular métricas para cabecera de monitoreo de viajes."""
    hoy = date.today()
    choferes_totales = db.query(Usuario).filter(Usuario.rol == 'chofer').count()
    viajes_activos = db.query(SesionViaje).filter(SesionViaje.estado == 'activa').count()
    alertas_hoy = db.query(AlertaSomnolencia).filter(func.date(AlertaSomnolencia.timestamp_alerta) == hoy).count()
    return {
        "choferes_totales": choferes_totales,
        "viajes_activos": viajes_activos,
        "alertas_hoy": alertas_hoy,
        "fecha": hoy.isoformat()
    }
