/**
 * Servicio API para Eventos de Somnolencia
 */
import apiClient from '../../../lib/api/client';
import type { 
  EventoConChofer, 
  EventoResumen,
  EstadisticasGenerales, 
  EstadisticasChofer,
  EventosFiltros,
  TipoEvento,
  NivelSeveridad
} from '../types';

const BASE_URL = '/eventos';

export const eventosApi = {
  /**
   * Obtener eventos recientes (para dashboard admin)
   */
  getEventosRecientes: async (params: {
    minutos?: number;
    limite?: number;
    solo_criticos?: boolean;
  } = {}): Promise<EventoConChofer[]> => {
    try {
      const response = await apiClient.get<EventoConChofer[]>(`${BASE_URL}/recientes`, {
        params: {
          minutos: params.minutos || 60,
          limite: params.limite || 100,
          solo_criticos: params.solo_criticos || false
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en getEventosRecientes:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener eventos de un chofer específico
   */
  getEventosPorChofer: async (
    idChofer: number,
    params: {
      limite?: number;
      offset?: number;
      dias?: number;
      tipo_evento?: TipoEvento;
      nivel_severidad?: NivelSeveridad;
    } = {}
  ): Promise<EventoResumen[]> => {
    try {
      const response = await apiClient.get<EventoResumen[]>(`${BASE_URL}/chofer/${idChofer}`, {
        params: {
          limite: params.limite || 50,
          offset: params.offset || 0,
          dias: params.dias || 7,
          ...(params.tipo_evento && { tipo_evento: params.tipo_evento }),
          ...(params.nivel_severidad && { nivel_severidad: params.nivel_severidad })
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en getEventosPorChofer:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener eventos de un viaje
   */
  getEventosPorViaje: async (idViaje: number): Promise<EventoResumen[]> => {
    try {
      const response = await apiClient.get<EventoResumen[]>(`${BASE_URL}/viaje/${idViaje}`);
      return response.data;
    } catch (error: any) {
      console.error('Error en getEventosPorViaje:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener estadísticas generales del sistema
   */
  getEstadisticasGenerales: async (dias: number = 7): Promise<EstadisticasGenerales> => {
    try {
      const response = await apiClient.get<EstadisticasGenerales>(
        `${BASE_URL}/estadisticas/generales`,
        { params: { dias } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error en getEstadisticasGenerales:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de un chofer específico
   */
  getEstadisticasChofer: async (
    idChofer: number,
    dias: number = 7
  ): Promise<EstadisticasChofer> => {
    try {
      const response = await apiClient.get<EstadisticasChofer>(
        `${BASE_URL}/estadisticas/chofer/${idChofer}`,
        { params: { dias } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error en getEstadisticasChofer:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener todos los eventos con filtros (para exportación)
   */
  getAllEventos: async (filtros: EventosFiltros = {}): Promise<EventoConChofer[]> => {
    // Usar endpoint de recientes con límite alto
    const minutos = (filtros.dias || 30) * 24 * 60; // Convertir días a minutos
    
    return eventosApi.getEventosRecientes({
      minutos,
      limite: filtros.limite || 1000,
      solo_criticos: filtros.solo_criticos
    });
  }
};

export default eventosApi;