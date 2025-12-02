/**
 * App.jsx - Componente principal de la aplicación
 * GPS Bolivia - Sistema de Asignación y Monitoreo de Viajes
 */
import React, { useState, useEffect, useRef } from 'react';
import TripForm from './components/TripForm';
import MapComponent from './components/MapComponent';
import LiveMonitoring from './components/LiveMonitoring';
import { getTrips, getLiveData, startSimulation, stopSimulation } from './services/api';

function App() {
  // Estados para el mapa
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [locations, setLocations] = useState([]);

  // Estados para el monitoreo en vivo
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState('form'); // 'form' o 'monitor'
  
  // Ref para el intervalo de actualización
  const pollingInterval = useRef(null);

  // Cargar viajes al iniciar
  useEffect(() => {
    loadTrips();
  }, []);

  // Polling para datos en vivo cuando hay simulación activa
  useEffect(() => {
    if (isSimulating && selectedTripId) {
      // Iniciar polling cada 2 segundos
      pollingInterval.current = setInterval(async () => {
        try {
          const data = await getLiveData(selectedTripId);
          setLiveData(data);
          
          // Si el viaje terminó, detener el polling
          if (data.status === 'completado') {
            setIsSimulating(false);
            clearInterval(pollingInterval.current);
          }
        } catch (error) {
          console.error('Error al obtener datos en vivo:', error);
        }
      }, 2000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isSimulating, selectedTripId]);

  const loadTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
    }
  };

  // Manejadores para actualizar el mapa
  const handleOriginChange = (location) => {
    setOrigin(location);
    if (!location) setRouteData(null);
  };

  const handleDestinationChange = (location) => {
    setDestination(location);
    if (!location) setRouteData(null);
  };

  const handleRouteCalculated = (route) => {
    setRouteData(route);
  };

  const handleTripCreated = () => {
    loadTrips();
  };

  // Seleccionar un viaje para monitorear
  const handleSelectTrip = async (tripId) => {
    setSelectedTripId(tripId);
    try {
      const data = await getLiveData(tripId);
      setLiveData(data);
      
      // Actualizar origen y destino en el mapa
      if (data.origin) setOrigin(data.origin);
      if (data.destination) setDestination(data.destination);
    } catch (error) {
      console.error('Error al cargar datos del viaje:', error);
    }
  };

  // Iniciar simulación
  const handleStartSimulation = async () => {
    if (!selectedTripId) return;
    
    try {
      await startSimulation(selectedTripId);
      setIsSimulating(true);
      setViewMode('monitor');
    } catch (error) {
      console.error('Error al iniciar simulación:', error);
      alert('Error al iniciar la simulación: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Detener simulación
  const handleStopSimulation = async () => {
    if (!selectedTripId) return;
    
    try {
      await stopSimulation(selectedTripId);
      setIsSimulating(false);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      loadTrips(); // Recargar viajes para actualizar estados
    } catch (error) {
      console.error('Error al detener simulación:', error);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🗺️ GPS Bolivia - Sistema de Viajes</h1>
            <p>Asignación y monitoreo de rutas entre departamentos</p>
          </div>
          <div className="header-actions">
            <button 
              className={`view-toggle ${viewMode === 'form' ? 'active' : ''}`}
              onClick={() => setViewMode('form')}
            >
              📝 Crear Viaje
            </button>
            <button 
              className={`view-toggle ${viewMode === 'monitor' ? 'active' : ''}`}
              onClick={() => setViewMode('monitor')}
            >
              📡 Monitoreo
            </button>
          </div>
        </div>
      </header>

      {/* Barra de información del viaje */}
      {origin && destination && (
        <div className="route-header">
          <div className="route-point">
            <span className="point-indicator origin"></span>
            <span className="point-label">Origen</span>
            <span className="point-name">{origin.name}, Bolivia</span>
          </div>
          <span className="route-arrow">→</span>
          <div className="route-point">
            <span className="point-indicator destination"></span>
            <span className="point-label">Destino</span>
            <span className="point-name">{destination.name}, Bolivia</span>
          </div>
          {isSimulating && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              EN VIVO
            </div>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <main className="main-content">
        {/* Panel lateral */}
        <aside className="form-panel">
          {viewMode === 'form' ? (
            <TripForm
              onOriginChange={handleOriginChange}
              onDestinationChange={handleDestinationChange}
              onRouteCalculated={handleRouteCalculated}
              onTripCreated={handleTripCreated}
              locations={locations}
              setLocations={setLocations}
            />
          ) : (
            <div className="monitor-panel">
              {/* Selector de viaje */}
              <div className="card">
                <div className="card-header">
                  <span className="card-header-icon">🚗</span>
                  <h2>Seleccionar Viaje</h2>
                </div>
                <div className="card-body">
                  <select 
                    className="trip-selector"
                    value={selectedTripId || ''}
                    onChange={(e) => handleSelectTrip(parseInt(e.target.value))}
                  >
                    <option value="">-- Seleccionar viaje --</option>
                    {trips.filter(t => t.status === 'pendiente' || t.status === 'en_curso').map(trip => (
                      <option key={trip.id} value={trip.id}>
                        Viaje #{trip.id} - {trip.origin_location?.name} → {trip.destination_location?.name} ({trip.status})
                      </option>
                    ))}
                  </select>

                  <div className="simulation-controls">
                    {!isSimulating ? (
                      <button 
                        className="btn-start"
                        onClick={handleStartSimulation}
                        disabled={!selectedTripId}
                      >
                        ▶️ Iniciar Simulación
                      </button>
                    ) : (
                      <button 
                        className="btn-stop"
                        onClick={handleStopSimulation}
                      >
                        ⏹️ Detener Simulación
                      </button>
                    )}
                  </div>

                  {isSimulating && liveData && (
                    <div className="speed-indicator">
                      <div className="speed-value">
                        {liveData.current_speed?.toFixed(0) || 0}
                      </div>
                      <div className="speed-unit">km/h</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de monitoreo en vivo */}
              <LiveMonitoring 
                liveData={liveData} 
                isSimulating={isSimulating}
              />
            </div>
          )}
        </aside>

        {/* Panel del mapa */}
        <section className="map-panel">
          <MapComponent
            origin={origin}
            destination={destination}
            routeData={routeData}
            liveData={liveData}
            isSimulating={isSimulating}
          />
        </section>
      </main>

      <style>{`
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .view-toggle {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle:hover {
          background: rgba(255,255,255,0.2);
        }

        .view-toggle.active {
          background: white;
          color: #667eea;
        }

        .route-header {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          z-index: 1000;
        }

        .route-point {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .point-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .point-indicator.origin {
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }

        .point-indicator.destination {
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }

        .point-label {
          font-weight: 500;
        }

        .point-name {
          color: #94a3b8;
        }

        .route-arrow {
          color: #64748b;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ef4444;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          animation: pulse 1.5s infinite;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .monitor-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: calc(100vh - 120px);
          overflow-y: auto;
          padding-bottom: 1rem;
        }

        .monitor-panel .card {
          flex-shrink: 0;
        }

        .trip-selector {
          width: 100%;
          padding: 0.6rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .simulation-controls {
          display: flex;
          gap: 0.5rem;
        }

        .btn-start, .btn-stop {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-start {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
        }

        .btn-start:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
        }

        .btn-start:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-stop {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-stop:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }

        .speed-indicator {
          margin-top: 0.75rem;
          text-align: center;
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          color: white;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.35rem;
        }

        .speed-value {
          font-size: 2rem;
          font-weight: bold;
          line-height: 1;
        }

        .speed-unit {
          font-size: 0.85rem;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

export default App;
