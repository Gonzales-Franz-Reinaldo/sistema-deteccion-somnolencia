// ============================================
// PÁGINA: GESTIÓN DE VIAJES
// Lista completa de viajes asignados con filtros
// ============================================

import { useNavigate } from 'react-router-dom';
import { ViajesTable } from '../../../features/viajes/components/ViajesTable';
import { useViajes } from '../../../features/viajes/hooks/useViajes';

export const GestionViajesPage = () => {
  const navigate = useNavigate();
  const {
    viajes,
    loading,
    error,
    total,
    page,
    totalPages,
    setPage,
    refetch,
    deleteViaje,
  } = useViajes();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAsignarViaje = () => {
    navigate('/admin/viajes/asignar');
  };

  const handleDelete = async (id: number, nombreChofer: string) => {
    await deleteViaje(id, nombreChofer);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🚗</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Viajes</h1>
              <p className="text-gray-600 mt-1">
                Administra las asignaciones de viajes a choferes
              </p>
            </div>
          </div>

          <button
            onClick={handleAsignarViaje}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
          >
            <span className="mr-2">➕</span>
            Asignar Viaje
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Viajes</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {viajes.filter(v => v.estado === 'pendiente').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🚦</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Curso</p>
              <p className="text-2xl font-bold text-gray-900">
                {viajes.filter(v => v.estado === 'en_curso').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {viajes.filter(v => v.estado === 'completada').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de viajes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ViajesTable
          viajes={viajes}
          loading={loading}
          error={error}
          onRetry={refetch}
          onDelete={handleDelete}
          // Paginación
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default GestionViajesPage;
