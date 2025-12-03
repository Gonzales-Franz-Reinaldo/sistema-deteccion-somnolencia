/**
 * Container que muestra las notificaciones apiladas en la esquina superior derecha.
 */

import React from 'react';
import { NotificacionSomnolenciaComponent } from './NotificacionSomnolencia';
import type { Notificacion } from '../../hooks/useNotificacionesSomnolencia';

interface NotificacionesContainerProps {
  notificaciones: Notificacion[];
  onClose: (id: string) => void;
}

export const NotificacionesContainer: React.FC<NotificacionesContainerProps> = ({
  notificaciones,
  onClose,
}) => {
  if (notificaciones.length === 0) return null;
  
  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-h-screen overflow-hidden"
      aria-live="polite"
      aria-label="Notificaciones de somnolencia"
    >
      {notificaciones.map((notif) => (
        <NotificacionSomnolenciaComponent
          key={notif.id_notificacion}
          notificacion={notif}
          onClose={() => onClose(notif.id_notificacion)}
          duracionMs={5000}
        />
      ))}
    </div>
  );
};

export default NotificacionesContainer;