// ============================================
// COMPONENTE: TABLA DE CHOFERES
// Muestra lista de choferes con información completa
// ============================================

import { useNavigate } from 'react-router-dom';
import type { Chofer } from '../types';
import { formatDate } from '../../../lib/utils/formatDate';

interface ChoferesTableProps {
  choferes: Chofer[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onDelete: (id: number, nombreCompleto: string) => void;
  // Props para paginación
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Componente de tabla para mostrar choferes
 * Incluye manejo de estados: loading, error, vacío y datos
 * Ahora incluye paginación integrada en el footer
 */
export const ChoferesTable = ({ 
  choferes, 
  loading, 
  error, 
  onRetry,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}: ChoferesTableProps) => {
  const navigate = useNavigate();
  
  /**
   * Estado de carga
   */
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando choferes...</p>
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
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  /**
   * Estado vacío (sin resultados)
   */
  if (choferes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-5xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900">No hay choferes registrados</h3>
          <p className="text-gray-600">No se encontraron choferes que coincidan con la búsqueda</p>
        </div>
      </div>
    );
  }



  /**
   * Maneja el click en el botón editar
   * Navega a la página de edición del chofer
   */
  const handleEdit = (chofer: Chofer) => {
    navigate(`/admin/choferes/${chofer.id_usuario}/editar`);
  };

  /**
   * Maneja el click en el botón eliminar
   */
  const handleDelete = (chofer: Chofer) => {
    onDelete(chofer.id_usuario, chofer.nombre_completo);
  };

  /**
   * Renderizado de la tabla con datos
   */
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header de la tabla */}
          <thead className="bg-blue-600">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                DNI/CI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Última Sesión
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Body de la tabla */}
          <tbody className="bg-white divide-y divide-gray-200">
            {choferes.map((chofer) => (
              <tr 
                key={chofer.id_usuario} 
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Nombre Completo con Avatar */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">
                        {chofer.nombre_completo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {chofer.nombre_completo}
                      </div>
                      <div className="text-xs text-gray-500">
                        @{chofer.usuario}
                      </div>
                    </div>
                  </div>
                </td>

                {/* DNI/CI */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">🪪</span>
                    <span className="text-sm font-medium text-gray-700">
                      {chofer.dni_ci || <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">✉️</span>
                    <span className="text-sm text-gray-600">
                      {chofer.email}
                    </span>
                  </div>
                </td>

                {/* Teléfono */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">📱</span>
                    <span className="text-sm text-gray-600">
                      {chofer.telefono || <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
                </td>

                {/* Empresa */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <span>🏢</span>
                    <span>{chofer.nombre_empresa || 'Sin empresa'}</span>
                  </span>
                </td>

                {/* Estado (Activo/Inactivo) */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      chofer.activo
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {chofer.activo ? '✓ ACTIVO' : '✗ INACTIVO'}
                  </span>
                </td>

                {/* Última Sesión */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">🕒</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(chofer.ultima_sesion)}
                    </span>
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Botón Editar */}
                    <button
                      onClick={() => handleEdit(chofer)}
                      className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-all duration-200 border border-yellow-200 font-medium text-xs shadow-sm hover:shadow"
                      title="Editar chofer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Editar</span>
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDelete(chofer)}
                      className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all duration-200 border border-red-200 font-medium text-xs shadow-sm hover:shadow"
                      title="Eliminar chofer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer de la tabla con paginación integrada */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        {currentPage && totalPages && onPageChange && totalPages > 1 ? (
          // Mostrar paginación si hay más de 1 página
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{choferes.length}</span> chofer(es) en página{' '}
              <span className="font-semibold">{currentPage}</span> de{' '}
              <span className="font-semibold">{totalPages}</span>
            </p>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
              {/* Primera página */}
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                «
              </button>

              {/* Anterior */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Siguiente */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>

              {/* Última página */}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                »
              </button>
            </div>
          </div>
        ) : (
          // Mostrar solo contador si no hay paginación
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{choferes.length}</span> chofer(es)
          </p>
        )}
      </div>
    </div>
  );
};

export default ChoferesTable;
