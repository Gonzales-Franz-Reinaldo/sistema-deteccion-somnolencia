from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin_user
from app.models.user import Usuario
from app.schemas.reporte import (
    ReporteFiltros,
    ReportesResponse,
    EstadisticasResponse,
    DetalleSesion
)
from app.crud import reporte as crud_reporte


router = APIRouter()


@router.get("/", response_model=ReportesResponse)
def obtener_reportes(
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio del período (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin del período (YYYY-MM-DD)"),
    id_chofer: Optional[int] = Query(None, description="ID del chofer"),
    id_empresa: Optional[int] = Query(None, description="ID de la empresa"),
    tipo_alerta: Optional[str] = Query(None, description="Tipo de alerta (microsueño, bostezo, etc.)"),
    estado: Optional[str] = Query(None, description="Estado de la sesión (activa, finalizada, interrumpida)"),
    nivel_alerta: Optional[str] = Query(None, description="Nivel de alerta (normal, alerta, critico)"),
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de registros"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    **Obtener lista de sesiones con filtros**
    
    Endpoint para obtener reportes de sesiones de monitoreo con filtros opcionales.
    
    **Requiere rol:** Admin
    
    **Filtros disponibles:**
    - `fecha_inicio` y `fecha_fin`: Rango de fechas
    - `id_chofer`: Filtrar por chofer específico
    - `id_empresa`: Filtrar por empresa
    - `tipo_alerta`: Filtrar sesiones que tengan alertas de este tipo
    - `estado`: Filtrar por estado de sesión
    - `nivel_alerta`: Filtrar por nivel de alerta
    - `skip` y `limit`: Paginación
    
    **Retorna:**
    - Lista de sesiones con resumen de alertas
    - Total de registros
    - Información de paginación
    """
    # Crear objeto de filtros
    filtros = ReporteFiltros(
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        id_chofer=id_chofer,
        id_empresa=id_empresa,
        tipo_alerta=tipo_alerta,
        estado=estado,
        nivel_alerta=nivel_alerta,
        skip=skip,
        limit=limit
    )
    
    # Obtener sesiones con filtros
    sesiones, total = crud_reporte.obtener_reportes_con_filtros(db, filtros)
    
    return ReportesResponse(
        sesiones=sesiones,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/estadisticas", response_model=EstadisticasResponse)
def obtener_estadisticas(
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin del período"),
    id_chofer: Optional[int] = Query(None, description="ID del chofer"),
    id_empresa: Optional[int] = Query(None, description="ID de la empresa"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    **Obtener estadísticas agregadas de reportes**
    
    Endpoint para obtener métricas y estadísticas generales de sesiones y alertas.
    
    **Requiere rol:** Admin
    
    **Filtros opcionales:**
    - `fecha_inicio` y `fecha_fin`: Período de análisis
    - `id_chofer`: Estadísticas de un chofer específico
    - `id_empresa`: Estadísticas de una empresa
    
    **Retorna:**
    - Total de sesiones y choferes
    - Total de alertas por tipo
    - Promedios de alertas y duración
    - Distribución por nivel de alerta
    """
    estadisticas = crud_reporte.obtener_estadisticas_generales(
        db=db,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        id_chofer=id_chofer,
        id_empresa=id_empresa
    )
    
    return EstadisticasResponse(
        estadisticas=estadisticas,
        periodo_inicio=fecha_inicio,
        periodo_fin=fecha_fin
    )


@router.get("/sesion/{id_sesion}", response_model=DetalleSesion)
def obtener_detalle_sesion(
    id_sesion: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    **Obtener detalle completo de una sesión**
    
    Endpoint para obtener información detallada de una sesión específica,
    incluyendo todas las alertas generadas.
    
    **Requiere rol:** Admin
    
    **Parámetros:**
    - `id_sesion`: ID de la sesión a consultar
    
    **Retorna:**
    - Información completa de la sesión
    - Datos del chofer y empresa
    - Lista de todas las alertas con timestamps
    - Contadores totales por tipo de alerta
    """
    detalle = crud_reporte.obtener_detalle_sesion(db, id_sesion)
    
    if not detalle:
        raise HTTPException(
            status_code=404,
            detail=f"Sesión con ID {id_sesion} no encontrada"
        )
    
    return detalle


@router.get("/health")
def health_check(
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    **Health check del módulo de reportes**
    
    Endpoint para verificar que el módulo de reportes está operativo.
    
    **Requiere rol:** Admin
    """
    return {
        "status": "ok",
        "module": "reportes",
        "message": "Módulo de reportes operativo"
    }

