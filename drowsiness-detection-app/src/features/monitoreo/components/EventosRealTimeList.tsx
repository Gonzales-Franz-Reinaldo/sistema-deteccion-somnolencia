// ============================================
// LISTA DE EVENTOS DE SOMNOLENCIA EN TIEMPO REAL
// ============================================

import React from 'react';
import type { EventoMonitoreo } from '../types';
import { EVENTO_CONFIG, SEVERIDAD_CONFIG } from '../types';

interface EventosRealTimeListProps {
  eventos: EventoMonitoreo[];
  maxEventos?: number;
}

export const EventosRealTimeList: React.FC<EventosRealTimeListProps> = ({ 
  eventos, 
  maxEventos = 10 
}) => {
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (duracion: number | null, cantidad: number | null): string => {
    if (duracion) {
      return `${duracion.toFixed(1)}s`;
    }
    if (cantidad && cantidad > 1) {
      return `${cantidad}/min`;
    }
    return '—';
  };

  const eventosOrdenados = [...eventos]
    .sort((a, b) => new Date(b.timestamp_evento).getTime() - new Date(a.timestamp_evento).getTime())
    .slice(0, maxEventos);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-gray-200">
        <h3 className="flex items-center gap-2 text-lg font-bold text-red-600">
          <span className="text-xl">🚨</span>
          Eventos en Tiempo Real
        </h3>
      </div>

      {/* Lista de eventos */}
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {eventosOrdenados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <span className="text-4xl">✅</span>
            <p className="mt-2">Sin eventos de somnolencia</p>
          </div>
        ) : (
          eventosOrdenados.map((evento) => {
            const config = EVENTO_CONFIG[evento.tipo_evento] || { icon: '❓', color: 'text-gray-600', label: evento.tipo_evento };
            const severidadConfig = SEVERIDAD_CONFIG[evento.nivel_severidad] || SEVERIDAD_CONFIG.NORMAL;

            return (
              <div 
                key={evento.id_evento} 
                className={`p-3 hover:bg-gray-50 transition-colors ${
                  evento.nivel_severidad === 'CRITICAL' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${severidadConfig.bg}`}>
                    {config.icon}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(evento.timestamp_evento)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1">
                      {/* Badge de severidad */}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${severidadConfig.bg} ${severidadConfig.text}`}>
                        {evento.nivel_severidad}
                      </span>
                      
                      {/* Duración/Cantidad */}
                      <span className="text-xs text-gray-500">
                        {formatDuration(evento.duracion_segundos, evento.cantidad_eventos)}
                      </span>

                      {/* Velocidad si existe */}
                      {evento.velocidad_kmh !== null && (
                        <span className="text-xs text-gray-500">
                          🚗 {evento.velocidad_kmh} km/h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventosRealTimeList;