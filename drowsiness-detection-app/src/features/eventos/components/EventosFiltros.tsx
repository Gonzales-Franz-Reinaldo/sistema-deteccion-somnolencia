/**
 * Componente de filtros para eventos de somnolencia
 */
import { useState, useEffect } from 'react';
import { Card } from '../../../components/common';
import { choferesApi } from '../../choferes/services/choferesApi';
import type { Chofer } from '../../choferes/types';
import type { EventosFiltros, TipoEvento, NivelSeveridad } from '../types';
import { TIPO_EVENTO_LABELS, SEVERIDAD_LABELS } from '../types';

interface EventosFiltrosProps {
  onAplicarFiltros: (filtros: EventosFiltros) => void;
  loading?: boolean;
}

export const EventosFiltrosComponent = ({ onAplicarFiltros, loading }: EventosFiltrosProps) => {
  const [idChofer, setIdChofer] = useState<string>('');
  const [tipoEvento, setTipoEvento] = useState<string>('');
  const [nivelSeveridad, setNivelSeveridad] = useState<string>('');
  const [dias, setDias] = useState<string>('7');
  const [soloCriticos, setSoloCriticos] = useState<boolean>(false);
  
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(false);

  // Cargar lista de choferes
  useEffect(() => {
    const loadChoferes = async () => {
      setLoadingChoferes(true);
      try {
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
    const filtros: EventosFiltros = {
      dias: parseInt(dias) || 7
    };
    
    if (idChofer) filtros.id_chofer = parseInt(idChofer);
    if (tipoEvento) filtros.tipo_evento = tipoEvento as TipoEvento;
    if (nivelSeveridad) filtros.nivel_severidad = nivelSeveridad as NivelSeveridad;
    if (soloCriticos) filtros.solo_criticos = true;
    
    onAplicarFiltros(filtros);
  };

  const handleLimpiar = () => {
    setIdChofer('');
    setTipoEvento('');
    setNivelSeveridad('');
    setDias('7');
    setSoloCriticos(false);
    onAplicarFiltros({});
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros de Búsqueda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <select
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="1">Último día</option>
            <option value="7">Últimos 7 días</option>
            <option value="15">Últimos 15 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="60">Últimos 60 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
        </div>

        {/* Chofer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chofer
          </label>
          <select
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

        {/* Tipo de Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Evento
          </label>
          <select
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_EVENTO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Severidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severidad
          </label>
          <select
            value={nivelSeveridad}
            onChange={(e) => setNivelSeveridad(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="">Todas las severidades</option>
            {Object.entries(SEVERIDAD_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Solo Críticos */}
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soloCriticos}
              onChange={(e) => setSoloCriticos(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Solo críticos</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAplicar}
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aplicando...
            </span>
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
    </Card>
  );
};

export default EventosFiltrosComponent;