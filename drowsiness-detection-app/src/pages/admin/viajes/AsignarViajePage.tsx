// PÁGINA: ASIGNAR NUEVO VIAJE
// Formulario de creación de viaje

import { useNavigate } from 'react-router-dom';
import { ViajeForm } from '../../../features/viajes/components/ViajeForm';

export const AsignarViajePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/viajes');
  };

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
            <span className="text-4xl">🚗</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asignar Nuevo Viaje</h1>
              <p className="mt-1 text-sm text-gray-600">
                Complete los detalles del viaje para asignar a un chofer
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta con el formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <ViajeForm />
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Información importante
              </h3>
              <div className="mt-2 text-sm text-blue-800">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seleccione primero la categoría de licencia para filtrar choferes disponibles</li>
                  <li>El origen y destino deben ser diferentes</li>
                  <li>La duración estimada se calcula en horas y minutos</li>
                  <li>Solo se mostrarán choferes activos con la categoría seleccionada</li>
                  <li>La empresa se asigna automáticamente según el chofer seleccionado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsignarViajePage;
