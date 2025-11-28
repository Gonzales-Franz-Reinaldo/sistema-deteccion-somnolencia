import { useState, useCallback } from 'react';
import type { 
  SesionResumen, 
  EstadisticasReporte, 
  DetalleSesion,
  ReporteFiltros 
} from '../types';
import { reportesApi } from '../services/reportesApi';

interface UseReportesState {
  // Sesiones
  sesiones: SesionResumen[];
  total: number;
  
  // Paginación
  currentPage: number;
  limit: number;
  totalPages: number;
  
  // Estadísticas
  estadisticas: EstadisticasReporte | null;
  
  // Detalle de sesión
  sesionDetalle: DetalleSesion | null;
  
  // Estados de carga
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingDetalle: boolean;
  
  // Errores
  error: string | null;
}

interface UseReportesReturn extends UseReportesState {
  loadReportes: (filtros?: ReporteFiltros) => Promise<void>;
  loadEstadisticas: (filtros?: Partial<ReporteFiltros>) => Promise<void>;
  loadDetalleSesion: (id_sesion: number) => Promise<void>;
  clearDetalle: () => void;
  clearError: () => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

/**
 * Hook personalizado para manejo de reportes
 */
export const useReportes = (): UseReportesReturn => {
  const [state, setState] = useState<UseReportesState>({
    sesiones: [],
    total: 0,
    currentPage: 1,
    limit: 5,
    totalPages: 0,
    estadisticas: null,
    sesionDetalle: null,
    loading: false,
    loadingEstadisticas: false,
    loadingDetalle: false,
    error: null
  });

  // Almacenar filtros actuales para paginación
  const [currentFilters, setCurrentFilters] = useState<ReporteFiltros>({});

  /**
   * Cargar lista de sesiones con filtros
   */
  const loadReportes = useCallback(async (filtros: ReporteFiltros = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Aplicar límite de paginación
      const skip = ((filtros.skip !== undefined ? Math.floor(filtros.skip / state.limit) : state.currentPage - 1)) * state.limit;
      const finalFiltros = { 
        ...filtros, 
        skip, 
        limit: state.limit 
      };
      
      // Guardar filtros actuales
      setCurrentFilters(filtros);
      
      const response = await reportesApi.getReportes(finalFiltros);
      const totalPages = Math.ceil(response.total / state.limit);
      
      // Ordenar DESC por fecha_inicio (más recientes primero)
      const sesionesOrdenadas = [...response.sesiones].sort((a, b) => {
        const da = new Date(a.fecha_inicio).getTime();
        const db = new Date(b.fecha_inicio).getTime();
        return db - da; // descendente
      });

      setState(prev => ({
        ...prev,
        sesiones: sesionesOrdenadas,
        total: response.total,
        totalPages,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      
      const errorMessage = error.response?.data?.detail 
        || 'Error al cargar los reportes. Por favor, intente nuevamente.';
      
      setState(prev => ({
        ...prev,
        sesiones: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: errorMessage
      }));
    }
  }, [state.limit, state.currentPage]);

  /**
   * Cargar estadísticas agregadas
   */
  const loadEstadisticas = useCallback(async (filtros: Partial<ReporteFiltros> = {}) => {
    setState(prev => ({ ...prev, loadingEstadisticas: true, error: null }));
    
    try {
      const response = await reportesApi.getEstadisticas(filtros);
      
      setState(prev => ({
        ...prev,
        estadisticas: response.estadisticas,
        loadingEstadisticas: false
      }));
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      
      const errorMessage = error.response?.data?.detail 
        || 'Error al cargar las estadísticas. Por favor, intente nuevamente.';
      
      setState(prev => ({
        ...prev,
        estadisticas: null,
        loadingEstadisticas: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Cargar detalle completo de una sesión
   */
  const loadDetalleSesion = useCallback(async (id_sesion: number) => {
    setState(prev => ({ ...prev, loadingDetalle: true, error: null }));
    
    try {
      const detalle = await reportesApi.getDetalleSesion(id_sesion);
      
      setState(prev => ({
        ...prev,
        sesionDetalle: detalle,
        loadingDetalle: false
      }));
    } catch (error: any) {
      console.error('Error al cargar detalle de sesión:', error);
      
      const errorMessage = error.response?.data?.detail 
        || 'Error al cargar el detalle de la sesión. Por favor, intente nuevamente.';
      
      setState(prev => ({
        ...prev,
        sesionDetalle: null,
        loadingDetalle: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Limpiar detalle de sesión
   */
  const clearDetalle = useCallback(() => {
    setState(prev => ({ ...prev, sesionDetalle: null }));
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Ir a la siguiente página
   */
  const nextPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage < prev.totalPages) {
        const newPage = prev.currentPage + 1;
        // Recargar datos con nueva página
        loadReportes({ ...currentFilters, skip: (newPage - 1) * prev.limit });
        return { ...prev, currentPage: newPage };
      }
      return prev;
    });
  }, [currentFilters, loadReportes]);

  /**
   * Ir a la página anterior
   */
  const prevPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage > 1) {
        const newPage = prev.currentPage - 1;
        // Recargar datos con nueva página
        loadReportes({ ...currentFilters, skip: (newPage - 1) * prev.limit });
        return { ...prev, currentPage: newPage };
      }
      return prev;
    });
  }, [currentFilters, loadReportes]);

  /**
   * Ir a una página específica
   */
  const goToPage = useCallback((page: number) => {
    setState(prev => {
      if (page >= 1 && page <= prev.totalPages && page !== prev.currentPage) {
        // Recargar datos con nueva página
        loadReportes({ ...currentFilters, skip: (page - 1) * prev.limit });
        return { ...prev, currentPage: page };
      }
      return prev;
    });
  }, [currentFilters, loadReportes]);

  return {
    ...state,
    loadReportes,
    loadEstadisticas,
    loadDetalleSesion,
    clearDetalle,
    clearError,
    nextPage,
    prevPage,
    goToPage
  };
};

export default useReportes;
