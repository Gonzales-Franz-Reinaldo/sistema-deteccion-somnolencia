// TIPOS PARA SESIONES Y ALERTAS

export interface AlertaResumen {
  id_alerta: number;
  timestamp_alerta: string;
  tipo_alerta: TipoAlerta;
  severidad: Severidad;
  duracion_segundos?: number;
}

export interface SesionResumen {
  id_sesion: number;
  id_usuario: number;
  nombre_chofer: string;
  email_chofer: string;
  empresa: string;
  fecha_inicio: string;
  fecha_fin?: string;
  duracion_minutos?: number;
  estado: EstadoSesion;
  nivel_alerta: NivelAlerta;
  ruta_nombre?: string;
  
  // Contadores de alertas
  total_microsueno: number;
  total_bostezos: number;
  total_parpadeos_excesivos: number;
  total_cabeceos: number;
  total_frotamiento_ojos: number;
  total_alertas: number;
}

export interface DetalleSesion extends SesionResumen {
  ubicacion_inicio?: string;
  ubicacion_fin?: string;
  observaciones?: string;
  alertas: AlertaResumen[];
}

// TIPOS PARA FILTROS

export interface ReporteFiltros {
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string;    // YYYY-MM-DD
  id_chofer?: number;
  id_empresa?: number;
  tipo_alerta?: TipoAlerta;
  estado?: EstadoSesion;
  nivel_alerta?: NivelAlerta;
  skip?: number;
  limit?: number;
}

// TIPOS PARA ESTADÍSTICAS

export interface AlertasPorTipo {
  microsueno: number;
  bostezos: number;
  parpadeos_excesivos: number;
  cabeceos: number;
  frotamiento_ojos: number;
}

export interface EstadisticasReporte {
  total_sesiones: number;
  total_sesiones_activas: number;
  total_sesiones_finalizadas: number;
  total_alertas: number;
  total_choferes: number;
  
  alertas_por_tipo: AlertasPorTipo;
  
  promedio_alertas_por_sesion: number;
  promedio_duracion_sesion_minutos: number;
  
  sesiones_normales: number;
  sesiones_alerta: number;
  sesiones_criticas: number;
}

// TIPOS PARA RESPUESTAS

export interface ReportesResponse {
  sesiones: SesionResumen[];
  total: number;
  skip: number;
  limit: number;
}

export interface EstadisticasResponse {
  estadisticas: EstadisticasReporte;
  periodo_inicio?: string;
  periodo_fin?: string;
}

// ENUMS Y TIPOS LITERALES

export type TipoAlerta = 
  | 'microsueno' 
  | 'bostezo' 
  | 'parpadeo_excesivo' 
  | 'cabeceo' 
  | 'frotamiento_ojos';

export type Severidad = 'leve' | 'moderado' | 'grave' | 'critico';

export type EstadoSesion = 'activa' | 'finalizada' | 'interrumpida';

export type NivelAlerta = 'normal' | 'alerta' | 'critico';

// MAPEOS DE ETIQUETAS

export const TIPO_ALERTA_LABELS: Record<TipoAlerta, string> = {
  microsueno: 'Microsueños',
  bostezo: 'Bostezos',
  parpadeo_excesivo: 'Parpadeo Excesivo',
  cabeceo: 'Cabeceos',
  frotamiento_ojos: 'Frotamiento de Ojos'
};

export const SEVERIDAD_LABELS: Record<Severidad, string> = {
  leve: 'Leve',
  moderado: 'Moderado',
  grave: 'Grave',
  critico: 'Crítico'
};

export const ESTADO_SESION_LABELS: Record<EstadoSesion, string> = {
  activa: 'Activa',
  finalizada: 'Finalizada',
  interrumpida: 'Interrumpida'
};

export const NIVEL_ALERTA_LABELS: Record<NivelAlerta, string> = {
  normal: 'Normal',
  alerta: 'Alerta',
  critico: 'Crítico'
};

// COLORES POR NIVEL

export const NIVEL_ALERTA_COLORS: Record<NivelAlerta, string> = {
  normal: 'text-green-600 bg-green-50',
  alerta: 'text-yellow-600 bg-yellow-50',
  critico: 'text-red-600 bg-red-50'
};

export const NIVEL_ALERTA_BADGES: Record<NivelAlerta, string> = {
  normal: 'bg-green-100 text-green-800',
  alerta: 'bg-yellow-100 text-yellow-800',
  critico: 'bg-red-100 text-red-800'
};
