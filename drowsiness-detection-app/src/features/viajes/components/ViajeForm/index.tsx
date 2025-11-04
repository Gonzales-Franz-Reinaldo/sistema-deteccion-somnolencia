// ============================================
// FORMULARIO COMPLETO DE ASIGNACIÓN/EDICIÓN DE VIAJE
// Incluye todas las secciones integradas con 2 columnas
// Soporta modo creación y edición
// ============================================

import { useViajeForm } from '../../hooks/useViajeForm';
import { DEPARTAMENTOS_BOLIVIA, CATEGORIAS_LICENCIA } from '../../constants/departamentos';

interface ViajeFormProps {
  viajeId?: number; // Si existe, modo edición
}

export const ViajeForm: React.FC<ViajeFormProps> = ({ viajeId }) => {
  const {
    formData,
    errors,
    loading,
    loadingInitialData,
    isEditMode,
    choferesDisponibles,
    loadingChoferes,
    validandoDisponibilidad,
    disponible,
    mensajeDisponibilidad,
    handleChange,
    handleSubmit,
    handleReset,
    handleCancel,
  } = useViajeForm({ viajeId });

  // Mostrar spinner mientras carga datos iniciales (modo edición)
  if (loadingInitialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando datos del viaje...</span>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ============================================ */}
        {/* COLUMNA IZQUIERDA */}
        {/* ============================================ */}
        <div className="space-y-6">
          {/* SECCIÓN: INFORMACIÓN DEL CHOFER */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-4 pb-3 border-b border-indigo-200">
              <span className="text-2xl">👤</span>
              Información del Chofer
            </h3>

            <div className="space-y-4">
              {/* Categoría de Licencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría de Licencia *
                </label>
                <select
                  value={formData.categoria_licencia}
                  onChange={(e) => handleChange('categoria_licencia', e.target.value)}
                  disabled={isEditMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.categoria_licencia ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIAS_LICENCIA.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                {errors.categoria_licencia && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoria_licencia}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione la categoría para filtrar choferes disponibles
                </p>
              </div>

              {/* Chofer (dinámico según categoría) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chofer *
                </label>
                <select
                  value={formData.id_chofer}
                  onChange={(e) => handleChange('id_chofer', e.target.value)}
                  disabled={!formData.categoria_licencia || loadingChoferes || isEditMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.id_chofer ? 'border-red-500' : 'border-gray-300'
                  } ${(!formData.categoria_licencia || loadingChoferes || isEditMode) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingChoferes 
                      ? 'Cargando choferes...' 
                      : !formData.categoria_licencia 
                      ? 'Primero seleccione una categoría' 
                      : 'Seleccionar chofer...'}
                  </option>
                  {choferesDisponibles.map((chofer) => (
                    <option key={chofer.id_usuario} value={chofer.id_usuario}>
                      {chofer.nombre_completo}
                    </option>
                  ))}
                </select>
                {errors.id_chofer && (
                  <p className="text-red-500 text-xs mt-1">{errors.id_chofer}</p>
                )}
              </div>

              {/* Información de Empresa (solo lectura) */}
              {formData.nombre_empresa_info && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600 mr-2">🏢</span>
                    <span className="font-medium text-gray-700">Empresa:</span>
                    <span className="ml-2 text-gray-900">{formData.nombre_empresa_info}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN: DETALLES DEL VIAJE */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-4 pb-3 border-b border-indigo-200">
              <span className="text-2xl">🗺️</span>
              Detalles del Viaje
            </h3>

            <div className="space-y-4">
              {/* Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen *
                </label>
                <select
                  value={formData.origen}
                  onChange={(e) => handleChange('origen', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.origen ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar origen...</option>
                  {DEPARTAMENTOS_BOLIVIA.map((departamento) => (
                    <option key={`origen-${departamento}`} value={departamento}>
                      📍 {departamento}
                    </option>
                  ))}
                </select>
                {errors.origen && (
                  <p className="text-red-500 text-xs mt-1">{errors.origen}</p>
                )}
              </div>

              {/* Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destino *
                </label>
                <select
                  value={formData.destino}
                  onChange={(e) => handleChange('destino', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.destino ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar destino...</option>
                  {DEPARTAMENTOS_BOLIVIA.map((departamento) => (
                    <option 
                      key={`destino-${departamento}`} 
                      value={departamento}
                      disabled={departamento === formData.origen}
                    >
                      🎯 {departamento}
                    </option>
                  ))}
                </select>
                {errors.destino && (
                  <p className="text-red-500 text-xs mt-1">{errors.destino}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  El origen y destino deben ser diferentes
                </p>
              </div>

              {/* Fecha Programada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Programada del Viaje *
                </label>
                <input
                  type="date"
                  value={formData.fecha_viaje_programada}
                  onChange={(e) => handleChange('fecha_viaje_programada', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.fecha_viaje_programada ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fecha_viaje_programada && (
                  <p className="text-red-500 text-xs mt-1">{errors.fecha_viaje_programada}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  📅 Fecha en la que el chofer realizará el viaje
                </p>
              </div>

              {/* Hora Programada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Programada del Viaje *
                </label>
                <input
                  type="time"
                  value={formData.hora_viaje_programada}
                  onChange={(e) => handleChange('hora_viaje_programada', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.hora_viaje_programada ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hora_viaje_programada && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_viaje_programada}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  🕐 Hora en la que el chofer debe iniciar el viaje
                </p>
              </div>

              {/* Badge de Validación de Disponibilidad - Solo valida FECHA */}
              {formData.id_chofer && formData.fecha_viaje_programada && (
                <div className="mt-4">
                  {validandoDisponibilidad && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">⏳ Validando disponibilidad del chofer para esta fecha...</span>
                    </div>
                  )}

                  {!validandoDisponibilidad && disponible === true && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg">
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-green-700">Chofer disponible para esta fecha</p>
                        <p className="text-xs text-green-600">{mensajeDisponibilidad}</p>
                      </div>
                    </div>
                  )}

                  {!validandoDisponibilidad && disponible === false && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                      <span className="text-red-600 text-xl">⚠️</span>
                      <div>
                        <p className="text-sm font-semibold text-red-700">Chofer no disponible para esta fecha</p>
                        <p className="text-xs text-red-600">{mensajeDisponibilidad}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* COLUMNA DERECHA */}
        {/* ============================================ */}
        <div className="space-y-6">
          {/* SECCIÓN: DURACIÓN Y DISTANCIA */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-4 pb-3 border-b border-indigo-200">
              <span className="text-2xl">⏱️</span>
              Duración y Distancia
            </h3>

            <div className="space-y-4">
              {/* Duración: Horas y Minutos en una fila */}
              <div className="grid grid-cols-2 gap-4">
                {/* Horas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.horas}
                    onChange={(e) => handleChange('horas', e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      errors.horas ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.horas && (
                    <p className="text-red-500 text-xs mt-1">{errors.horas}</p>
                  )}
                </div>

                {/* Minutos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minutos *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutos}
                    onChange={(e) => handleChange('minutos', e.target.value)}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      errors.minutos ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minutos && (
                    <p className="text-red-500 text-xs mt-1">{errors.minutos}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Duración estimada del viaje (0-24 horas, 0-59 minutos)
              </p>

              {/* Distancia en kilómetros (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distancia (km)
                  <span className="text-gray-400 ml-1">(opcional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.distancia_km}
                  onChange={(e) => handleChange('distancia_km', e.target.value)}
                  placeholder="Ej: 525.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.distancia_km ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.distancia_km && (
                  <p className="text-red-500 text-xs mt-1">{errors.distancia_km}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN: OBSERVACIONES */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-4 pb-3 border-b border-indigo-200">
              <span className="text-2xl">📝</span>
              Observaciones
            </h3>

            <div>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                rows={5}
                maxLength={500}
                placeholder="Notas adicionales sobre el viaje (máximo 500 caracteres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Información adicional sobre el viaje (opcional)
                </p>
                <p className="text-xs text-gray-400">
                  {formData.observaciones.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: CONFIGURACIÓN (solo en creación) */}
          {!isEditMode && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-600 mb-4 pb-3 border-b border-indigo-200">
                <span className="text-2xl">⚙️</span>
                Configuración
              </h3>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="enviar_email"
                  checked={formData.enviar_email}
                  onChange={(e) => handleChange('enviar_email', e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="enviar_email" className="ml-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">
                    Enviar viaje por email al chofer
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Se enviará un correo con los detalles del viaje asignado
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Funcionalidad pendiente de implementación
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* BOTONES DE ACCIÓN */}
      {/* ============================================ */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        {/* Botón Cancelar */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>

        {/* Botón Limpiar (solo en creación) */}
        {!isEditMode && (
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar Formulario
          </button>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading || validandoDisponibilidad || disponible === false}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center ${
            loading || validandoDisponibilidad || disponible === false
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          title={
            disponible === false 
              ? 'El chofer no está disponible. Seleccione otra fecha/hora.' 
              : validandoDisponibilidad 
              ? 'Validando disponibilidad...' 
              : ''
          }
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditMode ? 'Actualizando...' : 'Asignando...'}
            </>
          ) : validandoDisponibilidad ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validando...
            </>
          ) : (
            <>
              <span className="mr-2">{isEditMode ? '💾' : '✅'}</span>
              {isEditMode ? 'Actualizar Viaje' : 'Asignar Viaje'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ViajeForm;
