from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================
# SCHEMAS PARA SESIONES
# ============================================

class AlertaResumen(BaseModel):
    """Schema para resumen de una alerta"""
    id_alerta: int
    timestamp_alerta: datetime
    tipo_alerta: str
    severidad: str
    duracion_segundos: Optional[float] = None
    
    class Config:
        from_attributes = True


class SesionResumen(BaseModel):
    """Schema para resumen de sesión en lista de reportes"""
    id_sesion: int
    id_usuario: int
    nombre_chofer: str
    email_chofer: str
    empresa: str
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    estado: str
    nivel_alerta: str
    ruta_nombre: Optional[str] = None
    
    # Contadores de alertas
    total_microsueno: int = 0
    total_bostezos: int = 0
    total_parpadeos_excesivos: int = 0
    total_cabeceos: int = 0
    total_frotamiento_ojos: int = 0
    total_alertas: int = 0
    
    class Config:
        from_attributes = True


class DetalleSesion(BaseModel):
    """Schema para detalle completo de una sesión"""
    id_sesion: int
    id_usuario: int
    nombre_chofer: str
    email_chofer: str
    empresa: str
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    estado: str
    nivel_alerta: str
    ruta_nombre: Optional[str] = None
    ubicacion_inicio: Optional[str] = None
    ubicacion_fin: Optional[str] = None
    observaciones: Optional[str] = None
    
    # Contadores de alertas
    total_microsueno: int = 0
    total_bostezos: int = 0
    total_parpadeos_excesivos: int = 0
    total_cabeceos: int = 0
    total_frotamiento_ojos: int = 0
    total_alertas: int = 0
    
    # Lista de alertas
    alertas: List[AlertaResumen] = []
    
    class Config:
        from_attributes = True


# ============================================
# SCHEMAS PARA FILTROS
# ============================================

class ReporteFiltros(BaseModel):
    """Schema para filtros de búsqueda de reportes"""
    fecha_inicio: Optional[date] = Field(None, description="Fecha de inicio del período")
    fecha_fin: Optional[date] = Field(None, description="Fecha de fin del período")
    id_chofer: Optional[int] = Field(None, description="ID del chofer")
    id_empresa: Optional[int] = Field(None, description="ID de la empresa")
    tipo_alerta: Optional[str] = Field(None, description="Tipo de alerta específica")
    estado: Optional[str] = Field(None, description="Estado de la sesión")
    nivel_alerta: Optional[str] = Field(None, description="Nivel de alerta")
    skip: int = Field(0, ge=0, description="Registros a saltar (paginación)")
    limit: int = Field(100, ge=1, le=1000, description="Límite de registros")


# ============================================
# SCHEMAS PARA ESTADÍSTICAS
# ============================================

class AlertasPorTipo(BaseModel):
    """Schema para conteo de alertas por tipo"""
    microsueno: int = 0
    bostezos: int = 0
    parpadeos_excesivos: int = 0
    cabeceos: int = 0
    frotamiento_ojos: int = 0


class EstadisticasReporte(BaseModel):
    """Schema para estadísticas generales de reportes"""
    total_sesiones: int = 0
    total_sesiones_activas: int = 0
    total_sesiones_finalizadas: int = 0
    total_alertas: int = 0
    total_choferes: int = 0
    
    # Alertas por tipo
    alertas_por_tipo: AlertasPorTipo
    
    # Promedios
    promedio_alertas_por_sesion: float = 0.0
    promedio_duracion_sesion_minutos: float = 0.0
    
    # Sesiones por nivel de alerta
    sesiones_normales: int = 0
    sesiones_alerta: int = 0
    sesiones_criticas: int = 0


# ============================================
# SCHEMAS PARA REPORTES GENERADOS
# ============================================

class ReporteGenerado(BaseModel):
    """Schema para metadata de reporte generado"""
    id_reporte: int
    tipo_reporte: str
    fecha_generacion: datetime
    periodo_inicio: Optional[date] = None
    periodo_fin: Optional[date] = None
    nombre_archivo: str
    ruta_archivo: str
    formato: str
    tamaño_kb: Optional[int] = None
    nombre_generador: str
    
    class Config:
        from_attributes = True


# ============================================
# SCHEMAS PARA RESPUESTAS
# ============================================

class ReportesResponse(BaseModel):
    """Schema para respuesta de lista de sesiones"""
    sesiones: List[SesionResumen]
    total: int
    skip: int
    limit: int


class EstadisticasResponse(BaseModel):
    """Schema para respuesta de estadísticas"""
    estadisticas: EstadisticasReporte
    periodo_inicio: Optional[date] = None
    periodo_fin: Optional[date] = None

