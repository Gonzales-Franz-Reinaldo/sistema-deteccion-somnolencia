// ============================================
// PÁGINA: EDITAR VIAJE EXISTENTE
// Formulario de edición de viaje
// ============================================

import { useNavigate, useParams } from 'react-router-dom';
import { ViajeForm } from '../../../features/viajes/components/ViajeForm';

export const EdicionViajePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const viajeId = id ? parseInt(id, 10) : undefined;

  const handleBack = () => {
    navigate('/admin/viajes');
  };

  if (!viajeId || isNaN(viajeId)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-3xl">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-900">
                  ID de viaje no válido
                </h3>
                <p className="mt-2 text-sm text-red-800">
                  No se pudo cargar el viaje. Por favor, verifique la URL.
                </p>
                <button
                  onClick={handleBack}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="mr-2">←</span>
                  Volver a Gestión de Viajes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón volver */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Volver a Gestión de Viajes
          </button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">📝</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Viaje</h1>
              <p className="mt-1 text-sm text-gray-600">
                Modifique los detalles del viaje asignado
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta con el formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <ViajeForm viajeId={viajeId} />
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-900">
                Consideraciones importantes
              </h3>
              <div className="mt-2 text-sm text-yellow-800">
                <ul className="list-disc pl-5 space-y-1">
                  <li>No se puede cambiar el chofer asignado en modo edición</li>
                  <li>Puede modificar el origen, destino, duración y observaciones</li>
                  <li>Los cambios se aplicarán inmediatamente después de guardar</li>
                  <li>El estado del viaje puede actualizarse según corresponda</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdicionViajePage;
