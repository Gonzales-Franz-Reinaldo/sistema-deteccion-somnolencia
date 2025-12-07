// PÁGINA DE MONITOREO DE VIAJE EN DETALLE
// Vista completa con mapa GPS en tiempo real

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';

// Importar componentes del feature monitoreo
import {
  ViajeHeader,
  ChoferInfoPanel,
  EventosRealTimeList,
  MapaGPS,
  GPSConnectionStatus,
  useGPSRealtime,
} from '../../features/monitoreo';

import type {
  ViajeMonitoreo,
  EventoMonitoreo,
  PosicionGPS,
  ChoferInfo,
} from '../../features/monitoreo/types';

export const MonitoreoViajeDetallePage: React.FC = () => {
  const { idViaje } = useParams<{ idViaje: string }>();
  const navigate = useNavigate();

  // Estados
  const [viaje, setViaje] = useState<ViajeMonitoreo | null>(null);
  const [eventos, setEventos] = useState<EventoMonitoreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Ref para actualizar posición sin causar re-render
  const posicionCallbackRef = useRef<((pos: PosicionGPS) => void) | null>(null);
  
  //  Estado solo para mostrar en el panel de info (no afecta MapaGPS)
  const [posicionDisplay, setPosicionDisplay] = useState<PosicionGPS | null>(null);

  // Hook de GPS en tiempo real - ACTUALIZADO con nuevos callbacks
  const {
    connectionStatus,
    isChoferOnline,
    isChoferSignalWeak,  
    lastUpdate,
    choferInfo,
    secondsSinceLastUpdate,  
    reconnect,
  } = useGPSRealtime({
    idViaje: parseInt(idViaje || '0'),
    enabled: !!idViaje && !!viaje,
    onPositionUpdate: (position) => {
      const posicion: PosicionGPS = {
        lat: position.lat,
        lng: position.lng,
        velocidad: position.velocidad_kmh,
        heading: position.heading,
        timestamp: position.timestamp,
        precision: position.precision_m ?? undefined,
      };
      
      if (posicionCallbackRef.current) {
        posicionCallbackRef.current(posicion);
      }
      
      setPosicionDisplay(posicion);
    },
    onChoferConnected: (data) => {
      console.log('Chofer conectado:', data.nombre_chofer);
    },
    onChoferDisconnected: () => {
      console.log('Chofer desconectado');
    },
    //  Callback cuando se pierde señal por timeout
    onChoferSignalLost: () => {
      console.warn('Señal GPS del chofer perdida (timeout)');
    },
  });

  //  Callback que el MapaGPS registrará
  const handlePosicionCallbackReady = useCallback((callback: (pos: PosicionGPS) => void) => {
    posicionCallbackRef.current = callback;
  }, []);

  // Cargar datos del viaje
  const cargarDatosViaje = useCallback(async () => {
    if (!idViaje) {
      setError('ID de viaje no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Obtener datos del viaje
      const viajeResponse = await apiClient.get(`/viajes/${idViaje}`);
      const viajeData = viajeResponse.data;

      // 2. Obtener datos del chofer
      const choferResponse = await apiClient.get(`/users/${viajeData.id_chofer}`);
      const choferData = choferResponse.data;

      // 3. Obtener eventos del viaje
      let eventosData: EventoMonitoreo[] = [];
      try {
        const eventosResponse = await apiClient.get(`/eventos/viaje/${idViaje}`);
        eventosData = eventosResponse.data || [];
      } catch {
        console.log('No hay eventos para este viaje aún');
      }

      // 4. Calcular contadores
      const contadores = {
        microsuenos: eventosData.filter(e => e.tipo_evento === 'microsueno').length,
        cabeceos: eventosData.filter(e => e.tipo_evento === 'cabeceo').length,
        bostezos: eventosData.filter(e => e.tipo_evento === 'bostezo').length,
        parpadeos_excesivos: eventosData.filter(e => e.tipo_evento === 'parpadeo_ojos').length,
        frotamiento_ojos: eventosData.filter(e => e.tipo_evento === 'frotamiento_ojos').length,
        total_alertas: eventosData.length,
      };

      // 5. Obtener última posición del último evento con GPS
      const eventoConGPS = eventosData
        .filter(e => e.latitud && e.longitud)
        .sort((a, b) => new Date(b.timestamp_evento).getTime() - new Date(a.timestamp_evento).getTime())[0];

      const ultimaPosicion: PosicionGPS | null = eventoConGPS ? {
        lat: eventoConGPS.latitud!,
        lng: eventoConGPS.longitud!,
        velocidad: eventoConGPS.velocidad_kmh,
        heading: null,
        timestamp: eventoConGPS.timestamp_evento,
      } : null;

      // 6. Construir objeto chofer
      const chofer: ChoferInfo = {
        id_usuario: choferData.id_usuario,
        nombre_completo: choferData.nombre_completo,
        dni_ci: choferData.dni_ci,
        email: choferData.email,
        telefono: choferData.telefono,
        ciudad: choferData.ciudad,
        numero_licencia: choferData.numero_licencia,
        categoria_licencia: choferData.categoria_licencia,
        tipo_chofer: choferData.tipo_chofer || 'individual',
        empresa: choferData.nombre_empresa,
      };

      // 7. Construir objeto viaje completo
      const viajeCompleto: ViajeMonitoreo = {
        id_viaje: viajeData.id_viaje,
        id_chofer: viajeData.id_chofer,
        origen: viajeData.origen,
        destino: viajeData.destino,
        estado: viajeData.estado,
        duracion_estimada: viajeData.duracion_estimada,
        distancia_km: viajeData.distancia_km,
        fecha_inicio: viajeData.fecha_inicio,
        fecha_viaje_programada: viajeData.fecha_viaje_programada,
        hora_viaje_programada: viajeData.hora_viaje_programada,
        chofer,
        contadores,
        eventos_recientes: eventosData.slice(0, 20),
        ultima_posicion: ultimaPosicion,
      };

      setViaje(viajeCompleto);
      setEventos(eventosData);
      
      // Setear posición inicial si existe
      if (ultimaPosicion) {
        setPosicionDisplay(ultimaPosicion);
      }

    } catch (err: unknown) {
      console.error('Error cargando datos del viaje:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error cargando información del viaje';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [idViaje]);

  // Cargar datos iniciales (solo una vez)
  useEffect(() => {
    cargarDatosViaje();
  }, [cargarDatosViaje]);

  // Polling para actualizar eventos cada 30 segundos
  useEffect(() => {
    if (!idViaje || !viaje) return;

    const interval = setInterval(async () => {
      try {
        const eventosResponse = await apiClient.get(`/eventos/viaje/${idViaje}`);
        const eventosActualizados = eventosResponse.data || [];
        setEventos(eventosActualizados);
      } catch (err) {
        console.error('Error actualizando eventos:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [idViaje, viaje]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información del viaje...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !viaje) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
          <span className="text-6xl">⚠️</span>
          <h2 className="text-2xl font-bold text-red-700 mt-4">Error al cargar el viaje</h2>
          <p className="text-red-600 mt-2">{error || 'No se encontró el viaje'}</p>
          <button
            onClick={() => navigate('/admin/monitoreo-viajes')}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver a viajes en curso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón Volver */}
      <button
        onClick={() => navigate('/admin/monitoreo-viajes')}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a viajes en curso
      </button>

      {/* Header del Viaje con estado de conexión GPS - ACTUALIZADO */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <ViajeHeader
          origen={viaje.origen}
          destino={viaje.destino}
          enVivo={viaje.estado === 'en_curso'}
        />
        <GPSConnectionStatus
          status={connectionStatus}
          isChoferOnline={isChoferOnline}
          isChoferSignalWeak={isChoferSignalWeak}  // ← NUEVO
          lastUpdate={lastUpdate}
          choferName={choferInfo?.nombre_chofer}
          secondsSinceLastUpdate={secondsSinceLastUpdate}  // ← NUEVO
          onReconnect={reconnect}
        />
      </div>

      {/* Contenido Principal - LAYOUT: Mapa grande */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Columna Izquierda - Info del Chofer y Eventos (1/4) */}
        <div className="lg:col-span-1 space-y-4">
          <ChoferInfoPanel chofer={viaje.chofer} />
          <EventosRealTimeList eventos={eventos} maxEventos={8} />
        </div>

        {/* Columna Derecha - Mapa GPS (3/4) */}
        <div className="lg:col-span-3">
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" 
            style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
          >
            <MapaGPS
              // ← NO pasar posicionActual como prop que cambia
              posicionInicial={viaje.ultima_posicion}
              eventos={eventos}
              origen={viaje.origen}
              destino={viaje.destino}
              rutaNombre={`${viaje.origen} → ${viaje.destino}`}
              isChoferOnline={isChoferOnline}
              connectionStatus={connectionStatus}
              //  Callback para registrar el actualizador de posición
              onPosicionCallbackReady={handlePosicionCallbackReady}
            />
          </div>
        </div>
      </div>

      {/* Footer con estadísticas del viaje */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          Resumen del Viaje
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-600">{viaje.contadores.microsuenos}</p>
            <p className="text-xs text-gray-600">😴 Microsueños</p>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <p className="text-xl font-bold text-orange-600">{viaje.contadores.cabeceos}</p>
            <p className="text-xs text-gray-600">🙇 Cabeceos</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <p className="text-xl font-bold text-yellow-600">{viaje.contadores.parpadeos_excesivos}</p>
            <p className="text-xs text-gray-600">👁️ Parpadeos</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-600">{viaje.contadores.bostezos}</p>
            <p className="text-xs text-gray-600">🥱 Bostezos</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-xl font-bold text-purple-600">{viaje.contadores.frotamiento_ojos}</p>
            <p className="text-xs text-gray-600">🤚 Frotamientos</p>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded-lg">
            <p className="text-xl font-bold text-gray-700">{viaje.contadores.total_alertas}</p>
            <p className="text-xs text-gray-600">📈 Total</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">{viaje.distancia_km?.toFixed(1) || '—'}</p>
            <p className="text-xs text-gray-600">📍 km</p>
          </div>
        </div>

        {/* Info adicional - Mostrar posición actual del display */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-600">
          <span><strong>Duración:</strong> {viaje.duracion_estimada}</span>
          <span><strong>Fecha:</strong> {viaje.fecha_viaje_programada}</span>
          <span><strong>Hora:</strong> {viaje.hora_viaje_programada?.slice(0, 5)}</span>
          {viaje.fecha_inicio && (
            <span><strong>Inicio:</strong> {new Date(viaje.fecha_inicio).toLocaleString('es-BO')}</span>
          )}
          {posicionDisplay && (
            <span className="text-indigo-600">
              <strong>📍 GPS:</strong> {posicionDisplay.lat.toFixed(6)}, {posicionDisplay.lng.toFixed(6)}
              {posicionDisplay.velocidad !== null && ` | ${posicionDisplay.velocidad.toFixed(1)} km/h`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoreoViajeDetallePage;