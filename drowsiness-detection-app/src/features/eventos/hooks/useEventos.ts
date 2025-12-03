/**
 * Hook personalizado para gestión de eventos de somnolencia
 */
import { useState, useCallback } from 'react';
import { eventosApi } from '../services/eventosApi';
import { choferesApi } from '../../choferes/services/choferesApi';
import type {
  EventoConChofer,
  EventoResumen,
  EstadisticasGenerales,
  EstadisticasChofer,
  EventosFiltros,
  TipoEvento,
  NivelSeveridad
} from '../types';

interface UseEventosState {
  // Eventos
  eventos: EventoConChofer[];
  eventosPorChofer: EventoResumen[];
  
  // Estadísticas
  estadisticas: EstadisticasGenerales | null;
  estadisticasChofer: EstadisticasChofer | null;
  
  // Paginación
  total: number;
  currentPage: number;
  pageSize: number;
  
  // Estados de carga
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingChofer: boolean;
  
  // Errores
  error: string | null;
  
  // Filtros activos
  filtrosActivos: EventosFiltros;
}

interface UseEventosReturn extends UseEventosState {
  // Acciones
  loadEventosRecientes: (params?: {
    minutos?: number;
    limite?: number;
    solo_criticos?: boolean;
  }) => Promise<void>;
  
  loadEventosPorChofer: (
    idChofer: number,
    params?: {
      dias?: number;
      tipo_evento?: TipoEvento;
      nivel_severidad?: NivelSeveridad;
    }
  ) => Promise<void>;
  
  loadEstadisticasGenerales: (dias?: number) => Promise<void>;
  loadEstadisticasChofer: (idChofer: number, dias?: number) => Promise<void>;
  
  // Filtros
  aplicarFiltros: (filtros: EventosFiltros) => Promise<void>;
  limpiarFiltros: () => void;
  
  // Paginación
  cambiarPagina: (pagina: number) => void;
  
  // Utils
  clearError: () => void;
  
  // Export
  getEventosParaExportar: () => Promise<EventoConChofer[]>;
}

export const useEventos = (): UseEventosReturn => {
  const [state, setState] = useState<UseEventosState>({
    eventos: [],
    eventosPorChofer: [],
    estadisticas: null,
    estadisticasChofer: null,
    total: 0,
    currentPage: 1,
    pageSize: 20,
    loading: false,
    loadingEstadisticas: false,
    loadingChofer: false,
    error: null,
    filtrosActivos: {}
  });

  /**
   * Cargar eventos recientes
   */
  const loadEventosRecientes = useCallback(async (params: {
    minutos?: number;
    limite?: number;
    solo_criticos?: boolean;
  } = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Cargando eventos recientes con params:', params);
      
      const eventos = await eventosApi.getEventosRecientes({
        minutos: params.minutos || 10080, // 7 días por defecto
        limite: params.limite || 200,
        solo_criticos: params.solo_criticos || false
      });
      
      console.log('✅ Eventos cargados:', eventos.length);
      
      setState(prev => ({
        ...prev,
        eventos,
        total: eventos.length,
        loading: false
      }));
    } catch (error: any) {
      console.error('❌ Error cargando eventos:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.message ||
                          'Error al cargar eventos';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        eventos: []
      }));
    }
  }, []);

  /**
   * Cargar eventos de un chofer específico
   */
  const loadEventosPorChofer = useCallback(async (
    idChofer: number,
    params: {
      dias?: number;
      tipo_evento?: TipoEvento;
      nivel_severidad?: NivelSeveridad;
    } = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Cargando eventos del chofer:', idChofer);
      
      // 1. Obtener datos del chofer para tener su nombre
      let nombreChofer = 'Desconocido';
      try {
        const chofer = await choferesApi.getById(idChofer);
        nombreChofer = chofer.nombre_completo || 'Desconocido';
        console.log('👤 Nombre del chofer:', nombreChofer);
      } catch (e) {
        console.warn('⚠️ No se pudo obtener el nombre del chofer:', e);
      }
      
      // 2. Obtener eventos del chofer
      const eventos = await eventosApi.getEventosPorChofer(idChofer, {
        dias: params.dias || 30,
        limite: 200,
        ...params
      });
      
      console.log('✅ Eventos del chofer cargados:', eventos.length);
      
      // 3. Convertir EventoResumen a EventoConChofer con el nombre del chofer
      const eventosConChofer: EventoConChofer[] = eventos.map(e => ({
        ...e,
        nombre_chofer: nombreChofer,
        id_chofer: idChofer
      }));
      
      setState(prev => ({
        ...prev,
        eventos: eventosConChofer,
        total: eventosConChofer.length,
        loading: false
      }));
    } catch (error: any) {
      console.error('❌ Error cargando eventos del chofer:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.detail || 'Error al cargar eventos del chofer',
        eventos: []
      }));
    }
  }, []);

  /**
   * Cargar estadísticas generales
   */
  const loadEstadisticasGenerales = useCallback(async (dias: number = 7) => {
    setState(prev => ({ ...prev, loadingEstadisticas: true, error: null }));
    
    try {
      console.log('📊 Cargando estadísticas generales, días:', dias);
      
      const estadisticas = await eventosApi.getEstadisticasGenerales(dias);
      
      console.log('✅ Estadísticas cargadas:', estadisticas);
      
      setState(prev => ({
        ...prev,
        estadisticas,
        loadingEstadisticas: false
      }));
    } catch (error: any) {
      console.error('❌ Error cargando estadísticas:', error);
      
      setState(prev => ({
        ...prev,
        loadingEstadisticas: false,
        error: error.response?.data?.detail || 'Error al cargar estadísticas'
      }));
    }
  }, []);

  /**
   * Cargar estadísticas de un chofer
   */
  const loadEstadisticasChofer = useCallback(async (
    idChofer: number,
    dias: number = 7
  ) => {
    setState(prev => ({ ...prev, loadingChofer: true, error: null }));
    
    try {
      const estadisticasChofer = await eventosApi.getEstadisticasChofer(idChofer, dias);
      
      setState(prev => ({
        ...prev,
        estadisticasChofer,
        loadingChofer: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loadingChofer: false,
        error: error.response?.data?.detail || 'Error al cargar estadísticas del chofer'
      }));
    }
  }, []);

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = useCallback(async (filtros: EventosFiltros) => {
    setState(prev => ({ ...prev, filtrosActivos: filtros, currentPage: 1 }));
    
    const minutos = (filtros.dias || 7) * 24 * 60;
    
    if (filtros.id_chofer) {
      // Si hay filtro por chofer, usar endpoint específico
      await loadEventosPorChofer(filtros.id_chofer, {
        dias: filtros.dias,
        tipo_evento: filtros.tipo_evento,
        nivel_severidad: filtros.nivel_severidad
      });
    } else {
      // Si no hay filtro por chofer, usar endpoint general
      await loadEventosRecientes({
        minutos,
        limite: filtros.limite || 200,
        solo_criticos: filtros.solo_criticos
      });
    }
  }, [loadEventosRecientes, loadEventosPorChofer]);

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      filtrosActivos: {},
      currentPage: 1 
    }));
    loadEventosRecientes({ minutos: 10080, limite: 200 });
    loadEstadisticasGenerales(7);
  }, [loadEventosRecientes, loadEstadisticasGenerales]);

  /**
   * Cambiar página
   */
  const cambiarPagina = useCallback((pagina: number) => {
    setState(prev => ({ ...prev, currentPage: pagina }));
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Obtener eventos para exportar (sin paginación)
   */
  const getEventosParaExportar = useCallback(async (): Promise<EventoConChofer[]> => {
    const { filtrosActivos } = state;
    
    return eventosApi.getAllEventos({
      ...filtrosActivos,
      limite: 5000
    });
  }, [state]);

  return {
    ...state,
    loadEventosRecientes,
    loadEventosPorChofer,
    loadEstadisticasGenerales,
    loadEstadisticasChofer,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    clearError,
    getEventosParaExportar
  };
};

export default useEventos;