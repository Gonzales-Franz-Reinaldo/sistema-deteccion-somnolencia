// ============================================
// SERVICIO API PARA VIAJES
// Maneja todas las llamadas HTTP relacionadas con viajes
// ============================================

import apiClient from '../../../lib/api/client';
import type { 
  ViajesListResponse, 
  Viaje, 
  ViajesFilters, 
  ViajeCreateData, 
  ViajeUpdateData,
  ChoferesDisponiblesResponse,
  CategoriaLicencia 
} from '../types';

/**
 * API Service para gestión de viajes
 * Utiliza el cliente HTTP configurado globalmente
 */
export const viajesApi = {
  /**
   * Obtiene lista paginada de viajes con filtros opcionales
   * 
   * @param skip - Número de registros a saltar (paginación)
   * @param limit - Límite de registros a retornar
   * @param filters - Filtros opcionales (id_chofer, id_empresa, estado, origen, destino)
   * @returns Promise con la respuesta que incluye total y lista de viajes
   * 
   * @example
   * // Obtener primera página (10 registros)
   * const response = await viajesApi.getAll(0, 10);
   * 
   * // Obtener solo viajes pendientes
   * const response = await viajesApi.getAll(0, 10, { estado: 'pendiente' });
   */
  getAll: async (
    skip: number = 0,
    limit: number = 10,
    filters?: ViajesFilters
  ): Promise<ViajesListResponse> => {
    try {
      // Construir parámetros de query string
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      // Agregar filtros si existen
      if (filters?.id_chofer) {
        params.append('id_chofer', filters.id_chofer.toString());
      }
      if (filters?.id_empresa) {
        params.append('id_empresa', filters.id_empresa.toString());
      }
      if (filters?.estado) {
        params.append('estado', filters.estado);
      }
      if (filters?.origen) {
        params.append('origen', filters.origen);
      }
      if (filters?.destino) {
        params.append('destino', filters.destino);
      }

      // Realizar petición GET
      const response = await apiClient.get<ViajesListResponse>(
        `/viajes?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener viajes:', error);
      throw error;
    }
  },

  /**
   * Obtiene un viaje específico por ID
   * 
   * @param id - ID del viaje
   * @returns Promise con los datos del viaje
   */
  getById: async (id: number): Promise<Viaje> => {
    try {
      const response = await apiClient.get<Viaje>(`/viajes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener viaje ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo viaje en el sistema
   * 
   * @param data - Datos del viaje a crear
   * @returns Promise con los datos del viaje creado
   * 
   * @example
   * const nuevoViaje = await viajesApi.create({
   *   id_chofer: 2,
   *   id_empresa: 1,
   *   origen: 'La Paz',
   *   destino: 'Santa Cruz',
   *   duracion_estimada: '12 horas 30 minutos',
   *   distancia_km: 525.5,
   *   observaciones: 'Ruta principal',
   *   enviar_email: true
   * });
   */
  create: async (data: ViajeCreateData): Promise<Viaje> => {
    try {
      const response = await apiClient.post<Viaje>('/viajes', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear viaje:', error);
      throw error;
    }
  },

  /**
   * Actualiza un viaje existente
   * 
   * @param id - ID del viaje a actualizar
   * @param data - Datos a actualizar (solo campos modificados)
   * @returns Promise con los datos del viaje actualizado
   * 
   * @example
   * const viajeActualizado = await viajesApi.update(5, {
   *   estado: 'en_curso',
   *   fecha_inicio: '2024-11-03T08:00:00',
   *   observaciones: 'Viaje iniciado sin problemas'
   * });
   */
  update: async (id: number, data: ViajeUpdateData): Promise<Viaje> => {
    try {
      const response = await apiClient.put<Viaje>(`/viajes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar viaje ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un viaje permanentemente
   * 
   * @param id - ID del viaje a eliminar
   * @returns Promise que resuelve cuando el viaje es eliminado
   * 
   * ADVERTENCIA: Esta operación no se puede deshacer
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/viajes/${id}`);
    } catch (error) {
      console.error(`Error al eliminar viaje ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene viajes de un chofer específico
   * 
   * @param id_chofer - ID del chofer
   * @param skip - Número de registros a saltar
   * @param limit - Límite de registros a retornar
   * @returns Promise con la respuesta que incluye total y lista de viajes
   */
  getByChofer: async (
    id_chofer: number,
    skip: number = 0,
    limit: number = 10
  ): Promise<ViajesListResponse> => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ViajesListResponse>(
        `/viajes/chofer/${id_chofer}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener viajes del chofer ${id_chofer}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene viajes de una empresa específica
   * 
   * @param id_empresa - ID de la empresa
   * @param skip - Número de registros a saltar
   * @param limit - Límite de registros a retornar
   * @returns Promise con la respuesta que incluye total y lista de viajes
   */
  getByEmpresa: async (
    id_empresa: number,
    skip: number = 0,
    limit: number = 10
  ): Promise<ViajesListResponse> => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get<ViajesListResponse>(
        `/viajes/empresa/${id_empresa}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener viajes de la empresa ${id_empresa}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene choferes disponibles filtrados por categoría de licencia
   * 
   * @param categoria_licencia - Categoría de licencia requerida
   * @returns Promise con la respuesta que incluye total y lista de choferes
   * 
   * @example
   * const response = await viajesApi.getChoferesDisponibles('Categoría C - Vehículos Pesados');
   * console.log(response.choferes); // Lista de choferes con categoría C
   */
  getChoferesDisponibles: async (
    categoria_licencia: CategoriaLicencia
  ): Promise<ChoferesDisponiblesResponse> => {
    try {
      const params = new URLSearchParams({
        categoria_licencia: categoria_licencia,
      });

      const response = await apiClient.get<ChoferesDisponiblesResponse>(
        `/viajes/choferes-disponibles/por-categoria?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener choferes disponibles para categoría ${categoria_licencia}:`, error);
      throw error;
    }
  },

  /**
   * Valida si un chofer está disponible en una fecha/hora específica
   * 
   * @param id_chofer - ID del chofer a validar
   * @param fecha_viaje_programada - Fecha programada (YYYY-MM-DD)
   * @param hora_viaje_programada - Hora programada (HH:MM o HH:MM:SS)
   * @param id_viaje_excluir - ID del viaje a excluir (para modo edición)
   * @returns Promise con disponibilidad y mensaje
   * 
   * @example
   * const result = await viajesApi.validarDisponibilidad(2, '2024-11-05', '08:00');
   * if (!result.disponible) {
   *   console.error(result.mensaje); // "El chofer ya tiene un viaje asignado..."
   * }
   */
  validarDisponibilidad: async (
    id_chofer: number,
    fecha_viaje_programada: string,
    hora_viaje_programada: string,
    id_viaje_excluir?: number
  ): Promise<{
    disponible: boolean;
    mensaje: string;
    viaje_existente?: {
      id_viaje: number;
      origen: string;
      destino: string;
      estado: string;
    };
  }> => {
    try {
      const params = new URLSearchParams({
        id_chofer: id_chofer.toString(),
        fecha_viaje_programada: fecha_viaje_programada,
        hora_viaje_programada: hora_viaje_programada,
      });

      if (id_viaje_excluir) {
        params.append('id_viaje_excluir', id_viaje_excluir.toString());
      }

      const response = await apiClient.get(
        `/viajes/validar-disponibilidad?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      throw error;
    }
  },
};

export default viajesApi;
