// ============================================
// COMPONENTE: TABLA DE VIAJES
// Muestra lista de viajes con información completa
// ============================================

import { useNavigate } from 'react-router-dom';
import type { Viaje } from '../types';
import { ESTADO_BADGES } from '../types';
import { formatDate } from '../../../lib/utils/formatDate';

interface ViajesTableProps {
  viajes: Viaje[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onDelete: (id: number, nombreChofer: string) => void;
  // Props para paginación
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Componente de tabla para mostrar viajes
 * Incluye manejo de estados: loading, error, vacío y datos
 * Incluye paginación integrada en el footer
 */
export const ViajesTable = ({ 
  viajes, 
  loading, 
  error, 
  onRetry,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}: ViajesTableProps) => {
  const navigate = useNavigate();
  
  /**
   * Estado de carga
   */
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  /**
   * Estado de error
   */
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900">Error al cargar datos</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  /**
   * Estado vacío (sin resultados)
   */
  if (viajes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-5xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-900">No hay viajes registrados</h3>
          <p className="text-gray-600">No se encontraron viajes que coincidan con la búsqueda</p>
          <button
            onClick={() => navigate('/admin/viajes/asignar')}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
          >
            <span className="mr-2">+</span>
            Asignar Primer Viaje
          </button>
        </div>
      </div>
    );
  }

  /**
   * Maneja el click en el botón editar
   */
  const handleEdit = (viaje: Viaje) => {
    navigate(`/admin/viajes/${viaje.id_viaje}/editar`);
  };

  /**
   * Maneja el click en el botón eliminar
   */
  const handleDelete = (viaje: Viaje) => {
    onDelete(viaje.id_viaje, viaje.nombre_chofer || 'Desconocido');
  };

  /**
   * Renderiza el badge de estado
   */
  const renderEstadoBadge = (estado: Viaje['estado']) => {
    const badge = ESTADO_BADGES[estado];
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bgColor} ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  /**
   * Renderizado de la tabla con datos
   */
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header de la tabla */}
          <thead className="bg-indigo-600">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Chofer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Origen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Destino
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Duración
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                📅 Fecha Programada
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                🕐 Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                📋 Fecha Asignación
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Body de la tabla */}
          <tbody className="bg-white divide-y divide-gray-200">
            {viajes.map((viaje) => (
              <tr 
                key={viaje.id_viaje} 
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Chofer con Avatar y Categoría */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">
                        {viaje.nombre_chofer?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {viaje.nombre_chofer || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {viaje.categoria_licencia || 'Sin categoría'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Empresa */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-1 text-gray-500">🏢</span>
                    <span className="text-sm text-gray-900">
                      {viaje.nombre_empresa || 'Sin empresa'}
                    </span>
                  </div>
                </td>

                {/* Origen */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-1">📍</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {viaje.origen}
                    </span>
                  </div>
                </td>

                {/* Destino */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-1">🎯</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {viaje.destino}
                    </span>
                  </div>
                </td>

                {/* Duración */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    <div>
                      <div className="text-sm text-gray-900">
                        {viaje.duracion_estimada}
                      </div>
                      {viaje.distancia_km && (
                        <div className="text-xs text-gray-500">
                          {viaje.distancia_km} km
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {renderEstadoBadge(viaje.estado)}
                </td>

                {/* Fecha Programada */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-indigo-600">
                      {formatDate(viaje.fecha_viaje_programada)}
                    </span>
                  </div>
                </td>

                {/* Hora Programada */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {viaje.hora_viaje_programada ? viaje.hora_viaje_programada.substring(0, 5) : '-'}
                    </span>
                  </div>
                </td>

                {/* Fecha Asignación */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(viaje.fecha_asignacion)}
                    </span>
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {/* Botón Editar */}
                    <button
                      onClick={() => handleEdit(viaje)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm inline-flex items-center"
                      title="Editar viaje"
                    >
                      <span className="mr-1">✏️</span>
                      Editar
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDelete(viaje)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm inline-flex items-center"
                      title="Eliminar viaje"
                    >
                      <span className="mr-1">🗑️</span>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación */}
      {currentPage && totalPages && onPageChange && totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                ← Anterior
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViajesTable;
