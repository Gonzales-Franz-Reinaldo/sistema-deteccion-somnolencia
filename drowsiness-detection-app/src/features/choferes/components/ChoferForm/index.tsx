// ============================================
// FORMULARIO COMPLETO DE REGISTRO/EDICIÓN DE CHOFER
// Incluye todas las secciones integradas
// Soporta modo creación y edición
// ============================================

import { useState, useEffect } from 'react';
import { useChoferForm } from '../../hooks/useChoferForm';
import { empresasApi } from '../../../empresas/services/empresasApi';
import type { Empresa } from '../../../empresas/types';

interface ChoferFormProps {
  choferId?: number; // Si existe, modo edición
}

export const ChoferForm: React.FC<ChoferFormProps> = ({ choferId }) => {
  const {
    formData,
    errors,
    loading,
    loadingInitialData,
    isEditMode,
    handleChange,
    handleSubmit,
    handleReset,
    handleCancel,
  } = useChoferForm({ choferId });

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [changePassword, setChangePassword] = useState(false); // Checkbox para cambiar contraseña en modo edición

  // Cargar empresas al montar el componente
  useEffect(() => {
    const loadEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const data = await empresasApi.getAllActive();
        setEmpresas(data);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
      } finally {
        setLoadingEmpresas(false);
      }
    };

    loadEmpresas();
  }, []);

  // Mostrar spinner mientras carga datos iniciales (modo edición)
  if (loadingInitialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando datos del chofer...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          {/* SECCIÓN: DATOS PERSONALES */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4 pb-3 border-b border-blue-200">
              <span className="text-2xl">👤</span>
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleChange('nombres', e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.nombres ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nombres && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleChange('apellidos', e.target.value)}
                  placeholder="Ej: Pérez Gómez"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.apellidos ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.apellidos && (
                  <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>
                )}
              </div>

              {/* DNI/CI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI/CI *
                </label>
                <input
                  type="text"
                  value={formData.dni_ci}
                  onChange={(e) => handleChange('dni_ci', e.target.value)}
                  placeholder="Ej: 12345678"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.dni_ci ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dni_ci && (
                  <p className="text-red-500 text-xs mt-1">{errors.dni_ci}</p>
                )}
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género *
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleChange('genero', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.genero ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.genero && (
                  <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
                )}
              </div>

              {/* Nacionalidad */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={formData.nacionalidad}
                  onChange={(e) => handleChange('nacionalidad', e.target.value)}
                  placeholder="Ej: Boliviana"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: INFORMACIÓN DE CONTACTO */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4 pb-3 border-b border-blue-200">
              <span className="text-2xl">📞</span>
              Información de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ej: jperez@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="Ej: +591 70123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  placeholder="Ej: Av. Principal #123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleChange('ciudad', e.target.value)}
                  placeholder="Ej: La Paz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          {/* SECCIÓN: INFORMACIÓN LABORAL */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4 pb-3 border-b border-blue-200">
              <span className="text-2xl">🚗</span>
              Información Laboral
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa (SIEMPRE visible - todos los choferes son de empresa) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <select
                  value={formData.id_empresa}
                  onChange={(e) => handleChange('id_empresa', e.target.value)}
                  disabled={loadingEmpresas}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.id_empresa ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_empresa} value={empresa.id_empresa}>
                      {empresa.nombre_empresa}
                    </option>
                  ))}
                </select>
                {errors.id_empresa && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_empresa}</p>
                )}
              </div>

              {/* Número de Licencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Licencia *
                </label>
                <input
                  type="text"
                  value={formData.numero_licencia}
                  onChange={(e) => handleChange('numero_licencia', e.target.value)}
                  placeholder="Ej: LIC-123456"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.numero_licencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.numero_licencia && (
                  <p className="text-red-500 text-xs mt-1">{errors.numero_licencia}</p>
                )}
              </div>

              {/* Categoría de Licencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría de Licencia *
                </label>
                <select
                  value={formData.categoria_licencia}
                  onChange={(e) => handleChange('categoria_licencia', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.categoria_licencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="a">Categoría A - Motocicletas</option>
                  <option value="b">Categoría B - Vehículos Livianos</option>
                  <option value="c">Categoría C - Vehículos Pesados</option>
                  <option value="d">Categoría D - Transporte Público</option>
                </select>
                {errors.categoria_licencia && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoria_licencia}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN: CREDENCIALES */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4 pb-3 border-b border-blue-200">
              <span className="text-2xl">🔐</span>
              Credenciales de Acceso
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Usuario */}
              <div className={isEditMode ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => handleChange('usuario', e.target.value)}
                  placeholder="Ej: jperez"
                  readOnly={isEditMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.usuario ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.usuario && (
                  <p className="text-red-500 text-xs mt-1">{errors.usuario}</p>
                )}
                {!isEditMode && (
                  <p className="text-gray-500 text-xs mt-1">Mínimo 5 caracteres</p>
                )}
                {isEditMode && (
                  <p className="text-gray-500 text-xs mt-1">⚠️ El usuario no se puede modificar</p>
                )}
              </div>

              {/* Checkbox para cambiar contraseña (solo en modo edición) */}
              {isEditMode && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={changePassword}
                      onChange={(e) => {
                        setChangePassword(e.target.checked);
                        // Limpiar contraseñas si se desmarca
                        if (!e.target.checked) {
                          handleChange('password', '');
                          handleChange('password_confirm', '');
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Cambiar contraseña
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs mt-1 ml-6">
                    Marque esta opción solo si desea cambiar la contraseña actual
                  </p>
                </div>
              )}

              {/* Mostrar campos de contraseña solo en modo creación o si checkbox está marcado */}
              {(!isEditMode || changePassword) && (
                <>
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña {!isEditMode && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="********"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                    {isEditMode && (
                      <p className="text-gray-500 text-xs mt-1">Mínimo 6 caracteres</p>
                    )}
                  </div>

                  {/* Confirmar Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña {!isEditMode && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password_confirm}
                      onChange={(e) => handleChange('password_confirm', e.target.value)}
                      placeholder="********"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password_confirm ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password_confirm && (
                      <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Alerta */}
            {!isEditMode && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <span className="text-yellow-800 text-sm">
                  El chofer deberá cambiar su contraseña en el primer inicio de sesión
                </span>
              </div>
            )}
            {isEditMode && !changePassword && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <span className="text-blue-800 text-sm">
                  La contraseña actual se mantendrá sin cambios
                </span>
              </div>
            )}
          </div>

          {/* SECCIÓN: CONFIGURACIÓN */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4 pb-3 border-b border-blue-200">
              <span className="text-2xl">⚙️</span>
              Configuración
            </h3>

            <div className="space-y-3">
              {/* Enviar credenciales por email (solo en modo creación) */}
              {!isEditMode && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enviar_email}
                    onChange={(e) => handleChange('enviar_email', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Enviar credenciales por email al chofer
                  </span>
                </label>
              )}

              {/* Activar cuenta */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Activar cuenta inmediatamente
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{isEditMode ? 'Actualizando...' : 'Registrando...'}</span>
            </>
          ) : (
            <>
              <span className="text-lg">{isEditMode ? '✏️' : '💾'}</span>
              <span>{isEditMode ? 'Actualizar Chofer' : 'Registrar Chofer'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-lg">❌</span>
          <span>Cancelar</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-lg">🔄</span>
          <span>{isEditMode ? 'Restaurar Datos' : 'Limpiar Formulario'}</span>
        </button>
      </div>
    </form>
  );
};

export default ChoferForm;
