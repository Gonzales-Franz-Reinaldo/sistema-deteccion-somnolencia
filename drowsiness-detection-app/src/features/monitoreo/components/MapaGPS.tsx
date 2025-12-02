// ============================================
// MAPA GPS CON LEAFLET Y ROUTING MACHINE
// Muestra ruta entre origen/destino y ubicación del chofer
// Similar al ejemplo gps-maps.html
// ============================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import type { PosicionGPS, EventoMonitoreo } from '../types';
import { EVENTO_CONFIG } from '../types';
import GPSStatusIndicator from './GPSStatusIndicator';
import VelocidadIndicator from './VelocidadIndicator';

// Arreglar iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaGPSProps {
  posicionActual: PosicionGPS | null;
  eventos: EventoMonitoreo[];
  origen: string;
  destino: string;
  rutaNombre?: string;
}

interface CoordsResult {
  lat: number;
  lng: number;
}

interface RutaInfo {
  distanciaKm: number;
  tiempoMinutos: number;
  coordOrigen: CoordsResult | null;
  coordDestino: CoordsResult | null;
}

export const MapaGPS: React.FC<MapaGPSProps> = ({
  posicionActual,
  eventos,
  origen,
  destino,
  rutaNombre,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const choferMarkerRef = useRef<L.CircleMarker | null>(null);
  const originMarkerRef = useRef<L.CircleMarker | null>(null);
  const destMarkerRef = useRef<L.CircleMarker | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const eventMarkersRef = useRef<L.CircleMarker[]>([]);
  
  const [rutaInfo, setRutaInfo] = useState<RutaInfo>({
    distanciaKm: 0,
    tiempoMinutos: 0,
    coordOrigen: null,
    coordDestino: null,
  });
  const [cargandoRuta, setCargandoRuta] = useState(true);
  const [errorRuta, setErrorRuta] = useState<string | null>(null);
  const [estadoGPS, setEstadoGPS] = useState({
    conectado: false,
    senal: 0,
    precision: 0,
    ultimaActualizacion: null as string | null,
  });

  // Coordenadas por defecto (Bolivia - Centro)
  const defaultLat = -17.5;
  const defaultLng = -65.0;

  /**
   * Geocodificar una ciudad usando Nominatim (igual que en el HTML)
   */
  const geocodificarCiudad = useCallback(async (query: string): Promise<CoordsResult | null> => {
    // Agregar ", Bolivia" para mejorar precisión
    const searchQuery = query.toLowerCase().includes('bolivia') ? query : `${query}, Bolivia`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SistemaDeteccionSomnolencia/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      
      console.warn(`No se encontraron coordenadas para: ${query}`);
      return null;
    } catch (error) {
      console.error('Error geocodificando:', query, error);
      return null;
    }
  }, []);

  /**
   * Limpiar ruta y marcadores anteriores
   */
  const limpiarMapa = useCallback(() => {
    if (routingControlRef.current && mapRef.current) {
      try {
        mapRef.current.removeControl(routingControlRef.current);
      } catch (e) {
        // Ignorar error si ya fue removido
      }
      routingControlRef.current = null;
    }
    
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, []);

  /**
   * Inicializar mapa
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 6,
      zoomControl: true,
    });

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      limpiarMapa();
      map.remove();
      mapRef.current = null;
    };
  }, [limpiarMapa]);

  /**
   * Calcular y mostrar ruta cuando cambian origen/destino
   */
  useEffect(() => {
    if (!mapRef.current || !origen || !destino) return;

    const calcularRuta = async () => {
      setCargandoRuta(true);
      setErrorRuta(null);

      console.log(`🗺️ Calculando ruta: ${origen} → ${destino}`);

      // Geocodificar origen y destino
      const [coordOrigen, coordDestino] = await Promise.all([
        geocodificarCiudad(origen),
        geocodificarCiudad(destino),
      ]);

      if (!coordOrigen) {
        setErrorRuta(`No se encontró: ${origen}`);
        setCargandoRuta(false);
        return;
      }

      if (!coordDestino) {
        setErrorRuta(`No se encontró: ${destino}`);
        setCargandoRuta(false);
        return;
      }

      console.log(`📍 Origen: ${coordOrigen.lat}, ${coordOrigen.lng}`);
      console.log(`📍 Destino: ${coordDestino.lat}, ${coordDestino.lng}`);

      setRutaInfo(prev => ({
        ...prev,
        coordOrigen,
        coordDestino,
      }));

      // Limpiar ruta anterior
      limpiarMapa();

      // Crear marcador de origen (verde)
      const originMarkerOptions = {
        radius: 10,
        fillColor: '#22C55E',
        fillOpacity: 1,
        color: '#166534',
        weight: 3,
      };

      originMarkerRef.current = L.circleMarker(
        [coordOrigen.lat, coordOrigen.lng], 
        originMarkerOptions
      ).addTo(mapRef.current!);
      
      originMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #166534;">📍 Origen</strong><br/>
          <span style="font-size: 14px; font-weight: bold;">${origen}</span><br/>
          <small style="color: #666;">
            ${coordOrigen.lat.toFixed(5)}, ${coordOrigen.lng.toFixed(5)}
          </small>
        </div>
      `);

      // Crear marcador de destino (rojo)
      const destMarkerOptions = {
        radius: 10,
        fillColor: '#EF4444',
        fillOpacity: 1,
        color: '#B91C1C',
        weight: 3,
      };

      destMarkerRef.current = L.circleMarker(
        [coordDestino.lat, coordDestino.lng], 
        destMarkerOptions
      ).addTo(mapRef.current!);
      
      destMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #B91C1C;">🎯 Destino</strong><br/>
          <span style="font-size: 14px; font-weight: bold;">${destino}</span><br/>
          <small style="color: #666;">
            ${coordDestino.lat.toFixed(5)}, ${coordDestino.lng.toFixed(5)}
          </small>
        </div>
      `);

      // Crear control de routing (igual que en el HTML)
      try {
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(coordOrigen.lat, coordOrigen.lng),
            L.latLng(coordDestino.lat, coordDestino.lng),
          ],
          routeWhileDragging: false,
          draggableWaypoints: false,
          addWaypoints: false,
          createMarker: () => null, // No crear marcadores adicionales
          lineOptions: {
            styles: [{ 
              color: '#3B82F6', 
              opacity: 0.8, 
              weight: 6 
            }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          show: false, // Ocultar panel de instrucciones
          fitSelectedRoutes: true,
        }).addTo(mapRef.current!);

        // Escuchar cuando se encuentra la ruta
        routingControlRef.current.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const summary = routes[0].summary;
            const distanciaKm = summary.totalDistance / 1000;
            const tiempoMinutos = Math.round(summary.totalTime / 60);

            setRutaInfo(prev => ({
              ...prev,
              distanciaKm,
              tiempoMinutos,
            }));

            console.log(`✅ Ruta calculada: ${distanciaKm.toFixed(1)} km, ${tiempoMinutos} min`);
          }
          setCargandoRuta(false);
        });

        routingControlRef.current.on('routingerror', (e: L.Routing.RoutingErrorEvent) => {
          console.error('Error calculando ruta:', e.error);
          
          // Fallback: calcular distancia en línea recta con Haversine
          const distanciaDirecta = calcularDistanciaHaversine(
            coordOrigen.lat, coordOrigen.lng,
            coordDestino.lat, coordDestino.lng
          );
          
          // Estimar tiempo (promedio 50 km/h en carretera boliviana)
          const tiempoEstimado = Math.round((distanciaDirecta / 50) * 60);

          setRutaInfo(prev => ({
            ...prev,
            distanciaKm: distanciaDirecta,
            tiempoMinutos: tiempoEstimado,
          }));

          // Dibujar línea directa como fallback
          L.polyline([
            [coordOrigen.lat, coordOrigen.lng],
            [coordDestino.lat, coordDestino.lng]
          ], {
            color: '#9CA3AF',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10',
          }).addTo(mapRef.current!);

          setErrorRuta('No se pudo calcular ruta exacta. Mostrando línea directa.');
          setCargandoRuta(false);
        });

      } catch (error) {
        console.error('Error creando routing control:', error);
        setCargandoRuta(false);
      }

      // Ajustar vista para mostrar origen y destino
      const bounds = L.latLngBounds([
        [coordOrigen.lat, coordOrigen.lng],
        [coordDestino.lat, coordDestino.lng],
      ]);
      mapRef.current!.fitBounds(bounds, { padding: [80, 80] });
    };

    calcularRuta();
  }, [origen, destino, geocodificarCiudad, limpiarMapa]);

  /**
   * Actualizar posición del chofer
   */
  useEffect(() => {
    if (!mapRef.current || !posicionActual) return;

    const { lat, lng, velocidad, precision } = posicionActual;

    // Actualizar o crear marcador del chofer
    if (choferMarkerRef.current) {
      choferMarkerRef.current.setLatLng([lat, lng]);
    } else {
      // Crear marcador con estilo azul pulsante
      choferMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        color: '#1E40AF',
        weight: 4,
      }).addTo(mapRef.current);

      choferMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #1E40AF;">🚗 Chofer en Ruta</strong><br/>
          <span>Posición actual</span><br/>
          <small style="color: #666;">
            ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </small>
        </div>
      `);
    }

    // Actualizar estado GPS
    setEstadoGPS({
      conectado: true,
      senal: 8,
      precision: precision || 5,
      ultimaActualizacion: posicionActual.timestamp,
    });
  }, [posicionActual]);

  /**
   * Mostrar marcadores de eventos de somnolencia
   */
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    eventMarkersRef.current.forEach(marker => marker.remove());
    eventMarkersRef.current = [];

    // Agregar marcadores de eventos con GPS
    eventos
      .filter(e => e.latitud && e.longitud)
      .forEach(evento => {
        const config = EVENTO_CONFIG[evento.tipo_evento];
        const colorMap: Record<string, string> = {
          CRITICAL: '#EF4444',
          HIGH: '#F97316',
          MEDIUM: '#EAB308',
          NORMAL: '#22C55E',
        };

        const marker = L.circleMarker([evento.latitud!, evento.longitud!], {
          radius: 8,
          fillColor: colorMap[evento.nivel_severidad] || '#6B7280',
          fillOpacity: 0.9,
          color: '#fff',
          weight: 2,
        }).addTo(mapRef.current!);

        marker.bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <span style="font-size: 24px;">${config?.icon || '⚠️'}</span>
            <strong style="display: block;">${config?.label || evento.tipo_evento}</strong>
            <small style="color: #666;">
              ${new Date(evento.timestamp_evento).toLocaleTimeString('es-BO')}
            </small>
          </div>
        `);

        eventMarkersRef.current.push(marker);
      });
  }, [eventos]);

  /**
   * Calcular distancia Haversine (fallback)
   */
  const calcularDistanciaHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Formatear tiempo
   */
  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Contenedor del mapa */}
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: '100%' }} />

      {/* Panel de información GPS (arriba izquierda) */}
      <div className="absolute top-4 left-4 z-[1000]">
        <GPSStatusIndicator estado={estadoGPS} />
      </div>

      {/* Panel de información de ruta (arriba derecha) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[220px] max-w-[280px]">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🗺️</span> Información de Ruta
        </h4>
        
        {cargandoRuta ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">Calculando ruta...</span>
          </div>
        ) : errorRuta ? (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ {errorRuta}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {/* Origen */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></span>
              <div>
                <span className="text-gray-500 text-xs">Origen:</span>
                <p className="font-medium text-gray-800">{origen}</p>
              </div>
            </div>
            
            {/* Destino */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></span>
              <div>
                <span className="text-gray-500 text-xs">Destino:</span>
                <p className="font-medium text-gray-800">{destino}</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Distancia y Tiempo */}
            <div className="bg-indigo-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <span>📏</span> Distancia:
                </span>
                <span className="font-bold text-indigo-600 text-lg">
                  {rutaInfo.distanciaKm.toFixed(1)} km
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <span>⏱️</span> Tiempo est.:
                </span>
                <span className="font-bold text-indigo-600 text-lg">
                  {formatearTiempo(rutaInfo.tiempoMinutos)}
                </span>
              </div>
            </div>

            {/* Coordenadas */}
            {rutaInfo.coordOrigen && rutaInfo.coordDestino && (
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 space-y-1">
                <p>
                  <strong>Origen:</strong> {rutaInfo.coordOrigen.lat.toFixed(5)}, {rutaInfo.coordOrigen.lng.toFixed(5)}
                </p>
                <p>
                  <strong>Destino:</strong> {rutaInfo.coordDestino.lat.toFixed(5)}, {rutaInfo.coordDestino.lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badge de ruta (abajo izquierda) */}
      {rutaNombre && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-red-500">📍</span>
            <span className="font-medium text-gray-800">{rutaNombre}</span>
          </div>
        </div>
      )}

      {/* Indicador de velocidad (abajo derecha) */}
      {posicionActual && posicionActual.velocidad !== null && posicionActual.velocidad !== undefined && (
        <VelocidadIndicator velocidad={posicionActual.velocidad} />
      )}

      {/* Mensaje si no hay posición del chofer pero sí hay ruta */}
      {!posicionActual && !cargandoRuta && rutaInfo.distanciaKm > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 shadow-md">
          <div className="flex items-center gap-2 text-amber-700">
            <span>📡</span>
            <span className="text-sm">Esperando señal GPS del chofer...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaGPS;