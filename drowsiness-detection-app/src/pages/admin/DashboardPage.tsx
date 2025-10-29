import { Card } from '../../components/common';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Choferes Activos', value: '24', color: 'bg-blue-500' },
    { label: 'Sesiones Hoy', value: '156', icon: '🚗', color: 'bg-green-500' },
    { label: 'Alertas', value: '47', icon: '!', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Bienvenido de nuevo, {user?.nombre_completo}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-xl transition-shadow border-0">
            <div className={`flex flex-col items-center justify-center h-32 ${stat.color} text-white rounded-lg p-4`}>
              {stat.icon && (
                <div className="text-2xl mb-2">{stat.icon}</div>
              )}
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-1">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/choferes" className="group">
          <Card className="hover:shadow-lg transition-shadow border-0 h-48 flex flex-col items-center justify-center text-center p-6 group-hover:bg-blue-50">
            <div className="text-4xl mb-4 text-blue-600 group-hover:text-blue-700">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestión de Choferes</h3>
            <p className="text-sm text-gray-600">Crear y administrar usuarios</p>
          </Card>
        </Link>

        <Link to="/admin/monitoreo" className="group">
          <Card className="hover:shadow-lg transition-shadow border-0 h-48 flex flex-col items-center justify-center text-center p-6 group-hover:bg-green-50">
            <div className="text-4xl mb-4 text-green-600 group-hover:text-green-700">📹</div>
            <h3 className="font-semibold text-gray-900 mb-2">Monitoreo en Vivo Choferes en Viaje</h3>
            <p className="text-sm text-gray-600">Ver choferes en tiempo real</p>
          </Card>
        </Link>

        <Link to="/admin/reportes" className="group">
          <Card className="hover:shadow-lg transition-shadow border-0 h-48 flex flex-col items-center justify-center text-center p-6 group-hover:bg-purple-50">
            <div className="text-4xl mb-4 text-purple-600 group-hover:text-purple-700">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reportes</h3>
            <p className="text-sm text-gray-600">Análisis y estadísticas detalladas</p>
          </Card>
        </Link>

      </div>
    </div>
  );
};

export default AdminDashboardPage;