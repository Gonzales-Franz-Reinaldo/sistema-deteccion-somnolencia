/**
 * Página de Reportes de Eventos de Somnolencia
 * 
 * Permite al administrador:
 * - Ver todos los eventos de somnolencia
 * - Filtrar por chofer, tipo, severidad, período
 * - Ver estadísticas generales
 * - Exportar a Excel y PDF
 */
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useEventos,
  EventosTable,
  EventosFiltrosComponent,
  EventosEstadisticas,
  exportEventosToExcel,
  exportEventosToPDF,
  type EventosFiltros
} from '../../features/eventos';

const ReportesPage = () => {
  const {
    eventos,
    estadisticas,
    total,
    currentPage,
    pageSize,
    loading,
    loadingEstadisticas,
    error,
    filtrosActivos,
    loadEventosRecientes,
    loadEstadisticasGenerales,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    clearError
  } = useEventos();

  const [exportando, setExportando] = useState(false);
  const [diasEstadisticas, setDiasEstadisticas] = useState(7);

  // Cargar datos iniciales
  useEffect(() => {
    loadEventosRecientes({ minutos: 60 * 24 * 7, limite: 500 }); // 7 días
    loadEstadisticasGenerales(7);
  }, []);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handler para aplicar filtros
  const handleAplicarFiltros = async (filtros: EventosFiltros) => {
    await aplicarFiltros(filtros);
    
    // Actualizar estadísticas según el período
    if (filtros.dias) {
      setDiasEstadisticas(filtros.dias);
      await loadEstadisticasGenerales(filtros.dias);
    }
  };

  // Handler para limpiar filtros
  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    setDiasEstadisticas(7);
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    if (eventos.length === 0) {
      toast.warning('No hay eventos para exportar');
      return;
    }

    setExportando(true);
    try {
      exportEventosToExcel({
        eventos,
        fileName: 'reporte_eventos_somnolencia',
        titulo: `Reporte de Eventos de Somnolencia - Últimos ${diasEstadisticas} días`
      });
      toast.success('✅ Archivo Excel generado correctamente');
    } catch (error: any) {
      toast.error(`Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    if (eventos.length === 0) {
      toast.warning('No hay eventos para exportar');
      return;
    }

    setExportando(true);
    try {
      // Construir información de filtros
      const filtrosInfo = construirInfoFiltros();
      
      exportEventosToPDF({
        eventos,
        fileName: 'reporte_eventos_somnolencia',
        titulo: 'Reporte de Eventos de Somnolencia',
        filtrosInfo
      });
      toast.success('✅ Archivo PDF generado correctamente');
    } catch (error: any) {
      toast.error(`Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  // Construir string con info de filtros aplicados
  const construirInfoFiltros = (): string => {
    const partes: string[] = [];
    
    partes.push(`Período: Últimos ${diasEstadisticas} días`);
    
    if (filtrosActivos.id_chofer) {
      partes.push(`Chofer ID: ${filtrosActivos.id_chofer}`);
    }
    if (filtrosActivos.tipo_evento) {
      partes.push(`Tipo: ${filtrosActivos.tipo_evento}`);
    }
    if (filtrosActivos.nivel_severidad) {
      partes.push(`Severidad: ${filtrosActivos.nivel_severidad}`);
    }
    if (filtrosActivos.solo_criticos) {
      partes.push('Solo eventos críticos');
    }
    
    return partes.join(' | ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Reportes de Somnolencia</h1>
          <p className="text-gray-600 mt-1">
            Análisis completo de eventos de somnolencia detectados
          </p>
        </div>
        
        {/* Botones de Exportación */}
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            disabled={loading || exportando || eventos.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {exportando ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Exportar Excel
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={loading || exportando || eventos.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {exportando ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <EventosEstadisticas 
        estadisticas={estadisticas} 
        loading={loadingEstadisticas}
        dias={diasEstadisticas}
      />

      {/* Filtros */}
      <EventosFiltrosComponent 
        onAplicarFiltros={handleAplicarFiltros}
        loading={loading}
      />

      {/* Información de resultados */}
      {!loading && eventos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium">
                Se encontraron <strong>{eventos.length}</strong> eventos
              </span>
            </div>
            {Object.keys(filtrosActivos).length > 0 && (
              <button
                onClick={handleLimpiarFiltros}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Eventos */}
      <EventosTable
        eventos={eventos}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        total={eventos.length}
        onPageChange={cambiarPagina}
      />

      {/* Footer informativo */}
      {!loading && eventos.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            💡 <strong>Tip:</strong> Usa los filtros para generar reportes específicos por chofer o tipo de evento.
            Los reportes exportados incluirán solo los datos filtrados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;
