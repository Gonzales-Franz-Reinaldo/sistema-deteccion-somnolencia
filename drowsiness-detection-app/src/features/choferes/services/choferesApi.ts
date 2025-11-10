// ============================================
// SERVICIO API PARA CHOFERES
// Maneja todas las llamadas HTTP relacionadas con choferes
// ============================================

import apiClient from '../../../lib/api/client';
import type { ChoferesListResponse, Chofer, ChoferesFilters, ChoferCreateData, ChoferUpdateData } from '../types';

/**
 * API Service para gestión de choferes
 * Utiliza el cliente HTTP configurado globalmente
 */
export const choferesApi = {
  /**
   * Obtiene lista paginada de choferes con filtros opcionales
   * 
   * @param skip - Número de registros a saltar (paginación)
   * @param limit - Límite de registros a retornar
   * @param filters - Filtros opcionales (activo, tipo_chofer, id_empresa)
   * @returns Promise con la respuesta que incluye total y lista de choferes
   * 
   * @example
   * // Obtener primera página (10 registros)
   * const response = await choferesApi.getAll(0, 10);
   * 
   * // Obtener solo choferes activos
   * const response = await choferesApi.getAll(0, 10, { activo: true });
   */
  getAll: async (
    skip: number = 0,
    limit: number = 10,
    filters?: ChoferesFilters
  ): Promise<ChoferesListResponse> => {
    try {
      // Construir parámetros de query string
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      // Agregar filtros si existen
      if (filters?.activo !== undefined) {
        params.append('activo', filters.activo.toString());
      }
      if (filters?.tipo_chofer) {
        params.append('tipo_chofer', filters.tipo_chofer);
      }
      if (filters?.id_empresa) {
        params.append('id_empresa', filters.id_empresa.toString());
      }

      // Realizar petición GET
      const response = await apiClient.get<ChoferesListResponse>(
        `/users?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener choferes:', error);
      throw error;
    }
  },

  /**
   * Busca choferes por término de búsqueda
   * Busca en: nombre completo, usuario y email
   * 
   * @param query - Término de búsqueda (mínimo 2 caracteres)
   * @returns Promise con array de choferes que coinciden
   * 
   * @example
   * const results = await choferesApi.search('juan');
   */
  search: async (query: string): Promise<Chofer[]> => {
    try {
      if (query.length < 2) {
        return [];
      }

      const response = await apiClient.get<Chofer[]>(
        `/users/search?q=${encodeURIComponent(query)}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al buscar choferes:', error);
      throw error;
    }
  },

  /**
   * Obtiene un chofer específico por ID
   * 
   * @param id - ID del chofer
   * @returns Promise con los datos del chofer
   */
  getById: async (id: number): Promise<Chofer> => {
    try {
      const response = await apiClient.get<Chofer>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener chofer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo chofer en el sistema
   * 
   * @param data - Datos del chofer a crear
   * @returns Promise con los datos del chofer creado
   * 
   * @example
   * const nuevoChofer = await choferesApi.create({
   *   usuario: 'jperez',
   *   password: 'chofer123',
   *   email: 'jperez@email.com',
   *   nombre_completo: 'Juan Pérez García',
   *   // ... más campos
   * });
   */
  create: async (data: ChoferCreateData): Promise<Chofer> => {
    try {
      const response = await apiClient.post<Chofer>('/users', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear chofer:', error);
      throw error;
    }
  },

  /**
   * Actualiza un chofer existente
   * 
   * @param id - ID del chofer a actualizar
   * @param data - Datos a actualizar (solo campos modificados)
   * @returns Promise con los datos del chofer actualizado
   * 
   * @example
   * const choferActualizado = await choferesApi.update(5, {
   *   telefono: '+591 70999999',
   *   direccion: 'Nueva dirección',
   *   activo: true
   * });
   */
  update: async (id: number, data: ChoferUpdateData): Promise<Chofer> => {
    try {
      const response = await apiClient.put<Chofer>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar chofer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un chofer del sistema
   * 
   * @param id - ID del chofer a eliminar
   * @returns Promise<void>
   * 
   * @example
   * await choferesApi.delete(5);
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error al eliminar chofer ${id}:`, error);
      throw error;
    }
  },
};

export default choferesApi;
