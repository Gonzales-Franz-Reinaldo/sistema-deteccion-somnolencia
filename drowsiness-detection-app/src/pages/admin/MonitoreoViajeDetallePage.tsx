// ============================================
// PÁGINA DE MONITOREO DE VIAJE EN DETALLE
// Vista completa con mapa GPS grande, eventos y datos del chofer
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';

// Importar componentes del feature monitoreo
import {
  ViajeHeader,
  ChoferInfoPanel,
  EventosRealTimeList,
  MapaGPS,
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
  const [posicionActual, setPosicionActual] = useState<PosicionGPS | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (eventosError) {
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
      if (ultimaPosicion) {
        setPosicionActual(ultimaPosicion);
      }

    } catch (err: any) {
      console.error('Error cargando datos del viaje:', err);
      setError(err.response?.data?.detail || 'Error cargando información del viaje');
    } finally {
      setLoading(false);
    }
  }, [idViaje]);

  // Cargar datos iniciales
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

        // Actualizar posición del último evento con GPS
        const eventoConGPS = eventosActualizados
          .filter((e: EventoMonitoreo) => e.latitud && e.longitud)
          .sort((a: EventoMonitoreo, b: EventoMonitoreo) => 
            new Date(b.timestamp_evento).getTime() - new Date(a.timestamp_evento).getTime()
          )[0];

        if (eventoConGPS) {
          setPosicionActual({
            lat: eventoConGPS.latitud!,
            lng: eventoConGPS.longitud!,
            velocidad: eventoConGPS.velocidad_kmh,
            heading: null,
            timestamp: eventoConGPS.timestamp_evento,
          });
        }
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

      {/* Header del Viaje */}
      <ViajeHeader
        origen={viaje.origen}
        destino={viaje.destino}
        enVivo={viaje.estado === 'en_curso'}
      />

      {/* Contenido Principal - LAYOUT MEJORADO: Mapa más grande */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Columna Izquierda - Info del Chofer y Eventos (más angosta) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Panel de información del chofer - Compacto */}
          <ChoferInfoPanel chofer={viaje.chofer} />

          {/* Lista de eventos en tiempo real */}
          <EventosRealTimeList eventos={eventos} maxEventos={8} />
        </div>

        {/* Columna Derecha - Mapa GPS (más grande, 3/4 del ancho) */}
        <div className="lg:col-span-3">
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" 
            style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
          >
            <MapaGPS
              posicionActual={posicionActual}
              eventos={eventos}
              origen={viaje.origen}
              destino={viaje.destino}
              rutaNombre={`${viaje.origen} → ${viaje.destino}`}
            />
          </div>
        </div>
      </div>

      {/* Footer con estadísticas del viaje - Compacto */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Contadores */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
              <span className="text-lg">😴</span>
              <span className="font-bold text-red-600">{viaje.contadores.microsuenos}</span>
              <span className="text-xs text-gray-500">Microsueños</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
              <span className="text-lg">🙇</span>
              <span className="font-bold text-orange-600">{viaje.contadores.cabeceos}</span>
              <span className="text-xs text-gray-500">Cabeceos</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
              <span className="text-lg">👁️</span>
              <span className="font-bold text-yellow-600">{viaje.contadores.parpadeos_excesivos}</span>
              <span className="text-xs text-gray-500">Parpadeos</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <span className="text-lg">🥱</span>
              <span className="font-bold text-blue-600">{viaje.contadores.bostezos}</span>
              <span className="text-xs text-gray-500">Bostezos</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <span className="text-lg">📊</span>
              <span className="font-bold text-gray-700">{viaje.contadores.total_alertas}</span>
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>

          {/* Info del viaje */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><strong>Duración:</strong> {viaje.duracion_estimada}</span>
            <span><strong>Fecha:</strong> {viaje.fecha_viaje_programada}</span>
            <span><strong>Hora:</strong> {viaje.hora_viaje_programada?.slice(0, 5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoreoViajeDetallePage;