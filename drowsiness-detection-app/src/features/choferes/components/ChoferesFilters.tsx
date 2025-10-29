// ============================================
// COMPONENTE: FILTROS Y BÚSQUEDA DE CHOFERES
// Incluye input de búsqueda y botón de registro
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChoferesFiltersProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

/**
 * Componente de filtros para la tabla de choferes
 * Incluye búsqueda manual (click en lupa o Enter) y botón de registro (deshabilitado)
 */
export const ChoferesFilters = ({ onSearch, loading = false }: ChoferesFiltersProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Actualiza el estado local del input sin ejecutar búsqueda
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  /**
   * Ejecuta la búsqueda cuando el usuario hace click en la lupa
   */
  const handleSearchSubmit = () => {
    // Buscar solo si tiene 2+ caracteres o está vacío (para limpiar)
    if (searchQuery.length >= 2 || searchQuery.length === 0) {
      onSearch(searchQuery);
    }
  };

  /**
   * Permite buscar al presionar Enter en el input
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      {/* Input de búsqueda */}
      <div className="relative flex-1 w-full sm:max-w-md">
        {/* Botón de lupa para ejecutar búsqueda */}
        <button
          onClick={handleSearchSubmit}
          disabled={loading}
          className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-400"
          title="Buscar chofer (o presiona Enter)"
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        
        <input
          type="text"
          placeholder="Buscar chofer por nombre, email... (presiona Enter o click en 🔍)"
          value={searchQuery}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />

        {/* Botón limpiar búsqueda */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Botón registrar */}
      <button
        onClick={() => navigate('/admin/choferes/nuevo')}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        title="Registrar un nuevo chofer en el sistema"
      >
        <span className="text-lg">✨</span>
        <span className="hidden sm:inline">Registrar Nuevo Chofer</span>
        <span className="sm:hidden">Nuevo Chofer</span>
      </button>
    </div>
  );
};

export default ChoferesFilters;
