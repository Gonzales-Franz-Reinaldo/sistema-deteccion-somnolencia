// ============================================
// INDICADOR DE VELOCIDAD CIRCULAR
// ============================================

import React from 'react';

interface VelocidadIndicatorProps {
  velocidad: number;
  maxVelocidad?: number;
}

export const VelocidadIndicator: React.FC<VelocidadIndicatorProps> = ({ 
  velocidad, 
  maxVelocidad = 120 
}) => {
  const porcentaje = Math.min((velocidad / maxVelocidad) * 100, 100);
  
  // Color basado en velocidad
  const getColor = (): string => {
    if (velocidad > 100) return 'text-red-500';
    if (velocidad > 80) return 'text-orange-500';
    if (velocidad > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Calcular el arco del círculo
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (porcentaje / 100) * circumference;

  return (
    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-full shadow-xl p-2">
      <div className="relative w-24 h-24">
        {/* SVG del círculo */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Fondo del círculo */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Arco de progreso */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ${getColor()}`}
          />
        </svg>

        {/* Velocidad en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor()}`}>{velocidad}</span>
          <span className="text-xs text-gray-500">km/h</span>
        </div>
      </div>
    </div>
  );
};

export default VelocidadIndicator;