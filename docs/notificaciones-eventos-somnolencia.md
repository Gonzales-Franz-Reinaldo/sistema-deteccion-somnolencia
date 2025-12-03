## Análisis de la Funcionalidad de Notificaciones de Somnolencia en Tiempo Real
implementar un sistema de notificaciones en tiempo real para eventos de somnolencia que funcione así:

┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   App Android       │      │    Backend          │      │   Web Admin         │
│   (Chofer)          │      │   (FastAPI)         │      │   (React)           │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
           │ 1. Detecta evento          │                            │
           │    somnolencia             │                            │
           │                            │                            │
           ├───────────────────────────>│                            │
           │ WebSocket: EVENTO_         │                            │
           │ SOMNOLENCIA                │                            │
           │                            │ 2. Retransmite             │
           │                            ├───────────────────────────>│
           │                            │ WebSocket: NOTIF_          │
           │                            │ SOMNOLENCIA                │
           │                            │                            │
           │                            │                            │ 3. Muestra modal
           │                            │                            │    🔔 + sonido
           │                            │                            │
           │ [Sin conexión]             │                            │
           │ Guarda en Room DB          │                            │
           │                            │                            │
           │ [Recupera conexión]        │                            │
           ├───────────────────────────>│                            │
           │ WebSocket: EVENTOS_BATCH   │ 4. Envía resumen          │
           │                            ├───────────────────────────>│
           │                            │ NOTIF_BATCH                │


FLUJO DE FUNCIONAMIENTO
┌──────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE NOTIFICACIONES                               │
└──────────────────────────────────────────────────────────────────────────────┘

1. CHOFER DETECTA SOMNOLENCIA (Android)
   │
   ├─► MonitoringViewModel.saveEventoSomnolencia()
   │   │
   │   ├─► SendEventoRealtimeUseCase() ─────────┐
   │   │                                         │
   │   └─► SaveEventoSomnolenciaUseCase()       │ WebSocket
   │       (Room DB local)                       │
   │                                             ▼
   │                              ┌──────────────────────────┐
   │                              │     BACKEND (FastAPI)     │
   │                              │                           │
   │                              │  /ws/chofer/{id_viaje}   │
   │                              │         │                 │
   │                              │         ▼                 │
   │                              │  EventoNotificationService│
   │                              │         │                 │
   │                              │         ▼                 │
   │                              │  broadcast_to_admins()   │
   │                              └───────────┬──────────────┘
   │                                          │
   │                                          │ WebSocket
   │                                          ▼
   │                              ┌──────────────────────────┐
   │                              │    FRONTEND (React)       │
   │                              │                           │
   │                              │  /ws/admin (connected)   │
   │                              │         │                 │
   │                              │         ▼                 │
   │                              │  NotificacionesProvider   │
   │                              │         │                 │
   │                              │         ▼                 │
   │                              │  🔔 Modal + Sonido        │
   │                              │  [Ir a Viajes en Curso]  │
   │                              └──────────────────────────┘

2. SIN CONEXIÓN (OFFLINE)
   │
   ├─► Eventos guardados en Room DB
   │   │
   │   └─► EventoWebSocketManager.pendingEvents (cola)
   │
   ▼
3. RECUPERA CONEXIÓN
   │
   ├─► WebSocket reconecta automáticamente
   │   │
   │   └─► sendPendingEvents() → EVENTOS_BATCH
   │                               │
   │                               ▼
   │                        Backend recibe batch
   │                               │
   │                               ▼
   │                    notificar_batch() → NOTIF_BATCH
   │                               │
   │                               ▼
   │                        Admin ve resumen:
   │                    "Juan Pérez tuvo 4 eventos:
   │                     2 microsueños, 1 cabeceo, 1 bostezo"


### Escenarios que identifico:
Escenario	            Comportamiento
Con conexión	        Cada evento detectado → Notificación inmediata al admin (1 por 1)
Sin conexión	        Eventos se guardan en Room DB local (ya implementado)
Recupera conexión	    Se reconecta WebSocket → Envía resumen de eventos pendientes al admin


### Características de la Notificación (Frontend):
1. Modal flotante en la parte superior de la interfaz
2. Visible en cualquier página del admin (no solo en monitoreo)
3. Datos a mostrar:
    - Nombre del chofer
    - Tipo de evento (microsueño, cabeceo, bostezo, etc.)
    - Nivel de severidad (CRITICAL, HIGH, etc.)
    - Timestamp del evento
    - Ubicación/velocidad si está disponible
4. Botón "Ir a Viajes en Curso" → Navega a /admin/monitoreo-viajes
5. Duración: 4-5 segundos, luego desaparece automáticamente
6. Sonido de alerta al llegar


### Diferencia con Batch Offline:
- Online: Notifica evento por evento
- Offline → Online: Notifica un resumen agrupado (ej: "Juan Pérez tuvo 4 eventos: 2 microsueños, 1 cabeceo, 1 bostezo")

### Dudas de Clarificación
Antes de planificar, necesito confirmar algunos puntos:
1. ¿Todos los eventos notifican o solo los críticos?
Opción A: Todos los eventos de somnolencia notifican (microsueño, cabeceo, bostezo, parpadeo, frotamiento)
Todos los eventos pero las que son CRITICA como microsueño y cabeceo en color rojo, lo demas como adevetencias con deferentes colores.

2. ¿Qué WebSocket usará el admin para recibir notificaciones?
Ya tienes /api/v1/ws/admin para notificaciones generales
Y /api/v1/gps/admin/{id_viaje} para GPS de un viaje específico
R.- La que mejor sea según tu.
¿El admin debe conectarse a un WebSocket global (/ws/admin) para recibir notificaciones de TODOS los viajes activos?
R.- Podra recibir de todos los viajes activos.

3. ¿Múltiples notificaciones simultáneas?
Si llegan 3 eventos de diferentes choferes en 2 segundos, ¿se apilan verticalmente o se muestran una tras otra?
R.- Se apilan verticalmente.

4. ¿El admin puede "descartar" la notificación antes de los 5 segundos?
¿Un botón de "X" para cerrar manualmente?
R.- Sí.

5. Para el batch offline, ¿cómo se dispara?
¿Cuando el chofer sincroniza eventos pendientes vía HTTP POST /eventos/batch, el backend también envía la notificación WebSocket?
¿O el chofer envía los eventos pendientes por WebSocket directamente?
R.- En esta parte velo tú cual es la mejor opción y recomendado.

### Archivos a Crear/Modificar
#### Backend (FastAPI)
Archivo	                                    Acción	            Descripción
- app/schemas/notificacion_somnolencia.py	       CREAR	Schemas para notificaciones
- app/services/evento_notification_service.py	       CREAR	Servicio de notificaciones de eventos
- websocket.py	MODIFICAR	Agregar handlers para eventos
- app/api/v1/routers/eventos.py	MODIFICAR	Enviar notificación al     crear evento

#### Android (Kotlin)
Archivo	                                    Acción	            Descripción
- data/remote/websocket/EventoWebSocketManager.kt	       CREAR	Manager WebSocket para eventos
- domain/usecase/evento/SendEventoRealtimeUseCase.kt	       CREAR	UseCase para enviar eventos
- di/WebSocketModule.kt	       CREAR	Módulo DI para WebSocket
- MonitoringViewModel.kt	MODIFICAR	Integrar envío de eventos

### Frontend (React)
Archivo	                                    Acción	            Descripción
- src/providers/NotificacionesProvider.tsx	       CREAR	Provider global de notificaciones
- src/hooks/useNotificacionesSomnolencia.ts	       CREAR	Hook para WebSocket de notificaciones
- src/components/notificaciones/NotificacionSomnolencia.tsx	       CREAR	Componente de notificación individual
- src/components/notificaciones/NotificacionesContainer.tsx	       CREAR	Container de notificaciones
- index.ts	       CREAR	Exports
- src/assets/sounds/alerta-somnolencia.mp3	       CREAR	Sonido de alerta
- AdminLayout.tsx	MODIFICAR	Integrar NotificacionesProvider
- App.tsx	MODIFICAR	Agregar NotificacionesProvider
