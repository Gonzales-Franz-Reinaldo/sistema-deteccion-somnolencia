import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { viajesApi } from '../../features/viajes/services/viajesApi';
import type { Viaje } from '../../features/viajes/types';

interface MetricasMonitoreo {
  choferes_totales: number;
  viajes_en_curso: number;
  alertas_hoy: number;
}

export const MonitoreoViajesPage = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasMonitoreo | null>(null);
  const navigate = useNavigate();

  const cargarViajes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await viajesApi.getEnCurso();
      setViajes(response.viajes || []);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Error cargando viajes en curso');
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (viajes: Viaje[]): MetricasMonitoreo => {
    // Contar choferes únicos
    const choferesUnicos = new Set(viajes.map(v => v.id_chofer)).size;
    
    // Placeholder para alertas hoy - puede implementarse con endpoint adicional
    const alertasHoy = 0;

    return {
      choferes_totales: choferesUnicos,
      viajes_en_curso: viajes.length,
      alertas_hoy: alertasHoy,
    };
  };

  /**
   * Función para calcular tiempo transcurrido desde el inicio del viaje
   * Comentada temporalmente - disponible para uso futuro si se necesita
   */
  // const calcularTiempoTranscurrido = (fechaInicio: string | null): string => {
  //   if (!fechaInicio) return '—';
  //   
  //   const inicio = new Date(fechaInicio);
  //   const ahora = new Date();
  //   const diffMs = ahora.getTime() - inicio.getTime();
  //   const minutos = Math.floor(diffMs / 60000);
  //   
  //   if (minutos < 60) return `${minutos} min`;
  //   
  //   const horas = Math.floor(minutos / 60);
  //   const mins = minutos % 60;
  //   return `${horas}h ${mins}m`;
  // };

  useEffect(() => {
    cargarViajes();
    const intervalo = setInterval(cargarViajes, 30000); // refresco cada 30s
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (viajes.length > 0) {
      setMetricas(calcularMetricas(viajes));
    }
  }, [viajes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🚛 Monitoreo Viajes en Curso</h1>
        <p className="text-gray-600 mt-2">Viajes actualmente en progreso y choferes activos</p>
      </div>

      {/* Métricas Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.viajes_en_curso ?? 0}</p>
          <p className="text-sm mt-1">Viajes en Curso</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.choferes_totales ?? 0}</p>
          <p className="text-sm mt-1">Choferes Activos</p>
        </div>
        {/* <div className="bg-orange-600 text-white rounded-lg p-4 flex flex-col items-center">
          <p className="text-3xl font-bold">{metricas?.alertas_hoy ?? 0}</p>
          <p className="text-sm mt-1">Alertas Hoy</p>
        </div> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Viajes Activos</h2>
        {loading ? (
          <p className="text-gray-600">Cargando viajes en curso...</p>
        ) : viajes.length === 0 ? (
          <p className="text-gray-600">No hay viajes en curso actualmente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viajes.map(v => (
              <div key={v.id_viaje} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{v.nombre_chofer || 'Sin asignar'}</p>
                    <p className="text-xs text-gray-500">{v.nombre_empresa || 'Sin empresa'}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                    EN CURSO
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Origen → Destino</p>
                    <p className="font-semibold">{v.origen} → {v.destino}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500 text-xs">Duración Est.</p>
                      <p className="font-semibold">{v.duracion_estimada || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500 text-xs">Distancia</p>
                      <p className="font-semibold">{v.distancia_km ? `${v.distancia_km} km` : '—'}</p>
                    </div>
                  </div>
                  
                  {v.categoria_licencia && (
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500 text-xs">Categoría Licencia</p>
                      <p className="font-semibold text-xs">{v.categoria_licencia}</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate(`/admin/monitoreo-viajes/${v.id_viaje}`)}
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
