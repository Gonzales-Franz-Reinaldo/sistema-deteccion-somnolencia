import type { SesionResumen } from '../types';
import { NIVEL_ALERTA_BADGES, NIVEL_ALERTA_LABELS } from '../types';
import { Card } from '../../../components/common';

interface ReportesTableProps {
  sesiones: SesionResumen[];
  loading?: boolean;
  onVerDetalle?: (sesion: SesionResumen) => void;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onGoToPage?: (page: number) => void;
}

export const ReportesTable = ({ 
  sesiones, 
  loading, 
  onVerDetalle,
  currentPage = 1,
  totalPages = 1,
  total = 0,
  onNextPage,
  onPrevPage,
  onGoToPage
}: ReportesTableProps) => {
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

  if (!sesiones || sesiones.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron sesiones con los filtros aplicados.
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
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chofer
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Fin
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Micro.
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bost.
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parp.
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cab.
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frot.
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sesiones.map((sesion) => (
              <tr key={sesion.id_sesion} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-xs">
                        {sesion.nombre_chofer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={sesion.nombre_chofer}>
                        {sesion.nombre_chofer}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]" title={sesion.email_chofer}>
                        {sesion.email_chofer}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 max-w-[100px] truncate" title={sesion.empresa}>
                  {sesion.empresa}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                  {formatFecha(sesion.fecha_inicio)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                  {sesion.fecha_fin ? formatFecha(sesion.fecha_fin) : 'En curso'}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${sesion.total_microsueno > 0 ? 'bg-red-100 text-red-800 font-semibold' : 'text-gray-500'}`}>
                    {sesion.total_microsueno}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${sesion.total_bostezos > 0 ? 'bg-yellow-100 text-yellow-800 font-semibold' : 'text-gray-500'}`}>
                    {sesion.total_bostezos}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${sesion.total_parpadeos_excesivos > 0 ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-500'}`}>
                    {sesion.total_parpadeos_excesivos}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${sesion.total_cabeceos > 0 ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-gray-500'}`}>
                    {sesion.total_cabeceos}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${sesion.total_frotamiento_ojos > 0 ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500'}`}>
                    {sesion.total_frotamiento_ojos}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full font-bold text-xs ${
                    sesion.total_alertas > 10 ? 'bg-red-100 text-red-800' :
                    sesion.total_alertas > 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {sesion.total_alertas}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${NIVEL_ALERTA_BADGES[sesion.nivel_alerta]}`}>
                    {NIVEL_ALERTA_LABELS[sesion.nivel_alerta]}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-medium">
                  {onVerDetalle && (
                    <button
                      onClick={() => onVerDetalle(sesion)}
                      className="text-indigo-600 hover:text-indigo-900 hover:underline text-xs"
                    >
                      Ver
                    </button>
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
            {/* Info de registros */}
            <div className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">{(currentPage - 1) * 5 + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(currentPage * 5, total)}
              </span>
              {' '}de{' '}
              <span className="font-medium">{total}</span>
              {' '}registros
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
              {/* Botón Anterior */}
              <button
                onClick={onPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                ← Anterior
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Mostrar siempre primera, última y páginas cercanas a la actual
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => onGoToPage?.(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={onNextPage}
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

            {/* Info de página */}
            <div className="text-sm text-gray-700">
              Página{' '}
              <span className="font-medium">{currentPage}</span>
              {' '}de{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReportesTable;
