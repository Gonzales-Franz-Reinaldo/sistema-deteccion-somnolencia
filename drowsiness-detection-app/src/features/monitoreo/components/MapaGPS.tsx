// MAPA GPS CON LEAFLET Y ROUTING MACHINE
// Muestra ruta entre origen/destino y ubicación del chofer en tiempo real

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { GPSStatusIndicator } from './GPSStatusIndicator';
import { VelocidadIndicator } from './VelocidadIndicator';
import { EVENTO_CONFIG } from '../types';
import type { PosicionGPS, EventoMonitoreo, GPSRealtimeStatus } from '../types';

// Arreglar iconos de Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaGPSProps {
  //  posición inicial en lugar de posición que cambia constantemente
  posicionInicial: PosicionGPS | null;
  eventos: EventoMonitoreo[];
  origen: string;
  destino: string;
  rutaNombre?: string;
  isChoferOnline?: boolean;
  connectionStatus?: GPSRealtimeStatus;
  // Callback para registrar el actualizador de posición
  onPosicionCallbackReady?: (callback: (pos: PosicionGPS) => void) => void;
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

// Cache global para geocodificación (evita peticiones repetidas)
const geocodeCache = new Map<string, CoordsResult | null>();

export const MapaGPS: React.FC<MapaGPSProps> = ({
  posicionInicial,
  eventos,
  origen,
  destino,
  rutaNombre,
  isChoferOnline = false,
  connectionStatus = 'DISCONNECTED',
  onPosicionCallbackReady,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const choferMarkerRef = useRef<L.CircleMarker | null>(null);
  const originMarkerRef = useRef<L.CircleMarker | null>(null);
  const destMarkerRef = useRef<L.CircleMarker | null>(null);
  const eventMarkersRef = useRef<L.CircleMarker[]>([]);
  
  // Ref para controlar si la ruta ya fue calculada
  const rutaCalculadaRef = useRef<boolean>(false);
  const origenDestinoRef = useRef<string>('');
  
  // Estado para saber si el mapa está listo
  const [mapReady, setMapReady] = useState(false);
  
  // Estado interno para la posición actual del chofer (para UI del panel)
  const [posicionActual, setPosicionActual] = useState<PosicionGPS | null>(posicionInicial);
  
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

  // Clave única para origen/destino
  const rutaKey = useMemo(() => `${origen}|${destino}`, [origen, destino]);

  /**
   * Función para actualizar la posición del chofer (llamada externamente)
   * Esta función se llama desde el componente padre via callback
   */
  const actualizarPosicionChofer = useCallback((posicion: PosicionGPS) => {
    if (!mapRef.current || !mapReady) return;
    
    if (!posicion || 
        posicion.lat === null || 
        posicion.lat === undefined ||
        posicion.lng === null ||
        posicion.lng === undefined ||
        isNaN(posicion.lat) ||
        isNaN(posicion.lng)) {
      return;
    }

    const { lat, lng } = posicion;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn(' Coordenadas fuera de rango:', lat, lng);
      return;
    }

    console.log(` Actualizando posición del chofer: (${lat}, ${lng})`);

    const markerColor = isChoferOnline ? '#3B82F6' : '#9CA3AF';
    const borderColor = isChoferOnline ? '#1E40AF' : '#6B7280';

    if (choferMarkerRef.current) {
      // Solo actualizar posición del marcador existente
      choferMarkerRef.current.setLatLng([lat, lng]);
      choferMarkerRef.current.setStyle({
        fillColor: markerColor,
        color: borderColor,
      });
    } else {
      // Crear marcador solo si no existe
      choferMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 12,
        fillColor: markerColor,
        fillOpacity: 1,
        color: borderColor,
        weight: 4,
      }).addTo(mapRef.current);

      choferMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #1E40AF;">🚗 Chofer en Ruta</strong><br/>
          <span>Posición actual</span>
        </div>
      `);
    }

    // Actualizar estado interno para mostrar en el panel
    setPosicionActual(posicion);
    
    // Actualizar estado GPS
    setEstadoGPS(prev => ({
      ...prev,
      conectado: isChoferOnline,
      senal: isChoferOnline ? 8 : 0,
      precision: posicion.precision || 0,
      ultimaActualizacion: posicion.timestamp,
    }));
  }, [mapReady, isChoferOnline]);

  /**
   * Geocodificar una ciudad usando Nominatim CON CACHE
   */
  const geocodificarCiudad = useCallback(async (query: string): Promise<CoordsResult | null> => {
    // Verificar cache primero
    if (geocodeCache.has(query)) {
      return geocodeCache.get(query) || null;
    }
    
    const searchQuery = query.toLowerCase().includes('bolivia') ? query : `${query}, Bolivia`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SistemaDeteccionSomnolencia/1.0 (contacto@ejemplo.com)'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(' Rate limit de Nominatim alcanzado');
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        geocodeCache.set(query, result);
        return result;
      }
      
      geocodeCache.set(query, null);
      return null;
    } catch (error) {
      console.error('Error geocodificando:', query, error);
      return null;
    }
  }, []);

  /**
   * Inicializar mapa (solo una vez)
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      // Limpiar todo al desmontar
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch { /* ignorar */ }
        routingControlRef.current = null;
      }
      if (choferMarkerRef.current) {
        choferMarkerRef.current.remove();
        choferMarkerRef.current = null;
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      eventMarkersRef.current.forEach(m => m.remove());
      eventMarkersRef.current = [];
      
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  /**
   * Registrar el callback cuando el mapa esté listo
   */
  useEffect(() => {
    if (mapReady && onPosicionCallbackReady) {
      console.log(' Registrando callback de posición GPS');
      onPosicionCallbackReady(actualizarPosicionChofer);
    }
  }, [mapReady, onPosicionCallbackReady, actualizarPosicionChofer]);

  /**
   * Calcular ruta SOLO cuando cambian origen/destino y el mapa está listo
   */
  useEffect(() => {
    // No hacer nada si el mapa no está listo
    if (!mapReady || !mapRef.current || !origen || !destino) return;
    
    // Verificar si ya calculamos esta ruta
    if (origenDestinoRef.current === rutaKey && rutaCalculadaRef.current) {
      console.log(' Ruta ya calculada, omitiendo:', rutaKey);
      return;
    }

    let isMounted = true;

    const calcularRuta = async () => {
      setCargandoRuta(true);
      setErrorRuta(null);

      console.log(` Calculando ruta: ${origen} → ${destino}`);

      const [coordOrigen, coordDestino] = await Promise.all([
        geocodificarCiudad(origen),
        geocodificarCiudad(destino),
      ]);

      if (!isMounted || !mapRef.current) {
        console.log(' Componente desmontado, cancelando actualización de ruta');
        return;
      }

      if (!coordOrigen || !coordDestino) {
        setErrorRuta(`No se encontró: ${!coordOrigen ? origen : destino}`);
        setCargandoRuta(false);
        return;
      }

      console.log(` Origen: ${coordOrigen.lat}, ${coordOrigen.lng}`);
      console.log(` Destino: ${coordDestino.lat}, ${coordDestino.lng}`);

      setRutaInfo(prev => ({
        ...prev,
        coordOrigen,
        coordDestino,
      }));

      // Limpiar ruta anterior si existe
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch { /* ignorar */ }
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

      // Crear marcador de origen (verde)
      originMarkerRef.current = L.circleMarker(
        [coordOrigen.lat, coordOrigen.lng], 
        {
          radius: 10,
          fillColor: '#22C55E',
          fillOpacity: 1,
          color: '#166534',
          weight: 3,
        }
      ).addTo(mapRef.current);

      originMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #166534;"> Origen</strong><br/>
          <span>${origen}</span>
        </div>
      `);

      // Crear marcador de destino (rojo)
      destMarkerRef.current = L.circleMarker(
        [coordDestino.lat, coordDestino.lng], 
        {
          radius: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          color: '#B91C1C',
          weight: 3,
        }
      ).addTo(mapRef.current);

      destMarkerRef.current.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong style="color: #B91C1C;">🏁 Destino</strong><br/>
          <span>${destino}</span>
        </div>
      `);

      // Crear ruta con Leaflet Routing Machine
      try {
        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(coordOrigen.lat, coordOrigen.lng),
            L.latLng(coordDestino.lat, coordDestino.lng),
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          lineOptions: {
            styles: [{ 
              color: '#3B82F6', 
              opacity: 0.8, 
              weight: 6 
            }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          show: false,
          fitSelectedRoutes: true,
          createMarker: () => null,
        }).addTo(mapRef.current);

        routingControlRef.current.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
          if (!isMounted) return;
          
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

            console.log(` Ruta calculada: ${distanciaKm.toFixed(1)} km, ${tiempoMinutos} min`);
            
            // MARCAR COMO CALCULADA
            rutaCalculadaRef.current = true;
            origenDestinoRef.current = rutaKey;
          }
          
          setCargandoRuta(false);
        });

        routingControlRef.current.on('routingerror', () => {
          if (!isMounted) return;
          setErrorRuta('No se pudo calcular la ruta');
          setCargandoRuta(false);
        });

      } catch (error) {
        console.error('Error creando ruta:', error);
        if (isMounted) {
          setErrorRuta('Error al calcular la ruta');
          setCargandoRuta(false);
        }
      }
    };

    calcularRuta();

    return () => {
      isMounted = false;
    };
  }, [mapReady, rutaKey, geocodificarCiudad, origen, destino]);

  /**
   * Actualizar estado GPS basado en conexión (sin afectar posición)
   */
  useEffect(() => {
    setEstadoGPS(prev => ({
      ...prev,
      conectado: isChoferOnline,
      senal: isChoferOnline ? (posicionActual ? 8 : 4) : 0,
    }));
  }, [isChoferOnline, posicionActual]);

  /**
   * Mostrar posición inicial si existe (solo una vez al cargar)
   */
  useEffect(() => {
    if (mapReady && posicionInicial && !choferMarkerRef.current) {
      actualizarPosicionChofer(posicionInicial);
    }
  }, [mapReady, posicionInicial, actualizarPosicionChofer]);

  /**
   * Mostrar marcadores de eventos
   */
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Limpiar marcadores anteriores
    eventMarkersRef.current.forEach(marker => marker.remove());
    eventMarkersRef.current = [];

    eventos
      .filter(e => e.latitud && e.longitud)
      .forEach(evento => {
        const config = EVENTO_CONFIG[evento.tipo_evento] || { 
          icon: '', 
          color: 'text-gray-600', 
          label: evento.tipo_evento 
        };
        
        const severityColors: Record<string, string> = {
          CRITICAL: '#EF4444',
          HIGH: '#F97316',
          MEDIUM: '#EAB308',
          NORMAL: '#22C55E',
        };
        
        const color = severityColors[evento.nivel_severidad] || '#6B7280';

        const marker = L.circleMarker([evento.latitud!, evento.longitud!], {
          radius: 8,
          fillColor: color,
          fillOpacity: 0.8,
          color: '#FFF',
          weight: 2,
        }).addTo(mapRef.current!);

        marker.bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 120px;">
            <span style="font-size: 24px;">${config.icon}</span>
            <br/>
            <strong>${config.label}</strong>
            <br/>
            <small style="color: ${color};">${evento.nivel_severidad}</small>
            <br/>
            <small style="color: #666;">
              ${new Date(evento.timestamp_evento).toLocaleTimeString()}
            </small>
          </div>
        `);

        eventMarkersRef.current.push(marker);
      });
  }, [eventos, mapReady]);

  /**
   * Formatear tiempo
   */
  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Contenedor del mapa - altura completa */}
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: '100%' }} />

      {/* Indicador de estado GPS (arriba izquierda) */}
      <div className="absolute top-4 left-4 z-[1000]">
        <GPSStatusIndicator estado={estadoGPS} />
      </div>

      {/* Panel de información de ruta (arriba derecha) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[220px] max-w-[300px]">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span></span> Información de Ruta
        </h4>
        
        {cargandoRuta ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">Calculando ruta...</span>
          </div>
        ) : errorRuta ? (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
             {errorRuta}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {/* Origen */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-gray-500">Origen:</p>
                <p className="font-semibold text-gray-800">{origen}</p>
                {rutaInfo.coordOrigen && (
                  <p className="text-xs text-gray-400">
                    {rutaInfo.coordOrigen.lat.toFixed(5)}, {rutaInfo.coordOrigen.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Destino */}
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></span>
              <div>
                <p className="text-xs text-gray-500">Destino:</p>
                <p className="font-semibold text-gray-800">{destino}</p>
                {rutaInfo.coordDestino && (
                  <p className="text-xs text-gray-400">
                    {rutaInfo.coordDestino.lat.toFixed(5)}, {rutaInfo.coordDestino.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Distancia y Tiempo */}
            <div className="bg-indigo-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <span>📏</span> Distancia:
                </span>
                <span className="font-bold text-indigo-600">
                  {rutaInfo.distanciaKm.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <span>⏱️</span> Tiempo est.:
                </span>
                <span className="font-bold text-indigo-600">
                  {formatearTiempo(rutaInfo.tiempoMinutos)}
                </span>
              </div>
            </div>
            
            {/* Posición actual del chofer */}
            {posicionActual && posicionActual.lat && posicionActual.lng && (
              <>
                <hr className="border-gray-200" />
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0 animate-pulse"></span>
                  <div>
                    <p className="text-xs text-gray-500">Chofer en ruta</p>
                    <p className="text-xs text-gray-600">
                       {posicionActual.lat.toFixed(6)}, {posicionActual.lng.toFixed(6)}
                    </p>
                    {posicionActual.velocidad !== null && posicionActual.velocidad !== undefined && (
                      <p className="text-xs text-gray-600">
                        🚗 {posicionActual.velocidad.toFixed(1)} km/h
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nombre de ruta si existe */}
      {rutaNombre && (
        <div className="absolute bottom-20 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
          <span className="text-sm font-medium text-gray-700">🛣️ {rutaNombre}</span>
        </div>
      )}

      {/* Indicador de velocidad (abajo derecha) */}
      {posicionActual && posicionActual.velocidad !== null && posicionActual.velocidad !== undefined && (
        <VelocidadIndicator velocidad={posicionActual.velocidad} />
      )}

      {/* Mensajes de estado */}
      {isChoferOnline && (!posicionActual || !posicionActual.lat) && connectionStatus === 'CONNECTED' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-md">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">Esperando primera posición GPS...</span>
          </div>
        </div>
      )}

      {!isChoferOnline && (!posicionActual || !posicionActual.lat) && !cargandoRuta && rutaInfo.distanciaKm > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 shadow-md">
          <div className="flex items-center gap-2 text-amber-700">
            <span>📡</span>
            <span className="text-sm">Esperando señal GPS del chofer...</span>
          </div>
        </div>
      )}

      {connectionStatus === 'DISCONNECTED' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 shadow-md">
          <div className="flex items-center gap-2 text-gray-600">
            <span>⚫</span>
            <span className="text-sm">Sin conexión GPS</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaGPS;