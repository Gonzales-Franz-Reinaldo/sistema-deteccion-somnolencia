// ============================================
// TIPOS E INTERFACES PARA EMPRESAS
// ============================================

/**
 * Interfaz para una Empresa
 */
export interface Empresa {
  id_empresa: number;
  nombre_empresa: string;
  ruc: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  fecha_registro: string;
}

/**
 * Respuesta del listado de empresas
 */
export interface EmpresasListResponse {
  total: number;
  page: number;
  page_size: number;
  empresas: Empresa[];
}
