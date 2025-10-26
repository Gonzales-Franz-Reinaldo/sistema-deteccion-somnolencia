import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input, Button } from '../../../components/common';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Enviar credenciales
      await login(username, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    // Contenedor principal con los estilos de la tarjeta (Card) - padding aumentado para mayor tamaño vertical
    <div className="bg-white p-10 rounded-xl shadow-2xl border border-gray-200 min-h-[600px]">
      <div className="space-y-8"> {/* Aumentado de space-y-6 a space-y-8 para más separación vertical */}

        {/* Título y Separador */}
        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-center text-xl font-semibold text-gray-800">
            {/* Icono de llave de tuerca (Wrench) */}
            <svg className="w-6 h-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Acceso Usuario
          </div>
        </div>

        {/* Alerta de Administrador */}
        <div className="bg-blue-100 border border-blue-200 p-3 rounded text-blue-800">
          <div className="flex items-start">
            {/* Icono de información */}
            <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">
              Use sus credenciales de administrador para acceder
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5"> {/* Aumentado de space-y-4 a space-y-5 para más espacio vertical en inputs */}
          {/* Campo Usuario */}
          <Input
            label="Usuario"
            type="text"
            placeholder="usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Campo Contraseña */}
          <Input
            label="Contraseña"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Checkbox Recordar Sesión */}
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 select-none">
              Recordar sesión
            </label>
          </div>

          {/* Contenedor de Botones */}
          <div className="flex justify-between items-center pt-2 space-x-4">
            <Button
              type="submit"
              // Usar className para aplicar el gradiente exacto de la barra superior y color específico de la imagen
              className="flex-grow !py-3 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 shadow-md"
              isLoading={isLoading}
              disabled={isLoading || !username || !password}
            >
              <span className="flex items-center justify-center gap-2">
                {/* Icono de candado */}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 7h2a3 3 0 013 3v2a1 1 0 001 1h2a1 1 0 001-1v-2a5 5 0 00-5-5h-4z" />
                </svg>
                Iniciar Sesión
              </span>
            </Button>
            
            
          </div>
        </form>

        {/* Alerta de Bloqueo */}
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded text-yellow-800 mt-4">
          <div className="flex items-start">
            {/* Icono de advertencia */}
            <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 13a1 1 0 100-2 1 1 0 000 2zM10 7a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">
              3 intentos fallidos bloquearán la cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;