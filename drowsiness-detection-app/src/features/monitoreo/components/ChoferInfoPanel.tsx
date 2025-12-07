// PANEL DE INFORMACIÓN DEL CHOFER
// Muestra datos personales y licencia

import React from 'react';
import type { ChoferInfo } from '../types';

interface ChoferInfoPanelProps {
  chofer: ChoferInfo;
}

export const ChoferInfoPanel: React.FC<ChoferInfoPanelProps> = ({ chofer }) => {
  // Obtener iniciales del nombre
  const getInitials = (nombre: string): string => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Avatar y Nombre */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 text-center border-b border-gray-200">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
          {getInitials(chofer.nombre_completo)}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{chofer.nombre_completo}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {chofer.tipo_chofer === 'empresa' ? chofer.empresa : 'Chofer Individual'}
        </p>
      </div>

      {/* Información Personal */}
      <div className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
          <span>👤</span>
          Información Personal
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">DNI/CI:</span>
            <span className="font-medium text-gray-900">{chofer.dni_ci || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Teléfono:</span>
            <span className="font-medium text-gray-900">{chofer.telefono || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="font-medium text-gray-900 truncate max-w-[150px]" title={chofer.email}>
              {chofer.email}
            </span>
          </div>
        </div>
      </div>

      {/* Licencia de Conducir */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
          <span>🪪</span>
          Licencia de Conducir
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Número:</span>
            <span className="font-medium text-gray-900">{chofer.numero_licencia || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Categoría:</span>
            <span className="font-medium text-gray-900">
              {chofer.categoria_licencia?.split(' - ')[0] || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vigencia:</span>
            <span className="font-medium text-green-600">Hasta 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoferInfoPanel;