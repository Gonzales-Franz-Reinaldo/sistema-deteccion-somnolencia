// SERVICIO API PARA MONITOREO DE VIAJES

import apiClient from '../../../lib/api/client';
import type { ViajeMonitoreo, EventoMonitoreo, PosicionGPS } from '../types';

/**
 * API Service para monitoreo de viajes en tiempo real
 */
export const monitoreoApi = {
  /**
   * Obtiene información completa del viaje para monitoreo
   */
  getViajeInfo: async (idViaje: number): Promise<ViajeMonitoreo> => {
    try {
      // Obtener datos del viaje
      const viajeResponse = await apiClient.get(`/viajes/${idViaje}`);
      const viaje = viajeResponse.data;

      // Obtener eventos del viaje
      const eventosResponse = await apiClient.get(`/eventos/viaje/${idViaje}`);
      const eventos: EventoMonitoreo[] = eventosResponse.data || [];

      // Obtener información del chofer
      const choferResponse = await apiClient.get(`/users/${viaje.id_chofer}`);
      const chofer = choferResponse.data;

      // Calcular contadores
      const contadores = {
        microsuenos: eventos.filter(e => e.tipo_evento === 'microsueno').length,
        cabeceos: eventos.filter(e => e.tipo_evento === 'cabeceo').length,
        bostezos: eventos.filter(e => e.tipo_evento === 'bostezo').length,
        parpadeos_excesivos: eventos.filter(e => e.tipo_evento === 'parpadeo_ojos').length,
        frotamiento_ojos: eventos.filter(e => e.tipo_evento === 'frotamiento_ojos').length,
        total_alertas: eventos.length,
      };

      // Obtener última posición (del último evento con GPS)
      const eventoConGPS = eventos
        .filter(e => e.latitud && e.longitud)
        .sort((a, b) => new Date(b.timestamp_evento).getTime() - new Date(a.timestamp_evento).getTime())[0];

      const ultima_posicion: PosicionGPS | null = eventoConGPS ? {
        lat: eventoConGPS.latitud!,
        lng: eventoConGPS.longitud!,
        velocidad: eventoConGPS.velocidad_kmh,
        heading: null,
        timestamp: eventoConGPS.timestamp_evento,
      } : null;

      return {
        id_viaje: viaje.id_viaje,
        id_chofer: viaje.id_chofer,
        origen: viaje.origen,
        destino: viaje.destino,
        estado: viaje.estado,
        duracion_estimada: viaje.duracion_estimada,
        distancia_km: viaje.distancia_km,
        fecha_inicio: viaje.fecha_inicio,
        fecha_viaje_programada: viaje.fecha_viaje_programada,
        hora_viaje_programada: viaje.hora_viaje_programada,
        chofer: {
          id_usuario: chofer.id_usuario,
          nombre_completo: chofer.nombre_completo,
          dni_ci: chofer.dni_ci,
          email: chofer.email,
          telefono: chofer.telefono,
          ciudad: chofer.ciudad,
          numero_licencia: chofer.numero_licencia,
          categoria_licencia: chofer.categoria_licencia,
          tipo_chofer: chofer.tipo_chofer || 'individual',
          empresa: chofer.nombre_empresa,
        },
        contadores,
        eventos_recientes: eventos.slice(0, 10), // Últimos 10 eventos
        ultima_posicion,
      };
    } catch (error) {
      console.error('Error obteniendo info del viaje:', error);
      throw error;
    }
  },

  /**
   * Obtiene eventos de un viaje
   */
  getEventosViaje: async (idViaje: number): Promise<EventoMonitoreo[]> => {
    try {
      const response = await apiClient.get(`/eventos/viaje/${idViaje}`);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      return [];
    }
  },

  /**
   * Obtiene eventos recientes del chofer
   */
  getEventosRecientes: async (minutos: number = 60): Promise<EventoMonitoreo[]> => {
    try {
      const response = await apiClient.get(`/eventos/recientes?minutos=${minutos}`);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo eventos recientes:', error);
      return [];
    }
  },
};

export default monitoreoApi;