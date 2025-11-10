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
  tipo_chofer: 'individual' | 'empresa' | null;
  id_empresa: number | null;
  nombre_empresa: string | null; // Nombre de la empresa (JOIN)
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

/**
 * Datos necesarios para crear un nuevo chofer (enviar al backend)
 */
export interface ChoferCreateData {
  // Credenciales
  usuario: string;
  password: string;
  email: string;
  rol: 'chofer';
  
  // Datos personales
  nombre_completo: string;
  dni_ci: string;
  genero: 'masculino' | 'femenino' | 'otro';
  nacionalidad?: string;
  
  // Contacto
  telefono: string;
  direccion?: string;
  ciudad?: string;
  
  // Laboral
  tipo_chofer: 'individual' | 'empresa';
  id_empresa?: number;
  numero_licencia: string;
  categoria_licencia: string;
  
  // Estado
  activo: boolean;
  
  // Notificaciones (opcional - solo para creación)
  enviar_email?: boolean;
}

/**
 * Datos para actualizar un chofer existente (enviar al backend)
 * Similar a ChoferCreateData pero con campos opcionales
 */
export interface ChoferUpdateData {
  // Credenciales (usuario no se cambia, password es opcional)
  usuario?: string;
  password?: string; // Solo si se cambia
  email?: string;
  
  // Datos personales
  nombre_completo?: string;
  dni_ci?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  nacionalidad?: string;
  
  // Contacto
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  
  // Laboral
  tipo_chofer?: 'individual' | 'empresa';
  id_empresa?: number;
  numero_licencia?: string;
  categoria_licencia?: string;
  
  // Estado
  activo?: boolean;
}

/**
 * Datos del formulario (incluye campos adicionales)
 */
export interface ChoferFormData {
  // Datos personales (separados para el form)
  nombres: string;
  apellidos: string;
  dni_ci: string;
  genero: 'masculino' | 'femenino' | 'otro' | '';
  nacionalidad: string;
  
  // Contacto
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  
  // Laboral (tipo_chofer removido del form - hardcoded como 'empresa')
  id_empresa: string; // String en el form, se convierte a number
  numero_licencia: string;
  categoria_licencia: 'a' | 'b' | 'c' | 'd' | '';
  
  // Credenciales
  usuario: string;
  password: string;
  password_confirm: string;
  
  // Configuración
  activo: boolean;
  enviar_email: boolean; // Solo para creación, enviar credenciales por email
}

/**
 * Errores de validación del formulario
 */
export interface ChoferFormErrors {
  nombres?: string;
  apellidos?: string;
  dni_ci?: string;
  genero?: string;
  email?: string;
  telefono?: string;
  tipo_chofer?: string;
  id_empresa?: string;
  numero_licencia?: string;
  categoria_licencia?: string;
  usuario?: string;
  password?: string;
  password_confirm?: string;
}

