// INDICADOR DE ESTADO DE CONEXIÓN GPS
// Muestra si el chofer está enviando GPS en tiempo real

import React from 'react';
import type { GPSRealtimeStatus } from '../types';

interface GPSConnectionStatusProps {
  status: GPSRealtimeStatus;
  isChoferOnline: boolean;
  isChoferSignalWeak?: boolean;  
  lastUpdate: Date | null;
  choferName?: string;
  secondsSinceLastUpdate?: number;  
  onReconnect?: () => void;
}

export const GPSConnectionStatus: React.FC<GPSConnectionStatusProps> = ({
  status,
  isChoferOnline,
  isChoferSignalWeak = false,
  lastUpdate,
  choferName,
  secondsSinceLastUpdate = 0,
  onReconnect,
}) => {
  const getStatusConfig = () => {
    //  Señal perdida (timeout del frontend)
    if (status === 'CONNECTED' && !isChoferOnline && secondsSinceLastUpdate > 10) {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🔴',
        label: 'Señal GPS Perdida',
        description: `Sin señal hace ${secondsSinceLastUpdate}s`,
        animate: false,
        showReconnect: true,
      };
    }
    
    //  Señal débil (advertencia)
    if (isChoferOnline && isChoferSignalWeak) {
      return {
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: '🟠',
        label: 'Señal GPS Débil',
        description: `${secondsSinceLastUpdate}s sin actualización`,
        animate: true,
        showReconnect: false,
      };
    }
    
    if (isChoferOnline && status === 'CONNECTED') {
      return {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '🟢',
        label: 'GPS En Vivo',
        description: choferName ? `${choferName} transmitiendo` : 'Chofer transmitiendo',
        animate: true,
        showReconnect: false,
      };
    }
    
    if (status === 'CONNECTED' && !isChoferOnline) {
      return {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '🟡',
        label: 'Esperando GPS',
        description: 'Chofer no ha iniciado transmisión',
        animate: false,
        showReconnect: false,
      };
    }
    
    if (status === 'CONNECTING' || status === 'RECONNECTING') {
      return {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '🔄',
        label: status === 'CONNECTING' ? 'Conectando...' : 'Reconectando...',
        description: 'Estableciendo conexión',
        animate: true,
        showReconnect: false,
      };
    }
    
    if (status === 'ERROR') {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🔴',
        label: 'Error de Conexión',
        description: 'No se puede conectar al servidor',
        animate: false,
        showReconnect: true,
      };
    }
    
    // DISCONNECTED
    return {
      color: 'bg-gray-400',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '⚫',
      label: 'Desconectado',
      description: 'Sin conexión GPS',
      animate: false,
      showReconnect: true,
    };
  };
  
  const config = getStatusConfig();
  
  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Sin datos';
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 5) return 'Ahora';
    if (diffSeconds < 60) return `Hace ${diffSeconds}s`;
    if (diffSeconds < 3600) return `Hace ${Math.floor(diffSeconds / 60)}min`;
    
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`rounded-lg p-3 ${config.bgColor} border ${config.borderColor} shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        {/* Indicador principal */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className={`text-lg ${config.animate ? 'animate-pulse' : ''}`}>
              {config.icon}
            </span>
            {config.animate && isChoferOnline && !isChoferSignalWeak && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
          
          <div>
            <p className={`font-semibold text-sm ${config.textColor}`}>
              {config.label}
            </p>
            <p className="text-xs text-gray-500">
              {config.description}
            </p>
          </div>
        </div>
        
        {/* Última actualización y botón reconectar */}
        <div className="text-right">
          {isChoferOnline && lastUpdate && !isChoferSignalWeak && (
            <p className="text-xs text-gray-500">
              Última: {formatLastUpdate(lastUpdate)}
            </p>
          )}
          
          {/*  Mostrar segundos en señal débil */}
          {isChoferSignalWeak && secondsSinceLastUpdate > 0 && (
            <p className="text-xs text-orange-600 font-medium">
              ⏱️ {secondsSinceLastUpdate}s
            </p>
          )}
          
          {config.showReconnect && onReconnect && (
            <button
              onClick={onReconnect}
              className="mt-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
            >
              Reconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSConnectionStatus;