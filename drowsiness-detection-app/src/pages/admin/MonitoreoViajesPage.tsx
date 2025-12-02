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
    const choferesUnicos = new Set(viajes.map(v => v.id_chofer)).size;
    return {
      choferes_totales: choferesUnicos,
      viajes_en_curso: viajes.length,
      alertas_hoy: 0,
    };
  };

  useEffect(() => {
    cargarViajes();
    const intervalo = setInterval(cargarViajes, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (viajes.length > 0) {
      setMetricas(calcularMetricas(viajes));
    }
  }, [viajes]);

  // Función para navegar al detalle
  const verEnTiempoReal = (idViaje: number) => {
    navigate(`/admin/monitoreo-viajes/${idViaje}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🚛</span>
          Monitoreo de Viajes en Curso
        </h1>
        <p className="mt-2 text-indigo-100">Seguimiento en tiempo real de choferes activos</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{metricas?.viajes_en_curso ?? 0}</p>
              <p className="text-sm mt-2 text-green-100">🚗 Viajes en Curso</p>
            </div>
            <div className="text-6xl opacity-20">🚗</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{metricas?.choferes_totales ?? 0}</p>
              <p className="text-sm mt-2 text-indigo-100">👨‍✈️ Choferes Activos</p>
            </div>
            <div className="text-6xl opacity-20">👨‍✈️</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Lista de Viajes */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🚗 Choferes en Viaje</h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {viajes.length} activos
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando viajes en curso...</p>
            </div>
          </div>
        ) : viajes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <span className="text-6xl">🚫</span>
            <p className="text-gray-600 mt-4 text-lg">No hay viajes en curso actualmente</p>
            <p className="text-gray-500 mt-2 text-sm">Los viajes aparecerán aquí cuando un chofer inicie un viaje asignado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viajes.map(v => (
              <div 
                key={v.id_viaje} 
                className="group relative bg-white border-2 border-indigo-100 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-indigo-300"
              >
                {/* Badge EN VIVO */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    EN VIVO
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  {/* Cabecera */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {(v.nombre_chofer || 'C')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{v.nombre_chofer || 'Sin asignar'}</h3>
                      <p className="text-sm text-gray-500">{v.nombre_empresa || 'Sin empresa'}</p>
                    </div>
                  </div>

                  {/* Ruta */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="font-medium text-gray-700">{v.origen}</span>
                    </div>
                    <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-4"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="font-medium text-gray-700">{v.destino}</span>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{v.fecha_viaje_programada}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🕐</span>
                      <span>{v.hora_viaje_programada?.slice(0, 5)}</span>
                    </div>
                    {v.distancia_km && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{v.distancia_km} km</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{v.duracion_estimada}</span>
                    </div>
                  </div>

                  {/* Botón Ver en Tiempo Real */}
                  <button
                    onClick={() => verEnTiempoReal(v.id_viaje)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <span>📍</span>
                    Ver en Tiempo Real
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer de actualización */}
      {viajes.length > 0 && (
        <div className="text-center text-sm text-gray-500 italic">
          🔄 Actualización automática cada 30 segundos
        </div>
      )}
    </div>
  );
};

export default MonitoreoViajesPage;