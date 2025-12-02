🗺️ Planificación: Monitoreo GPS en Tiempo Real
Excelente pregunta. Vamos a analizar las opciones y diseñar la mejor solución para tu caso de uso.

📊 Análisis de Opciones
Opción 1: WebSocket (Recomendada ✅)
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   App Móvil     │◄─────────────────────────►│    Backend      │
│   (Chofer)      │   Conexión persistente     │    FastAPI      │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                               WebSocket│
                                                        ▼
                                               ┌─────────────────┐
                                               │   Frontend      │
                                               │   (Admin)       │
                                               └─────────────────┘

Ventaja	Descripción
✅ Baja latencia	Actualizaciones en <100ms
✅ Bidireccional	El backend puede enviar comandos al chofer
✅ Eficiente	Una sola conexión, no múltiples requests
✅ Detección de desconexión	Sabe inmediatamente si el chofer se desconectó

🎯  WebSocket Híbrido
La mejor solución para tu caso es WebSocket porque:

Chofer → Backend: Envía ubicación cada 2-3 segundos
Backend → Admin: Retransmite ubicación en tiempo real
Detección de desconexión: Ambos lados saben si se pierde conexión
Escalable: Un chofer puede tener múltiples admins observando

🏗️ Arquitectura Propuesta
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA GPS TIEMPO REAL                      │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         APP MÓVIL (CHOFER)          │
                    │                                     │
                    │  ┌─────────────────────────────┐    │
                    │  │ LocationService             │    │
                    │  │ - Obtiene GPS cada 2-3s     │    │
                    │  │ - Solo si viaje activo      │    │
                    │  │ - Solo si hay internet      │    │
                    │  └──────────────┬──────────────┘    │
                    │                 │                   │
                    │                 ▼                   │
                    │  ┌─────────────────────────────┐    │
                    │  │ WebSocketManager            │    │
                    │  │ - Conecta a ws://backend    │    │
                    │  │ - Envía: {lat, lng, speed,  │    │
                    │  │          heading, timestamp}│    │
                    │  │ - Reconexión automática     │    │
                    │  └──────────────┬──────────────┘    │
                    └─────────────────┼───────────────────┘
                                      │
                                      │ WebSocket
                                      │ wss://api/ws/gps/{id_viaje}
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    ConnectionManager                            │     │
│  │                                                                 │     │
│  │   chofer_connections: Dict[id_viaje, WebSocket]                │     │
│  │   admin_connections: Dict[id_viaje, List[WebSocket]]           │     │
│  │                                                                 │     │
│  │   ┌─────────────────┐         ┌─────────────────┐              │     │
│  │   │ Chofer envía    │────────►│ Broadcast a     │              │     │
│  │   │ ubicación       │         │ todos los admins│              │     │
│  │   │                 │         │ suscritos       │              │     │
│  │   └─────────────────┘         └─────────────────┘              │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Endpoints WebSocket:                                                    │
│  - ws://api/v1/gps/chofer/{id_viaje}  ← Chofer envía ubicación          │
│  - ws://api/v1/gps/admin/{id_viaje}   ← Admin recibe ubicación          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ WebSocket
                                      │ wss://api/ws/gps/admin/{id_viaje}
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Admin React)                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ useGPSWebSocket(idViaje)                                        │    │
│  │                                                                  │    │
│  │  - Conecta a ws://api/v1/gps/admin/{id_viaje}                   │    │
│  │  - Recibe: {lat, lng, speed, heading, timestamp, status}        │    │
│  │  - Estados: CONECTADO | DESCONECTADO | RECONECTANDO             │    │
│  │  - Actualiza marcador en mapa cada mensaje recibido             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ MapaGPS                                                          │    │
│  │  - Muestra ruta origen→destino (ya implementado)                │    │
│  │  - Marcador azul pulsante = posición actual del chofer          │    │
│  │  - Se mueve suavemente con cada actualización                   │    │
│  │  - Indicador de conexión: 🟢 En línea | 🔴 Desconectado         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘


📦 Estructura de Mensajes WebSocket
Chofer → Backend
{
  "type": "GPS_UPDATE",
  "data": {
    "id_viaje": 123,
    "id_chofer": 45,
    "lat": -17.3895,
    "lng": -66.1568,
    "velocidad_kmh": 65.5,
    "heading": 180.0,
    "precision_m": 5.0,
    "timestamp": "2025-12-02T10:30:00Z"
  }
}

Backend → Admin (Broadcast)
{
  "type": "GPS_POSITION",
  "data": {
    "lat": -17.3895,
    "lng": -66.1568,
    "velocidad_kmh": 65.5,
    "heading": 180.0,
    "precision_m": 5.0,
    "timestamp": "2025-12-02T10:30:00Z",
    "nombre_chofer": "Juan Pérez"
  }
}

Notificaciones de Estado
{
  "type": "CHOFER_DISCONNECTED",
  "data": {
    "id_viaje": 123,
    "ultimo_timestamp": "2025-12-02T10:30:00Z",
    "mensaje": "El chofer perdió conexión"
  }
}

🔧 Plan de Implementación
Fase 1: Backend WebSocket (FastAPI)
drowsiness-detecction-backend/
├── app/
│   ├── api/v1/routers/
│   │   └── gps_realtime.py          ← NUEVO: Endpoints WebSocket GPS
│   ├── services/
│   │   └── gps_connection_manager.py ← NUEVO: Gestión de conexiones GPS
│   └── schemas/
│       └── gps.py                    ← NUEVO: Schemas de GPS




Fase 2: Frontend React (Admin)
drowsiness-detection-app/
├── src/features/monitoreo/
│   ├── hooks/
│   │   └── useGPSRealtime.ts         ← NUEVO: Hook WebSocket GPS
│   └── components/
│       └── MapaGPS.tsx               ← ACTUALIZAR: Integrar WebSocket




Fase 3: App Móvil Android (Kotlin)
app/src/main/java/.../
├── data/remote/
│   └── GPSWebSocketManager.kt        ← NUEVO: Cliente WebSocket
├── services/
│   └── GPSTrackingService.kt         ← NUEVO: Servicio de ubicación
└── domain/usecases/
    └── StartGPSTrackingUseCase.kt    ← NUEVO: Lógica de tracking


📁 Estructura de Archivos a Crear/Modificar
BACKEND (FastAPI):
├── app/services/
│   └── gps_realtime_manager.py       ← NUEVO: Gestor de conexiones GPS
├── app/schemas/
│   └── gps_realtime.py               ← NUEVO: Schemas GPS
├── app/api/v1/routers/
│   └── gps_realtime.py               ← NUEVO: Router WebSocket GPS
└── app/main.py                        ← MODIFICAR: Registrar router

FRONTEND (React):
├── src/features/monitoreo/
│   ├── hooks/
│   │   └── useGPSRealtime.ts          ← NUEVO: Hook WebSocket GPS
│   ├── components/
│   │   ├── MapaGPS.tsx                ← MODIFICAR: Integrar WebSocket
│   │   └── GPSConnectionStatus.tsx    ← NUEVO: Indicador de conexión
│   └── types.ts                       ← MODIFICAR: Agregar tipos GPS
└── src/pages/admin/
    └── MonitoreoViajeDetallePage.tsx  ← MODIFICAR: Usar WebSocket

APP MÓVIL (Kotlin):
├── data/remote/
│   └── GPSWebSocketService.kt         ← NUEVO: Cliente WebSocket
├── domain/usecase/gps/
│   └── SendGPSLocationUseCase.kt      ← NUEVO: UseCase GPS
├── di/
│   └── GPSModule.kt                   ← NUEVO: Módulo Hilt
└── presentation/monitoring/
    └── MonitoringViewModel.kt         ← MODIFICAR: Integrar GPS
    


¿Cada cuántos segundos enviar ubicación?

- R.- 2 segundos → Más preciso, más batería

¿Guardar historial de posiciones?

- R.- No guardar (solo tiempo real) ← Recomendado para empezar

¿Múltiples admins pueden ver el mismo viaje?

- R-. Sí (broadcast a todos)

¿Prioridad de implementación?

¿O prefieres que diseñe todo junto?
Todo en uno.

Opción A: Implementación completa (Backend + Frontend + Móvil)