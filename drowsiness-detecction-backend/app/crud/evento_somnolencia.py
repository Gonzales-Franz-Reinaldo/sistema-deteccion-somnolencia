from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from app.models.evento_somnolencia import EventoSomnolencia
from app.models.user import Usuario  
from app.schemas.evento_somnolencia import EventoSomnolenciaCreate
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta


def crear_evento(
    db: Session, 
    evento: EventoSomnolenciaCreate,
    id_chofer: int
) -> EventoSomnolencia:
    """
    Crear un nuevo evento de somnolencia.
    """
    db_evento = EventoSomnolencia(
        id_chofer=id_chofer,
        id_viaje=evento.id_viaje,
        tipo_evento=evento.tipo_evento,
        duracion_segundos=evento.duracion_segundos,
        cantidad_eventos=evento.cantidad_eventos,
        nivel_severidad=evento.nivel_severidad,
        latitud=evento.latitud,
        longitud=evento.longitud,
        velocidad_kmh=evento.velocidad_kmh,
        timestamp_evento=evento.timestamp_evento,
        dispositivo_id=evento.dispositivo_id,
        version_app=evento.version_app,
        sincronizado_offline=evento.sincronizado_offline
    )
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


def crear_eventos_batch(
    db: Session, 
    eventos: List[EventoSomnolenciaCreate],
    id_chofer: int
) -> List[EventoSomnolencia]:
    """
    Crear múltiples eventos en una sola transacción.
    """
    db_eventos = []
    for evento in eventos:
        db_evento = EventoSomnolencia(
            id_chofer=id_chofer,
            id_viaje=evento.id_viaje,
            tipo_evento=evento.tipo_evento,
            duracion_segundos=evento.duracion_segundos,
            cantidad_eventos=evento.cantidad_eventos,
            nivel_severidad=evento.nivel_severidad,
            latitud=evento.latitud,
            longitud=evento.longitud,
            velocidad_kmh=evento.velocidad_kmh,
            timestamp_evento=evento.timestamp_evento,
            dispositivo_id=evento.dispositivo_id,
            version_app=evento.version_app,
            sincronizado_offline=evento.sincronizado_offline
        )
        db_eventos.append(db_evento)
    
    db.add_all(db_eventos)
    db.commit()
    
    for evento in db_eventos:
        db.refresh(evento)
    
    return db_eventos


def obtener_evento_por_id(db: Session, id_evento: int) -> Optional[EventoSomnolencia]:
    """
    Obtener un evento por su ID.
    """
    return db.query(EventoSomnolencia).filter(
        EventoSomnolencia.id_evento == id_evento
    ).first()


def obtener_eventos_por_chofer(
    db: Session, 
    id_chofer: int, 
    limite: int = 100,
    offset: int = 0,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
    tipo_evento: Optional[str] = None,
    nivel_severidad: Optional[str] = None
) -> List[EventoSomnolencia]:
    """
    Obtener eventos de un chofer específico con filtros opcionales.
    """
    query = db.query(EventoSomnolencia).filter(
        EventoSomnolencia.id_chofer == id_chofer
    )
    
    if desde:
        query = query.filter(EventoSomnolencia.timestamp_evento >= desde)
    
    if hasta:
        query = query.filter(EventoSomnolencia.timestamp_evento <= hasta)
    
    if tipo_evento:
        query = query.filter(EventoSomnolencia.tipo_evento == tipo_evento)
    
    if nivel_severidad:
        query = query.filter(EventoSomnolencia.nivel_severidad == nivel_severidad)
    
    return query.order_by(
        desc(EventoSomnolencia.timestamp_evento)
    ).offset(offset).limit(limite).all()


def obtener_eventos_por_viaje(
    db: Session, 
    id_viaje: int
) -> List[EventoSomnolencia]:
    """
    Obtener todos los eventos de un viaje específico.
    """
    return db.query(EventoSomnolencia).filter(
        EventoSomnolencia.id_viaje == id_viaje
    ).order_by(
        EventoSomnolencia.timestamp_evento.asc()
    ).all()


def obtener_eventos_recientes(
    db: Session, 
    minutos: int = 60,
    limite: int = 100,
    solo_criticos: bool = False
) -> List[EventoSomnolencia]:
    """
    Obtener eventos de los últimos X minutos.
    """
    tiempo_limite = datetime.utcnow() - timedelta(minutes=minutos)
    
    query = db.query(EventoSomnolencia).filter(
        EventoSomnolencia.timestamp_evento >= tiempo_limite
    )
    
    if solo_criticos:
        query = query.filter(
            EventoSomnolencia.nivel_severidad.in_(['CRITICAL', 'HIGH'])
        )
    
    return query.order_by(
        desc(EventoSomnolencia.timestamp_evento)
    ).limit(limite).all()


def obtener_estadisticas_chofer(
    db: Session, 
    id_chofer: int, 
    dias: int = 7
) -> Dict[str, Any]:
    """
    Obtener estadísticas de eventos de un chofer en los últimos X días.
    """
    fecha_inicio = datetime.utcnow() - timedelta(days=dias)
    
    # Base query
    base_query = db.query(EventoSomnolencia).filter(
        and_(
            EventoSomnolencia.id_chofer == id_chofer,
            EventoSomnolencia.timestamp_evento >= fecha_inicio
        )
    )
    
    # Contar por tipo
    stats_tipo = db.query(
        EventoSomnolencia.tipo_evento,
        func.count(EventoSomnolencia.id_evento).label('cantidad')
    ).filter(
        and_(
            EventoSomnolencia.id_chofer == id_chofer,
            EventoSomnolencia.timestamp_evento >= fecha_inicio
        )
    ).group_by(EventoSomnolencia.tipo_evento).all()
    
    # Contar por severidad
    stats_severidad = db.query(
        EventoSomnolencia.nivel_severidad,
        func.count(EventoSomnolencia.id_evento).label('cantidad')
    ).filter(
        and_(
            EventoSomnolencia.id_chofer == id_chofer,
            EventoSomnolencia.timestamp_evento >= fecha_inicio
        )
    ).group_by(EventoSomnolencia.nivel_severidad).all()
    
    # Convertir a diccionarios
    resultado = {
        "microsuenos": 0,
        "cabeceos": 0,
        "bostezos": 0,
        "parpadeo_ojos": 0,
        "frotamientos_ojos": 0,
        "eventos_critical": 0,
        "eventos_high": 0,
        "eventos_medium": 0
    }
    
    for tipo, cantidad in stats_tipo:
        if tipo == "microsueno":
            resultado["microsuenos"] = cantidad
        elif tipo == "cabeceo":
            resultado["cabeceos"] = cantidad
        elif tipo == "bostezo":
            resultado["bostezos"] = cantidad
        elif tipo == "parpadeo_ojos":
            resultado["parpadeo_ojos"] = cantidad
        elif tipo == "frotamiento_ojos":
            resultado["frotamientos_ojos"] = cantidad
    
    for severidad, cantidad in stats_severidad:
        if severidad == "CRITICAL":
            resultado["eventos_critical"] = cantidad
        elif severidad == "HIGH":
            resultado["eventos_high"] = cantidad
        elif severidad == "MEDIUM":
            resultado["eventos_medium"] = cantidad
    
    # Total de eventos
    resultado["total_eventos"] = sum([
        resultado["microsuenos"],
        resultado["cabeceos"],
        resultado["bostezos"],
        resultado["parpadeo_ojos"],
        resultado["frotamientos_ojos"]
    ])
    
    # Último evento
    ultimo = base_query.order_by(
        desc(EventoSomnolencia.timestamp_evento)
    ).first()
    resultado["ultimo_evento"] = ultimo.timestamp_evento if ultimo else None
    
    return resultado


def obtener_estadisticas_generales(
    db: Session,
    dias: int = 7
) -> Dict[str, Any]:
    """
    Obtener estadísticas generales del sistema (para admin).
    """
    fecha_inicio = datetime.utcnow() - timedelta(days=dias)
    
    # Total eventos
    total = db.query(func.count(EventoSomnolencia.id_evento)).filter(
        EventoSomnolencia.timestamp_evento >= fecha_inicio
    ).scalar() or 0
    
    # Choferes únicos con eventos
    choferes_unicos = db.query(
        func.count(func.distinct(EventoSomnolencia.id_chofer))
    ).filter(
        EventoSomnolencia.timestamp_evento >= fecha_inicio
    ).scalar() or 0
    
    # Por tipo
    por_tipo_result = db.query(
        EventoSomnolencia.tipo_evento,
        func.count(EventoSomnolencia.id_evento).label('cantidad')
    ).filter(
        EventoSomnolencia.timestamp_evento >= fecha_inicio
    ).group_by(EventoSomnolencia.tipo_evento).all()
    
    por_tipo = {tipo: cantidad for tipo, cantidad in por_tipo_result}
    
    # Por severidad
    por_severidad_result = db.query(
        EventoSomnolencia.nivel_severidad,
        func.count(EventoSomnolencia.id_evento).label('cantidad')
    ).filter(
        EventoSomnolencia.timestamp_evento >= fecha_inicio
    ).group_by(EventoSomnolencia.nivel_severidad).all()
    
    por_severidad = {sev: cantidad for sev, cantidad in por_severidad_result}
    
    # Top choferes
    top_choferes_result = db.query(
        EventoSomnolencia.id_chofer,
        func.count(EventoSomnolencia.id_evento).label('total')
    ).filter(
        EventoSomnolencia.timestamp_evento >= fecha_inicio
    ).group_by(
        EventoSomnolencia.id_chofer
    ).order_by(
        desc('total')
    ).limit(5).all()
    
    top_choferes = [
        {"id_chofer": id_chofer, "total_eventos": total}
        for id_chofer, total in top_choferes_result
    ]
    
    return {
        "periodo_dias": dias,
        "total_eventos": total,
        "total_choferes_con_eventos": choferes_unicos,
        "por_tipo": por_tipo,
        "por_severidad": por_severidad,
        "top_choferes": top_choferes
    }


def contar_eventos_chofer(
    db: Session,
    id_chofer: int,
    desde: Optional[datetime] = None
) -> int:
    """
    Contar eventos de un chofer desde una fecha.
    """
    query = db.query(func.count(EventoSomnolencia.id_evento)).filter(
        EventoSomnolencia.id_chofer == id_chofer
    )
    
    if desde:
        query = query.filter(EventoSomnolencia.timestamp_evento >= desde)
    
    return query.scalar() or 0