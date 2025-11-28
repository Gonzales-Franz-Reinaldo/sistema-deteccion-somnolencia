import apiClient from '../../../lib/api/client';
import type { 
  ReportesResponse, 
  EstadisticasResponse, 
  DetalleSesion,
  ReporteFiltros 
} from '../types';

/**
 * Servicio para interactuar con endpoints de reportes
 */
export const reportesApi = {
  /**
   * Obtener lista de sesiones con filtros
   */
  getReportes: async (filtros: ReporteFiltros = {}): Promise<ReportesResponse> => {
    try {
      // Construir query params
      const params = new URLSearchParams();
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.id_chofer) params.append('id_chofer', filtros.id_chofer.toString());
      if (filtros.id_empresa) params.append('id_empresa', filtros.id_empresa.toString());
      if (filtros.tipo_alerta) params.append('tipo_alerta', filtros.tipo_alerta);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.nivel_alerta) params.append('nivel_alerta', filtros.nivel_alerta);
      if (filtros.skip !== undefined) params.append('skip', filtros.skip.toString());
      if (filtros.limit !== undefined) params.append('limit', filtros.limit.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/reportes?${queryString}` : '/reportes';
      
      const response = await apiClient.get<ReportesResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas agregadas
   */
  getEstadisticas: async (filtros: Partial<ReporteFiltros> = {}): Promise<EstadisticasResponse> => {
    try {
      // Construir query params
      const params = new URLSearchParams();
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.id_chofer) params.append('id_chofer', filtros.id_chofer.toString());
      if (filtros.id_empresa) params.append('id_empresa', filtros.id_empresa.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/reportes/estadisticas?${queryString}` : '/reportes/estadisticas';
      
      const response = await apiClient.get<EstadisticasResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de una sesión
   */
  getDetalleSesion: async (id_sesion: number): Promise<DetalleSesion> => {
    try {
      const response = await apiClient.get<DetalleSesion>(`/reportes/sesion/${id_sesion}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de sesión:', error);
      throw error;
    }
  },

  /**
   * Verificar estado del módulo de reportes
   */
  healthCheck: async (): Promise<{ status: string; module: string; message: string }> => {
    try {
      const response = await apiClient.get('/reportes/health');
      return response.data;
    } catch (error) {
      console.error('Error en health check de reportes:', error);
      throw error;
    }
  }
};

export default reportesApi;
