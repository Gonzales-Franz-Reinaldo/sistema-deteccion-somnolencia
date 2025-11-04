// ============================================
// CONSTANTES PARA FEATURE VIAJES
// ============================================

import type { Departamento, CategoriaLicencia } from '../types';

/**
 * Lista de los 9 departamentos de Bolivia
 * Para seleccionar origen y destino en el formulario
 */
export const DEPARTAMENTOS_BOLIVIA: Departamento[] = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando'
];

/**
 * Categorías de licencia de conducir en Bolivia
 * Para filtrar choferes en el formulario de asignación
 */
export const CATEGORIAS_LICENCIA: CategoriaLicencia[] = [
  'Categoría A - Motocicletas',
  'Categoría B - Vehículos Livianos',
  'Categoría C - Vehículos Pesados',
  'Categoría D - Transporte Público',
  'Categoría E - Transporte Internacional',
  'Categoría F - Transporte de Carga Especial'
];

/**
 * Rango de horas válidas para duración estimada (0-24)
 */
export const HORAS_VALIDAS = {
  MIN: 0,
  MAX: 24
};

/**
 * Rango de minutos válidos para duración estimada (0-59)
 */
export const MINUTOS_VALIDOS = {
  MIN: 0,
  MAX: 59
};

/**
 * Configuración de paginación por defecto
 */
export const PAGINATION_DEFAULTS = {
  SKIP: 0,
  LIMIT: 10,
  MAX_LIMIT: 100
};

/**
 * Estados de viaje con etiquetas legibles
 */
export const ESTADOS_VIAJE = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en_curso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
} as const;

/**
 * Etiquetas de estados para UI
 */
export const ESTADOS_LABELS = {
  [ESTADOS_VIAJE.PENDIENTE]: 'Pendiente',
  [ESTADOS_VIAJE.EN_CURSO]: 'En Curso',
  [ESTADOS_VIAJE.COMPLETADA]: 'Completada',
  [ESTADOS_VIAJE.CANCELADA]: 'Cancelada'
} as const;
