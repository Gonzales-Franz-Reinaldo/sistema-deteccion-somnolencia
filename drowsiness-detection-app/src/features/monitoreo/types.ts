// ============================================
// TIPOS E INTERFACES PARA FEATURE MONITOREO
// ============================================

/**
 * Información del chofer para monitoreo
 */
export interface ChoferInfo {
  id_usuario: number;
  nombre_completo: string;
  dni_ci: string | null;
  email: string;
  telefono: string | null;
  ciudad: string | null;
  numero_licencia: string | null;
  categoria_licencia: string | null;
  tipo_chofer: 'individual' | 'empresa';
  empresa: string | null;
}

/**
 * Posición GPS del chofer
 */
export interface PosicionGPS {
  lat: number;
  lng: number;
  velocidad: number | null;
  heading: number | null;
  timestamp: string;
  precision?: number;
}

/**
 * Evento de somnolencia en tiempo real
 */
export interface EventoMonitoreo {
  id_evento: number;
  tipo_evento: 'microsueno' | 'cabeceo' | 'parpadeo_ojos' | 'bostezo' | 'frotamiento_ojos';
  nivel_severidad: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  duracion_segundos: number | null;
  cantidad_eventos: number | null;
  timestamp_evento: string;
  latitud: number | null;
  longitud: number | null;
  velocidad_kmh: number | null;
}

/**
 * Contadores de eventos del viaje
 */
export interface ContadoresEventos {
  microsuenos: number;
  cabeceos: number;
  bostezos: number;
  parpadeos_excesivos: number;
  frotamiento_ojos: number;
  total_alertas: number;
}

/**
 * Información completa del viaje para monitoreo
 */
export interface ViajeMonitoreo {
  id_viaje: number;
  id_chofer: number;
  origen: string;
  destino: string;
  estado: 'pendiente' | 'en_curso' | 'completada' | 'cancelada';
  duracion_estimada: string;
  distancia_km: number | null;
  fecha_inicio: string | null;
  fecha_viaje_programada: string;
  hora_viaje_programada: string;
  chofer: ChoferInfo;
  contadores: ContadoresEventos;
  eventos_recientes: EventoMonitoreo[];
  ultima_posicion: PosicionGPS | null;
}

/**
 * Estado de conexión GPS
 */
export interface EstadoGPS {
  conectado: boolean;
  senal: number; // 0-8
  precision: number; // metros
  ultimaActualizacion: string | null;
}

/**
 * Configuración de iconos por tipo de evento
 */
export const EVENTO_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  microsueno: { icon: '😴', color: 'text-red-600', label: 'Ojos Cerrados' },
  cabeceo: { icon: '🙇', color: 'text-orange-600', label: 'Cabeceo' },
  parpadeo_ojos: { icon: '👁️', color: 'text-yellow-600', label: 'Parpadeo Excesivo' },
  bostezo: { icon: '🥱', color: 'text-blue-600', label: 'Bostezo' },
  frotamiento_ojos: { icon: '🤚', color: 'text-purple-600', label: 'Frotamiento Ojos' },
};

/**
 * Configuración de colores por severidad
 */
export const SEVERIDAD_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};