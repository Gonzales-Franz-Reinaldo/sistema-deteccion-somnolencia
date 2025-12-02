// ============================================
// INDICADOR DE ESTADO GPS
// ============================================

import React from 'react';
import type { EstadoGPS } from '../types';

interface GPSStatusIndicatorProps {
  estado: EstadoGPS;
}

export const GPSStatusIndicator: React.FC<GPSStatusIndicatorProps> = ({ estado }) => {
  const getSignalBars = (senal: number): React.ReactNode => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      const isActive = senal >= (i + 1) * 2;
      bars.push(
        <div
          key={i}
          className={`w-1.5 rounded-sm transition-colors ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}
          style={{ height: `${(i + 1) * 4 + 4}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 space-y-2 text-xs">
      {/* Estado de conexión */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${estado.conectado ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-gray-700">
          GPS: <span className={estado.conectado ? 'text-green-600' : 'text-red-600'}>
            {estado.conectado ? 'Conectado' : 'Desconectado'}
          </span>
        </span>
      </div>

      {/* Señal */}
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-4">
          {getSignalBars(estado.senal)}
        </div>
        <span className="text-gray-700">Señal: {estado.senal}/8</span>
      </div>

      {/* Precisión */}
      <div className="flex items-center gap-2">
        <span className="text-red-500">📍</span>
        <span className="text-gray-700">Precisión: {estado.precision}m</span>
      </div>
    </div>
  );
};

export default GPSStatusIndicator;