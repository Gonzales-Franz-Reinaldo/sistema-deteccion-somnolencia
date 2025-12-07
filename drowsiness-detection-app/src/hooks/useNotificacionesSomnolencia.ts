/**
 * Hook para recibir notificaciones de eventos de somnolencia en tiempo real.
 * Se conecta al WebSocket del admin y recibe alertas de todos los choferes.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { storage } from '../lib/utils/storage';
import { TOKEN_KEY } from '../lib/constants';

// URL base del WebSocket
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// TIPOS

export type NotificacionTipo = 'NOTIF_SOMNOLENCIA' | 'NOTIF_BATCH';

export type NivelSeveridad = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificacionSomnolencia {
  type: 'NOTIF_SOMNOLENCIA';
  id_notificacion: string;
  id_viaje: number;
  id_chofer: number;
  nombre_chofer: string;
  tipo_evento: string;
  nivel_severidad: NivelSeveridad;
  duracion_segundos: number;
  timestamp_evento: string;
  timestamp_notificacion: string;
  latitud?: number;
  longitud?: number;
  velocidad_kmh?: number;
  titulo: string;
  mensaje: string;
  color: string;
  icono: string;
  es_critico: boolean;
}

export interface NotificacionBatch {
  type: 'NOTIF_BATCH';
  id_notificacion: string;
  id_viaje: number;
  id_chofer: number;
  nombre_chofer: string;
  total_eventos: number;
  eventos_criticos: number;
  eventos_por_tipo: Record<string, number>;
  periodo_inicio: string;
  periodo_fin: string;
  timestamp_notificacion: string;
  titulo: string;
  mensaje: string;
  color: string;
  icono: string;
  es_critico: boolean;
}

export type Notificacion = NotificacionSomnolencia | NotificacionBatch;

export type ConnectionStatus = 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'DISCONNECTED' 
  | 'RECONNECTING'
  | 'ERROR';

// HOOK PRINCIPAL

interface UseNotificacionesSomnolenciaProps {
  enabled?: boolean;
  onNotificacion?: (notificacion: Notificacion) => void;
  onError?: (error: string) => void;
}

interface UseNotificacionesSomnolenciaReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

export const useNotificacionesSomnolencia = ({
  enabled = true,
  onNotificacion,
  onError,
}: UseNotificacionesSomnolenciaProps): UseNotificacionesSomnolenciaReturn => {
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  
  // Callbacks estables
  const onNotificacionRef = useRef(onNotificacion);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onNotificacionRef.current = onNotificacion;
    onErrorRef.current = onError;
  }, [onNotificacion, onError]);
  
  // Limpiar timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);
  
  // Procesar mensaje
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      // Ignorar mensajes de sistema
      if (message.type === 'CONNECTION_ESTABLISHED' || message.type === 'PONG') {
        return;
      }
      
      // ← FIX: El backend envía { event_type, data, ... }
      // El "type" real está en message.data.type o message.event_type
      const eventType = message.event_type || message.type;
      const notificationData = message.data || message;
      
      // Procesar notificaciones
      if (eventType === 'NOTIF_SOMNOLENCIA' || eventType === 'NOTIF_BATCH') {
        console.log(' Notificación recibida:', eventType, notificationData);
        onNotificacionRef.current?.(notificationData as Notificacion);
      }
      
    } catch (error) {
      console.debug('Mensaje no-JSON recibido:', event.data);
    }
  }, []);
  
  // Conectar
  const connect = useCallback(() => {
    if (!enabled) {
      console.log(' useNotificacionesSomnolencia: DESHABILITADO (enabled=false)');
      return;
    }
    
    const token = storage.get<string>(TOKEN_KEY);
    if (!token) {
      console.warn(' No hay token para conectar WebSocket de notificaciones');
      setConnectionStatus('ERROR');
      return;
    }
    
    // Limpiar conexión anterior
    if (wsRef.current) {
      wsRef.current.close();
    }
    clearTimers();
    
    setConnectionStatus('CONNECTING');
    
    const wsUrl = `${WS_BASE_URL}/api/v1/ws/admin?token=${token}`;
    console.log(' Conectando WebSocket notificaciones:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(' WebSocket notificaciones conectado');
        setConnectionStatus('CONNECTED');
        reconnectAttemptsRef.current = 0;
        
        // Ping cada 25 segundos
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
            console.log(' Ping enviado (notificaciones)');
          }
        }, 25000);
      };
      
      ws.onmessage = (event) => {
        console.log(' Mensaje WebSocket notificaciones:', event.data);
        handleMessage(event);
      };
      
      ws.onerror = (error) => {
        console.error(' Error WebSocket notificaciones:', error);
        setConnectionStatus('ERROR');
        onErrorRef.current?.('Error de conexión WebSocket');
      };
      
      ws.onclose = (event) => {
        console.log(' WebSocket notificaciones cerrado:', event.code, event.reason);
        clearTimers();
        
        // Reconectar si no fue cierre intencional
        if (event.code !== 1000 && enabled) {
          setConnectionStatus('RECONNECTING');
          
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(` Reconectando notificaciones en ${delay}ms...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.error(' Máximo de reconexiones alcanzado');
            setConnectionStatus('ERROR');
          }
        } else {
          setConnectionStatus('DISCONNECTED');
        }
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Error creando WebSocket:', error);
      setConnectionStatus('ERROR');
    }
  }, [enabled, handleMessage, clearTimers]);
  
  // Desconectar
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexión manual');
      wsRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
  }, [clearTimers]);
  
  // Reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);
  
  // Conectar al montar
  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled]); // No incluir connect/disconnect
  
  return {
    connectionStatus,
    isConnected: connectionStatus === 'CONNECTED',
    reconnect,
    disconnect,
  };
};

export default useNotificacionesSomnolencia;