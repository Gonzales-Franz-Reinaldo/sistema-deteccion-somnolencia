/**
 * Componente de Formulario - Asignación de Viajes
 * Similar al diseño mostrado en la imagen de referencia
 */
import React, { useState, useEffect } from 'react';
import { getLocations, createTrip, getRouteByIds } from '../services/api';

function TripForm({ onOriginChange, onDestinationChange, onRouteCalculated, onTripCreated, locations, setLocations }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    origin_id: '',
    destination_id: '',
    scheduled_date: '',
    scheduled_time: ''
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  // Cargar ubicaciones al montar el componente
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        setError('Error al cargar los departamentos. Verifica que el backend esté funcionando.');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [setLocations]);

  // Manejar cambios en el formulario
  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar mensajes
    setError('');
    setSuccess('');

    // Actualizar el mapa cuando cambie origen o destino
    if (name === 'origin_id' && value) {
      const origin = locations.find(loc => loc.id === parseInt(value));
      onOriginChange(origin);
      
      // Si hay destino seleccionado, calcular ruta
      if (formData.destination_id) {
        await calculateRoute(parseInt(value), parseInt(formData.destination_id));
      }
    }

    if (name === 'destination_id' && value) {
      const destination = locations.find(loc => loc.id === parseInt(value));
      onDestinationChange(destination);
      
      // Si hay origen seleccionado, calcular ruta
      if (formData.origin_id) {
        await calculateRoute(parseInt(formData.origin_id), parseInt(value));
      }
    }
  };

  // Calcular la ruta entre origen y destino
  const calculateRoute = async (originId, destinationId) => {
    try {
      const route = await getRouteByIds(originId, destinationId);
      setRouteInfo(route);
      onRouteCalculated(route);
    } catch (err) {
      console.error('Error calculando ruta:', err);
      // Fallback: mostrar línea directa
      setRouteInfo({ 
        success: false, 
        message: 'Mostrando línea directa',
        coordinates: [],
        distance_km: 0,
        duration_minutes: 0
      });
      onRouteCalculated(null);
    }
  };

  // Validar el formulario
  const validateForm = () => {
    if (!formData.origin_id) {
      setError('Debes seleccionar un origen');
      return false;
    }
    if (!formData.destination_id) {
      setError('Debes seleccionar un destino');
      return false;
    }
    if (formData.origin_id === formData.destination_id) {
      setError('El origen y destino deben ser diferentes');
      return false;
    }
    if (!formData.scheduled_date) {
      setError('Debes seleccionar una fecha');
      return false;
    }
    if (!formData.scheduled_time) {
      setError('Debes seleccionar una hora');
      return false;
    }
    return true;
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Formatear la fecha para el backend
      const tripData = {
        origin_id: parseInt(formData.origin_id),
        destination_id: parseInt(formData.destination_id),
        scheduled_date: `${formData.scheduled_date}T00:00:00`,
        scheduled_time: formData.scheduled_time
      };

      await createTrip(tripData);
      
      setSuccess('✅ ¡Viaje programado correctamente!');
      
      // Notificar que se creó el viaje
      if (onTripCreated) onTripCreated();
      
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (err) {
      console.error('Error al crear viaje:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al programar el viaje. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-header-icon">🗺️</span>
        <h2>Detalles del Viaje</h2>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Mensajes de alerta */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Campo Origen */}
          <div className="form-group">
            <label htmlFor="origin_id">
              Origen <span className="required">*</span>
            </label>
            <select
              id="origin_id"
              name="origin_id"
              value={formData.origin_id}
              onChange={handleChange}
              disabled={loadingLocations}
            >
              <option value="">Seleccionar origen...</option>
              {locations.map(location => (
                <option 
                  key={location.id} 
                  value={location.id}
                  disabled={location.id === parseInt(formData.destination_id)}
                >
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Destino */}
          <div className="form-group">
            <label htmlFor="destination_id">
              Destino <span className="required">*</span>
            </label>
            <select
              id="destination_id"
              name="destination_id"
              value={formData.destination_id}
              onChange={handleChange}
              disabled={loadingLocations}
            >
              <option value="">Seleccionar destino...</option>
              {locations.map(location => (
                <option 
                  key={location.id} 
                  value={location.id}
                  disabled={location.id === parseInt(formData.origin_id)}
                >
                  {location.name}
                </option>
              ))}
            </select>
            {formData.origin_id && formData.destination_id && 
             formData.origin_id === formData.destination_id && (
              <p className="form-error">El origen y destino deben ser diferentes</p>
            )}
            <p className="form-helper">
              📍 El origen y destino deben ser diferentes
            </p>
          </div>

          {/* Campo Fecha */}
          <div className="form-group">
            <label htmlFor="scheduled_date">
              Fecha Programada del Viaje <span className="required">*</span>
            </label>
            <input
              type="date"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              min={getMinDate()}
            />
            <p className="form-helper">
              📅 Fecha en la que el chofer realizará el viaje
            </p>
          </div>

          {/* Campo Hora */}
          <div className="form-group">
            <label htmlFor="scheduled_time">
              Hora Programada del Viaje <span className="required">*</span>
            </label>
            <input
              type="time"
              id="scheduled_time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
            />
            <p className="form-helper">
              ⏰ Hora en la que el chofer debe iniciar el viaje
            </p>
          </div>

          {/* Información de la ruta */}
          {routeInfo && formData.origin_id && formData.destination_id && (
            <div className="route-info">
              <h4>📊 Información de la Ruta</h4>
              <div className="route-info-grid">
                <div className="route-info-item">
                  <div className="label">Distancia</div>
                  <div className="value">
                    {routeInfo.distance_km > 0 
                      ? `${routeInfo.distance_km} km` 
                      : 'Calculando...'}
                  </div>
                </div>
                <div className="route-info-item">
                  <div className="label">Duración Est.</div>
                  <div className="value">
                    {routeInfo.duration_minutes > 0 
                      ? `${Math.round(routeInfo.duration_minutes / 60)} h ${Math.round(routeInfo.duration_minutes % 60)} min`
                      : 'N/A'}
                  </div>
                </div>
              </div>
              {!routeInfo.success && (
                <p className="form-helper" style={{ marginTop: '0.5rem', color: '#f59e0b' }}>
                  ⚠️ {routeInfo.message}
                </p>
              )}
            </div>
          )}

          {/* Botón de envío */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || loadingLocations}
          >
            {loading ? (
              <>
                <span className="loader"></span>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Programar Viaje</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TripForm;
