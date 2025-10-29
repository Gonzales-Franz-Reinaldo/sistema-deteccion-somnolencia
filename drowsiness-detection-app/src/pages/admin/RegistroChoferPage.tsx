// ============================================
// PÁGINA: REGISTRO DE NUEVO CHOFER
// ============================================

import { Link } from 'react-router-dom';
import { ChoferForm } from '../../features/choferes/components/ChoferForm';

export const RegistroChoferPage = () => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors">
          Dashboard
        </Link>
        <span>›</span>
        <Link to="/admin/choferes" className="hover:text-blue-600 transition-colors">
          Gestión de Choferes
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Registrar Nuevo Chofer</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-5xl">➕</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registro de Nuevo Chofer
          </h1>
          <p className="text-gray-600 mt-1">
            Complete todos los campos requeridos (*) para registrar un nuevo chofer en el sistema
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <ChoferForm />
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">
              Información importante
            </h4>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Los campos marcados con (*) son obligatorios</li>
              <li>El chofer recibirá sus credenciales de acceso</li>
              <li>El chofer deberá cambiar su contraseña en el primer inicio de sesión</li>
              <li>Los choferes de empresa deben estar asociados a una empresa activa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroChoferPage;
