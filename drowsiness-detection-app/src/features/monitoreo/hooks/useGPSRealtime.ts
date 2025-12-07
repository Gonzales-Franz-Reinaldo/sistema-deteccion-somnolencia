// HOOK PARA GPS EN TIEMPO REAL VIA WEBSOCKET
// Conecta con el backend para recibir ubicación del chofer

import { useEffect, useRef, useState, useCallback } from 'react';
import { storage } from '../../../lib/utils/storage';
import { TOKEN_KEY } from '../../../lib/constants';

// URL base del WebSocket
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

//  Timeout para detectar chofer offline (en ms)
const CHOFER_OFFLINE_TIMEOUT_MS = 6000; // 6 segundos sin posición = offline
const CHOFER_WARNING_TIMEOUT_MS = 5000;  // 5 segundos = advertencia

// Tipos de mensajes
export type GPSMessageType = 
  | 'GPS_POSITION' 
  | 'CHOFER_CONNECTED' 
  | 'CHOFER_DISCONNECTED' 
  | 'PONG'
  | 'ERROR';

// Estado de conexión
export type GPSConnectionStatus = 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'DISCONNECTED' 
  | 'RECONNECTING'
  | 'ERROR';

// Posición GPS recibida
export interface GPSPosition {
  lat: number;
  lng: number;
  velocidad_kmh: number | null;
  heading: number | null;
  precision_m: number | null;
  timestamp: string;
}

// Mensaje GPS del servidor
export interface GPSMessage {
  type: GPSMessageType;
  id_viaje: number;
  id_chofer?: number;
  nombre_chofer?: string;
  lat?: number;
  lng?: number;
  velocidad_kmh?: number;
  heading?: number;
  precision_m?: number;
  timestamp?: string;
  mensaje?: string;
  ultima_posicion?: GPSPosition | null;
}

// Props del hook
interface UseGPSRealtimeProps {
  idViaje: number;
  enabled?: boolean;
  onPositionUpdate?: (position: GPSPosition) => void;
  onChoferConnected?: (data: { id_chofer: number; nombre_chofer: string }) => void;
  onChoferDisconnected?: (data: { ultima_posicion?: GPSPosition | null }) => void;
  onChoferSignalLost?: () => void;  //  Callback cuando se pierde señal
  onError?: (error: string) => void;
}

// Return del hook
interface UseGPSRealtimeReturn {
  // Estado
  connectionStatus: GPSConnectionStatus;
  isChoferOnline: boolean;
  isChoferSignalWeak: boolean;  //  Indica señal débil
  currentPosition: GPSPosition | null;
  lastUpdate: Date | null;
  choferInfo: { id_chofer: number; nombre_chofer: string } | null;
  secondsSinceLastUpdate: number;  //  Segundos desde última actualización
  
  // Acciones
  reconnect: () => void;
  disconnect: () => void;
}

export const useGPSRealtime = ({
  idViaje,
  enabled = true,
  onPositionUpdate,
  onChoferConnected,
  onChoferDisconnected,
  onChoferSignalLost,
  onError,
}: UseGPSRealtimeProps): UseGPSRealtimeReturn => {
  // Estados
  const [connectionStatus, setConnectionStatus] = useState<GPSConnectionStatus>('DISCONNECTED');
  const [isChoferOnline, setIsChoferOnline] = useState(false);
  const [isChoferSignalWeak, setIsChoferSignalWeak] = useState(false);  // ← NUEVO
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [choferInfo, setChoferInfo] = useState<{ id_chofer: number; nombre_chofer: string } | null>(null);
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(0);  // ← NUEVO
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  //  Refs para el timeout de señal del chofer
  const lastPositionTimeRef = useRef<number | null>(null);
  const signalCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasChoferOnlineRef = useRef(false);  // Para evitar callbacks duplicados
  
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
    //  Limpiar interval de verificación de señal
    if (signalCheckIntervalRef.current) {
      clearInterval(signalCheckIntervalRef.current);
      signalCheckIntervalRef.current = null;
    }
  }, []);
  
  //  Función para verificar timeout de señal del chofer
  const checkChoferSignal = useCallback(() => {
    if (!lastPositionTimeRef.current) {
      // Si nunca recibimos posición, no hacer nada especial
      return;
    }
    
    const now = Date.now();
    const timeSinceLastPosition = now - lastPositionTimeRef.current;
    const seconds = Math.floor(timeSinceLastPosition / 1000);
    
    setSecondsSinceLastUpdate(seconds);
    
    // Verificar si hay advertencia (señal débil)
    if (timeSinceLastPosition >= CHOFER_WARNING_TIMEOUT_MS && timeSinceLastPosition < CHOFER_OFFLINE_TIMEOUT_MS) {
      if (!isChoferSignalWeak) {
        console.warn(` Señal GPS débil: ${seconds}s sin actualización`);
        setIsChoferSignalWeak(true);
      }
    } else if (timeSinceLastPosition < CHOFER_WARNING_TIMEOUT_MS) {
      if (isChoferSignalWeak) {
        setIsChoferSignalWeak(false);
      }
    }
    
    // Verificar si el chofer está offline (timeout completo)
    if (timeSinceLastPosition >= CHOFER_OFFLINE_TIMEOUT_MS) {
      if (isChoferOnline && wasChoferOnlineRef.current) {
        console.warn(` Chofer offline detectado por timeout: ${seconds}s sin señal`);
        setIsChoferOnline(false);
        setIsChoferSignalWeak(false);
        wasChoferOnlineRef.current = false;
        
        // Notificar pérdida de señal
        onChoferSignalLost?.();
        onChoferDisconnected?.({
          ultima_posicion: currentPosition,
        });
      }
    }
  }, [isChoferOnline, isChoferSignalWeak, currentPosition, onChoferSignalLost, onChoferDisconnected]);
  
  //  Iniciar verificación periódica de señal
  const startSignalCheck = useCallback(() => {
    // Limpiar intervalo anterior si existe
    if (signalCheckIntervalRef.current) {
      clearInterval(signalCheckIntervalRef.current);
    }
    
    // Verificar cada segundo
    signalCheckIntervalRef.current = setInterval(() => {
      checkChoferSignal();
    }, 1000);
  }, [checkChoferSignal]);
  
  // Procesar mensaje recibido
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: GPSMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'GPS_POSITION':
          if (message.lat !== undefined && message.lng !== undefined) {
            const position: GPSPosition = {
              lat: message.lat,
              lng: message.lng,
              velocidad_kmh: message.velocidad_kmh ?? null,
              heading: message.heading ?? null,
              precision_m: message.precision_m ?? null,
              timestamp: message.timestamp || new Date().toISOString(),
            };
            
            setCurrentPosition(position);
            setLastUpdate(new Date());
            setIsChoferOnline(true);
            setIsChoferSignalWeak(false);  // ← Reset señal débil
            setSecondsSinceLastUpdate(0);  // ← Reset contador
            
            //  Actualizar tiempo de última posición
            lastPositionTimeRef.current = Date.now();
            wasChoferOnlineRef.current = true;
            
            if (message.id_chofer && message.nombre_chofer) {
              setChoferInfo({
                id_chofer: message.id_chofer,
                nombre_chofer: message.nombre_chofer,
              });
            }
            
            onPositionUpdate?.(position);
          }
          break;
          
        case 'CHOFER_CONNECTED':
          setIsChoferOnline(true);
          setIsChoferSignalWeak(false);
          wasChoferOnlineRef.current = true;
          
          if (message.id_chofer && message.nombre_chofer) {
            setChoferInfo({
              id_chofer: message.id_chofer,
              nombre_chofer: message.nombre_chofer,
            });
          }
          if (message.ultima_posicion) {
            setCurrentPosition(message.ultima_posicion);
            setLastUpdate(new Date());
            lastPositionTimeRef.current = Date.now();
          }
          onChoferConnected?.({
            id_chofer: message.id_chofer!,
            nombre_chofer: message.nombre_chofer!,
          });
          console.log(' Chofer conectado GPS:', message.nombre_chofer);
          break;
          
        case 'CHOFER_DISCONNECTED':
          setIsChoferOnline(false);
          setIsChoferSignalWeak(false);
          wasChoferOnlineRef.current = false;
          lastPositionTimeRef.current = null;  // ← Reset
          
          onChoferDisconnected?.({
            ultima_posicion: message.ultima_posicion,
          });
          console.log(' Chofer desconectado GPS (notificado por servidor)');
          break;
          
        case 'PONG':
          // Respuesta al ping, conexión activa
          break;
          
        case 'ERROR':
          console.error('Error GPS WebSocket:', message.mensaje);
          onError?.(message.mensaje || 'Error desconocido');
          break;
          
        default:
          console.log('Mensaje GPS no manejado:', message);
      }
    } catch (error) {
      // Si no es JSON válido, ignorar
      console.debug('Mensaje GPS no-JSON:', event.data);
    }
  }, [onPositionUpdate, onChoferConnected, onChoferDisconnected, onError]);
  
  // Conectar WebSocket
  const connect = useCallback(() => {
    if (!enabled || !idViaje) return;
    
    const token = storage.get<string>(TOKEN_KEY);
    if (!token) {
      console.warn('No hay token para conectar GPS WebSocket');
      setConnectionStatus('ERROR');
      return;
    }
    
    // Limpiar conexión anterior
    if (wsRef.current) {
      wsRef.current.close();
    }
    clearTimers();
    
    setConnectionStatus('CONNECTING');
    
    const wsUrl = `${WS_BASE_URL}/api/v1/gps/admin/${idViaje}?token=${token}`;
    console.log(' Conectando GPS WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(' GPS WebSocket conectado');
        setConnectionStatus('CONNECTED');
        reconnectAttemptsRef.current = 0;
        
        // Enviar ping cada 25 segundos
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
        
        //  Iniciar verificación de señal del chofer
        startSignalCheck();
      };
      
      ws.onmessage = handleMessage;
      
      ws.onerror = (error) => {
        console.error(' Error GPS WebSocket:', error);
        setConnectionStatus('ERROR');
      };
      
      ws.onclose = (event) => {
        console.log(' GPS WebSocket cerrado:', event.code, event.reason);
        clearTimers();
        
        // Solo reconectar si no fue cierre intencional
        if (event.code !== 1000 && enabled) {
          setConnectionStatus('RECONNECTING');
          
          // Reconectar con backoff exponencial
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(` Reconectando GPS en ${delay}ms... (intento ${reconnectAttemptsRef.current + 1})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.error(' Máximo de reconexiones GPS alcanzado');
            setConnectionStatus('ERROR');
          }
        } else {
          setConnectionStatus('DISCONNECTED');
        }
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Error creando GPS WebSocket:', error);
      setConnectionStatus('ERROR');
    }
  }, [idViaje, enabled, handleMessage, clearTimers, startSignalCheck]);
  
  // Desconectar
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexión manual');
      wsRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
    setIsChoferOnline(false);
    setIsChoferSignalWeak(false);
    lastPositionTimeRef.current = null;
    wasChoferOnlineRef.current = false;
  }, [clearTimers]);
  
  // Reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);
  
  // Conectar al montar o cuando cambie idViaje
  useEffect(() => {
    if (enabled && idViaje) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [idViaje, enabled]); // No incluir connect/disconnect para evitar loops
  
  //  Efecto para reiniciar verificación de señal cuando cambia checkChoferSignal
  useEffect(() => {
    if (connectionStatus === 'CONNECTED' && isChoferOnline) {
      startSignalCheck();
    }
    
    return () => {
      if (signalCheckIntervalRef.current) {
        clearInterval(signalCheckIntervalRef.current);
        signalCheckIntervalRef.current = null;
      }
    };
  }, [connectionStatus, isChoferOnline, startSignalCheck]);
  
  return {
    connectionStatus,
    isChoferOnline,
    isChoferSignalWeak,
    currentPosition,
    lastUpdate,
    choferInfo,
    secondsSinceLastUpdate,
    reconnect,
    disconnect,
  };
};

export default useGPSRealtime;