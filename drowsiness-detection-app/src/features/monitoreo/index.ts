// EXPORTS DEL FEATURE MONITOREO

// Types
export * from './types';

// Services
export { monitoreoApi } from './services/monitoreoApi';

// Hooks
export { useMonitoreoWebSocket } from './hooks/useMonitoreoWebSocket';
export { useGPSRealtime } from './hooks/useGPSRealtime';  

// Components
export { ViajeHeader } from './components/ViajeHeader';
export { ChoferInfoPanel } from './components/ChoferInfoPanel';
export { EventosRealTimeList } from './components/EventosRealTimeList';
export { GPSStatusIndicator } from './components/GPSStatusIndicator';
export { VelocidadIndicator } from './components/VelocidadIndicator';
export { MapaGPS } from './components/MapaGPS';
export { GPSConnectionStatus } from './components/GPSConnectionStatus';  