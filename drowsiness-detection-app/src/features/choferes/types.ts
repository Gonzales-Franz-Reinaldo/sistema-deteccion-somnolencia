// ============================================
// TIPOS E INTERFACES PARA FEATURE CHOFERES
// ============================================

/**
 * Interfaz principal para un Chofer
 * Representa un usuario con rol 'chofer' en el sistema
 */
export interface Chofer {
  id_usuario: number;
  usuario: string;
  email: string;
  nombre_completo: string;
  telefono: string | null;
  rol: 'chofer';
  dni_ci: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  nacionalidad: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  tipo_chofer: 'individual' | 'empresa' | null;
  id_empresa: number | null;
  numero_licencia: string | null;
  categoria_licencia: string | null;
  activo: boolean;
  primer_inicio: boolean;
  fecha_registro: string;
  ultima_sesion: string | null;
}

/**
 * Respuesta del endpoint GET /api/v1/users
 * Incluye datos de paginación y lista de choferes
 */
export interface ChoferesListResponse {
  total: number;
  page: number;
  page_size: number;
  users: Chofer[];
}

/**
 * Filtros disponibles para la consulta de choferes
 */
export interface ChoferesFilters {
  activo?: boolean;
  tipo_chofer?: 'individual' | 'empresa';
  id_empresa?: number;
  search?: string;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  skip: number;
  limit: number;
}
