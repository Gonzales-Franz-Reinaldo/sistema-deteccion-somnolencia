import { useState, useEffect } from 'react';
import type { ReporteFiltros, TipoAlerta } from '../types';
import { TIPO_ALERTA_LABELS } from '../types';
import { Card } from '../../../components/common';
import { choferesApi } from '../../choferes/services/choferesApi';
import type { Chofer } from '../../choferes/types';

interface ReportesFiltrosProps {
  onAplicarFiltros: (filtros: ReporteFiltros) => void;
  loading?: boolean;
}

export const ReportesFiltros = ({ onAplicarFiltros, loading }: ReportesFiltrosProps) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [idChofer, setIdChofer] = useState<string>('');
  const [tipoAlerta, setTipoAlerta] = useState<string>('');
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(false);

  // Cargar lista de choferes al montar
  useEffect(() => {
    const loadChoferes = async () => {
      setLoadingChoferes(true);
      try {
        // Solicitar máximo 100 (límite permitido por backend) en lugar de 1000 que causaba 422
        const response = await choferesApi.getAll(0, 100, { activo: true });
        setChoferes(response.users || []);
      } catch (error) {
        console.error('Error al cargar choferes:', error);
      } finally {
        setLoadingChoferes(false);
      }
    };
    
    loadChoferes();
  }, []);

  const handleAplicar = () => {
    const filtros: ReporteFiltros = {};
    
    if (fechaInicio) filtros.fecha_inicio = fechaInicio;
    if (fechaFin) filtros.fecha_fin = fechaFin;
    if (idChofer) filtros.id_chofer = parseInt(idChofer);
    if (tipoAlerta) filtros.tipo_alerta = tipoAlerta as TipoAlerta;
    
    onAplicarFiltros(filtros);
  };

  const handleLimpiar = () => {
    setFechaInicio('');
    setFechaFin('');
    setIdChofer('');
    setTipoAlerta('');
    onAplicarFiltros({});
  };

  // Obtener fecha de hace 30 días para sugerencia
  const getFechaHace30Dias = (): string => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha.toISOString().split('T')[0];
  };

  // Obtener fecha de hoy
  const getFechaHoy = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha Inicio */}
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            id="fecha_inicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            max={fechaFin || getFechaHoy()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            id="fecha_fin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            min={fechaInicio}
            max={getFechaHoy()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>

        {/* Selector de Chofer */}
        <div>
          <label htmlFor="chofer" className="block text-sm font-medium text-gray-700 mb-1">
            Chofer
          </label>
          <select
            id="chofer"
            value={idChofer}
            onChange={(e) => setIdChofer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading || loadingChoferes}
          >
            <option value="">Todos los choferes</option>
            {choferes.map((chofer) => (
              <option key={chofer.id_usuario} value={chofer.id_usuario}>
                {chofer.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Alerta */}
        <div>
          <label htmlFor="tipo_alerta" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Alerta
          </label>
          <select
            id="tipo_alerta"
            value={tipoAlerta}
            onChange={(e) => setTipoAlerta(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_ALERTA_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAplicar}
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <>
              <svg className="inline animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aplicando...
            </>
          ) : (
            '🔍 Aplicar Filtros'
          )}
        </button>
        <button
          onClick={handleLimpiar}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Sugerencias rápidas */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Búsquedas rápidas:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFechaInicio(getFechaHace30Dias());
              setFechaFin(getFechaHoy());
            }}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            📅 Últimos 30 días
          </button>
          <button
            onClick={() => {
              setFechaInicio(getFechaHoy());
              setFechaFin(getFechaHoy());
            }}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            📅 Hoy
          </button>
          <button
            onClick={() => {
              // Ajuste: backend usa 'microsueno' sin ñ
              setTipoAlerta('microsueno');
            }}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            disabled={loading}
          >
            😴 Solo Microsueños
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ReportesFiltros;
