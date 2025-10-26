// PROVEEDOR DE AUTENTICACIÓN
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { authApi } from '../features/auth/services/authApi';
import { storage } from '../lib/utils/storage';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROUTES } from '../lib/constants';
import type { AuthContextType } from '../features/auth/types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.get<string>(TOKEN_KEY);
      const savedUser = storage.get<User>(USER_KEY);

      if (token && savedUser) {
        try {
          // Verificar que el token aún sea válido
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          // Token inválido, limpiar
          storage.clear();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authApi.login({ username, password });

      // Guardar tokens y usuario
      storage.set(TOKEN_KEY, response.access_token);
      storage.set(REFRESH_TOKEN_KEY, response.refresh_token);
      storage.set(USER_KEY, response.user);

      setUser(response.user);

      // Redirigir según el rol
      if (response.user.rol === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (response.user.rol === 'chofer') {
        navigate(ROUTES.CHOFER_DASHBOARD);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado y storage
      storage.clear();
      setUser(null);
      navigate(ROUTES.LOGIN);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};