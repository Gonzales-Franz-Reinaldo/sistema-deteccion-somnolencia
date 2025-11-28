import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';

// Placeholder types (will align with backend endpoints once created)
interface ViajeActivo {
  id_sesion: number;
  nombre_chofer: string;
  empresa: string;
  nivel_alerta: string;
  total_alertas: number;
  fecha_inicio: string;
  ultima_alerta?: string | null;
  ultima_posicion?: { lat: number; lng: number } | null;
  duracion_minutos?: number;
}

interface MetricasMonitoreo {
  choferes_totales: number;
  viajes_activos: number;
  alertas_hoy: number;
  fecha: string;
}

export const MonitoreoViajesPage = () => {
  const [viajes, setViajes] = useState<ViajeActivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasMonitoreo | null>(null);
  const navigate = useNavigate();

  const cargarViajes = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiClient.get('/monitoring/viajes-activos');
      setViajes(resp.data.viajes || []);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Error cargando viajes activos');
    } finally {
      setLoading(false);
    }
  };

  const cargarMetricas = async () => {
    try {
      const resp = await apiClient.get('/monitoring/metrics');
      setMetricas(resp.data);
    } catch (e:any) { /* silencioso */ }
  };

  useEffect(() => {
    cargarViajes();
    cargarMetricas();
    const intervalo = setInterval(() => { cargarViajes(); cargarMetricas(); }, 30000); // refresco cada 30s
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📹 Monitoreo Viajes</h1>
        <p className="text-gray-600 mt-2">Choferes activos y alertas en tiempo real</p>
      </div>

      {/* Métricas Header (placeholder) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.viajes_activos ?? viajes.length}</p>
          <p className="text-sm mt-1">Choferes en Viaje</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.choferes_totales ?? 0}</p>
          <p className="text-sm mt-1">Choferes Totales</p>
        </div>
        <div className="bg-orange-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.alertas_hoy ?? 0}</p>
          <p className="text-sm mt-1">Alertas Hoy</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choferes Activos en Viaje</h2>
        {loading ? (
          <p className="text-gray-600">Cargando viajes activos...</p>
        ) : viajes.length === 0 ? (
          <p className="text-gray-600">No hay viajes activos actualmente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viajes.map(v => (
              <div key={v.id_sesion} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{v.nombre_chofer}</p>
                    <p className="text-xs text-gray-500">{v.empresa}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    v.nivel_alerta === 'critico' ? 'bg-red-100 text-red-700' :
                    v.nivel_alerta === 'alerta' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{v.nivel_alerta}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Duración</p>
                    <p className="font-semibold">{v.duracion_minutos ?? '—'} min</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Alertas</p>
                    <p className="font-semibold">{v.total_alertas}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Últ. Alerta</p>
                    <p className="font-semibold">{v.ultima_alerta ? 'Hace poco' : '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Posición</p>
                    <p className="font-semibold">{v.ultima_posicion ? `${v.ultima_posicion.lat.toFixed(2)}, ${v.ultima_posicion.lng.toFixed(2)}` : '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/monitoreo-viajes/${v.id_sesion}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Ver en Tiempo Real
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoreoViajesPage;
