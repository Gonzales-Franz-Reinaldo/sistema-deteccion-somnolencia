/**
 * Componente de notificación individual de somnolencia.
 * Se muestra como un toast/modal flotante.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notificacion, NotificacionSomnolencia as NotifSomnolencia, NotificacionBatch } from '../../hooks/useNotificacionesSomnolencia';

interface NotificacionSomnolenciaProps {
  notificacion: Notificacion;
  onClose: () => void;
  duracionMs?: number;
}

export const NotificacionSomnolenciaComponent: React.FC<NotificacionSomnolenciaProps> = ({
  notificacion,
  onClose,
  duracionMs = 5000,
}) => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Auto-cerrar después de duracionMs
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duracionMs) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        handleClose();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [duracionMs]);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Esperar animación
  };
  
  const handleIrAViajes = () => {
    handleClose();
    navigate('/admin/monitoreo-viajes');
  };
  
  // Determinar estilos según severidad
  const getStyles = () => {
    const esCritico = notificacion.es_critico;
    const color = notificacion.color;
    
    return {
      container: `
        ${esCritico ? 'border-l-4 border-red-500' : 'border-l-4 border-amber-500'}
        bg-white shadow-xl rounded-lg overflow-hidden
      `,
      header: esCritico ? 'bg-red-50' : 'bg-amber-50',
      iconBg: esCritico ? 'bg-red-100' : 'bg-amber-100',
      progressBar: esCritico ? 'bg-red-500' : 'bg-amber-500',
    };
  };
  
  const styles = getStyles();
  
  // Formatear timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };
  
  // Renderizar contenido según tipo
  const renderContent = () => {
    if (notificacion.type === 'NOTIF_SOMNOLENCIA') {
      const n = notificacion as NotifSomnolencia;
      return (
        <>
          {/* Detalles del evento */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className="text-sm font-medium capitalize">
                {n.tipo_evento.replace('_', ' ')}
              </span>
            </div>
            
            {n.duracion_segundos > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duración:</span>
                <span className="text-sm font-medium">{n.duracion_segundos.toFixed(1)}s</span>
              </div>
            )}
            
            {n.velocidad_kmh && n.velocidad_kmh > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Velocidad:</span>
                <span className="text-sm font-medium">{Math.round(n.velocidad_kmh)} km/h</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hora:</span>
              <span className="text-sm font-medium">{formatTime(n.timestamp_evento)}</span>
            </div>
          </div>
        </>
      );
    } else {
      // NOTIF_BATCH
      const n = notificacion as NotificacionBatch;
      return (
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total eventos:</span>
            <span className="text-sm font-bold">{n.total_eventos}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Eventos críticos:</span>
            <span className={`text-sm font-bold ${n.eventos_criticos > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {n.eventos_criticos}
            </span>
          </div>
          
          {/* Desglose por tipo */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Desglose:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(n.eventos_por_tipo).map(([tipo, count]) => (
                <span 
                  key={tipo}
                  className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize"
                >
                  {tipo.replace('_', ' ')}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div 
      className={`
        w-80 max-w-full transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${styles.container}
      `}
      role="alert"
    >
      {/* Barra de progreso */}
      <div className="h-1 bg-gray-200">
        <div 
          className={`h-full transition-all duration-50 ${styles.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Header */}
      <div className={`px-4 py-3 ${styles.header}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{notificacion.icono}</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm leading-tight">
                {notificacion.titulo}
              </h4>
              <p className="text-sm text-gray-600 mt-0.5">
                {notificacion.nombre_chofer}
              </p>
            </div>
          </div>
          
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar notificación"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Contenido */}
      {renderContent()}
      
      {/* Footer con botón */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={handleIrAViajes}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                     hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ir a Viajes en Curso
        </button>
      </div>
    </div>
  );
};

export default NotificacionSomnolenciaComponent;