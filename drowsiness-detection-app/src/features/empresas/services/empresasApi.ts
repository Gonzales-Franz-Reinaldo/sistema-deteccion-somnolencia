// ============================================
// SERVICIO API PARA EMPRESAS
// ============================================

import apiClient from '../../../lib/api/client';
import type { Empresa } from '../types';

/**
 * API Service para gestión de empresas
 */
export const empresasApi = {
  /**
   * Obtiene todas las empresas activas
   * Usado para dropdowns y selección
   */
  getAllActive: async (): Promise<Empresa[]> => {
    try {
      const response = await apiClient.get<{ empresas: Empresa[] }>(
        '/empresas?activo=true'
      );
      return response.data.empresas;
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw error;
    }
  },
};

export default empresasApi;
