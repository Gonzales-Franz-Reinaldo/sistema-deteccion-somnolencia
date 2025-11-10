// ============================================
// PÁGINA: GESTIÓN DE CHOFERES
// Vista principal para administrar choferes del sistema
// ============================================

import { useChoferes } from '../../features/choferes/hooks/useChoferes';
import { ChoferesTable } from '../../features/choferes/components/ChoferesTable';
import { ChoferesFilters } from '../../features/choferes/components/ChoferesFilters';
import { Link } from 'react-router-dom';

/**
 * Página principal de gestión de choferes
 * Incluye: filtros, búsqueda, tabla y paginación
 */
export const GestionChoferesPage = () => {
  const { 
    choferes, 
    loading, 
    error, 
    total, 
    page, 
    totalPages,
    setPage, 
    refetch,
    search,
    deleteChofer
  } = useChoferes();

  /**
   * Maneja la búsqueda de choferes
   */
  const handleSearch = (query: string) => {
    search(query);
  };

  /**
   * Maneja la eliminación de un chofer
   */
  const handleDelete = async (id: number, nombreCompleto: string) => {
    await deleteChofer(id, nombreCompleto);
  };

  return (
    <div className="space-y-6">
      {/* Header con breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/admin/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Gestión de Choferes</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choferes Registrados</h1>
            <p className="text-gray-600 mt-1">
              Administra y visualiza todos los choferes del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <ChoferesFilters onSearch={handleSearch} loading={loading} />

      {/* Estadísticas rápidas */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Choferes</p>
                <p className="text-2xl font-bold text-blue-900">{total}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Choferes Activos</p>
                <p className="text-2xl font-bold text-green-900">
                  {choferes.filter(c => c.activo).length}
                </p>
              </div>
              <div className="text-3xl">✓</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de choferes con paginación integrada */}
      <ChoferesTable
        choferes={choferes}
        loading={loading}
        error={error}
        onRetry={refetch}
        onDelete={handleDelete}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Botón volver al dashboard */}
      <div className="flex justify-center pt-4">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default GestionChoferesPage;
