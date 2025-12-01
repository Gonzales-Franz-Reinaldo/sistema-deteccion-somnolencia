# Estrategias de Sincronización Edge → Cloud

Estrategia C: Híbrida (Local + Envío Inmediato)
La mejor práctica de la industria

┌─────────────────────────────────────────────────────────────────┐
│  EVENTO DE SOMNOLENCIA DETECTADO                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────┐                    │
│  │ 1. SIEMPRE guardar en Room primero      │ ◄── GARANTÍA      │
│  │    - sincronizado = false               │     LOCAL         │
│  └─────────────────┬───────────────────────┘                    │
│                    │                                            │
│                    ▼                                            │
│           ┌─────────────┐                                       │
│           │ ¿Hay        │  (SyncImmediateUseCase)               │
│           │ Internet?   │                                       │
│           └──────┬──────┘                                       │
│                  │                                              │
│        ┌─────────┴─────────┐                                    │
│        │                   │                                    │
│        ▼                   ▼                                    │
│       ✅ SÍ              ❌ NO                                  │
│        │                   │                                    │
│        ▼                   │                                    │
│  ┌───────────────┐         │                                    │
│  │ 2. Enviar     │         │                                    │
│  │    INMEDIATO  │         │ Eventos quedan en Room             │
│  │    POST /api  │         │ con sincronizado=false             │
│  └───────┬───────┘         │                                    │
│          │                 │                                    │
│     ┌────┴────┐            │                                    │
│     ▼         ▼            │                                    │
│   ✅ OK    ❌ FAIL         │                                    │
│     │         │            │                                    │
│     ▼         └────────────┼───────┐                            │
│ ┌──────────────┐           │       │                            │
│ │ sincronizado │           │       │                            │
│ │ = true       │           │       │                            │
│ └──────────────┘           │       │                            │
│                            │       │                            │
│ ════════════════════════════════════════════════════════════    │
│                            │       │                            │
│  CONEXIÓN RECUPERADA       │       │                            │
│  (ConnectivitySyncService) ◄───────┘                            │
│            │                                                    │
│            ▼                                                    │
│  ┌──────────────────────────────────────┐                       │
│  │ ⚡ SINCRONIZACIÓN INMEDIATA          │                       │
│  │    - Detecta Status.Available        │                       │
│  │    - Obtiene eventos pendientes      │                       │
│  │    - POST /api/v1/eventos/batch      │                       │
│  │    - Marca sincronizado = true       │                       │
│  └──────────────────────────────────────┘                       │
│                                                                 │
│ ════════════════════════════════════════════════════════════    │
│                                                                 │
│  BACKUP: WorkManager cada 15 min                                │
│  (Por si ConnectivitySyncService falla)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EVENTO DE SOMNOLENCIA DETECTADO                           │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ 1. SIEMPRE guardar en Room primero      │ ◄── GARANTÍA  │
│  │    - idChofer, idViaje, sessionId       │     LOCAL     │
│  │    - GPS, timestamp, metadatos          │               │
│  │    - sincronizado = false               │               │
│  └─────────────────┬───────────────────────┘                │
│                    │                                        │
│                    ▼                                        │
│           ┌─────────────┐                                   │
│           │ ¿Hay        │  (SyncImmediateUseCase)           │
│           │ Internet?   │                                   │
│           └──────┬──────┘                                   │
│                  │                                          │
│        ┌─────────┴─────────┐                                │
│        │                   │                                │
│        ▼                   ▼                                │
│       ✅ SÍ              ❌ NO                              │
│        │                   │                                │
│        ▼                   │                                │
│  ┌───────────────┐         │                                │
│  │ 2. Enviar     │         │ (Esperar WorkManager)          │
│  │    INMEDIATO  │         │                                │
│  │    POST /api  │         │                                │
│  └───────┬───────┘         │                                │
│          │                 │                                │
│     ┌────┴────┐            │                                │
│     │         │            │                                │
│     ▼         ▼            │                                │
│   ✅ OK    ❌ FAIL         │                                │
│     │         │            │                                │
│     ▼         └────────────┼──────┐                         │
│  ┌───────────┐             │      │                         │
│  │ 3. Marcar │             │      ▼                         │
│  │ sincronizado=true       │  ┌────────────────────────┐    │
│  │ idServidor=X  │         │  │ WorkManager cada 15min │    │
│  └───────────┘             │  │ reintenta sincronizar  │    │
│                            │  │ eventos pendientes     │    │
│                            │  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

🎯 Recomendación: Estrategia C (Híbrida)
### ¿Por qué NO solo Online-First (Estrategia B)?
Problema	Impacto
Red inestable	Túneles, zonas rurales → pérdida de datos
Latencia de red	Si POST falla, ¿qué haces con el evento?
Timeouts	Red lenta = evento perdido
Race conditions	Evento en tránsito cuando se pierde conexión
Sin garantía de entrega	No hay forma de saber si llegó

### ¿Por qué SÍ Estrategia C (Híbrida)?

Ventaja	Beneficio
Garantía 100%	Evento SIEMPRE se guarda primero
Tiempo real	Si hay internet, llega en <1 segundo
Resiliencia	Si falla red, datos no se pierden
Idempotencia	El backend puede detectar duplicados
Auditoría local	Historial completo en el dispositivo

📋 Implementación Recomendada: Estrategia C
Flujo Detallado
1. EVENTO DETECTADO (microsueño, cabeceo, etc.)
   │
   ▼
2. GUARDAR EN ROOM (sincronizado = false)
   │   → Esto toma ~5ms
   │   → Garantiza que NUNCA se pierde
   │
   ▼
3. VERIFICAR CONECTIVIDAD
   │
   ├── ✅ HAY INTERNET
   │   │
   │   ▼
   │   4a. ENVIAR AL BACKEND (async, no bloquea UI)
   │   │
   │   ├── ✅ ÉXITO (201)
   │   │   │
   │   │   ▼
   │   │   5a. Actualizar Room: sincronizado = true
   │   │       idServidor = respuesta.id
   │   │
   │   └── ❌ ERROR (timeout, 500, etc.)
   │       │
   │       ▼
   │       5b. Dejar sincronizado = false
   │           (WorkManager lo reintentará)
   │
   └── ❌ NO HAY INTERNET
       │
       ▼
       4b. No hacer nada más
           (WorkManager sincronizará cuando vuelva)

Tiempos Reales
Acción	Tiempo
Guardar en Room	~5-10ms
POST al backend (buena conexión)	~100-300ms
POST al backend (conexión lenta)	~1-5s
WorkManager retry	5 min (configurable)  -- 5 minutos

📌 IMPLEMENTAR ESTRATEGIA C (HÍBRIDA)

1. Siempre guardar en Room primero (garantía)
2. Si hay internet → enviar inmediato al backend
3. Si envío exitoso → marcar sincronizado = true
4. Si envío falla o no hay internet → WorkManager reintenta

Beneficios para tu sistema:
✅ Admin recibe alertas críticas en tiempo real (cuando hay internet)
✅ Nunca se pierde un evento (Room como respaldo)
✅ Funciona en túneles/zonas sin cobertura (offline)
✅ Sincronización automática cuando vuelve la conexión