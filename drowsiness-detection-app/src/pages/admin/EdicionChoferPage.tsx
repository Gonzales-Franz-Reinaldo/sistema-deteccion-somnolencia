// ============================================
// PÁGINA: EDICIÓN DE CHOFER
// Permite modificar datos de un chofer existente
// ============================================

import { useParams, Link } from 'react-router-dom';
import { ChoferForm } from '../../features/choferes/components/ChoferForm';

export const EdicionChoferPage = () => {
  const { id } = useParams<{ id: string }>();
  const choferId = Number(id);

  // Validar que el ID sea válido
  if (!id || isNaN(choferId)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">❌ Error</h2>
          <p className="text-red-700 mb-4">ID de chofer inválido</p>
          <Link
            to="/admin/choferes"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* BREADCRUMB */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to="/admin/choferes" className="hover:text-blue-600 transition-colors">
          Gestión de Choferes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Editar Chofer</span>
      </nav>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">✏️</span>
          Editar Chofer
        </h1>
        <p className="text-gray-600 mt-2">
          Modifique los datos del chofer. Los cambios se reflejarán inmediatamente en el sistema.
        </p>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ChoferForm choferId={choferId} />
      </div>

      {/* INFO BOX */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>ℹ️</span>
          Información importante
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>El nombre de usuario no puede ser modificado por seguridad</li>
          <li>La contraseña solo se actualizará si marca la opción "Cambiar contraseña"</li>
          <li>Los cambios se guardarán al hacer clic en "Actualizar Chofer"</li>
          <li>Si el chofer tiene sesiones activas, deberá cerrar sesión y volver a ingresar</li>
        </ul>
      </div>
    </div>
  );
};

export default EdicionChoferPage;
