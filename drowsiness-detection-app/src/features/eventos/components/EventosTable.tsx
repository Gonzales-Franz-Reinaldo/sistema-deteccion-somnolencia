/**
 * Tabla de eventos de somnolencia
 */
import { Card } from '../../../components/common';
import type { EventoConChofer } from '../types';
import { 
  TIPO_EVENTO_LABELS, 
  TIPO_EVENTO_ICONOS, 
  SEVERIDAD_LABELS, 
  SEVERIDAD_COLORS,
  SEVERIDAD_DOT_COLORS
} from '../types';

interface EventosTableProps {
  eventos: EventoConChofer[];
  loading?: boolean;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export const EventosTable = ({
  eventos,
  loading,
  currentPage = 1,
  pageSize = 20,
  total = 0,
  onPageChange
}: EventosTableProps) => {
  
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron eventos con los filtros aplicados.
          </p>
        </div>
      </Card>
    );
  }

  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  // Paginar eventos localmente
  const eventosPaginados = eventos.slice(startIndex, endIndex);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chofer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo Evento
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severidad
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Velocidad
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventosPaginados.map((evento) => (
              <tr key={evento.id_evento} className="hover:bg-gray-50 transition-colors">
                {/* Fecha/Hora */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatFecha(evento.timestamp_evento)}
                </td>
                
                {/* Chofer */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {evento.nombre_chofer?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {evento.nombre_chofer || 'Desconocido'}
                      </p>
                    </div>
                  </div>
                </td>
                
                {/* Tipo Evento */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {TIPO_EVENTO_ICONOS[evento.tipo_evento]}
                    </span>
                    <span className="text-sm text-gray-900">
                      {TIPO_EVENTO_LABELS[evento.tipo_evento]}
                    </span>
                  </div>
                </td>
                
                {/* Severidad */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {evento.nivel_severidad && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERIDAD_COLORS[evento.nivel_severidad]}`}>
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${SEVERIDAD_DOT_COLORS[evento.nivel_severidad]}`}></span>
                      {SEVERIDAD_LABELS[evento.nivel_severidad]}
                    </span>
                  )}
                </td>
                
                {/* Duración */}
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                  {evento.duracion_segundos 
                    ? `${evento.duracion_segundos.toFixed(1)}s` 
                    : evento.cantidad_eventos 
                      ? `${evento.cantidad_eventos}x` 
                      : '-'
                  }
                </td>
                
                {/* Velocidad */}
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                  {evento.velocidad_kmh !== null ? (
                    <span className={`font-medium ${evento.velocidad_kmh > 80 ? 'text-red-600' : 'text-gray-900'}`}>
                      {evento.velocidad_kmh} km/h
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                
                {/* Ubicación */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {evento.latitud && evento.longitud ? (
                    <a
                      href={`https://www.google.com/maps?q=${evento.latitud},${evento.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                      title={`${evento.latitud}, ${evento.longitud}`}
                    >
                      📍 Ver mapa
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> -{' '}
              <span className="font-medium">{endIndex}</span> de{' '}
              <span className="font-medium">{total}</span> eventos
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                ← Anterior
              </button>
              
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EventosTable;