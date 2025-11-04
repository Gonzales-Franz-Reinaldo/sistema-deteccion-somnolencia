// ============================================
// HOOK PERSONALIZADO PARA GESTIÓN DE VIAJES
// Maneja estado, carga de datos y operaciones CRUD
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { viajesApi } from '../services/viajesApi';
import type { Viaje, ViajesFilters } from '../types';

/**
 * Hook personalizado para gestión de viajes
 * Proporciona estado, funciones de carga y control de paginación
 * 
 * @returns Objeto con:
 *   - viajes: Array de viajes cargados
 *   - loading: Estado de carga
 *   - error: Mensaje de error si ocurre
 *   - total: Total de viajes en BD
 *   - page: Página actual
 *   - pageSize: Tamaño de página
 *   - setPage: Función para cambiar página
 *   - setFilters: Función para aplicar filtros
 *   - refetch: Función para recargar datos
 *   - deleteViaje: Función para eliminar viaje
 * 
 * @example
 * const { viajes, loading, error, deleteViaje, refetch } = useViajes();
 */
export const useViajes = () => {
  // Estado principal
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  // Filtros
  const [filters, setFilters] = useState<ViajesFilters>({});

  /**
   * Carga viajes desde la API
   * Aplica filtros y paginación
   */
  const loadViajes = useCallback(async (customFilters?: ViajesFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const skip = (page - 1) * pageSize;
      const activeFilters = customFilters !== undefined ? customFilters : filters;
      
      const response = await viajesApi.getAll(skip, pageSize, activeFilters);
      
      setViajes(response.viajes);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar viajes';
      setError(errorMessage);
      console.error('Error loading viajes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  /**
   * Efecto que recarga datos cuando cambia la página o filtros
   */
  useEffect(() => {
    loadViajes();
  }, [loadViajes]);

  /**
   * Actualiza filtros y recarga datos
   */
  const updateFilters = useCallback((newFilters: ViajesFilters) => {
    setFilters(newFilters);
    setPage(1); // Resetear a primera página
  }, []);

  /**
   * Elimina un viaje con confirmación
   */
  const deleteViaje = useCallback(async (id: number, nombreChofer: string) => {
    // Confirmación
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el viaje asignado a ${nombreChofer}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return false;
    }

    try {
      await viajesApi.delete(id);
      console.log('Viaje eliminado correctamente');
      
      // Recargar datos
      await loadViajes();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar viaje';
      console.error('Error deleting viaje:', err);
      alert(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadViajes]);

  /**
   * Recarga los datos manualmente
   */
  const refetch = useCallback(() => {
    loadViajes();
  }, [loadViajes]);

  return {
    // Estado
    viajes,
    loading,
    error,
    
    // Paginación
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    
    // Funciones
    setPage,
    setFilters: updateFilters,
    refetch,
    deleteViaje,
  };
};

export default useViajes;
