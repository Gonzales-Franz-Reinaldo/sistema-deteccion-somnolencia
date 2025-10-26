import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import { ROUTES } from '../lib/constants';

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Icono de Auto */}
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-8 shadow-2xl">
            <svg className="w-24 h-24 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-11 0A1.5 1.5 0 0 1 5 14.5A1.5 1.5 0 0 1 6.5 13A1.5 1.5 0 0 1 8 14.5A1.5 1.5 0 0 1 6.5 16M18.92 6c-.2-.58-.76-1-1.42-1h-11c-.66 0-1.22.42-1.42 1L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-6z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            Sistema de Detección de Somnolencia
          </h1>
          <p className="text-xl md:text-2xl text-purple-100">
            Tecnología de IA para tu seguridad vial
          </p>
        </div>

        {/* Botón */}
        <div className="pt-8">
          <Button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="bg-white text-purple-600 hover:bg-purple-50 text-lg px-12 py-4 shadow-xl transform hover:scale-105"
          >
            Comenzar
          </Button>
        </div>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-white">
          <div className="space-y-2">
            <div className="text-4xl">🎯</div>
            <h3 className="font-semibold text-lg">Detección Precisa</h3>
            <p className="text-sm text-purple-200">Monitoreo en tiempo real</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🔔</div>
            <h3 className="font-semibold text-lg">Alertas Inteligentes</h3>
            <p className="text-sm text-purple-200">Notificaciones oportunas</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">📊</div>
            <h3 className="font-semibold text-lg">Reportes Detallados</h3>
            <p className="text-sm text-purple-200">Análisis completo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;