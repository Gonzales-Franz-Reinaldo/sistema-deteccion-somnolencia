import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    // Estructura de la página: Header y Contenido centrado.
    <div className="min-h-screen bg-gray-50">
      {/* Header Fijo con el logo y título de la app */}
      {/* Colores ajustados para ser más oscuros: from-indigo-700 to-purple-800 */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 shadow-md p-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Ícono del auto mejorado y más grande (w-8 h-8 en lugar de w-5 h-5) */}
          <span className="text-3xl mr-2 flex-shrink-0 mt-0.5">🚗</span>
          <h1 className="text-base font-semibold">
            Sistema de Detección de Somnolencia
          </h1>
        </div>
      </header>

      {/* Contenedor central para el formulario */}
      <div className="flex items-center justify-center pt-20 p-4">
        {/* Tamaño del formulario aumentado a max-w-2xl para que sea más grande */}
        <div className="w-full max-w-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;