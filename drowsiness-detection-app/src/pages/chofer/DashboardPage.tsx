import { Card, Button } from '../../components/common';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const ChoferDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user?.nombre_completo}</p>
      </div>

      {/* Session Status */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse" />
              <p className="text-sm font-medium">Estado de Sesión</p>
            </div>
            <h2 className="text-2xl font-bold">Sin sesión activa. Inicie el monitoreo para comenzar.</h2>
            <p className="text-blue-100 mt-2">Fecha: 12/10/2025 - 13:27 | Tiempo de Sesión: 00:00:00</p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 text-lg">
            🎥 Iniciar Monitoreo
          </Button>
        </div>
      </Card>

      {/* Session Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Información de la Sesión
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">📅 Fecha</span>
              <span className="font-semibold text-gray-900">12/10/2025 - 13:27</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">⏱️ Tiempo de Sesión</span>
              <span className="font-semibold text-gray-900">00:00:00</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Alertas
          </h3>
          <div className="space-y-3">
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
              <p className="font-semibold text-orange-800">47 Alertas Totales</p>
              <p className="text-sm text-orange-600 mt-1">Últimas 24 horas</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-xs text-yellow-600">Microsueños</p>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-orange-600">Bostezos</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-xs text-red-600">Cabeceos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            Viajes Recientes
          </h3>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todo →
          </button>
        </div>
        <div className="space-y-3">
          {[
            { date: '10/10/2025', duration: '2h 30min', alerts: 3, status: 'Completado' },
            { date: '08/10/2025', duration: '1h 45min', alerts: 1, status: 'Completado' },
            { date: '05/10/2025', duration: '3h 15min', alerts: 5, status: 'Completado' },
          ].map((trip, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trip.date}</p>
                  <p className="text-sm text-gray-600">Duración: {trip.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-orange-600">{trip.alerts}</span> alertas
                </p>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mt-1">
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ChoferDashboardPage;