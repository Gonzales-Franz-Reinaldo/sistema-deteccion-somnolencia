# 🧪 Guía de Pruebas - Sistema Edge → Cloud

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


### 🧪 PRUEBAS ACTUALIZADAS
Prueba 1: CON Internet (Sync Inmediato)
1. Iniciar viaje como chofer
2. Provocar microsueño (cerrar ojos 3+ segundos)
3. Verificar en Logcat:

📝 Guardando evento: microsueno
✅ Evento guardado en Room: ID=1
📤 Enviando evento 1 al servidor...
✅ Evento 1 sincronizado → ID servidor: 42

Verificar en backend: GET /api/v1/eventos/chofer/{id} muestra el evento


### Prueba 2: SIN Internet → Recuperar Conexión
1. Activar modo avión
2. Iniciar viaje y provocar 3 eventos
3. Verificar en Logcat

📝 Guardando evento: microsueno
✅ Evento guardado en Room: ID=1
📵 Sin conexión - Evento 1 queda pendiente

4. Desactivar modo avión
5. INMEDIATAMENTE verificar en Logcat:

🌐 Conexión DISPONIBLE
═══════════════════════════════════════
⚡ CONEXIÓN RECUPERADA - SINCRONIZANDO
═══════════════════════════════════════
📤 Enviando batch: 3 eventos
✅ SYNC EXITOSA: 3 eventos

6. Verificar: Eventos aparecen en backend INMEDIATAMENTE

### Prueba 3: Sin eventos pendientes
1. Tener conexión estable
2. No provocar ningún evento
3. Desconectar y reconectar WiFi
4. Verificar en Logcat:

🌐 Conexión DISPONIBLE
✅ No hay eventos pendientes de sincronización
(No hace nada porque no hay eventos)