// TIPOS GLOBALES
export interface User {
  id_usuario: number;
  usuario: string;
  nombre_completo: string;
  email: string;
  rol: 'admin' | 'chofer';
  telefono?: string;
  dni_ci?: string;
  activo: boolean;
  primer_inicio: boolean;
  fecha_registro: string;
  ultima_sesion?: string;

  // Datos adicionales para chofer
  genero?: 'masculino' | 'femenino' | 'otro';
  nacionalidad?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  tipo_chofer?: 'individual' | 'empresa';
  id_empresa?: number;
  numero_licencia?: string;
  categoria_licencia?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}