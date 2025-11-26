# 🎯 ANÁLISIS DEL MODELO DE NEGOCIO ACTUAL

## Lo que tienes ahora:

```
┌─────────────────────────────────────────────────────┐
│ MODELO ACTUAL (100% Cloud-Dependent)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Chofer (Vehículo)              Servidor Cloud       │
│ ┌──────────────┐                                    │
│ │ App Web      │──────WebSocket────────►            │
│ │ (Browser)    │◄────── Análisis IA ─────┐          │
│ │              │                         │          │
│ │ Cámara ──┐   │                    ┌───┴───┐      b│
│ └──────────┼───┘                    │ FastAPI│      │
│            │                        │ + IA   │      │
│         Frames                      └───┬───┘       │
│        (Base64)                         │           │
│                                         │           │
│                                   ┌────▼────┐       │
│ Admin (Oficina)                   │PostgreSQL│      │
│ ┌──────────────┐                  └─────────┘       │
│ │ Dashboard    │◄───REST API───────────┘            │
│ │ (Browser)    │                                    │
│ └──────────────┘                                    │
│                                                     │
│ ⚠️ PROBLEMA: Si no hay internet, TODO se cae        │
└─────────────────────────────────────────────────────┘
```

---

# 🚨 IDENTIFICACIÓN DE PROBLEMAS CRÍTICOS

## PROBLEMA #1: Dependencia Total de Internet ⛔

**Escenario Real:**
```
├─ Chofer entra a zona sin cobertura
├─ WebSocket se desconecta
├─ App web deja de procesar frames
├─ ⚠️ NO HAY ALERTA de somnolencia
└─ 💀 RIESGO DE ACCIDENTE
```

**Severidad:** 🔴 **CRÍTICA** - Puede causar accidentes fatales

---

## PROBLEMA #2: Procesamiento en la Nube es Inviable ⛔

**Cálculo de Latencia Real:**

```
┌─────────────────────────────────────────┐
│ Frame capture:      ~33ms (30 FPS)      │
│ Base64 encode:      ~10ms               │
│ Upload (4G): 640x480 ~50-200ms          │
│ IA processing:      ~100-300ms          │
│ Download response:  ~30-100ms           │
│ Decode + render:    ~20ms               │
├─────────────────────────────────────────┤
│ TOTAL LATENCY:      ~243-663ms          │
│                                         │
│ ⚠️ Delay de detección: 0.25-0.6 segundos│
│                                         │
│ A 100 km/h = 27.7 m/s                  │
│ En 0.5s avanza: 13.8 metros SIN alerta │
└─────────────────────────────────────────┘
```

**Severidad:** 🔴 **CRÍTICA** - Delay inaceptable para seguridad vial

---

# ✅ SOLUCIÓN ARQUITECTÓNICA RECOMENDADA

## 🎯 ARQUITECTURA HÍBRIDA (Edge + Cloud)

### 🛠 IMPLEMENTACIÓN DETALLADA

#### OPCIÓN: Aplicación Android Nativa

Si el vehículo tiene Android Auto o tablet:

**Hardware:**
```
├─ Tablet Android (>= Android 10)
├─ Cámara frontal del tablet
└─ Soporte para tablero
```

**Software:**
```
├─ App nativa Android (Kotlin)
├─ MediaPipe Android SDK
├─ Base de datos local: Room
└─ Sync en background
```

---

## 📡 PROTOCOLO DE SINCRONIZACIÓN CLOUD

### Datos que se envían al Cloud (SOLO metadatos)

```json
{
  "id_viaje": 123,
  "id_chofer": 45,
  "timestamp": "2025-01-15T14:32:10Z",
  "gps": {
    "lat": -16.5000,
    "lon": -68.1500,
    "velocidad_kmh": 85
  },
  "metricas": {
    "parpadeos_minuto": 18,
    "microsueños_total": 2,
    "bostezos_ultimos_media_hora": 4,
    "inclinaciones_cabeza_cabeceo": 3,
    "frotamiento_ojos": 1
  },
  "alertas": [
    {
      "tipo": "microsueño",
      "timestamp": "2025-01-15T14:30:45Z",
      "duracion_segundos": 3.2
    }
  ],
  "estado_viaje": "en_curso"
}
```

**Tamaño:** ~1-2 KB por reporte  
**Frecuencia:** Cada 1-5 minutos

---

## 🔄 MANEJO DE CONECTIVIDAD

### Estados del Sistema:

```python
class EstadoConexion:
    ONLINE = "online"        # WiFi/4G disponible
    OFFLINE = "offline"      # Sin conexión
    SYNC_PENDING = "pending" # Datos esperando sync

# Lógica del Edge Device
while True:
    # 1. SIEMPRE procesar localmente
    frame = capturar_frame()
    prediccion = modelo_ia.detectar(frame)
    
    # 2. Alertar INMEDIATAMENTE si necesario
    if prediccion.es_critica():
        reproducir_alarma()
        guardar_en_buffer_local(prediccion)
    
    # 3. Intentar sync (no bloqueante)
    if hay_conexion() and buffer_tiene_datos():
        try:
            enviar_a_cloud_async(buffer.obtener_pendientes())
            buffer.marcar_como_sincronizado()
        except ConnectionError:
            # Silenciosamente fallar, reintentará después
            pass
```

---

## 📊 DASHBOARD ADMIN - FUNCIONALIDAD REALISTA

### Vista en Tiempo Real (con delays aceptables)

```
┌─────────────────────────────────────────────────┐
│ MONITOREO DE FLOTA - VISTA ACTUAL              │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🗺 Mapa (Google Maps / Leaflet)                │
│ ┌──────────────────────────────────────┐       │
│ │                                      │       │
│ │ 📍 Chofer A (Última actualización:  │       │
│ │    14:32 - hace 2 min)              │       │
│ │    Estado: ⚠️ Alerta Moderada       │       │
│ │                                      │       │
│ │ 📍 Chofer B (Última actualización:  │       │
│ │    14:33 - hace 1 min)              │       │
│ │    Estado: ✅ Normal                │       │
│ │                                      │       │
│ │ 📍 Chofer C (⚠️ Sin señal           │       │
│ │    desde 14:20 - hace 14 min)       │       │
│ │    Última posición conocida         │       │
│ └──────────────────────────────────────┘       │
│                                                 │
│ 📊 ALERTAS RECIENTES                           │
│ ┌──────────────────────────────────────┐       │
│ │ 🚨 Chofer A - Microsueño (3.2s)     │       │
│ │    14:30:45 - Ruta La Paz-Oruro     │       │
│ │                                      │       │
│ │ ⚠️ Chofer D - 4 bostezos (última hr)│       │
│ │    14:25:10 - Ruta Cochabamba-Sucre │       │
│ └──────────────────────────────────────┘       │
│                                                 │
│ ℹ️ Datos actualizados cada 1-5 minutos         │
│    (dependiendo de cobertura)                  │
└─────────────────────────────────────────────────┘
```

**NO es monitoreo instantáneo** (no es Netflix 😅)  
**ES monitoreo supervisado** con alertas y tendencias

---

## 🔐 ESTRATEGIAS PARA PÉRDIDA DE CONEXIÓN

### Protocolo de Escalamiento

```
Nivel 1: DETECCIÓN LOCAL (0ms delay)
├─ IA procesa → Detecta somnolencia
├─ Alarma INMEDIATA en cabina
└─ Guarda en buffer local

Nivel 2: SYNC CUANDO HAY RED (1-5 min delay)
├─ Envía resumen al cloud
├─ Admin ve notificación
└─ Puede llamar al chofer

Nivel 3: SIN CONEXIÓN PROLONGADA (>30 min)
├─ Edge device sigue funcionando 100%
├─ Alarmas locales siguen activas
├─ Buffer local guarda todo
├─ Admin ve "última posición conocida"
└─ Al recuperar conexión: Sync batch de datos

Nivel 4: EMERGENCIA
├─ Si chofer no responde a alertas locales
├─ Sistema puede activar:
│   ├─ Luces de emergencia (si integrado)
│   ├─ Reducción gradual de velocidad (IA avanzada)
│   └─ Llamada automática a contacto de emergencia
```

---

## 🎯 ¿QUÉ IMPLEMENTAR DONDE?

```
┌─────────────────────────────────────────────┐
│ CHOFER (en vehículo)                        │
│                                             │
│ ❌ NO: App web (tu implementación actual)   │
│    Razón: No funciona sin internet          │
│                                             │
│ ✅ SÍ: App nativa Android                   │
│    (con procesamiento offline)              │
│                                             │
├─────────────────────────────────────────────┤
│ ADMIN (en oficina)                          │
│ ✅ SÍ: App web (tu implementación actual)   │
│    Razón: Siempre tiene internet estable   │
└─────────────────────────────────────────────┘
```

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Qué pasa si el servidor cloud se cae?

**Respuesta:** ✅ **El vehículo sigue funcionando perfecto**

```
Impacto de Cloud Down:
├─ Detección IA: ✅ Sigue funcionando (local)
├─ Alertas al chofer: ✅ Siguen funcionando (local)
├─ Guardar datos: ✅ Buffer local crece
├─ Dashboard admin: ❌ No disponible temporalmente
└─ GPS tracking: ❌ No se actualiza en mapa

Recuperación:
└─ Al volver cloud: Sync automático del buffer
```

### Ventajas del cambio:

1. ✅ Funciona en el mundo real (carreteras sin señal)
2. ✅ Alertas instantáneas (salva vidas)
3. ✅ Costos operativos manejables
4. ✅ Escalable a flotas grandes
5. ✅ Cumple regulaciones de seguridad

---

# 🔍 ANÁLISIS CRÍTICO DEL SISTEMA

1. ✅ Problemas críticos identificados
2. ⚠️ Escenarios "Qué pasa si..." adicionales
3. 🛠 Soluciones arquitectónicas viables
4. 📊 Comparativa: App Web vs App Nativa
5. 🎯 Propuesta de arquitectura final

---

# 🚨 PARTE 1: PROBLEMAS CRÍTICOS IDENTIFICADOS

## 1.1 Pérdida de Conexión Chofer ↔ Admin

### ❌ Situación Actual (CRÍTICA)

```
┌─────────────┐ Internet ┌─────────────┐ Internet ┌─────────────┐
│   CHOFER    │──────────│  SERVIDOR   │──────────│    ADMIN    │
│ (Vehículo)  │WebSocket │   CLOUD     │WebSocket │  (Oficina)  │
└─────────────┘          └─────────────┘          └─────────────┘
      │                        │                        │
      │ ❌ Pierde señal        │                        │
      │ en carretera           │                        │
      │                        │                        │
      │ ❌ No envía frames     │ ❌ No hay datos        │
      │ ❌ No procesa IA       │ ❌ No monitorea        │
      │ ❌ No hay alertas      │ ❌ Pierde ubicación    │
```

### ⚠️ CONSECUENCIAS GRAVES:

- **Seguridad comprometida:** Si el chofer tiene microsueño en zona sin señal, NO HAY ALERTA
- **Monitoreo inútil:** Admin no ve nada durante 30-60 min en zonas sin cobertura
- **Sistema no cumple su propósito:** Prevenir accidentes requiere 100% disponibilidad

---

## 1.2 Dependencia Total de Internet

### ⚠️ FALLOS CRÍTICOS:

| Escenario | Consecuencia | Nivel de Riesgo |
|-----------|--------------|-----------------|
| Sin señal 4G/5G en carretera | ❌ Sistema completamente inoperativo | 🔴 CRÍTICO |
| Servidor cloud caído (AWS/Azure down) | ❌ Todos los choferes sin protección | 🔴 CRÍTICO |
| Latencia alta (>500ms) | ❌ Alertas llegan tarde (accidente) | 🔴 CRÍTICO |
| Cuota de datos agotada | ❌ Conexión cortada | 🟠 ALTO |
| Túnel/zona rural | ❌ Sin servicio 5-30 min | 🔴 CRÍTICO |

---

## 1.3 Procesamiento IA en la Nube

### ❌ Limitaciones Técnicas

```python
# Flujo actual (PROBLEMÁTICO)

# 1. Cámara captura frame (1920x1080) → ~500 KB
# 2. Envía a servidor cloud vía WebSocket
# 3. Servidor procesa con MediaPipe (100-200ms)
# 4. Retorna resultado JSON + imágenes

# ❌ PROBLEMAS:
# - Latencia total: 300-1000ms (inaceptable para alertas)
# - Consumo datos: ~15 MB/min → 900 MB/hora
# - Sin internet: 0% funcionalidad
```

---

# 🛠 PARTE 3: SOLUCIONES ARQUITECTÓNICAS VIABLES

## 3.1 SOLUCIÓN HÍBRIDA: Edge Computing + Cloud Sync

### ✅ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    VEHÍCULO DEL CHOFER                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📱 DISPOSITIVO LOCAL (Aplicación Móvil en Tablet)          │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🎥 Cámara → MediaPipe LOCAL → IA LOCAL                │ │
│ │ ✅ Procesa 100% sin internet                          │ │
│ │ ✅ Alerta sonora inmediata (50ms)                     │ │
│ │ ✅ Guarda datos en Room local                         │ │
│ │ ✅ GPS local (sin internet)                           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│                    ↓↑ (Sincronización)                      │
│                (Cuando HAY internet)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVIDOR CLOUD (AWS/Azure)                     │
├─────────────────────────────────────────────────────────────┤
│ 🔄 Cola de mensajes (RabbitMQ/Redis)                       │
│ 💾 Base de datos central (PostgreSQL)                      │
│ 📊 Dashboard admin en tiempo real (cuando hay conexión)    │
│ 📈 Análisis histórico + ML para patrones                   │
│ 📧 Notificaciones email/SMS a admin                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 📋 Flujo de Funcionamiento

```python
# DISPOSITIVO LOCAL EN VEHÍCULO

# 1. Captura de video
camara.capturar_frame() → frame_local

# 2. Procesamiento LOCAL (SIN INTERNET)
mediapipe_local.procesar(frame_local) → landmarks
ia_local.detectar_somnolencia(landmarks) → {
    "microsueno": True,
    "duracion": 3.2,
    "timestamp": "2025-11-10 14:23:45",
    "ubicacion_gps": "-12.0464, -77.0428"
}

# 3. Alerta INMEDIATA (sin depender de servidor)
if microsueno:
    alarma_sonora.reproducir()  # ✅ 50ms latencia
    
# 4. Guardar en Room local
db_local.insert(evento_somnolencia)

# 5. Sincronizar cuando HAY internet (Background task)
if internet_disponible():
    cola_mensajes.enviar(eventos_pendientes)  # Async
    admin_websocket.enviar(estado_actual)     # Real-time
```

---

### ✅ VENTAJAS DE ESTA ARQUITECTURA

| Característica | Beneficio |
|----------------|-----------|
| Procesamiento local | Alertas en 50 ms, sin depender de internet |
| Room local | Datos guardados aunque servidor caiga |
| Sincronización asíncrona | Admin ve datos cuando hay señal |
| GPS offline | Ubicación se guarda localmente |
| Modelo IA ligero | TensorFlow Lite/ONNX (20 MB vs 500 MB) |

---

## 3.2 COMPARATIVA: App Web vs App Nativa

| Criterio | App Web Pura 🌐 | App Nativa 📱 |
|----------|-----------------|---------------|
| Procesamiento IA sin internet | ❌ Imposible | ✅ Sí (TensorFlow Lite) |
| Acceso a cámara | ⚠️ Requiere HTTPS + permisos | ✅ Nativo |
| GPS offline | ❌ No | ✅ Sí |
| Base de datos local | ⚠️ IndexedDB (5-50 MB límite) | ✅ Room ilimitado |
| Instalación | ✅ URL en navegador | ❌ Tienda App Store/Play Store |
| Actualizaciones | ✅ Automáticas | ❌ Manual usuario |
| Compatibilidad dispositivos | ✅ Cualquier tablet/PC | ❌ Solo iOS/Android |
| Costo desarrollo | 🟢 Bajo (1 codebase) | 🔴 Alto (iOS + Android) |
| Rendimiento IA | 🔴 Bajo (depende servidor) | 🟢 Alto (GPU local) |
| Latencia alertas | 🔴 300-1000ms | 🟢 30-50ms |
| Recomendación | ❌ NO VIABLE para seguridad crítica | ✅ Viable pero costoso |

---

# 📚 DOCUMENTACIÓN: SOLUCIÓN HÍBRIDA Edge Computing + Cloud Sync

## 🎯 Visión General

La **Solución Híbrida Edge Computing + Cloud Sync** es una arquitectura de software que distribuye el procesamiento entre **dos capas principales**:

1. **EDGE (Borde/Local):** Procesamiento en el dispositivo del vehículo (offline-first)
2. **CLOUD (Nube):** Almacenamiento centralizado y monitoreo administrativo

Esta arquitectura garantiza que el sistema **funcione siempre**, incluso sin conexión a internet, mientras mantiene capacidades de monitoreo remoto cuando hay conectividad disponible.

---

## 🏗 Arquitectura del Sistema

### Componentes Principales

```
┌──────────────────────────────────────────────────────────────────┐
│                    VEHÍCULO DEL CHOFER                           │
│                      (CAPA EDGE)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📱 Dispositivo Local (Tablet o Móvil app)                       │
│ ┌────────────────────────────────────────────────────────┐     │
│ │ 🎥 Cámara → MediaPipe → Procesamiento IA             │     │
│ │ ✅ Funciona 100% OFFLINE                             │     │
│ │ ✅ Alertas en tiempo real (50-100ms)                 │     │
│ │ 💾 Base de datos local (Room)                        │     │
│ │ 📍 GPS logger (sin internet)                         │     │
│ │ 🔊 Sistema de alarmas nativo                         │     │
│ └────────────────────────────────────────────────────────┘     │
│                                                                  │
│              ↓↑ Sincronización Automática                       │
│         (Solo cuando HAY conexión a internet)                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓↑
┌──────────────────────────────────────────────────────────────────┐
│                  SERVIDOR EN LA NUBE                             │
│                    (CAPA CLOUD)                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ⚙️ Backend FastAPI                                              │
│ ┌────────────────────────────────────────────────────────┐     │
│ │ 💾 Base de datos PostgreSQL (central)                 │     │
│ │ 🔄 Cola de mensajes Redis (sincronización)            │     │
│ │ 📊 API REST (gestión de usuarios/empresas/viajes)     │     │
│ │ 🔌 WebSocket (comunicación tiempo real con admin)     │     │
│ │ 📧 Sistema de notificaciones                          │     │
│ └────────────────────────────────────────────────────────┘     │
│                                                                  │
│                ↓↑ Comunicación WebSocket                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓↑
┌──────────────────────────────────────────────────────────────────┐
│                 DASHBOARD ADMINISTRADOR                          │
│                (APLICACIÓN WEB REACT)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🗺 Mapa GPS con ubicaciones en tiempo real                      │
│ 📊 Panel de choferes activos                                    │
│ ⚠️ Alertas de somnolencia                                       │
│ 📈 Reportes y estadísticas históricas                           │
│ 👥 Gestión de usuarios y empresas                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Funcionamiento del Sistema

### 1. Procesamiento Local (EDGE) - Sin Internet

#### ¿Qué ocurre en el vehículo del chofer?

El dispositivo instalado en el vehículo (tablet app móvil) ejecuta todas las funciones críticas de seguridad de forma local:

#### 📹 Captura de Video

- La cámara del dispositivo graba continuamente al conductor
- Los frames de video se procesan localmente en el dispositivo
- No se envía video a internet (ahorro de datos y privacidad)

#### 🤖 Procesamiento con Inteligencia Artificial

- MediaPipe extrae 468 puntos faciales y 21 puntos por mano
- El modelo de IA analiza estos puntos para detectar:
  - Microsueños (ojos cerrados >2 segundos)
  - Bostezos (boca abierta >4 segundos)
  - Inclinación de cabeza (cabeceo >3 segundos)
  - Frotamiento de ojos (mano cerca del rostro)
  - Parpadeo excesivo (>20 parpadeos/minuto)

#### 🔔 Alertas Inmediatas

- Cuando se detecta somnolencia, el sistema:
  - Reproduce alarma sonora de alta intensidad
  - Muestra notificación visual en pantalla
  - Vibra el dispositivo (si es tablet)
- **Latencia total: 50-100 milisegundos** (casi instantáneo)
- **Funciona incluso sin internet**

#### 💾 Almacenamiento Local

- Cada evento de somnolencia se guarda en una base de datos Room local:
  - Timestamp exacto del evento
  - Tipo de somnolencia detectada
  - Duración en segundos
  - Coordenadas GPS del vehículo en ese momento
  - Estado de sincronización (pendiente/completado)

#### 📍 Registro GPS Offline

- El GPS del dispositivo registra la ubicación cada 30 segundos
- Se guarda localmente aunque no haya internet
- Permite reconstruir la ruta completa del viaje después

---

### 2. Sincronización Inteligente (EDGE → CLOUD)

#### ¿Cómo se comunican el vehículo y el servidor?

La sincronización ocurre **automáticamente en segundo plano** cuando el dispositivo detecta conexión a internet:

#### 🔍 Detección de Conectividad

- El sistema verifica cada 10 segundos si hay conexión a internet
- Cuando detecta señal (WiFi, 4G, 5G):
  - Inicia proceso de sincronización automática
  - No interrumpe el monitoreo en curso

#### 📤 Envío de Datos Acumulados

- El dispositivo consulta la base Room local
- Selecciona todos los eventos marcados como "no sincronizados"
- Los empaqueta en formato JSON comprimido
- Los envía al servidor en lotes (batches) para optimizar ancho de banda

**Ejemplo de datos enviados:**

```json
{
  "id_chofer": 123,
  "eventos": [
    {
      "timestamp": "2025-11-10 14:23:45",
      "tipo": "microsueno",
      "duracion_segundos": 3.2,
      "latitud": -12.0464,
      "longitud": -77.0428
    },
    {
      "timestamp": "2025-11-10 14:45:12",
      "tipo": "bostezo",
      "duracion_segundos": 5.1,
      "latitud": -12.0512,
      "longitud": -77.0356
    }
    // ... más eventos acumulados
  ]
}
```

#### ✅ Confirmación y Marcado

- El servidor recibe los eventos y los guarda en PostgreSQL
- Responde con confirmación: `{"status": "ok", "eventos_guardados": 15}`
- El dispositivo marca esos eventos como "sincronizados" en Room
- Los eventos sincronizados se conservan localmente para histórico

#### 🔄 Manejo de Fallos

- Si la sincronización falla (servidor caído, internet interrumpido):
  - Los eventos permanecen como "no sincronizados"
  - El sistema reintentará en el próximo ciclo (30 segundos después)
  - No se pierde ningún dato

---

### 3. Monitoreo en Tiempo Real (CLOUD → ADMIN)

#### ¿Cómo el administrador monitorea a los choferes?

El dashboard web del administrador recibe información en tiempo real **solo cuando los choferes tienen conexión a internet**:

#### 🔌 Conexión WebSocket Bidireccional

- Cuando el chofer tiene internet, su dispositivo abre un canal WebSocket con el servidor
- El servidor mantiene una lista de "choferes actualmente conectados"
- El dashboard del admin se suscribe a actualizaciones de todos los choferes

#### 📊 Información en Tiempo Real

- **Ubicación GPS:** Mapa muestra la posición actual de cada chofer
- **Estado de somnolencia:** Indicadores visuales (verde/amarillo/rojo)
- **Última alerta:** Cuándo y qué tipo de somnolencia se detectó
- **Estadísticas del viaje:** Total de microsueños, bostezos, etc.

#### 🗺 Visualización en Mapa

- Marcadores por chofer con colores según estado:
  - 🟢 Verde: Sin alertas recientes
  - 🟡 Amarillo: Alerta leve (1-2 eventos en última hora)
  - 🔴 Rojo: Alerta crítica (3+ eventos o microsueño prolongado)
- Click en marcador muestra detalles del chofer
- Ruta del viaje trazada en el mapa

#### ⚠️ Notificaciones Proactivas

- Cuando un chofer tiene evento crítico de somnolencia:
  - El admin recibe notificación push en su dashboard
  - Se envía email/SMS automático al supervisor
  - Se registra en bitácora de alertas

#### 📡 Manejo de Desconexiones

- Si un chofer pierde señal:
  - Su marcador en el mapa se pone gris
  - Se muestra "Última conexión: hace 5 minutos"
  - El admin ve la última ubicación conocida
  - Cuando recupera señal, todos los eventos acumulados llegan en lote

---

## 🛡 Ventajas de Esta Arquitectura

### Seguridad y Confiabilidad

| Escenario | Sin Arquitectura Híbrida | Con Arquitectura Híbrida |
|-----------|-------------------------|--------------------------|
| Sin señal en carretera | ❌ Sistema no funciona, no hay alertas | ✅ Alertas locales funcionan normalmente |
| Servidor caído | ❌ Ningún chofer protegido | ✅ Todos los choferes protegidos, solo admin sin visibilidad |
| Internet lento | ❌ Latencia alta, alertas tardías | ✅ Alertas inmediatas (procesamiento local) |
| Consumo de datos | ❌ 3.6 GB/hora (video streaming) | ✅ ~5 MB/hora (solo JSON con eventos) |
| Pérdida de datos | ❌ Eventos no registrados si hay falla | ✅ Room local garantiza 0% pérdida |

---

## 🔧 Componentes Técnicos Clave

### En el Dispositivo del Vehículo (EDGE)

#### Aplicación Móvil

- Kotlin
- Se instala como programa nativo en Windows/Mac/Linux
- Acceso completo a hardware: cámara, GPS, almacenamiento, notificaciones

#### MediaPipe (Biblioteca de Google)

- Detecta 468 puntos faciales en tiempo real
- Procesa 20-30 frames por segundo
- Funciona offline (modelo incluido en la aplicación)

#### Room

- Base de datos embebida
- No requiere servidor externo
- Perfecta para almacenamiento local

#### APIs Nativas del Sistema Operativo

- Acceso a GPS (geolocalización)
- Reproducción de sonidos (alarmas)
- Notificaciones del sistema
- Vibración (en tablets)

---

### En el Servidor Cloud (CLOUD)

#### FastAPI (Backend)

- Tu código actual se mantiene
- Se agregan endpoints de sincronización
- WebSocket para comunicación admin-servidor

#### PostgreSQL

- Base de datos central que almacena:
  - Usuarios (admins y choferes)
  - Empresas de transporte
  - Viajes asignados
  - Eventos de somnolencia sincronizados
  - Histórico completo

#### Redis

- Cola de mensajes para sincronización asíncrona
- Caché para mejorar rendimiento
- Gestión de sesiones WebSocket

#### Sistema de Notificaciones

- Envío de emails (SMTP)
- SMS (Twilio/similar)
- Push notifications (Firebase)

---

### En el Dashboard Admin (WEB)

#### Aplicación Web React

- Tu código actual se mantiene
- Se agrega componente de mapa GPS
- Panel de choferes en tiempo real

#### Mapbox/Leaflet

- Biblioteca para mostrar mapas interactivos
- Marcadores personalizados por chofer
- Trazado de rutas

#### WebSocket Client

- Conexión permanente con el servidor
- Recibe actualizaciones en tiempo real
- Notificaciones instantáneas

---

## 📋 Flujo Completo de un Evento de Somnolencia

### Caso 1: Chofer CON Conexión a Internet

```
1. Chofer conduce por autopista (señal 4G disponible)
    ↓
2. Dispositivo procesa video localmente (MediaPipe)
    ↓
3. IA detecta microsueño de 3.2 segundos
    ↓
4. INMEDIATAMENTE:
   - Alarma sonora se reproduce (50ms latencia)
   - Notificación en pantalla del dispositivo
    ↓
5. Evento se guarda en Room local con timestamp y GPS
    ↓
6. 2 segundos después:
   - Sincronización automática envía evento al servidor
   - Servidor guarda en PostgreSQL
    ↓
7. 1 segundo después:
   - WebSocket notifica al dashboard admin
   - Admin ve alerta en tiempo real en el mapa
   - Admin puede llamar al chofer si es necesario
```

**Tiempo total desde detección hasta alerta admin: ~3 segundos**

---

### Caso 2: Chofer SIN Conexión a Internet

```
1. Chofer conduce por zona rural sin señal
    ↓
2. Dispositivo procesa video localmente (MediaPipe)
    ↓
3. IA detecta microsueño de 4.1 segundos
    ↓
4. INMEDIATAMENTE:
   - Alarma sonora se reproduce (50ms latencia)
   - Notificación en pantalla del dispositivo
    ↓
5. Evento se guarda en Room local con timestamp y GPS
    ↓
6. Sincronización detecta que NO HAY internet
   - Marca evento como "pendiente de sincronizar"
   - Sistema sigue funcionando normalmente
    ↓
7. 30 minutos después, chofer llega a zona con señal
    ↓
8. Sincronización automática detecta internet
   - Envía los 12 eventos acumulados en lote
   - Servidor los guarda en PostgreSQL
    ↓
9. Admin recibe notificación:
   "Chofer Juan Pérez estuvo sin señal 30 min.
    Se detectaron 12 eventos de somnolencia.
    Revisar histórico."
```

**Resultado:** El chofer estuvo SIEMPRE protegido, el admin solo perdió visibilidad temporal

---

# 📚 DOCUMENTACIÓN: ARQUITECTURA HÍBRIDA Edge Computing + Cloud Sync

## 🎯 Visión General

La **Arquitectura Híbrida Edge Computing + Cloud Sync** es un diseño de sistema que distribuye la responsabilidad del procesamiento en dos capas independientes pero complementarias:

1. **EDGE (Borde/Local):** Procesamiento crítico en el dispositivo del vehículo (funciona offline)
2. **CLOUD (Nube):** Almacenamiento centralizado y monitoreo administrativo (requiere internet)

### Principio Fundamental

- 🔴 **CRÍTICO (Edge):** Detección de somnolencia + Alertas
- 🟢 **IMPORTANTE (Cloud):** Monitoreo remoto + Histórico

**La seguridad del chofer NUNCA depende de internet.** El admin puede perder visibilidad temporal, pero el conductor siempre está protegido.

---

## 🏗 Arquitectura Completa del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                 VEHÍCULO DEL CHOFER                         │
│                (CAPA EDGE - OFFLINE)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🖥 Dispositivo Edge (Tablet Android)                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                                                        │ │
│ │ 🎥 Cámara captura video (30 FPS)                      │ │
│ │           ↓                                            │ │
│ │ 🧠 MediaPipe procesa landmarks (468 puntos faciales)  │ │
│ │           ↓                                            │ │
│ │ 🔍 Algoritmo IA detecta somnolencia                   │ │
│ │    (microsueños, bostezos, inclinación, etc.)        │ │
│ │           ↓                                            │ │
│ │ 🔔 SI DETECTA: Alarma sonora INMEDIATA (50ms)        │ │
│ │           ↓                                            │ │
│ │ 💾 Guarda evento en base de datos local Room          │ │
│ │    (timestamp, GPS, tipo, duración)                   │ │
│ │           ↓                                            │ │
│ │ 📍 GPS registra ubicación cada 30 segundos            │ │
│ │                                                        │ │
│ │ ✅ TODO FUNCIONA SIN INTERNET                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│              ↓↑ Sincronización Automática                  │
│          (Solo cuando HAY conexión WiFi/4G)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   SERVIDOR EN LA NUBE                       │
│              (CAPA CLOUD - REQUIERE INTERNET)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚙️ Backend FastAPI (tu código actual)                      │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                                                        │ │
│ │ 📥 Recibe eventos sincronizados desde vehículos       │ │
│ │    (solo JSON con metadatos, NO video)               │ │
│ │           ↓                                            │ │
│ │ 💾 Almacena en PostgreSQL central                     │ │
│ │           ↓                                            │ │
│ │ 🔄 Actualiza cola Redis (sincronización)              │ │
│ │           ↓                                            │ │
│ │ 📡 Envía actualización vía WebSocket a admin          │ │
│ │           ↓                                            │ │
│ │ 📧 Notifica si evento crítico (email/SMS)             │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│                ↓↑ Comunicación WebSocket                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                 DASHBOARD ADMINISTRADOR                     │
│                 (APLICACIÓN WEB REACT)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🗺 Mapa GPS interactivo                                    │
│    - Marcadores de choferes activos                        │
│    - Colores según estado (verde/amarillo/rojo)            │
│    - Última ubicación conocida si sin señal                │
│                                                             │
│ 📊 Panel de alertas en tiempo real                         │
│    - Notificaciones de eventos críticos                    │
│    - Historial de somnolencia por chofer                   │
│                                                             │
│ 📈 Reportes y estadísticas                                 │
│    - Gráficos de tendencias                                │
│    - Exportación CSV                                        │
│                                                             │
│ ℹ️ Datos actualizados cada 1-5 minutos                     │
│    (dependiendo de cobertura del chofer)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Funcionamiento Completo

### ESCENARIO 1: Chofer CON Conexión a Internet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECCIÓN LOCAL (Edge)                                  │
├─────────────────────────────────────────────────────────────┤
│ Tiempo T=0ms:  Cámara captura frame del conductor         │
│ Tiempo T=33ms: MediaPipe extrae 468 landmarks faciales    │
│ Tiempo T=50ms: IA detecta microsueño de 3.2 segundos      │
│ Tiempo T=60ms: 🔔 ALARMA SONORA SE REPRODUCE              │
│ Tiempo T=70ms: Evento guardado en Room local              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SINCRONIZACIÓN AUTOMÁTICA (Edge → Cloud)                │
├─────────────────────────────────────────────────────────────┤
│ Tiempo T+2seg: Proceso background detecta internet        │
│ Tiempo T+3seg: Envía JSON comprimido al servidor:         │
│    {                                                        │
│        "tipo": "microsueño",                               │
│        "duracion": 3.2,                                    │
│        "timestamp": "2025-11-10 14:23:45",                 │
│        "gps": {lat: -12.04, lon: -77.04},                 │
│        "velocidad": 85                                     │
│    }                                                        │
│ Tiempo T+4seg: Servidor confirma recepción                │
│ Tiempo T+5seg: Room marca evento como sincronizado        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ACTUALIZACIÓN DASHBOARD ADMIN (Cloud → Admin)           │
├─────────────────────────────────────────────────────────────┤
│ Tiempo T+6seg: Servidor guarda en PostgreSQL              │
│ Tiempo T+7seg: WebSocket envía notificación a admin       │
│ Tiempo T+8seg: Dashboard muestra alerta en tiempo real:   │
│                "🚨 Chofer Juan - Microsueño detectado"     │
│                Mapa actualiza marcador a color ROJO        │
│ Tiempo T+9seg: Admin puede llamar al chofer si necesario  │
└─────────────────────────────────────────────────────────────┘
```

---

### ESCENARIO 2: Chofer SIN Conexión a Internet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECCIÓN LOCAL (Edge - OFFLINE)                        │
├─────────────────────────────────────────────────────────────┤
│ Conductor viaja por zona rural sin señal 4G               │
│                                                             │
│ Tiempo T=0ms:  Cámara captura frame del conductor         │
│ Tiempo T=33ms: MediaPipe extrae landmarks                 │
│ Tiempo T=50ms: IA detecta bostezo de 5.1 segundos         │
│ Tiempo T=60ms: 🔔 ALARMA SONORA SE REPRODUCE              │
│ Tiempo T=70ms: Evento guardado en Room local              │
│                                                             │
│ ✅ CHOFER PROTEGIDO - Sistema funciona 100% normal        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BUFFER LOCAL ACUMULA EVENTOS (Edge)                     │
├─────────────────────────────────────────────────────────────┤
│ Durante 45 minutos sin señal, el sistema:                 │
│                                                             │
│ - Detecta 3 bostezos → Alarmas reproducidas ✅            │
│ - Detecta 1 microsueño → Alarma reproducida ✅            │
│ - Detecta 2 inclinaciones → Alarmas reproducidas ✅       │
│                                                             │
│ Todos los eventos guardados en Room local:                │
│ - 6 eventos totales con timestamps y GPS                  │
│ - Estado: "pendiente_sincronizar"                         │
│ - Tamaño total: ~8 KB (JSON)                              │
│                                                             │
│ ⚠️ ADMIN NO VE NADA (sin conexión del chofer)             │
│ ✅ CHOFER SIGUE PROTEGIDO (alarmas locales activas)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RECUPERACIÓN DE SEÑAL (Edge → Cloud)                    │
├─────────────────────────────────────────────────────────────┤
│ Minuto 45: Chofer llega a zona con cobertura 4G           │
│                                                             │
│ Tiempo T=0seg: Sistema detecta conexión a internet        │
│ Tiempo T=2seg: Lee 6 eventos pendientes de Room           │
│ Tiempo T=3seg: Envía lote (batch) al servidor:            │
│                [evento1, evento2, ..., evento6]            │
│ Tiempo T=5seg: Servidor recibe y procesa los 6 eventos    │
│ Tiempo T=6seg: Servidor confirma: "6 eventos guardados"   │
│ Tiempo T=7seg: Room marca los 6 como sincronizados        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ADMIN RECIBE HISTÓRICO (Cloud → Admin)                  │
├─────────────────────────────────────────────────────────────┤
│ Tiempo T=8seg: Dashboard admin recibe notificación:       │
│                                                             │
│ 📢 "Chofer Juan reconectado después de 45 min sin señal"  │
│ ⚠️ "Se detectaron 6 eventos de somnolencia:"              │
│    - 3 bostezos (14:15, 14:28, 14:42)                     │
│    - 1 microsueño (14:35)                                  │
│    - 2 inclinaciones (14:20, 14:50)                       │
│                                                             │
│ Mapa actualiza ruta completa con puntos GPS históricos    │
│ Admin puede revisar timeline completo del viaje           │
│ Admin puede llamar al chofer para verificar estado        │
└─────────────────────────────────────────────────────────────┘
```

**Resultado:** El chofer estuvo siempre protegido. El admin solo perdió visibilidad temporal, pero recupera el histórico completo al reconectar.

---

# 📱 OPCIÓN: Implementación con Aplicación Android Nativa

## 1. Hardware Necesario

```
┌──────────────────────────────────────────────────┐
│ DISPOSITIVO ANDROID EN EL VEHÍCULO              │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📱 Tablet Android (≥ Android 10)                │
│    - Mínimo: 4GB RAM, procesador octacore       │
│    - Recomendado: Samsung Galaxy Tab A9+        │
│    - Pantalla: 8-10 pulgadas                    │
│    - Cámara frontal: 8MP o superior             │
│    - GPS integrado                              │
│    - Batería: 5000+ mAh                         │
│                                                  │
│ 🔌 Cargador vehicular 12V USB-C (2.4A)         │
│    - Alimentación continua durante viaje        │
│                                                  │
│ 🗜 Soporte de tablero antivibración             │
│    - Montaje con ventosa o adhesivo             │
│    - Ángulo ajustable                           │
│                                                  │
│ 🔊 Altavoz Bluetooth (opcional)                 │
│    - Para alarma más potente que speaker tablet │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de la Aplicación Android

```
┌──────────────────────────────────────────────────┐
│ APP NATIVA ANDROID (Kotlin + Jetpack Compose)   │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📦 CAPAS DE LA APLICACIÓN:                      │
│                                                  │
│ 1. CAPA DE PRESENTACIÓN (UI)                    │
│    - Jetpack Compose (UI declarativa)           │
│    - ViewModel (estado de la app)               │
│    - Navigation Component (pantallas)           │
│                                                  │
│ 2. CAPA DE DOMINIO (Lógica IA)                  │
│    - MediaPipe Face Landmarker (nativo Android) │
│    - Algoritmos de detección de somnolencia     │
│    - TensorFlow Lite (modelo custom opcional)   │
│                                                  │
│ 3. CAPA DE DATOS                                │
│    - Room Database                              │
│    - DataStore (preferencias)                   │
│    - Retrofit (sincronización HTTP)             │
│                                                  │
│ 4. SERVICIOS EN BACKGROUND                      │
│    - CameraX (captura video)                    │
│    - WorkManager (sincronización periódica)     │
│    - ForegroundService (detección activa)       │
│    - LocationManager (GPS)                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 3. Funcionamiento de la App Android

### Inicio de Viaje

**1. AUTENTICACIÓN**
- Chofer abre app en tablet
- Login con credenciales (ID + contraseña)
- App valida con servidor (requiere internet inicial)
- Servidor retorna token JWT

**2. INICIAR MONITOREO**
- Chofer presiona "Comenzar Viaje"
- App solicita permisos:
  - Cámara
  - Ubicación (GPS)
  - Audio (alarma)
  - Notificaciones
- App crea registro en Room Database:
  ```sql
  INSERT INTO viajes (id_chofer, inicio, estado)
  ```

**3. PROCESAMIENTO EN FOREGROUND SERVICE**
- Service se ejecuta aunque app minimizada
- Muestra notificación persistente:
  ```
  "🚗 Sistema de detección activo"
  ```
- No se puede cerrar sin detener viaje

---

### Ciclo de Detección (Loop Principal)

```
LOOP INFINITO (30 FPS):

1. CameraX captura frame de cámara frontal
   - Resolución: 640x480
   - Formato: YUV_420_888

2. MediaPipe Face Landmarker procesa
   - Detecta rostro
   - Extrae 468 landmarks
   - Usa GPU del dispositivo (aceleración)

3. Algoritmo de Somnolencia analiza
   - Calcula distancias oculares (EAR)
   - Mide apertura bucal (MAR)
   - Determina ángulo de cabeza

4. SI DETECTA SOMNOLENCIA:
   - MediaPlayer reproduce alarma.mp3
     (volumen máximo, ignora "no molestar")
   - Vibrador activa patrón intenso
   - UI muestra alerta visual
   - Room Database inserta evento:
     INSERT INTO eventos_somnolencia (...)

5. GPS registra ubicación
   - LocationManager obtiene coordenadas
   - Actualiza cada 30 segundos
   - Asocia a evento si hubo alerta

6. Renderizar UI
   - Compose dibuja landmarks sobre video
   - Actualiza métricas en pantalla

REPETIR (cada 33ms → 30 FPS)
```

---

### Sincronización en Background

```
WorkManager (cada 2 minutos):

1. Verificar conectividad
   - ConnectivityManager.getActiveNetwork()
   - Si no hay WiFi/datos: CANCELAR, reintentar después

2. Consultar eventos no sincronizados
   - Room DAO: eventosDao.getNoSincronizados()
   - Serializar a JSON

3. Enviar al servidor
   - Retrofit POST a /api/v1/sync-events
   - Timeout: 30 segundos
   - Reintentos: 3 con backoff exponencial

4. Marcar como sincronizados
   - Room DAO: eventosDao.marcarSincronizados(ids)

5. Notificar al chofer (opcional)
   - "✅ Datos sincronizados con servidor"
```

---

## 🏗 Arquitectura Propuesta - Android App

```
┌─────────────────────────────────────────────────────────────┐
│                     ANDROID APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📱 CAPA DE PRESENTACIÓN (UI Layer)                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Jetpack Compose UI                                   │  │
│ │ ├─ Splash Screen                                     │  │
│ │ ├─ Login Screen (Auth con backend)                   │  │
│ │ ├─ Dashboard Chofer                                  │  │
│ │ ├─ Monitoring Screen (Vista de cámara + métricas)    │  │
│ │ ├─ Session History                                   │  │
│ │ └─ Settings                                          │  │
│ └──────────────────────────────────────────────────────┘  │
│                            ↕                                │
│ 🧠 CAPA DE LÓGICA (Domain Layer)                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Use Cases / Interactors                              │  │
│ │ ├─ StartMonitoringUseCase                            │  │
│ │ ├─ ProcessFrameUseCase                               │  │
│ │ ├─ TriggerAlertUseCase                               │  │
│ │ ├─ SyncDataUseCase                                   │  │
│ │ └─ TrackGPSUseCase                                   │  │
│ └──────────────────────────────────────────────────────┘  │
│                            ↕                                │
│ 💾 CAPA DE DATOS (Data Layer)                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Repositories (Single Source of Truth)                │  │
│ │ ├─ AuthRepository                                    │  │
│ │ ├─ SessionRepository                                 │  │
│ │ ├─ MetricsRepository                                 │  │
│ │ └─ SyncRepository                                    │  │
│ └──────────────────────────────────────────────────────┘  │
│                            ↕                                │
│ 🔌 SERVICIOS Y COMPONENTES                                 │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📷 CameraX Service                                   │  │
│ │    └─ Captura frames 30 FPS                          │  │
│ │                                                       │  │
│ │ 🧠 MediaPipe ML Service                              │  │
│ │    ├─ Face Mesh Detection                            │  │
│ │    ├─ Eye Aspect Ratio (EAR)                         │  │
│ │    ├─ Mouth Aspect Ratio (MAR)                       │  │
│ │    └─ Head Pose Estimation                           │  │
│ │                                                       │  │
│ │ 🔊 Alert Service (Foreground Service)                │  │
│ │    ├─ Audio alerts (MediaPlayer)                     │  │
│ │    ├─ Vibration (Vibrator)                           │  │
│ │    └─ Visual alerts (Notification)                   │  │
│ │                                                       │  │
│ │ 📡 GPS Service (LocationManager)                     │  │
│ │    └─ Track location every 30s                       │  │
│ │                                                       │  │
│ │ 💾 Local Database (Room)                             │  │
│ │    ├─ SessionEntity                                  │  │
│ │    ├─ MetricsEntity                                  │  │
│ │    └─ AlertEntity                                    │  │
│ │                                                       │  │
│ │ 🌐 Network Service (Retrofit + OkHttp)               │  │
│ │    ├─ API Client (FastAPI backend)                   │  │
│ │    └─ Background sync (WorkManager)                  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 🚀 Roadmap de Implementación (8 Semanas)

## Semana 1-2: Setup y Arquitectura Base

### ✅ Tareas:
1. Crear proyecto Android Studio (Kotlin + Compose)
2. Configurar dependencias (Hilt, Room, Retrofit)
3. Implementar arquitectura MVVM + Clean
4. Crear entidades de base de datos
5. Configurar Hilt modules
6. Implementar DataStore para preferencias
7. Crear tema Compose (colores, tipografía)

### 📦 Entregables:
- Proyecto compilable
- Base de datos funcionando
- Navegación básica
- Pantalla de login (UI only)

---

## Semana 3: Autenticación y API

### ✅ Tareas:
1. Implementar Retrofit client (integración con FastAPI)
2. Crear AuthRepository + AuthApi
3. Implementar LoginUseCase
4. Conectar LoginViewModel con backend
5. Manejo de tokens JWT
6. Auto-login con tokens guardados
7. Logout functionality

### 📦 Entregables:
- Login funcional con backend
- Persistencia de sesión
- Manejo de errores de red

---

## Semana 4: CameraX + Permisos

### ✅ Tareas:
1. Solicitar permisos de cámara (Accompanist Permissions)
2. Implementar CameraX preview
3. Captura de frames a 30 FPS
4. Conversión de ImageProxy a Bitmap
5. UI de monitoring screen con vista previa
6. Mostrar métricas simuladas en UI

### 📦 Entregables:
- Cámara funcionando
- Preview en pantalla
- Permisos manejados correctamente

---

## Semana 5: MediaPipe IA + Detección

### ✅ Tareas:
1. Integrar MediaPipe Face Landmarker
2. Cargar modelo .task desde assets
3. Implementar detección de rostro en frames
4. Calcular EAR (Eye Aspect Ratio)
5. Calcular MAR (Mouth Aspect Ratio)
6. Detectar inclinación de cabeza (Head Pose)
7. Algoritmo de detección de somnolencia
8. Contadores: parpadeos, bostezos, cabeceos

### 📦 Entregables:
- Detección facial funcionando
- Métricas calculadas en tiempo real
- Algoritmo de somnolencia operativo

---

## Semana 6: Alertas + GPS + Storage

### ✅ Tareas:
1. Implementar AlertService (Foreground Service)
2. Reproducción de sonidos de alerta
3. Vibración en alertas críticas
4. Notificaciones persistentes
5. Integrar GPS (FusedLocationProvider)
6. Guardar métricas en Room Database
7. Crear workers para limpieza de datos antiguos

### 📦 Entregables:
- Sistema de alertas funcionando
- GPS tracking activo
- Datos guardados localmente

---

## Semana 7-8: Sincronización + Testing

### ✅ Tareas:
1. Implementar SyncWorker (WorkManager)
2. Sync periódico cada 2-5 minutos
3. Retry logic con exponential backoff
4. Manejo de conectividad (online/offline)
5. Pruebas de integración
6. Pruebas de UI (Compose Test)
7. Optimización de rendimiento
8. Documentación de código

### 📦 Entregables:
- App completa funcionando
- Sync con backend operativo
- Tests pasando
- APK release listo

---

# 📚 Recursos y Documentación

## Documentación Oficial:

- **Android Developers:** https://developer.android.com
- **Jetpack Compose:** https://developer.android.com/jetpack/compose
- **MediaPipe:** https://developers.google.com/mediapipe
- **CameraX:** https://developer.android.com/training/camerax

## Tutoriales Recomendados:

- **MediaPipe Face Landmarker Android:**
  https://developers.google.com/mediapipe/solutions/vision/face_landmarker/android

- **Jetpack Compose Tutorial:**
  https://developer.android.com/courses/jetpack-compose/course

- **Clean Architecture Android:**
  https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

## Repositorios Ejemplo:

- https://github.com/android/compose-samples
- https://github.com/google/mediapipe/tree/master/mediapipe/examples/android

---

# 🎯 Conclusión

Esta documentación presenta una **solución arquitectónica híbrida** que garantiza:

1. ✅ **Seguridad crítica:** Alertas funcionan sin internet
2. ✅ **Escalabilidad:** Soporta flotas grandes
3. ✅ **Confiabilidad:** 0% pérdida de datos
4. ✅ **Eficiencia:** Bajo consumo de datos
5. ✅ **Profesionalismo:** Cumple estándares de la industria

La implementación con **Android nativo** es la opción recomendada para sistemas de seguridad vehicular, priorizando la **protección del conductor** sobre la conectividad administrativa.

---

**Documentación generada para el Sistema de Detección de Somnolencia**  
**Versión:** 1.0  
**Fecha:** Noviembre 2025
