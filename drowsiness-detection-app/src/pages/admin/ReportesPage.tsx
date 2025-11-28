import { useEffect, useState } from 'react';
import { useReportes } from '../../features/reportes/hooks/useReportes';
import { ReportesFiltros } from '../../features/reportes/components/ReportesFiltros';
import { EstadisticasCards } from '../../features/reportes/components/EstadisticasCards';
import { ReportesTable } from '../../features/reportes/components/ReportesTable';
import { fetchAllReportes, exportToExcel, exportToPDF } from '../../features/reportes/utils';
import type { ReporteFiltros, SesionResumen } from '../../features/reportes/types';
import { NIVEL_ALERTA_LABELS, NIVEL_ALERTA_BADGES } from '../../features/reportes/types';

export const ReportesPage = () => {
  const {
    sesiones,
    total,
    currentPage,
    totalPages,
    estadisticas,
    sesionDetalle,
    loading,
    loadingEstadisticas,
    loadingDetalle,
    error,
    loadReportes,
    loadEstadisticas,
    loadDetalleSesion,
    clearDetalle,
    clearError,
    nextPage,
    prevPage,
    goToPage
  } = useReportes();

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadReportes({ limit: 5 });
    loadEstadisticas();
  }, []);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [lastFiltros, setLastFiltros] = useState<ReporteFiltros>({});

  const handleAplicarFiltros = (filtros: ReporteFiltros) => {
    loadReportes({ ...filtros, limit: 5 });
    loadEstadisticas(filtros);
    setLastFiltros(filtros);
  };

  const handleVerDetalle = (sesion: SesionResumen) => {
    loadDetalleSesion(sesion.id_sesion);
    setModalDetalleAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalDetalleAbierto(false);
    clearDetalle();
  };

  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const buildFiltrosInfo = (): string => {
    const partes: string[] = [];
    if (lastFiltros.fecha_inicio) partes.push(`Inicio: ${lastFiltros.fecha_inicio}`);
    if (lastFiltros.fecha_fin) partes.push(`Fin: ${lastFiltros.fecha_fin}`);
    if (lastFiltros.id_chofer) partes.push(`ChoferID: ${lastFiltros.id_chofer}`);
    if (lastFiltros.tipo_alerta) partes.push(`Tipo: ${lastFiltros.tipo_alerta}`);
    return partes.join(' | ');
  };

  const handleExportExcel = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const todas = await fetchAllReportes(lastFiltros);
      exportToExcel({ sesiones: todas });
    } catch (e:any) {
      setExportError(e.message || 'Error exportando a Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const todas = await fetchAllReportes(lastFiltros);
      exportToPDF({ sesiones: todas, filtrosInfo: buildFiltrosInfo() });
    } catch (e:any) {
      setExportError(e.message || 'Error exportando a PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Reportes de Somnolencia</h1>
        <p className="text-gray-600 mt-2">
          Análisis y estadísticas de sesiones de monitoreo
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <ReportesFiltros
        onAplicarFiltros={handleAplicarFiltros}
        loading={loading || loadingEstadisticas}
      />

      {/* Estadísticas */}
      <EstadisticasCards
        estadisticas={estadisticas}
        loading={loadingEstadisticas}
      />

      {/* Acciones de Exportación y Tabla de Reportes */}
      <div>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Sesiones de Monitoreo
              {total > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({total} registros visibles)
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exporting || loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${exporting || loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                📗 {exporting ? 'Exportando...' : 'Excel'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting || loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${exporting || loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                📄 {exporting ? 'Generando...' : 'PDF'}
              </button>
            </div>
          </div>
          {exportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {exportError}
            </div>
          )}
        </div>
        <ReportesTable
          sesiones={sesiones}
          loading={loading}
          onVerDetalle={handleVerDetalle}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onGoToPage={goToPage}
        />
      </div>

      {/* Modal de Detalle de Sesión */}
      {modalDetalleAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetalle ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Cargando detalle de sesión...</p>
              </div>
            ) : sesionDetalle ? (
              <>
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Detalle de Sesión #{sesionDetalle.id_sesion}</h3>
                    <button
                      onClick={handleCerrarModal}
                      className="text-white hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body del Modal */}
                <div className="p-6 space-y-6">
                  {/* Información del Chofer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Chofer</p>
                      <p className="text-lg font-semibold text-gray-900">{sesionDetalle.nombre_chofer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Empresa</p>
                      <p className="text-lg text-gray-900">{sesionDetalle.empresa}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fecha y Hora</p>
                      <p className="text-lg text-gray-900">{formatFecha(sesionDetalle.fecha_inicio)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duración</p>
                      <p className="text-lg text-gray-900">
                        {sesionDetalle.duracion_minutos ? `${sesionDetalle.duracion_minutos} minutos` : 'N/A'}
                      </p>
                    </div>
                    {sesionDetalle.ruta_nombre && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Ruta</p>
                        <p className="text-lg text-gray-900">{sesionDetalle.ruta_nombre}</p>
                      </div>
                    )}
                  </div>

                  {/* Nivel de Alerta */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Nivel de Alerta</p>
                    <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${NIVEL_ALERTA_BADGES[sesionDetalle.nivel_alerta]}`}>
                      {NIVEL_ALERTA_LABELS[sesionDetalle.nivel_alerta]}
                    </span>
                  </div>

                  {/* Resumen de Alertas */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Alertas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Microsueños</p>
                        <p className="text-2xl font-bold text-red-600">{sesionDetalle.total_microsueno}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Bostezos</p>
                        <p className="text-2xl font-bold text-yellow-600">{sesionDetalle.total_bostezos}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Parpadeos</p>
                        <p className="text-2xl font-bold text-blue-600">{sesionDetalle.total_parpadeos_excesivos}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Cabeceos</p>
                        <p className="text-2xl font-bold text-purple-600">{sesionDetalle.total_cabeceos}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Frotamiento</p>
                        <p className="text-2xl font-bold text-green-600">{sesionDetalle.total_frotamiento_ojos}</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-200">Total</p>
                        <p className="text-2xl font-bold text-white">{sesionDetalle.total_alertas}</p>
                      </div>
                    </div>
                  </div>

                  {/* Historial de Alertas */}
                  {sesionDetalle.alertas && sesionDetalle.alertas.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Historial de Alertas ({sesionDetalle.alertas.length})
                      </h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {sesionDetalle.alertas.map((alerta) => (
                          <div
                            key={alerta.id_alerta}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                alerta.severidad === 'critico' ? 'bg-red-500' :
                                alerta.severidad === 'grave' ? 'bg-orange-500' :
                                alerta.severidad === 'moderado' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{alerta.tipo_alerta.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500">{formatFecha(alerta.timestamp_alerta)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700 capitalize">{alerta.severidad}</p>
                              {alerta.duracion_segundos && (
                                <p className="text-xs text-gray-500">{alerta.duracion_segundos}s</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del Modal */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
                  <button
                    onClick={handleCerrarModal}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-600">
                No se pudo cargar el detalle de la sesión
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;
