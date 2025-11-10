// ============================================
// HOOK PERSONALIZADO PARA GESTIÓN DE CHOFERES
// Maneja estado, carga de datos y operaciones CRUD
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { choferesApi } from '../services/choferesApi';
import type { Chofer, ChoferesFilters } from '../types';

/**
 * Hook personalizado para gestión de choferes
 * Proporciona estado, funciones de carga y control de paginación
 * 
 * @returns Objeto con:
 *   - choferes: Array de choferes cargados
 *   - loading: Estado de carga
 *   - error: Mensaje de error si ocurre
 *   - total: Total de choferes en BD
 *   - page: Página actual
 *   - pageSize: Tamaño de página
 *   - setPage: Función para cambiar página
 *   - setFilters: Función para aplicar filtros
 *   - refetch: Función para recargar datos
 * 
 * @example
 * const { choferes, loading, error, refetch } = useChoferes();
 */
export const useChoferes = () => {
  // Estado principal
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  
  // Filtros
  const [filters, setFilters] = useState<ChoferesFilters>({});

  /**
   * Carga choferes desde la API
   * Aplica filtros y paginación
   */
  const loadChoferes = useCallback(async (customFilters?: ChoferesFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const skip = (page - 1) * pageSize;
      const activeFilters = customFilters !== undefined ? customFilters : filters;
      
      const response = await choferesApi.getAll(skip, pageSize, activeFilters);
      
      setChoferes(response.users);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar choferes';
      setError(errorMessage);
      console.error('Error loading choferes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  /**
   * Efecto que recarga datos cuando cambia la página
   */
  useEffect(() => {
    loadChoferes();
  }, [loadChoferes]);

  /**
   * Actualiza filtros y recarga datos
   */
  const updateFilters = useCallback((newFilters: ChoferesFilters) => {
    setFilters(newFilters);
    setPage(1); // Resetear a primera página
  }, []);

  /**
   * Busca choferes por término
   */
  const searchChoferes = useCallback(async (query: string) => {
    if (query.length === 0) {
      // Si no hay búsqueda, recargar todos
      loadChoferes({});
      return;
    }

    if (query.length < 2) {
      return; // No buscar con menos de 2 caracteres
    }

    setLoading(true);
    setError(null);

    try {
      const results = await choferesApi.search(query);
      setChoferes(results);
      setTotal(results.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar choferes';
      setError(errorMessage);
      console.error('Error searching choferes:', err);
    } finally {
      setLoading(false);
    }
  }, [loadChoferes]);

  /**
   * Elimina un chofer con confirmación
   */
  const deleteChofer = useCallback(async (id: number, nombreCompleto: string) => {
    // Confirmación
    const confirmed = window.confirm(
      `¿Está seguro de eliminar al chofer ${nombreCompleto}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return false;
    }

    try {
      await choferesApi.delete(id);
      console.log('Chofer eliminado correctamente');
      
      // Recargar datos
      await loadChoferes();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar chofer';
      console.error('Error deleting chofer:', err);
      alert(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadChoferes]);

  return {
    // Estado
    choferes,
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
    refetch: loadChoferes,
    search: searchChoferes,
    deleteChofer,
  };
};

export default useChoferes;
