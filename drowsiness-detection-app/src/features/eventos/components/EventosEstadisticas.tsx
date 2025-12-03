/**
 * Componente de estadísticas de eventos de somnolencia
 */
import { Card } from '../../../components/common';
import type { EstadisticasGenerales } from '../types';
import { TIPO_EVENTO_LABELS, TIPO_EVENTO_ICONOS } from '../types';

interface EventosEstadisticasProps {
  estadisticas: EstadisticasGenerales | null;
  loading?: boolean;
  dias?: number;
}

export const EventosEstadisticas = ({ 
  estadisticas, 
  loading,
  dias = 7 
}: EventosEstadisticasProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Eventos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {estadisticas.total_eventos.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Últimos {dias} días
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Eventos Críticos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {(estadisticas.por_severidad?.CRITICAL || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {estadisticas.por_severidad?.HIGH || 0} de severidad alta
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Microsueños */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Microsueños</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {(estadisticas.por_tipo?.microsueno || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Evento más peligroso
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full text-2xl">
              😴
            </div>
          </div>
        </Card>

        {/* Choferes con Eventos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Choferes Afectados</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {estadisticas.total_choferes_con_eventos}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Con al menos 1 evento
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribución por Tipo */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Evento</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(TIPO_EVENTO_LABELS).map(([tipo, label]) => (
            <div key={tipo} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">{TIPO_EVENTO_ICONOS[tipo as keyof typeof TIPO_EVENTO_ICONOS]}</div>
              <p className="text-2xl font-bold text-gray-900">
                {(estadisticas.por_tipo?.[tipo] || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribución por Severidad */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Severidad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {(estadisticas.por_severidad?.NORMAL || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Medio</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(estadisticas.por_severidad?.MEDIUM || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Alto</p>
              <p className="text-2xl font-bold text-orange-600">
                {(estadisticas.por_severidad?.HIGH || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Crítico</p>
              <p className="text-2xl font-bold text-red-600">
                {(estadisticas.por_severidad?.CRITICAL || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventosEstadisticas;