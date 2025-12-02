// ============================================
// HOOK PARA WEBSOCKET DE MONITOREO EN TIEMPO REAL
// ============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { storage } from '../../../lib/utils/storage';
import { TOKEN_KEY } from '../../../lib/constants';
import type { EventoMonitoreo, PosicionGPS } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

interface UseMonitoreoWebSocketProps {
  idViaje: number;
  onNuevoEvento?: (evento: EventoMonitoreo) => void;
  onNuevaPosicion?: (posicion: PosicionGPS) => void;
  onConexionCambiada?: (conectado: boolean) => void;
}

interface UseMonitoreoWebSocketReturn {
  conectado: boolean;
  ultimoEvento: EventoMonitoreo | null;
  ultimaPosicion: PosicionGPS | null;
  reconectar: () => void;
}

export const useMonitoreoWebSocket = ({
  idViaje,
  onNuevoEvento,
  onNuevaPosicion,
  onConexionCambiada,
}: UseMonitoreoWebSocketProps): UseMonitoreoWebSocketReturn => {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<EventoMonitoreo | null>(null);
  const [ultimaPosicion, setUltimaPosicion] = useState<PosicionGPS | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const conectar = useCallback(() => {
    const token = storage.get<string>(TOKEN_KEY);
    if (!token) {
      console.warn('No hay token para conectar WebSocket');
      return;
    }

    // Limpiar conexión anterior
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WS_BASE_URL}/api/v1/ws/monitor?token=${token}`;
    console.log('🔌 Conectando WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        setConectado(true);
        onConexionCambiada?.(true);

        // Enviar ping cada 30 segundos para mantener conexión
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.event_type) {
            case 'evento_somnolencia':
            case 'evento_critico':
              // Solo procesar eventos del viaje actual
              if (data.data?.id_viaje === idViaje) {
                const evento: EventoMonitoreo = data.data;
                setUltimoEvento(evento);
                onNuevoEvento?.(evento);

                // Si tiene GPS, actualizar posición
                if (evento.latitud && evento.longitud) {
                  const posicion: PosicionGPS = {
                    lat: evento.latitud,
                    lng: evento.longitud,
                    velocidad: evento.velocidad_kmh,
                    heading: null,
                    timestamp: evento.timestamp_evento,
                  };
                  setUltimaPosicion(posicion);
                  onNuevaPosicion?.(posicion);
                }
              }
              break;

            case 'posicion_actualizada':
              if (data.data?.id_viaje === idViaje) {
                const posicion: PosicionGPS = data.data;
                setUltimaPosicion(posicion);
                onNuevaPosicion?.(posicion);
              }
              break;

            case 'pong':
              // Respuesta al ping, conexión activa
              break;

            default:
              console.log('📨 Mensaje WS:', data);
          }
        } catch (e) {
          // Si no es JSON, ignorar (probablemente "pong")
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setConectado(false);
        onConexionCambiada?.(false);

        // Limpiar interval de ping
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Reconectar después de 5 segundos si no fue cierre intencional
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Intentando reconectar...');
            conectar();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creando WebSocket:', error);
    }
  }, [idViaje, onNuevoEvento, onNuevaPosicion, onConexionCambiada]);

  const reconectar = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    conectar();
  }, [conectar]);

  useEffect(() => {
    conectar();

    return () => {
      // Limpiar al desmontar
      if (wsRef.current) {
        wsRef.current.close(1000, 'Componente desmontado');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [conectar]);

  return {
    conectado,
    ultimoEvento,
    ultimaPosicion,
    reconectar,
  };
};

export default useMonitoreoWebSocket;