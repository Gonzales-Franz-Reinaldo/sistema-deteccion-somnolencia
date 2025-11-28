import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../lib/api/client';

interface Posicion {
  id_posicion: number; lat: number; lng: number; velocidad?: number; heading?: number; timestamp: string;
}
interface Alerta {
  id_alerta: number; tipo_alerta: string; severidad: string; duracion_segundos?: number; timestamp_alerta: string;
}
interface ViajeInfo {
  id_sesion: number;
  estado: string;
  nivel_alerta: string;
  fecha_inicio: string;
  fecha_fin?: string;
  duracion_minutos?: number;
  ruta_nombre?: string;
  ubicacion_inicio?: string;
  ubicacion_fin?: string;
  distancia_km: number;
  contadores: {
    microsuenos: number;
    bostezos: number;
    parpadeos_excesivos: number;
    cabeceos: number;
    frotamiento_ojos: number;
    total_alertas: number;
  };
  chofer: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    dni_ci?: string;
    telefono?: string;
    ciudad?: string;
    numero_licencia?: string;
    categoria_licencia?: string;
    tipo_chofer?: string;
    empresa?: string;
  };
}

export const MonitoreoViajeDetallePage = () => {
  const { id_sesion } = useParams();
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [viajeInfo, setViajeInfo] = useState<ViajeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conectado, setConectado] = useState(false);
  const [latenciaMs, setLatenciaMs] = useState<number | null>(null);
  const [ultimoHeartbeat, setUltimoHeartbeat] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingStartRef = useRef<number | null>(null);

  // Cargar histórico inicial + info viaje
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const resp = await apiClient.get(`/monitoring/viaje/${id_sesion}/posiciones?limit=200`);
        setPosiciones(resp.data.posiciones || []);
        const infoResp = await apiClient.get(`/monitoring/viaje/${id_sesion}/info`);
        setViajeInfo(infoResp.data);
      } catch (e:any) {
        setError(e.response?.data?.detail || e.message);
      }
    };
    cargarInicial();
    // Refresco periódico de info cada 30s
    const interval = setInterval(async () => {
      try {
        const infoResp = await apiClient.get(`/monitoring/viaje/${id_sesion}/info`);
        setViajeInfo(infoResp.data);
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [id_sesion]);

  // WebSocket para stream (usar backend real, no puerto del dev server)
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL as string) || window.location.origin;
    // Asegurar que no haya / al final
    const normalized = apiBase.replace(/\/$/, '');
    const wsBase = normalized.replace(/^http/, 'ws'); // http->ws, https->wss automáticamente
    const ws = new WebSocket(`${wsBase}/api/v1/monitoring/viaje/${id_sesion}/stream`);
    wsRef.current = ws;
    ws.onopen = () => {
      setError(null);
      setConectado(true);
      // ping cada 5s para solicitar actualizaciones y medir latencia
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          pingStartRef.current = performance.now();
          ws.send('ping');
        }
      }, 5000);
      (ws as any)._interval = interval;
    };
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // Latencia estimada
        if (pingStartRef.current !== null) {
          setLatenciaMs(performance.now() - pingStartRef.current);
          pingStartRef.current = null;
        }
        if (data.posiciones && data.posiciones.length) {
          setPosiciones(prev => [...prev, ...data.posiciones]);
        }
        if (data.alertas && data.alertas.length) {
          setAlertas(prev => [...data.alertas, ...prev].slice(0,200));
        }
        if (data.heartbeat) {
          setUltimoHeartbeat(Date.now());
        }
      } catch (e) { /* noop */ }
    };
    ws.onerror = () => {
      setError('Error en WebSocket de viaje (verifique backend y token)');
      setConectado(false);
    };
    ws.onclose = () => {
      const interval = (ws as any)._interval;
      if (interval) clearInterval(interval);
      setConectado(false);
    };
    return () => {
      if (ws) ws.close();
      const interval = (ws as any)?._interval;
      if (interval) clearInterval(interval);
      setConectado(false);
    };
  }, [id_sesion]);

  // Carga dinámica script de Google Maps y render básico
  const mapRef = useRef<HTMLDivElement | null>(null);
  const gmapRef = useRef<any>(null);
  const polyRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Falta VITE_GOOGLE_MAPS_API_KEY en entorno');
      return;
    }
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.onerror = () => setError('Error cargando Google Maps (API Key inválida?)');
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
    function initMap() {
      if (!mapRef.current || gmapRef.current) return;
      const center = posiciones.length ? { lat: posiciones[0].lat, lng: posiciones[0].lng } : { lat: -16.5, lng: -68.15 };
      gmapRef.current = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        mapTypeId: 'roadmap'
      });
      polyRef.current = new (window as any).google.maps.Polyline({ path: [], strokeColor: '#673ab7', strokeWeight: 4 });
      polyRef.current.setMap(gmapRef.current);
      markerRef.current = new (window as any).google.maps.Marker({ position: center, map: gmapRef.current });
    }
  }, [posiciones]);

  // Actualizar polyline y marcador cuando cambian posiciones
  useEffect(() => {
    if (!gmapRef.current || !polyRef.current || !markerRef.current) return;
    if (!posiciones.length) return;
    const latest = posiciones[posiciones.length - 1];
    const path = polyRef.current.getPath();
    // Añadir nuevas coordenadas (evitar duplicadas)
    const already = path.getLength();
    for (let i = already; i < posiciones.length; i++) {
      path.push(new (window as any).google.maps.LatLng(posiciones[i].lat, posiciones[i].lng));
    }
    markerRef.current.setPosition({ lat: latest.lat, lng: latest.lng });
    gmapRef.current.panTo({ lat: latest.lat, lng: latest.lng });
  }, [posiciones]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header con badges */}
      <div className="mb-6">
        <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs opacity-80">Origen</p>
                <p className="font-semibold">{viajeInfo?.ubicacion_inicio?.split(',')[0] || viajeInfo?.ruta_nombre || 'Cochabamba Sur'}</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">EN VIVO</p>
            <p className="text-xs opacity-90">Viaje #{id_sesion}</p>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚩</span>
              <div>
                <p className="text-xs opacity-80">Destino</p>
                <p className="font-semibold">{viajeInfo?.ubicacion_fin?.split(',')[0] || 'Oruro, Bolivia'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-b-lg shadow flex items-center justify-between text-sm">
          <div className="flex gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full ${conectado? 'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
              {conectado? '🟢 Conectado':'⚫ Desconectado'}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              ⚡ {latenciaMs? `${Math.round(latenciaMs)} ms`:'— ms'}
            </span>
            {viajeInfo && (
              <span className={`px-3 py-1 rounded-full ${
                viajeInfo.nivel_alerta==='critico'?'bg-red-100 text-red-700':
                viajeInfo.nivel_alerta==='alerta'?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700'
              }`}>
                {viajeInfo.nivel_alerta==='critico'?'🚨':viajeInfo.nivel_alerta==='alerta'?'⚠️':'✅'} {viajeInfo.nivel_alerta.toUpperCase()}
              </span>
            )}
            {posiciones.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700">
                🚗 {Math.round(posiciones[posiciones.length-1].velocidad ?? 0)} km/h
              </span>
            )}
          </div>
          <button
            onClick={async () => {
              try { await apiClient.post(`/monitoring/viaje/${id_sesion}/posicion-test`); } catch {/* noop */}
            }}
            className="px-4 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium"
          >+ Posición Test</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">⚠️ {error}</div>}

      {/* Layout principal: izquierda info, derecha mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información del Chofer */}
          {viajeInfo && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Ubicación del Chofer
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {viajeInfo.chofer.nombre_completo?.charAt(0) || 'R'}
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">{viajeInfo.chofer.nombre_completo || 'Roberto Silva'}</h3>
                  <p className="text-xs text-gray-500">Chofer Profesional</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 font-semibold mb-1">👤 Información Personal</p>
                    <p><strong>DNI/CI:</strong> {viajeInfo.chofer.dni_ci || 'No registrado'}</p>
                    <p><strong>Teléfono:</strong> {viajeInfo.chofer.telefono || 'No registrado'}</p>
                    <p><strong>Email:</strong> {viajeInfo.chofer.email || 'No registrado'}</p>
                    {viajeInfo.chofer.ciudad && <p><strong>Ciudad:</strong> {viajeInfo.chofer.ciudad}</p>}
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 font-semibold mb-1">🚗 Licencia de Conducir</p>
                    <p><strong>Número:</strong> {viajeInfo.chofer.numero_licencia || 'No registrado'}</p>
                    <p><strong>Categoría:</strong> {viajeInfo.chofer.categoria_licencia || 'No registrado'}</p>
                    <p><strong>Vigencia:</strong> Hasta 2026</p>
                  </div>
                  <div>
                    <p><strong>Estado:</strong> <span className="text-green-600">● {viajeInfo.estado}</span></p>
                    <p><strong>Distancia:</strong> {viajeInfo.distancia_km.toFixed(2)} km</p>
                    <p><strong>Duración:</strong> {viajeInfo.duracion_minutos || 0} min</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eventos en Tiempo Real */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-orange-600 px-4 py-3">
              <h2 className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Eventos en Tiempo Real
              </h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {alertas.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Sin eventos registrados</p>
              ) : (
                <ul className="space-y-2">
                  {alertas.map(a => (
                    <li key={a.id_alerta} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border-l-4 border-orange-400">
                      <div className="text-2xl">
                        {a.tipo_alerta==='microsueño'?'😴':
                         a.tipo_alerta==='bostezo'?'🥱':
                         a.tipo_alerta==='parpadeo_excesivo'?'👁️':
                         a.tipo_alerta==='cabeceo'?'💤':'👋'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{a.tipo_alerta.replace('_',' ')}</p>
                        <p className="text-xs text-gray-500">{new Date(a.timestamp_alerta).toLocaleString()}</p>
                        <p className="text-xs text-gray-600 mt-1">Severidad {a.severidad} • {a.duracion_segundos || 0}s</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Mapa a la derecha */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <div ref={mapRef} className="w-full h-[600px] bg-gray-200" />
              {posiciones.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-xs text-gray-500">Total de posiciones</p>
                  <p className="text-2xl font-bold text-indigo-600">{posiciones.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoreoViajeDetallePage;