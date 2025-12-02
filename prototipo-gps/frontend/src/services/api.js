/**
 * Configuración de API para comunicación con el backend
 */
import axios from 'axios';

// URL base del backend
const API_BASE_URL = 'http://localhost:8000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtener todos los departamentos de Bolivia
 */
export const getLocations = async () => {
  try {
    const response = await api.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw error;
  }
};

/**
 * Obtener una ubicación por ID
 */
export const getLocation = async (id) => {
  try {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    throw error;
  }
};

/**
 * Crear un nuevo viaje
 */
export const createTrip = async (tripData) => {
  try {
    const response = await api.post('/trips', tripData);
    return response.data;
  } catch (error) {
    console.error('Error al crear viaje:', error);
    throw error;
  }
};

/**
 * Obtener todos los viajes
 */
export const getTrips = async () => {
  try {
    const response = await api.get('/trips');
    return response.data;
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    throw error;
  }
};

/**
 * Obtener la ruta entre dos puntos
 */
export const getRoute = async (originLat, originLng, destLat, destLng) => {
  try {
    const response = await api.post('/route', {
      origin_lat: originLat,
      origin_lng: originLng,
      destination_lat: destLat,
      destination_lng: destLng
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    throw error;
  }
};

/**
 * Obtener la ruta entre dos ubicaciones por ID
 */
export const getRouteByIds = async (originId, destinationId) => {
  try {
    const response = await api.get(`/route/${originId}/${destinationId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    throw error;
  }
};

/**
 * Obtener un viaje por ID
 */
export const getTrip = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    throw error;
  }
};

/**
 * Iniciar un viaje
 */
export const startTrip = async (tripId) => {
  try {
    const response = await api.post(`/trips/${tripId}/start`);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar viaje:', error);
    throw error;
  }
};

/**
 * Finalizar un viaje
 */
export const endTrip = async (tripId) => {
  try {
    const response = await api.post(`/trips/${tripId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error al finalizar viaje:', error);
    throw error;
  }
};

/**
 * Obtener datos en vivo del viaje
 */
export const getLiveData = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/live`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos en vivo:', error);
    throw error;
  }
};

/**
 * Obtener eventos de somnolencia de un viaje
 */
export const getTripEvents = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/events`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    throw error;
  }
};

/**
 * Iniciar simulación de viaje
 */
export const startSimulation = async (tripId) => {
  try {
    const response = await api.post(`/trips/${tripId}/simulate/start`);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar simulación:', error);
    throw error;
  }
};

/**
 * Detener simulación de viaje
 */
export const stopSimulation = async (tripId) => {
  try {
    const response = await api.post(`/trips/${tripId}/simulate/stop`);
    return response.data;
  } catch (error) {
    console.error('Error al detener simulación:', error);
    throw error;
  }
};

export default api;
