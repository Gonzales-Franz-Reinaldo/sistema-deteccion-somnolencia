/**
 * Tipos para el módulo de Eventos de Somnolencia
 */

// ENUMS

export type TipoEvento = 
  | 'microsueno' 
  | 'cabeceo' 
  | 'parpadeo_ojos' 
  | 'bostezo' 
  | 'frotamiento_ojos';

export type NivelSeveridad = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// INTERFACES DE EVENTOS

export interface EventoResumen {
  id_evento: number;
  tipo_evento: TipoEvento;
  nivel_severidad: NivelSeveridad | null;
  duracion_segundos: number | null;
  cantidad_eventos: number | null;
  timestamp_evento: string;
  latitud: number | null;
  longitud: number | null;
  velocidad_kmh: number | null;
}

export interface EventoConChofer extends EventoResumen {
  nombre_chofer: string | null;
  id_chofer?: number;
}

export interface EventoCompleto extends EventoResumen {
  id_chofer: number;
  id_viaje: number | null;
  timestamp_sincronizado: string;
  dispositivo_id: string | null;
  version_app: string | null;
  sincronizado_offline: boolean;
}

// INTERFACES DE ESTADÍSTICAS

export interface EstadisticasChofer {
  id_chofer: number;
  nombre_chofer: string;
  periodo_dias: number;
  total_eventos: number;
  microsuenos: number;
  cabeceos: number;
  bostezos: number;
  parpadeo_ojos: number;
  frotamientos_ojos: number;
  eventos_critical: number;
  eventos_high: number;
  eventos_medium: number;
  ultimo_evento: string | null;
}

export interface EstadisticasGenerales {
  periodo_dias: number;
  total_eventos: number;
  total_choferes_con_eventos: number;
  por_tipo: Record<string, number>;
  por_severidad: Record<string, number>;
  top_choferes: Array<{
    id_chofer: number;
    total_eventos: number;
  }>;
}

// INTERFACES DE FILTROS

export interface EventosFiltros {
  id_chofer?: number;
  tipo_evento?: TipoEvento;
  nivel_severidad?: NivelSeveridad;
  dias?: number;
  limite?: number;
  offset?: number;
  solo_criticos?: boolean;
}

// MAPEOS Y LABELS

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  microsueno: 'Microsueño',
  cabeceo: 'Cabeceo',
  parpadeo_ojos: 'Parpadeo Excesivo',
  bostezo: 'Bostezo',
  frotamiento_ojos: 'Frotamiento de Ojos'
};

export const TIPO_EVENTO_ICONOS: Record<TipoEvento, string> = {
  microsueno: '😴',
  cabeceo: '🤕',
  parpadeo_ojos: '👁️',
  bostezo: '🥱',
  frotamiento_ojos: '🤦'
};

export const SEVERIDAD_LABELS: Record<NivelSeveridad, string> = {
  NORMAL: 'Normal',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

export const SEVERIDAD_COLORS: Record<NivelSeveridad, string> = {
  NORMAL: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
};

export const SEVERIDAD_DOT_COLORS: Record<NivelSeveridad, string> = {
  NORMAL: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
};