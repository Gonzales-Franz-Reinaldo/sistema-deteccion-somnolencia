export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_VERSION = '/api/v1';

// Tokens y Storage
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

// Rutas
export const ROUTES = {
  WELCOME: '/',
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CHOFER_DASHBOARD: '/chofer/dashboard',
} as const;