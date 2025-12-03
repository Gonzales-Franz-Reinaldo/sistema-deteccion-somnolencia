/**
 * Provider global para el sistema de notificaciones de somnolencia.
 * Maneja la conexión WebSocket y la cola de notificaciones.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNotificacionesSomnolencia, type Notificacion, type ConnectionStatus } from '../hooks/useNotificacionesSomnolencia';
import { NotificacionesContainer } from '../components/notificaciones/NotificacionesContainer';
import { useAuth } from '../features/auth/hooks/useAuth';

// ============================================
// IMPORTAR ARCHIVO DE SONIDO (con fallback)
// ============================================
let alertaSonido: string | null = null;
try {
  // Intentar importar el sonido
  alertaSonido = new URL('../assets/sounds/notificacion_alerta.mp3', import.meta.url).href;
} catch (e) {
  console.warn('⚠️ Archivo de sonido no encontrado, las notificaciones no tendrán sonido');
}

// ============================================
// SONIDO DE ALERTA - USANDO ARCHIVO MP3
// ============================================

let audioInstance: HTMLAudioElement | null = null;

const getAudioInstance = (): HTMLAudioElement | null => {
  if (!alertaSonido) return null;
  
  if (!audioInstance) {
    audioInstance = new Audio(alertaSonido);
    audioInstance.preload = 'auto';
  }
  return audioInstance;
};

/**
 * Reproduce el sonido de alerta desde el archivo MP3.
 */
const playAlertSound = (durationMs: number = 5000) => {
  try {
    const audio = getAudioInstance();
    if (!audio) {
      console.log('🔇 Sin sonido de alerta (archivo no disponible)');
      return;
    }
    
    // Reiniciar si ya estaba reproduciéndose
    audio.pause();
    audio.currentTime = 0;
    
    // Configurar volumen
    audio.volume = 0.7;
    
    // Reproducir
    audio.play().catch(err => {
      console.warn('No se pudo reproducir sonido de alerta:', err);
    });
    
    // Detener después de la duración especificada
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, durationMs);
    
  } catch (error) {
    console.warn('Error reproduciendo sonido de alerta:', error);
  }
};

/**
 * Detiene el sonido de alerta si está reproduciéndose.
 */
const stopAlertSound = () => {
  try {
    const audio = getAudioInstance();
    audio.pause();
    audio.currentTime = 0;
  } catch (error) {
    // Ignorar errores al detener
  }
};

// ============================================
// CONTEXTO
// ============================================

interface NotificacionesContextValue {
  /** Estado de conexión WebSocket */
  connectionStatus: ConnectionStatus;
  /** Si está conectado */
  isConnected: boolean;
  /** Número de notificaciones activas */
  notificacionesCount: number;
  /** Reconectar WebSocket */
  reconnect: () => void;
  /** Desconectar WebSocket */
  disconnect: () => void;
  /** Activar/desactivar sonido */
  setSonidoEnabled: (enabled: boolean) => void;
  /** Si el sonido está activado */
  sonidoEnabled: boolean;
}

const NotificacionesContext = createContext<NotificacionesContextValue | null>(null);

// ============================================
// HOOK PARA USAR EL CONTEXTO
// ============================================

export const useNotificaciones = (): NotificacionesContextValue => {
  const context = useContext(NotificacionesContext);
  
  if (!context) {
    // Valores por defecto cuando no hay provider
    return {
      connectionStatus: 'DISCONNECTED',
      isConnected: false,
      notificacionesCount: 0,
      reconnect: () => {},
      disconnect: () => {},
      setSonidoEnabled: () => {},
      sonidoEnabled: false,
    };
  }
  
  return context;
};

// ============================================
// PROVIDER
// ============================================

interface NotificacionesProviderProps {
  children: React.ReactNode;
  /** Habilitar el sistema de notificaciones (default: true) */
  enabled?: boolean;
  /** Máximo de notificaciones visibles simultáneamente */
  maxNotificaciones?: number;
  /** Duración del sonido de alerta en milisegundos */
  duracionSonidoMs?: number;
}

export const NotificacionesProvider: React.FC<NotificacionesProviderProps> = ({
  children,
  enabled = true,
  maxNotificaciones = 5,
  duracionSonidoMs = 5000,
}) => {
  // Obtener estado de autenticación
  const { isAuthenticated, user } = useAuth();
  
  // Solo habilitar para admins autenticados
  const shouldEnable = enabled && isAuthenticated && user?.rol === 'admin';

  // ← AGREGAR LOG PARA DEPURACIÓN
  console.log('🔔 NotificacionesProvider:', {
    enabled,
    isAuthenticated,
    userRol: user?.rol,
    shouldEnable,
  });

  // Estado de notificaciones activas
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [sonidoEnabled, setSonidoEnabled] = useState(true);
  
  // Ref para evitar duplicados
  const notificacionesIdsRef = useRef<Set<string>>(new Set());
  
  // Callback cuando llega una notificación
  const handleNotificacion = useCallback((notificacion: Notificacion) => {
    // Evitar duplicados
    if (notificacionesIdsRef.current.has(notificacion.id_notificacion)) {
      return;
    }
    
    notificacionesIdsRef.current.add(notificacion.id_notificacion);
    
    // ← MODIFICADO: Reproducir sonido MP3 por 5 segundos
    if (sonidoEnabled) {
      playAlertSound(duracionSonidoMs);
    }
    
    // Agregar notificación (limitando cantidad)
    setNotificaciones(prev => {
      const newList = [notificacion, ...prev];
      // Limitar cantidad
      if (newList.length > maxNotificaciones) {
        const removed = newList.slice(maxNotificaciones);
        removed.forEach(n => notificacionesIdsRef.current.delete(n.id_notificacion));
        return newList.slice(0, maxNotificaciones);
      }
      return newList;
    });
    
    console.log('🔔 Nueva notificación agregada:', notificacion.titulo);
  }, [sonidoEnabled, maxNotificaciones, duracionSonidoMs]);
  
  // Hook de WebSocket
  const {
    connectionStatus,
    isConnected,
    reconnect,
    disconnect,
  } = useNotificacionesSomnolencia({
    enabled: shouldEnable,
    onNotificacion: handleNotificacion,
    onError: (error) => {
      console.error('Error en WebSocket de notificaciones:', error);
    },
  });
  
  // Cerrar notificación
  const handleCloseNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id_notificacion !== id));
    notificacionesIdsRef.current.delete(id);
    
    // ← NUEVO: Detener sonido cuando se cierra la notificación
    stopAlertSound();
  }, []);
  
  // Limpiar IDs antiguos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIds = new Set(notificaciones.map(n => n.id_notificacion));
      notificacionesIdsRef.current.forEach(id => {
        if (!currentIds.has(id)) {
          notificacionesIdsRef.current.delete(id);
        }
      });
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [notificaciones]);
  
  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      stopAlertSound();
    };
  }, []);
  
  // Valor del contexto
  const contextValue: NotificacionesContextValue = {
    connectionStatus,
    isConnected,
    notificacionesCount: notificaciones.length,
    reconnect,
    disconnect,
    setSonidoEnabled,
    sonidoEnabled,
  };
  
  return (
    <NotificacionesContext.Provider value={contextValue}>
      {children}
      
      {/* Container de notificaciones - siempre visible */}
      <NotificacionesContainer
        notificaciones={notificaciones}
        onClose={handleCloseNotificacion}
      />
    </NotificacionesContext.Provider>
  );
};

export default NotificacionesProvider;