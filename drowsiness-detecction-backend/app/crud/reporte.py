from typing import List, Optional, Tuple
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, case

from app.models.sesion import SesionViaje, AlertaSomnolencia
from app.models.posicion_viaje import PosicionViaje
from app.models.user import Usuario
from app.models.empresa import Empresa
from app.schemas.reporte import (
    ReporteFiltros,
    SesionResumen,
    DetalleSesion,
    EstadisticasReporte,
    AlertasPorTipo
)


def obtener_reportes_con_filtros(
    db: Session,
    filtros: ReporteFiltros
) -> Tuple[List[SesionResumen], int]:
    """
    Obtener lista de sesiones con filtros aplicados
    
    Args:
        db: Sesión de base de datos
        filtros: Filtros de búsqueda (ReporteFiltros)
    
    Returns:
        Tuple de (lista de sesiones, total de registros)
    """
    # Query base con JOIN a Usuario
    query = db.query(SesionViaje).join(
        Usuario, SesionViaje.id_usuario == Usuario.id_usuario
    ).outerjoin(
        Empresa, Usuario.id_empresa == Empresa.id_empresa
    )
    
    # Aplicar filtros
    condiciones = []
    
    if filtros.fecha_inicio:
        condiciones.append(
            func.date(SesionViaje.fecha_inicio) >= filtros.fecha_inicio
        )
    
    if filtros.fecha_fin:
        condiciones.append(
            func.date(SesionViaje.fecha_inicio) <= filtros.fecha_fin
        )
    
    if filtros.id_chofer:
        condiciones.append(SesionViaje.id_usuario == filtros.id_chofer)
    
    if filtros.id_empresa:
        condiciones.append(Usuario.id_empresa == filtros.id_empresa)
    
    if filtros.estado:
        condiciones.append(SesionViaje.estado == filtros.estado)
    
    if filtros.nivel_alerta:
        condiciones.append(SesionViaje.nivel_alerta == filtros.nivel_alerta)
    
    # Filtro por tipo de alerta (requiere subconsulta)
    if filtros.tipo_alerta:
        condiciones.append(
            SesionViaje.id_sesion.in_(
                db.query(AlertaSomnolencia.id_sesion).filter(
                    AlertaSomnolencia.tipo_alerta == filtros.tipo_alerta
                )
            )
        )
    
    if condiciones:
        query = query.filter(and_(*condiciones))
    
    # Contar total antes de paginación
    total = query.count()
    
    # Ordenar por fecha más reciente
    query = query.order_by(SesionViaje.fecha_inicio.desc())
    
    # Aplicar paginación
    sesiones = query.offset(filtros.skip).limit(filtros.limit).all()
    
    # Convertir a SesionResumen
    sesiones_resumen = []
    for sesion in sesiones:
        sesiones_resumen.append(
            SesionResumen(
                id_sesion=sesion.id_sesion,
                id_usuario=sesion.id_usuario,
                nombre_chofer=sesion.nombre_chofer,
                email_chofer=sesion.email_chofer,
                empresa=sesion.empresa_chofer,
                fecha_inicio=sesion.fecha_inicio,
                fecha_fin=sesion.fecha_fin,
                duracion_minutos=sesion.duracion_minutos,
                estado=sesion.estado,
                nivel_alerta=sesion.nivel_alerta,
                ruta_nombre=sesion.ruta_nombre,
                total_microsueno=sesion.total_microsuenos or 0,
                total_bostezos=sesion.total_bostezos or 0,
                total_parpadeos_excesivos=sesion.total_parpadeos_excesivos or 0,
                total_cabeceos=sesion.total_cabeceos or 0,
                total_frotamiento_ojos=sesion.total_frotamiento_ojos or 0,
                total_alertas=sesion.total_alertas
            )
        )
    
    return sesiones_resumen, total


def obtener_posiciones_por_sesion(
    db: Session,
    id_sesion: int,
    limit: int = 200,
    skip: int = 0
) -> Tuple[List[PosicionViaje], int]:
    """Recuperar posiciones de una sesión (paginadas, orden cronológico asc)."""
    base_q = db.query(PosicionViaje).filter(PosicionViaje.id_sesion == id_sesion)
    total = base_q.count()
    posiciones = base_q.order_by(PosicionViaje.timestamp.asc()).offset(skip).limit(limit).all()
    return posiciones, total


def obtener_viajes_activos_con_ultima_posicion(db: Session) -> List[dict]:
    """Lista de sesiones activas con su última posición y métricas clave."""
    sesiones_activas = db.query(SesionViaje).filter(SesionViaje.estado == 'activa').order_by(SesionViaje.fecha_inicio.desc()).all()
    resultado = []
    for s in sesiones_activas:
        ultima_pos = (
            db.query(PosicionViaje)
            .filter(PosicionViaje.id_sesion == s.id_sesion)
            .order_by(PosicionViaje.timestamp.desc())
            .first()
        )
        ultima_alerta = (
            db.query(AlertaSomnolencia)
            .filter(AlertaSomnolencia.id_sesion == s.id_sesion)
            .order_by(AlertaSomnolencia.timestamp_alerta.desc())
            .first()
        )
        resultado.append({
            "id_sesion": s.id_sesion,
            "nombre_chofer": s.nombre_chofer,
            "empresa": s.empresa_chofer,
            "nivel_alerta": s.nivel_alerta,
            "total_alertas": s.total_alertas,
            "fecha_inicio": s.fecha_inicio,
            "duracion_minutos": s.duracion_minutos,
            "ultima_alerta": ultima_alerta.timestamp_alerta if ultima_alerta else None,
            "ultima_posicion": {
                "lat": ultima_pos.lat,
                "lng": ultima_pos.lng,
                "timestamp": ultima_pos.timestamp
            } if ultima_pos else None
        })
    return resultado



def obtener_estadisticas_generales(
    db: Session,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_chofer: Optional[int] = None,
    id_empresa: Optional[int] = None
) -> EstadisticasReporte:
    """
    Obtener estadísticas agregadas de sesiones y alertas
    
    Args:
        db: Sesión de base de datos
        fecha_inicio: Filtro de fecha inicio (opcional)
        fecha_fin: Filtro de fecha fin (opcional)
        id_chofer: Filtro por chofer (opcional)
        id_empresa: Filtro por empresa (opcional)
    
    Returns:
        EstadisticasReporte con métricas agregadas
    """
    # Query base
    query = db.query(SesionViaje).join(
        Usuario, SesionViaje.id_usuario == Usuario.id_usuario
    )
    
    # Aplicar filtros
    condiciones = []
    
    if fecha_inicio:
        condiciones.append(func.date(SesionViaje.fecha_inicio) >= fecha_inicio)
    
    if fecha_fin:
        condiciones.append(func.date(SesionViaje.fecha_inicio) <= fecha_fin)
    
    if id_chofer:
        condiciones.append(SesionViaje.id_usuario == id_chofer)
    
    if id_empresa:
        condiciones.append(Usuario.id_empresa == id_empresa)
    
    if condiciones:
        query = query.filter(and_(*condiciones))
    
    # Total de sesiones
    total_sesiones = query.count()
    
    # Sesiones por estado
    total_activas = query.filter(SesionViaje.estado == 'activa').count()
    total_finalizadas = query.filter(SesionViaje.estado == 'finalizada').count()
    
    # Sesiones por nivel de alerta
    sesiones_normales = query.filter(SesionViaje.nivel_alerta == 'normal').count()
    sesiones_alerta = query.filter(SesionViaje.nivel_alerta == 'alerta').count()
    sesiones_criticas = query.filter(SesionViaje.nivel_alerta == 'critico').count()
    
    # Total de choferes únicos
    total_choferes = db.query(func.count(func.distinct(SesionViaje.id_usuario))).filter(
        SesionViaje.id_sesion.in_(query.with_entities(SesionViaje.id_sesion))
    ).scalar() or 0
    
    # Agregaciones de alertas
    agregaciones = query.with_entities(
        func.sum(SesionViaje.total_microsuenos).label('microsuenos'),
        func.sum(SesionViaje.total_bostezos).label('bostezos'),
        func.sum(SesionViaje.total_parpadeos_excesivos).label('parpadeos'),
        func.sum(SesionViaje.total_cabeceos).label('cabeceos'),
        func.sum(SesionViaje.total_frotamiento_ojos).label('frotamiento'),
        func.avg(SesionViaje.duracion_minutos).label('promedio_duracion')
    ).first()
    
    # Calcular totales
    total_microsueno = agregaciones.microsuenos or 0
    total_bostezos = agregaciones.bostezos or 0
    total_parpadeos = agregaciones.parpadeos or 0
    total_cabeceos = agregaciones.cabeceos or 0
    total_frotamiento = agregaciones.frotamiento or 0
    
    total_alertas = (
        total_microsueno +
        total_bostezos +
        total_parpadeos +
        total_cabeceos +
        total_frotamiento
    )
    
    # Promedios
    promedio_alertas = total_alertas / total_sesiones if total_sesiones > 0 else 0.0
    promedio_duracion = float(agregaciones.promedio_duracion or 0.0)
    
    return EstadisticasReporte(
        total_sesiones=total_sesiones,
        total_sesiones_activas=total_activas,
        total_sesiones_finalizadas=total_finalizadas,
        total_alertas=total_alertas,
        total_choferes=total_choferes,
        alertas_por_tipo=AlertasPorTipo(
            microsueno=total_microsueno,
            bostezos=total_bostezos,
            parpadeos_excesivos=total_parpadeos,
            cabeceos=total_cabeceos,
            frotamiento_ojos=total_frotamiento
        ),
        promedio_alertas_por_sesion=round(promedio_alertas, 2),
        promedio_duracion_sesion_minutos=round(promedio_duracion, 2),
        sesiones_normales=sesiones_normales,
        sesiones_alerta=sesiones_alerta,
        sesiones_criticas=sesiones_criticas
    )


def obtener_detalle_sesion(db: Session, id_sesion: int) -> Optional[DetalleSesion]:
    """
    Obtener detalle completo de una sesión incluyendo alertas
    
    Args:
        db: Sesión de base de datos
        id_sesion: ID de la sesión
    
    Returns:
        DetalleSesion o None si no existe
    """
    # Obtener sesión
    sesion = db.query(SesionViaje).filter(
        SesionViaje.id_sesion == id_sesion
    ).first()
    
    if not sesion:
        return None
    
    # Obtener alertas de la sesión
    alertas = db.query(AlertaSomnolencia).filter(
        AlertaSomnolencia.id_sesion == id_sesion
    ).order_by(AlertaSomnolencia.timestamp_alerta.desc()).all()
    
    return DetalleSesion(
        id_sesion=sesion.id_sesion,
        id_usuario=sesion.id_usuario,
        nombre_chofer=sesion.nombre_chofer,
        email_chofer=sesion.email_chofer,
        empresa=sesion.empresa_chofer,
        fecha_inicio=sesion.fecha_inicio,
        fecha_fin=sesion.fecha_fin,
        duracion_minutos=sesion.duracion_minutos,
        estado=sesion.estado,
        nivel_alerta=sesion.nivel_alerta,
        ruta_nombre=sesion.ruta_nombre,
        ubicacion_inicio=sesion.ubicacion_inicio,
        ubicacion_fin=sesion.ubicacion_fin,
        observaciones=sesion.observaciones,
        total_microsueno=sesion.total_microsuenos or 0,
        total_bostezos=sesion.total_bostezos or 0,
        total_parpadeos_excesivos=sesion.total_parpadeos_excesivos or 0,
        total_cabeceos=sesion.total_cabeceos or 0,
        total_frotamiento_ojos=sesion.total_frotamiento_ojos or 0,
        total_alertas=sesion.total_alertas,
        alertas=[
            {
                'id_alerta': alerta.id_alerta,
                'timestamp_alerta': alerta.timestamp_alerta,
                'tipo_alerta': alerta.tipo_alerta,
                'severidad': alerta.severidad,
                'duracion_segundos': alerta.duracion_segundos
            }
            for alerta in alertas
        ]
    )

