import axios, { AxiosError} from 'axios';
import  type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_VERSION, TOKEN_KEY } from '../constants';
import { storage } from '../utils/storage';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el token expiró (401), redirigir al login
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;