/**
 * Componente de Mapa - Visualización de rutas entre departamentos de Bolivia
 * Usa Leaflet con OpenStreetMap (gratuito)
 * Incluye monitoreo en tiempo real con eventos de somnolencia
 */
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir el problema de los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Colores por severidad de evento
const severityColors = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e'
};

// Nombres de eventos para popups
const eventTypeNames = {
  microsueno: 'Microsueño',
  cabeceo: 'Cabeceo',
  bostezo: 'Bostezo',
  parpadeo_ojos: 'Parpadeo Excesivo',
  frotamiento_ojos: 'Frotamiento de Ojos'
};

// Iconos personalizados
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Icono del conductor (posición actual)
const createDriverIcon = () => {
  return L.divIcon({
    className: 'driver-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        position: relative;
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-driver 2s infinite;
        ">
          <span style="font-size: 20px;">🚗</span>
        </div>
        <div style="
          position: absolute;
          top: -5px;
          right: -5px;
          width: 15px;
          height: 15px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          animation: blink 1s infinite;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Icono para eventos de somnolencia
const createEventIcon = (severity) => {
  const color = severityColors[severity] || severityColors.LOW;
  return L.divIcon({
    className: 'event-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-size: 12px; font-weight: bold;">!</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const originIcon = createCustomIcon('#22c55e'); // Verde para origen
const destinationIcon = createCustomIcon('#ef4444'); // Rojo para destino
const driverIcon = createDriverIcon();

// Centro de Bolivia para el mapa inicial
const BOLIVIA_CENTER = [-17.0, -65.0];
const DEFAULT_ZOOM = 6;

/**
 * Componente para ajustar la vista del mapa automáticamente
 */
function MapController({ origin, destination, routeCoordinates, driverPosition }) {
  const map = useMap();

  useEffect(() => {
    if (driverPosition) {
      // Si hay conductor en movimiento, seguirlo suavemente
      map.setView([driverPosition.latitude, driverPosition.longitude], 10, {
        animate: true,
        duration: 0.5
      });
    } else if (routeCoordinates && routeCoordinates.length > 0) {
      // Ajustar el mapa para mostrar toda la ruta
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin && destination) {
      // Si hay origen y destino pero no ruta, ajustar a ambos puntos
      const bounds = L.latLngBounds([
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin) {
      // Si solo hay origen, centrar en él
      map.setView([origin.latitude, origin.longitude], 10);
    } else if (destination) {
      // Si solo hay destino, centrar en él
      map.setView([destination.latitude, destination.longitude], 10);
    }
  }, [map, origin, destination, routeCoordinates, driverPosition]);

  return null;
}

/**
 * Componente principal del mapa
 */
function MapComponent({ origin, destination, routeData, liveData, isSimulating }) {
  const routeCoordinates = routeData?.coordinates || [];
  
  // Posición actual del conductor
  const driverPosition = liveData && liveData.current_latitude && liveData.current_longitude
    ? { latitude: liveData.current_latitude, longitude: liveData.current_longitude }
    : null;
  
  // Eventos recientes
  const events = liveData?.recent_events || [];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MapContainer
      center={BOLIVIA_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
      scrollWheelZoom={true}
    >
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes pulse-driver {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Capa de mapa base - OpenStreetMap (gratuito) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Controlador para ajustar la vista */}
      <MapController 
        origin={origin} 
        destination={destination} 
        routeCoordinates={routeCoordinates}
        driverPosition={isSimulating ? driverPosition : null}
      />

      {/* Marcador de origen */}
      {origin && (
        <Marker 
          position={[origin.latitude, origin.longitude]} 
          icon={originIcon}
        >
          <Popup>
            <div className="popup-content">
              <h3>📍 Origen</h3>
              <p><strong>{origin.name}</strong></p>
              <p>Lat: {origin.latitude.toFixed(4)}</p>
              <p>Lng: {origin.longitude.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marcador de destino */}
      {destination && (
        <Marker 
          position={[destination.latitude, destination.longitude]} 
          icon={destinationIcon}
        >
          <Popup>
            <div className="popup-content">
              <h3>🎯 Destino</h3>
              <p><strong>{destination.name}</strong></p>
              <p>Lat: {destination.latitude.toFixed(4)}</p>
              <p>Lng: {destination.longitude.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Línea de la ruta planificada */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#94a3b8',
            weight: 4,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: '10, 10'
          }}
        />
      )}

      {/* Línea directa como fallback si no hay ruta calculada */}
      {origin && destination && routeCoordinates.length === 0 && (
        <Polyline
          positions={[
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude]
          ]}
          pathOptions={{
            color: '#9ca3af',
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 10'
          }}
        />
      )}

      {/* Ruta recorrida (desde origen hasta posición actual del conductor) */}
      {isSimulating && driverPosition && origin && (
        <Polyline
          positions={[
            [origin.latitude, origin.longitude],
            [driverPosition.latitude, driverPosition.longitude]
          ]}
          pathOptions={{
            color: '#3b82f6',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      )}

      {/* Marcadores de eventos de somnolencia */}
      {events.map((event, index) => (
        <Marker
          key={event.id || index}
          position={[event.latitud, event.longitud]}
          icon={createEventIcon(event.nivel_severidad)}
        >
          <Popup>
            <div style={{ minWidth: '150px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: severityColors[event.nivel_severidad] }}>
                ⚠️ {eventTypeNames[event.tipo_evento] || event.tipo_evento}
              </h4>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                <strong>Severidad:</strong> {event.nivel_severidad}
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                <strong>Velocidad:</strong> {event.velocidad_kmh?.toFixed(0)} km/h
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                <strong>Hora:</strong> {formatTime(event.timestamp_evento)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Círculos de alerta alrededor de eventos críticos */}
      {events
        .filter(e => e.nivel_severidad === 'CRITICAL')
        .map((event, index) => (
          <Circle
            key={`circle-${event.id || index}`}
            center={[event.latitud, event.longitud]}
            radius={500}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        ))}

      {/* Marcador del conductor (posición actual) */}
      {isSimulating && driverPosition && (
        <Marker 
          position={[driverPosition.latitude, driverPosition.longitude]} 
          icon={driverIcon}
        >
          <Popup>
            <div style={{ minWidth: '150px' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>🚗 Conductor en Ruta</h3>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                <strong>Nombre:</strong> {liveData.driver_name}
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>
                <strong>Velocidad:</strong> {liveData.current_speed?.toFixed(0)} km/h
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#22c55e' }}>
                ● En movimiento
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapComponent;
