import { useEffect, useRef, useState, useCallback } from 'react';
import { storage } from '../../../lib/utils/storage';
import { TOKEN_KEY } from '../../../lib/constants';
import type { WebSocketResponse } from '../types';

const WS_URL = import.meta.env.VITE_API_URL.replace('http', 'ws') + '/api/v1/monitoring/ws';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketResponse | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 2000;

    const connect = useCallback(() => {
        try {
            // Obtener token para autenticación
            const token = storage.get<string>(TOKEN_KEY);

            if (!token) {
                setError('No se encontró token de autenticación');
                return;
            }

            // Crear conexión WebSocket con token en query params
            const wsUrl = `${WS_URL}?token=${token}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket conectado');
                reconnectAttemptsRef.current = 0;
                setIsConnected(true);
                setError(null);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data: WebSocketResponse = JSON.parse(event.data);
                    setLastMessage(data);

                    if (data.error) {
                        console.error('Error del servidor:', data.error);
                        setError(data.error);
                    }
                } catch (err) {
                    console.error('Error al parsear mensaje:', err);
                    setError('Error al procesar respuesta del servidor');
                }
            };

            wsRef.current.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('Error de conexión con el servidor');
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket desconectado');
                setIsConnected(false);
                handleReconnect();
            };
        } catch (err) {
            console.error('Error al crear WebSocket:', err);
            setError('Error al establecer conexión');
        }
    }, []);

    const handleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            console.log(
                `Intentando reconectar (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            setTimeout(() => {
                connect();
            }, reconnectDelay);
        } else {
            setError('No se pudo conectar después de varios intentos');
        }
    }, [connect]);

    const sendFrame = useCallback((data: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(data);
        } else {
            console.warn('WebSocket no está conectado');
            setError('Conexión perdida, reconectando...');
        }
    }, []);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const isConnectedActive = useCallback(() => {
        return wsRef.current !== null && wsRef.current.readyState === WebSocket.OPEN;
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        error,
        lastMessage,
        connect,
        sendFrame,
        disconnect,
        isConnectedActive,
    };
};