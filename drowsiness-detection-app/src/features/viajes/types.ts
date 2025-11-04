// ============================================
// TIPOS E INTERFACES PARA FEATURE VIAJES
// ============================================

/**
 * Estados disponibles para un viaje
 */
export type EstadoViaje = 'pendiente' | 'en_curso' | 'completada' | 'cancelada';

/**
 * Categorías de licencia de conducir en Bolivia
 */
export type CategoriaLicencia = 
  | 'Categoría A - Motocicletas'
  | 'Categoría B - Vehículos Livianos'
  | 'Categoría C - Vehículos Pesados'
  | 'Categoría D - Transporte Público'
  | 'Categoría E - Transporte Internacional'
  | 'Categoría F - Transporte de Carga Especial';

/**
 * Departamentos de Bolivia (para origen/destino)
 */
export type Departamento = 
  | 'La Paz'
  | 'Santa Cruz'
  | 'Cochabamba'
  | 'Oruro'
  | 'Potosí'
  | 'Chuquisaca'
  | 'Tarija'
  | 'Beni'
  | 'Pando';

/**
 * Interfaz principal para un Viaje
 * Representa la asignación de un viaje a un chofer
 */
export interface Viaje {
  id_viaje: number;
  id_chofer: number;
  id_empresa: number;
  origen: string;
  destino: string;
  duracion_estimada: string;
  distancia_km: number | null;
  estado: EstadoViaje;
  fecha_asignacion: string;
  fecha_viaje_programada: string; // Fecha para la que se programa el viaje (YYYY-MM-DD)
  hora_viaje_programada: string;  // Hora para la que se programa el viaje (HH:MM:SS)
  fecha_inicio: string | null;
  fecha_fin: string | null;
  observaciones: string | null;
  
  // Información relacionada (JOINs)
  nombre_chofer: string | null;
  categoria_licencia: string | null;
  nombre_empresa: string | null;
}

/**
 * Respuesta del endpoint GET /api/v1/viajes
 * Incluye datos de paginación y lista de viajes
 */
export interface ViajesListResponse {
  total: number;
  skip: number;
  limit: number;
  viajes: Viaje[];
}

/**
 * Filtros disponibles para la consulta de viajes
 */
export interface ViajesFilters {
  id_chofer?: number;
  id_empresa?: number;
  estado?: EstadoViaje;
  origen?: string;
  destino?: string;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  skip: number;
  limit: number;
}

/**
 * Datos necesarios para crear un nuevo viaje (enviar al backend)
 */
export interface ViajeCreateData {
  id_chofer: number;
  id_empresa: number;
  origen: string;
  destino: string;
  duracion_estimada: string;
  distancia_km?: number;
  fecha_viaje_programada: string; // YYYY-MM-DD
  hora_viaje_programada: string;  // HH:MM:SS
  observaciones?: string;
  enviar_email: boolean; // No se guarda en BD, solo metadata
}

/**
 * Datos para actualizar un viaje existente (enviar al backend)
 */
export interface ViajeUpdateData {
  id_chofer?: number;
  id_empresa?: number;
  origen?: string;
  destino?: string;
  duracion_estimada?: string;
  distancia_km?: number;
  fecha_viaje_programada?: string; // YYYY-MM-DD
  hora_viaje_programada?: string;  // HH:MM:SS
  estado?: EstadoViaje;
  fecha_inicio?: string;
  fecha_fin?: string;
  observaciones?: string;
}

/**
 * Datos del formulario (incluye campos separados)
 */
export interface ViajeFormData {
  // Filtros para chofer
  categoria_licencia: CategoriaLicencia | '';
  id_chofer: string; // String en el form, se convierte a number
  
  // Información de empresa (solo lectura, obtenida del chofer seleccionado)
  nombre_empresa_info: string;
  
  // Detalles del viaje
  origen: Departamento | '';
  destino: Departamento | '';
  
  // Duración (separada en horas y minutos)
  horas: string;
  minutos: string;
  
  // Fecha y hora programada
  fecha_viaje_programada: string; // YYYY-MM-DD
  hora_viaje_programada: string;  // HH:MM
  
  // Distancia (opcional)
  distancia_km: string;
  
  // Observaciones
  observaciones: string;
  
  // Configuración
  enviar_email: boolean;
}

/**
 * Errores de validación del formulario
 */
export interface ViajeFormErrors {
  categoria_licencia?: string;
  id_chofer?: string;
  origen?: string;
  destino?: string;
  horas?: string;
  minutos?: string;
  fecha_viaje_programada?: string;
  hora_viaje_programada?: string;
  distancia_km?: string;
  observaciones?: string;
}

/**
 * Chofer disponible para asignación de viaje
 */
export interface ChoferDisponible {
  id_usuario: number;
  nombre_completo: string;
  categoria_licencia: string;
  id_empresa: number | null;
  nombre_empresa: string | null;
}

/**
 * Respuesta del endpoint GET /api/v1/viajes/choferes-disponibles/por-categoria
 */
export interface ChoferesDisponiblesResponse {
  total: number;
  choferes: ChoferDisponible[];
}

/**
 * Badge de estado con estilos
 */
export interface EstadoBadge {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * Mapa de estados a badges
 */
export const ESTADO_BADGES: Record<EstadoViaje, EstadoBadge> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '⏳'
  },
  en_curso: {
    label: 'En Curso',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '🚗'
  },
  completada: {
    label: 'Completada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌'
  }
};
