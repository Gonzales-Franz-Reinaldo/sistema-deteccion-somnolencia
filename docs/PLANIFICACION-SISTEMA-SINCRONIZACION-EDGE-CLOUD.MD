# 📋 PLANIFICACIÓN DEL SISTEMA DE SINCRONIZACIÓN EDGE → CLOUD

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### ✅ LO QUE YA TIENES FUNCIONANDO

#### App Android (Edge Device)

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Detección Somnolencia | ✅ Completo | Microsueño, cabeceo, parpadeo, bostezo, frotamiento |
| MediaPipe Local | ✅ Funcionando | Face + Hand landmarks |
| Alertas Sonoras | ✅ Funcionando | Alarmas locales inmediatas |
| Autenticación | ✅ Funcionando | Login con JWT |
| Room Database | ⚠️ Parcial | Estructura existe pero NO se usa |
| GPS | ⚠️ Parcial | Permisos OK, pero NO captura ubicación |
| Sincronización | ❌ No existe | No hay envío de datos al servidor |

#### Backend FastAPI (Cloud)

| Componente | Estado | Descripción |
|------------|--------|-------------|
| API REST | ✅ Funcionando | Endpoints de auth, users, empresas, viajes |
| PostgreSQL | ✅ Funcionando | Tablas: usuarios, empresas, viajes, token_blacklist |
| JWT Auth | ✅ Funcionando | Access + Refresh tokens |
| Tabla eventos_somnolencia | ⚠️ SQL existe | Tabla creada pero sin modelo/endpoints |
| Endpoints eventos | ❌ No existe | No hay CRUD para eventos |
| WebSocket | ❌ No existe | No hay notificaciones en tiempo real |

---

## 🎯 OBJETIVO FINAL

```
┌───────────────────────────────────────────────────────┐
│                   FLUJO COMPLETO                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│   📱 APP ANDROID              ☁️ BACKEND             │
│   ┌─────────────────┐        ┌─────────────────┐    │
│   │ 1. Detecta      │        │                 │    │
│   │    somnolencia  │        │                 │    │
│   │                 │        │                 │    │
│   │ 2. Alerta       │        │                 │    │
│   │    INMEDIATA    │        │                 │    │
│   │                 │        │                 │    │
│   │ 3. Guarda en   ─┼───────►│ 5. Recibe       │    │
│   │    Room + GPS   │ (sync) │    eventos      │    │
│   │                 │        │                 │    │
│   │ 4. Sincroniza   │        │ 6. Notifica     │    │
│   │    cuando hay   │        │    admin       ─┼───►│ 🖥️ Admin
│   │    internet     │        │    (WebSocket)  │    │
│   └─────────────────┘        └─────────────────┘    │
│                                                       │
│   ✅ Funciona 100% OFFLINE                           │
│   ✅ Sincroniza cuando hay conexión                  │
│   ✅ Admin ve alertas en tiempo real                 │
└───────────────────────────────────────────────────────┘
```

---

## 📅 PLANIFICACIÓN POR FASES

### FASE 1: Backend - Endpoints de Eventos
**Prioridad:** 🔴 CRÍTICA

#### Objetivos:
- Crear modelo SQLAlchemy para `eventos_somnolencia`
- Crear schemas Pydantic para request/response
- Crear CRUD operations
- Crear endpoints REST para eventos
- Probar con Postman/Swagger

#### Archivos a crear/modificar:

```
drowsiness-detection-backend/app/
├── models/
│   └── evento_somnolencia.py      # ✅ YA EXISTE - Verificar
├── schemas/
│   └── evento_somnolencia.py      # ✅ YA EXISTE - Verificar
├── crud/
│   └── evento_somnolencia.py      # ✅ YA EXISTE - Verificar
├── api/v1/routers/
│   └── eventos.py                 # ✅ YA EXISTE - Verificar/Habilitar
└── main.py                        # Descomentar router de eventos
```

#### Endpoints a implementar:

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/api/v1/eventos` | Crear evento individual | Chofer |
| POST | `/api/v1/eventos/batch` | Crear eventos en lote (sync offline) | Chofer |
| GET | `/api/v1/eventos/chofer/{id}` | Obtener eventos de un chofer | Chofer/Admin |
| GET | `/api/v1/eventos/viaje/{id}` | Obtener eventos de un viaje | Admin |
| GET | `/api/v1/eventos/recientes` | Eventos últimos X minutos | Admin |
| GET | `/api/v1/eventos/estadisticas/{id}` | Estadísticas por chofer | Admin |

#### Entregable:
- ✅ Endpoints funcionando en Swagger
- ✅ Tests con datos de prueba

---

### FASE 2: Android - DatabaseModule + DAOs
**Prioridad:** 🔴 CRÍTICA

📋 ¿EN QUÉ CONSISTE LA FASE 2?
La Fase 2 tiene como objetivo preparar la infraestructura de almacenamiento local en Android para que los eventos de somnolencia detectados se guarden inmediatamente en la base de datos local (Room), permitiendo:

Funcionamiento Offline-First: Los eventos se guardan localmente sin depender de internet
Sincronización posterior: Los eventos pendientes se enviarán al servidor cuando haya conexión
Inyección de dependencias: Room database disponible en toda la app vía Hilt

#### Objetivos:
- Crear `DatabaseModule.kt` para inyección con Hilt
- Verificar/completar entidades de Room existentes
- Crear DAO para eventos de somnolencia
- Integrar con el sistema existente

#### Archivos a crear/modificar:

```
DriverDrowsinessDetectorApp/app/src/main/java/.../
├── di/
│   └── DatabaseModule.kt                    # NUEVO - Inyección de Room
├── data/local/
│   ├── database/
│   │   └── AppDatabase.kt                   # MODIFICAR - Agregar nuevas entidades
│   ├── entity/+++
│   │   ├── AlertEntity.kt                   # ✅ EXISTE - Verificar
│   │   ├── LocationEntity.kt                # ✅ EXISTE - Verificar
│   │   └── EventoSomnolenciaEntity.kt       # NUEVO - Para sync
│   └── dao/
│       ├── AlertDao.kt                      # ✅ EXISTE - Verificar
│       └── EventoSomnolenciaDao.kt          # NUEVO
```

#### Entregable:
- ✅ Room database inyectada correctamente
- ✅ DAOs funcionando
- ✅ Test: Guardar y leer evento local

---

### FASE 3: Android - Servicio de Ubicación GPS
**Prioridad:** 🟠 ALTA

📋 ¿EN QUÉ CONSISTE LA FASE 3?
La Fase 3 tiene como objetivo crear la infraestructura para:

Capturar ubicación GPS en tiempo real cuando se detecta un evento de somnolencia
Crear el Repository de Eventos como capa de abstracción entre DAOs y UseCases
Crear UseCase para guardar eventos con lógica de negocio completa
Preparar la integración con el sistema de detección existente


#### Objetivos:
- Crear servicio de ubicación con `FusedLocationProviderClient`
- Capturar ubicación cuando se detecta evento
- Guardar ubicación junto con evento

#### Archivos a crear/modificar:

```
DriverDrowsinessDetectorApp/app/src/main/java/.../
├── data/
│   └── location/
│       └── LocationService.kt               # NUEVO
├── domain/usecase/location/
│   └── GetCurrentLocationUseCase.kt         # NUEVO
└── di/
    └── LocationModule.kt                    # NUEVO - Inyección
```

#### Entregable:
- ✅ Obtener ubicación GPS actual
- ✅ Asociar ubicación a eventos de somnolencia

---





### FASE 4: Android - Integración Guardado Local
**Prioridad:** 🔴 CRÍTICA
📋 ¿EN QUÉ CONSISTE LA FASE 4?
La Fase 4 integra todo el sistema para que cuando se detecte un evento de somnolencia:

✅ Se muestre la alerta (ya funciona)
✅ Se capture la ubicación GPS actual
✅ Se cree el evento con todos los datos
✅ Se guarde en Room automáticamente
✅ Se marque como "pendiente de sincronización"

┌─────────────────────────────────────────────────────────────────┐
│                    FASE 4: INTEGRACIÓN COMPLETA                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🎯 FLUJO DE DETECCIÓN Y GUARDADO                              │
│                                                                 │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   MediaPipe  │───►│ DetectDrow.  │───►│  ViewModel   │     │
│   │   (Cámara)   │    │  UseCase     │    │              │     │
│   └──────────────┘    └──────────────┘    └──────┬───────┘     │
│                                                   │             │
│                                    ┌──────────────▼───────────┐ │
│                                    │  handleAlertWithDuration │ │
│                                    │  (detecta evento crítico)│ │
│                                    └──────────────┬───────────┘ │
│                                                   │             │
│          ┌────────────────────────────────────────┼─────────┐   │
│          │                                        │         │   │
│          ▼                                        ▼         │   │
│   ┌──────────────┐                        ┌──────────────┐  │   │
│   │  AlarmUtil   │                        │ SaveEvento   │  │   │
│   │  (Alarma)    │                        │ UseCase      │  │   │
│   └──────────────┘                        └──────┬───────┘  │   │
│                                                  │          │   │
│                         ┌────────────────────────┼──────┐   │   │
│                         │                        │      │   │   │
│                         ▼                        ▼      │   │   │
│                  ┌──────────────┐         ┌───────────┐ │   │   │
│                  │ GPS Location │         │   Room    │ │   │   │
│                  │   Service    │         │ Database  │ │   │   │
│                  └──────────────┘         └───────────┘ │   │   │
│                         │                        │      │   │   │
│                         └────────────────────────┘      │   │   │
│                                      │                  │   │   │
│                                      ▼                  │   │   │
│                         ┌────────────────────────┐      │   │   │
│                         │  EventoSomnolencia     │      │   │   │
│                         │  (sincronizado=false)  │──────┘   │   │
│                         └────────────────────────┘          │   │
│                                                             │   │
└─────────────────────────────────────────────────────────────────┘

#### Objetivos:
- Modificar `MonitoringViewModel` para guardar eventos en Room
- Capturar GPS cuando hay alerta
- Crear UseCase para guardar eventos

#### Archivos a modificar:

```
DriverDrowsinessDetectorApp/app/src/main/java/.../
├── domain/usecase/alert/
│   └── SaveAlertEventUseCase.kt             # NUEVO
├── data/repository/
│   └── EventosRepository.kt                 # NUEVO
└── presentation/monitoring/
    └── MonitoringViewModel.kt               # MODIFICAR - Integrar guardado
```

#### Flujo a implementar:

```kotlin
// Cuando se detecta microsueño/cabeceo/etc:
1. Mostrar alerta (ya funciona)
2. Obtener ubicación GPS actual
3. Crear EventoSomnolenciaEntity con todos los datos
4. Guardar en Room local
5. Marcar como "pendiente de sincronización"
```

#### Entregable:
- ✅ Eventos se guardan localmente con GPS
- ✅ Verificar con App Inspector de Android Studio

---




### FASE 5: Android - API Client para Eventos
**Prioridad:** 🟠 ALTA

 FASE 5: API Client para Eventos de Somnolencia
📋 ¿EN QUÉ CONSISTE LA FASE 5?
La Fase 5 crea la infraestructura de comunicación con el backend para sincronizar eventos:

┌─────────────────────────────────────────────────────────────────┐
│                    FASE 5: API CLIENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📱 ANDROID                              ☁️ BACKEND            │
│   ┌──────────────────┐                   ┌──────────────────┐  │
│   │ EventosApi.kt    │ ───── HTTP ─────► │ /api/v1/eventos  │  │
│   │ (Retrofit)       │                   │ (FastAPI)        │  │
│   └──────────────────┘                   └──────────────────┘  │
│          │                                       │              │
│          ▼                                       ▼              │
│   ┌──────────────────┐                   ┌──────────────────┐  │
│   │ EventoRequest.kt │                   │ EventoResponse   │  │
│   │ (DTO Salida)     │                   │ (DTO Entrada)    │  │
│   └──────────────────┘                   └──────────────────┘  │
│                                                                 │
│   ENDPOINTS:                                                    │
│   • POST /eventos          → Crear evento individual            │
│   • POST /eventos/batch    → Sincronizar eventos offline        │
│   • GET  /eventos/mis-eventos → Obtener mis eventos             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

#### Objetivos:
- Crear interfaces Retrofit para endpoints de eventos
- Crear DTOs para request/response
- Configurar en NetworkModule

#### Archivos a crear:

```
DriverDrowsinessDetectorApp/app/src/main/java/.../
├── data/remote/
│   ├── api/
│   │   └── EventosApi.kt                    # NUEVO
│   └── dto/
│       ├── request/
│       │   └── EventoRequest.kt             # NUEVO
│       └── response/
│           └── EventoResponse.kt            # NUEVO
└── di/
    └── NetworkModule.kt                     # MODIFICAR - Agregar EventosApi
```

#### Entregable:
- ✅ Retrofit configurado para eventos
- ✅ Test: Enviar evento al backend

---

### FASE 6: Android - WorkManager Sincronización
**Prioridad:** 🟠 ALTA

Flujo de Sincronización
┌─────────────────────────────────────────────────────────────┐
│                FLUJO DE SINCRONIZACIÓN                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📱 APP INICIA                                             │
│       │                                                     │
│       ▼                                                     │
│   ┌───────────────┐                                         │
│   │ SyncManager   │                                         │
│   │ .startPeriodic│                                         │
│   └───────┬───────┘                                         │
│           │                                                 │
│           ▼                                                 │
│   ┌───────────────┐    Cada 15 min    ┌───────────────┐    │
│   │  WorkManager  │──────────────────►│  SyncWorker   │    │
│   └───────────────┘  (con conexión)   └───────┬───────┘    │
│                                               │             │
│                                               ▼             │
│                                       ┌───────────────┐     │
│                                       │SyncEventos    │     │
│                                       │UseCase        │     │
│                                       └───────┬───────┘     │
│                                               │             │
│          ┌────────────────────────────────────┼─────────┐   │
│          │                                    │         │   │
│          ▼                                    ▼         │   │
│   ┌──────────────┐                    ┌──────────────┐  │   │
│   │    Room      │                    │   Backend    │  │   │
│   │ getPending() │                    │ POST /batch  │  │   │
│   └──────────────┘                    └──────────────┘  │   │
│          │                                    │         │   │
│          │         ┌──────────────┐           │         │   │
│          └────────►│ markAsSynced │◄──────────┘         │   │
│                    │ (idServidor) │                     │   │
│                    └──────────────┘                     │   │
│                                                         │   │
└─────────────────────────────────────────────────────────────┘

#### Objetivos:
- Crear `SyncWorker` con WorkManager
- Sincronizar eventos pendientes cuando hay internet
- Manejar reintentos y errores


#### Archivos a crear:

```
DriverDrowsinessDetectorApp/app/src/main/java/.../
├── sync/
│   ├── SyncWorker.kt                        # NUEVO - Worker principal
│   └── SyncManager.kt                       # NUEVO - Gestión de sync
└── di/
    └── WorkerModule.kt                      # NUEVO - Inyección de Workers
```

#### Lógica de sincronización:

1. WorkManager se ejecuta cada 15 minutos (o cuando hay conexión)
2. Consulta Room: eventos con `sincronizado = false`
3. Envía batch al backend (`POST /eventos/batch`)
4. Si éxito: marca `sincronizado = true` en Room
5. Si falla: reintenta en próxima ejecución

#### Entregable:
- ✅ Sincronización automática funcionando
- ✅ Test: Crear eventos offline, conectar internet, verificar sync

---

### FASE 7: Backend - WebSocket para Tiempo Real
**Prioridad:** 🟡 MEDIA

📋 ARQUITECTURA DE LA FASE 7
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 7: WEBSOCKET NOTIFICATIONS              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📱 APP ANDROID                          ☁️ BACKEND            │
│   ┌──────────────────┐                   ┌──────────────────┐  │
│   │ POST /eventos    │ ───── HTTP ─────► │ eventos.py       │  │
│   │ (evento crítico) │                   │ (crea evento)    │  │
│   └──────────────────┘                   └────────┬─────────┘  │
│                                                   │             │
│                                                   ▼             │
│                                          ┌──────────────────┐  │
│                                          │ NotificationSvc  │  │
│                                          │ (detecta crítico)│  │
│                                          └────────┬─────────┘  │
│                                                   │             │
│                                                   ▼             │
│   🖥️ ADMIN DASHBOARD                     ┌──────────────────┐  │
│   ┌──────────────────┐                   │ WebSocket        │  │
│   │ ws://server/ws   │ ◄─── WS ──────── │ ConnectionMgr    │  │
│   │ (recibe alerta)  │                   │ (broadcast)      │  │
│   └──────────────────┘                   └──────────────────┘  │
│                                                                 │
│   FLUJO:                                                        │
│   1. App envía evento POST /eventos                             │
│   2. Backend guarda en PostgreSQL                               │
│   3. NotificationService detecta si es crítico                  │
│   4. ConnectionManager broadcast a todos los admins conectados  │
│   5. Dashboard admin recibe notificación instantánea            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

#### Objetivos:
- Implementar WebSocket en FastAPI
- Notificar a admin cuando llega evento crítico
- Mantener conexión persistente con dashboard

#### Archivos a crear:

```
drowsiness-detection-backend/app/
├── api/v1/routers/
│   └── websocket.py                         # NUEVO
└── services/
    └── notification_service.py              # NUEVO
```

#### Entregable:
- ✅ WebSocket endpoint funcionando
- ✅ Admin recibe notificación al llegar evento crítico

---

### FASE 8: Testing e Integración
**Prioridad:** 🔴 CRÍTICA

#### Objetivos:
- Pruebas end-to-end del flujo completo
- Pruebas de escenarios offline
- Documentación de APIs

#### Escenarios a probar:

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Detección con internet | Evento guardado local + sincronizado inmediato |
| Detección sin internet | Evento guardado local, sync cuando vuelva internet |
| Batch de 50 eventos offline | Todos sincronizados correctamente |
| Backend caído | App sigue funcionando, eventos en cola |
| Reinicio de app | Eventos pendientes se sincronizan |

#### Entregable:
- ✅ Todos los escenarios funcionando
- ✅ Documentación actualizada

---

## 📊 RESUMEN DE FASES

| Fase | Descripción | Prioridad | Dependencias |
|------|-------------|-----------|--------------|
| 1 | Backend - Endpoints Eventos | 🔴 CRÍTICA | Ninguna |
| 2 | Android - DatabaseModule | 🔴 CRÍTICA | Ninguna |
| 3 | Android - GPS Service | 🟠 ALTA | Fase 2 |
| 4 | Android - Guardado Local | 🔴 CRÍTICA | Fases 2, 3 |
| 5 | Android - API Client | 🟠 ALTA | Fase 1 |
| 6 | Android - WorkManager Sync | 🟠 ALTA | Fases 4, 5 |
| 7 | Backend - WebSocket | 🟡 MEDIA | Fase 1 |
| 8 | Testing e Integración | 🔴 CRÍTICA | Todas |

**Tiempo total estimado:** 3-4 semanas

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### Semana 1:
- **:** FASE 1 (Backend endpoints)
- **:** FASE 2 (Android DatabaseModule)
- **:** FASE 3 (Android GPS)

### Semana 2:
- **:** FASE 4 (Android guardado local)
- **:** FASE 5 (Android API client)
- **:** FASE 6 (Android WorkManager)

### Semana 3:
- **:** FASE 7 (Backend WebSocket)
- **:** FASE 8 (Testing)

---

## 📝 NOTAS IMPORTANTES

### ¿Qué datos enviar al servidor?

**Solo eventos de alerta, no métricas continuas:**
- Microsueño (CRITICAL)
- Cabeceo (CRITICAL)
- Parpadeo excesivo (MEDIUM)
- Bostezo frecuente (HIGH)
- Frotamiento de ojos (MEDIUM)

### ¿Por qué no enviar métricas continuas (EAR, MAR)?
- ❌ Generaría ~1MB/minuto de datos
- ❌ No aporta valor real al admin
- ❌ Aumenta costos de servidor
- ✅ El admin solo necesita saber "cuándo hubo alerta"

### ¿WebSocket obligatorio?
No es crítico para MVP. Se puede implementar después. Con polling cada 30 segundos el admin vería alertas casi en tiempo real.

---

## ✅ CHECKLIST GENERAL

- [ ] FASE 1: Backend endpoints funcionando
- [ ] FASE 2: Room inyectado con Hilt
- [ ] FASE 3: GPS capturando ubicación
- [ ] FASE 4: Eventos guardándose localmente
- [ ] FASE 5: Retrofit conectando con backend
- [ ] FASE 6: Sincronización automática
- [ ] FASE 7: WebSocket notificando admin
- [ ] FASE 8: Tests pasando

---

## 📚 Referencias

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Room Database Guide](https://developer.android.com/training/data-storage/room)
- [WorkManager Guide](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Hilt Dependency Injection](https://developer.android.com/training/dependency-injection/hilt-android)
- [Retrofit](https://square.github.io/retrofit/)

---

**Última actualización:** Noviembre 2024