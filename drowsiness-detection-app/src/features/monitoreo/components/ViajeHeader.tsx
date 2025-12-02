// ============================================
// HEADER DEL MONITOREO DE VIAJE
// Muestra origen, destino y badge EN VIVO
// ============================================

import React from 'react';

interface ViajeHeaderProps {
  origen: string;
  destino: string;
  enVivo: boolean;
}

export const ViajeHeader: React.FC<ViajeHeaderProps> = ({ origen, destino, enVivo }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl shadow-lg p-4 text-white relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative flex items-center justify-center gap-6">
        {/* Origen */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          <div className="text-center">
            <p className="text-xs text-indigo-200 uppercase tracking-wide">Origen</p>
            <p className="text-lg font-bold">{origen}</p>
          </div>
        </div>

        {/* Flecha */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-white/50" />
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="w-12 h-0.5 bg-white/50" />
        </div>

        {/* Destino */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full" />
          <div className="text-center">
            <p className="text-xs text-indigo-200 uppercase tracking-wide">Destino</p>
            <p className="text-lg font-bold">{destino}</p>
          </div>
        </div>
      </div>

      {/* Badge EN VIVO */}
      {enVivo && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            EN VIVO
          </span>
        </div>
      )}
    </div>
  );
};

export default ViajeHeader;