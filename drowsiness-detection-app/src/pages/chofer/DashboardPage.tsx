import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Card, Button } from '../../components/common';

export const ChoferDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentDateTime = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' - ');

  return (
    <div className="min-h-screen p-12 max-w-7xl mx-auto">
      {/* Breadcrumb Bar */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-200 mb-8 rounded-xl">
        <nav className="flex text-sm text-blue-700" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1">
            <li>
              <span className="hover:text-blue-600">Usuario</span>
            </li>
            <li>
              <span className="flex items-center">
                <svg className="w-4 h-4 mx-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="hover:text-blue-600">Panel Principal</span>
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* User Info Card */}
      <Card className="mb-8 p-8 border-0 rounded-xl shadow-sm bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl text-blue-600">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.nombre_completo}</h2>
            <p className="text-gray-600">Chofer - Sistema de Detección de Somnolencia</p>
          </div>
        </div>
      </Card>

      {/* Session Status Card */}
      <Card className="mb-8 p-8 border-0 rounded-xl shadow-sm bg-white border-l-4 border-blue-500 bg-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mt-0.5 flex-shrink-0">
            <span className="text-sm font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-lg">
              Sin sesión activa. Inicie el monitoreo para comenzar.
            </p>
          </div>
        </div>
      </Card>

      {/* Start Monitoring Button */}
      <div className="flex justify-center mb-8">
        <Button
          variant="success"
          onClick={() => navigate('/chofer/monitoreo')}
          className="!w-96 !bg-green-500 !hover:bg-green-600 !active:bg-green-700 text-white font-bold py-5 px-10 text-xl rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-200"
        >
          <span className="text-3xl">🎥</span>
          Iniciar Monitoreo
        </Button>
      </div>

      {/* Session Info Card */}
      <Card className="p-8 border-0 rounded-xl shadow-sm bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <span className="text-3xl text-blue-600">📊</span>
          Información de la Sesión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex items-center justify-between md:justify-start md:gap-6 p-6 bg-gray-50 rounded-xl">
            <span className="text-2xl flex-shrink-0">📅</span>
            <div className="text-right md:text-left">
              <span className="text-base text-gray-600 block">Fecha</span>
              <p className="text-xl font-semibold text-gray-900">{currentDateTime}</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-start md:gap-6 p-6 bg-gray-50 rounded-xl">
            <span className="text-2xl flex-shrink-0">⏱️</span>
            <div className="text-right md:text-left">
              <span className="text-base text-gray-600 block">Tiempo de Sesión</span>
              <p className="text-xl font-semibold text-gray-900">00:00:00</p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ChoferDashboardPage;