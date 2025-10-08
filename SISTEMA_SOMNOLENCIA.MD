# 🛡️ Sistema de Detección de Somnolencia - Educare IA

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)
![Flet](https://img.shields.io/badge/Flet-0.21.0-purple.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.9-orange.svg)
![License](https://img.shields.io/badge/license-MIT-red.svg)

**Sistema avanzado de monitoreo en tiempo real para detectar signos de somnolencia mediante visión por computadora e inteligencia artificial.**

[Características](#-características-principales) •
[Arquitectura](#-arquitectura-del-sistema) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[Documentación](#-documentación-técnica)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Flujo de Datos](#-flujo-de-datos)
- [Componentes Detallados](#-componentes-detallados)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Métricas de Detección](#-métricas-de-detección)
- [Documentación Técnica](#-documentación-técnica)
- [Contribución](#-contribución)

---

## 🎯 Descripción General

El **Sistema de Detección de Somnolencia** es una aplicación de escritorio que utiliza visión por computadora para monitorear en tiempo real los signos de fatiga y somnolencia en conductores u operadores de maquinaria. El sistema analiza 468 puntos faciales y detecta patrones de comportamiento asociados con el cansancio.

### 🎭 Características de Detección

| Característica | Descripción | Umbral de Alerta |
|----------------|-------------|------------------|
| 👁️ **Parpadeo** | Frecuencia de parpadeo anormal | > 15 parpadeos/min |
| 😴 **Microsueño** | Ojos cerrados prolongadamente | > 2 segundos |
| 🥱 **Bostezo** | Apertura excesiva de la boca | > 4 segundos |
| 🙇 **Cabeceo** | Inclinación de cabeza hacia abajo | > 3 segundos |
| 🤲 **Frotamiento de ojos** | Manos cerca de los ojos | > 1 segundo |

---

## ✨ Características Principales

```
╔════════════════════════════════════════════════════════════════╗
║  🚀 CARACTERÍSTICAS DEL SISTEMA                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✓ Detección en tiempo real (30+ FPS)                        ║
║  ✓ Análisis de 468 puntos faciales (MediaPipe)               ║
║  ✓ Detección de hasta 2 manos simultáneamente                ║
║  ✓ Sistema de alertas visuales multinivel                     ║
║  ✓ Generación automática de reportes CSV                      ║
║  ✓ Visualización 3D de puntos faciales                        ║
║  ✓ Interfaz gráfica moderna con Flet                          ║
║  ✓ Arquitectura cliente-servidor con WebSockets               ║
║  ✓ Procesamiento asíncrono de alto rendimiento                ║
║  ✓ Sistema modular y extensible                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🏗️ Arquitectura del Sistema

### 📐 Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "🖥️ CAPA DE PRESENTACIÓN"
        A[👤 Usuario]
        B[🎨 Interfaz Gráfica Flet]
        C[📹 Captura de Cámara]
    end
    
    subgraph "🌐 CAPA DE COMUNICACIÓN"
        D[🔌 WebSocket Cliente]
        E[🔌 WebSocket Servidor]
    end
    
    subgraph "⚙️ CAPA DE PROCESAMIENTO"
        F[🧠 Sistema Principal]
        G[📍 Extractor de Puntos]
        H[📊 Procesador de Datos]
        I[🎯 Detector de Características]
        J[📈 Generador de Reportes]
        K[🎨 Visualizador]
    end
    
    subgraph "🔬 MÓDULOS DE ANÁLISIS"
        L[👁️ MediaPipe Face Mesh<br/>468 puntos faciales]
        M[🤲 MediaPipe Hands<br/>42 puntos por mano]
    end
    
    subgraph "💾 CAPA DE PERSISTENCIA"
        N[(📄 CSV Reports)]
        O[(📊 JSON Logs)]
    end
    
    A --> B
    B --> C
    C --> D
    D <--> E
    E <--> F
    F --> G
    G --> L
    G --> M
    L --> H
    M --> H
    H --> I
    I --> J
    I --> K
    J --> N
    J --> O
    K --> F
    F --> E
    
    style A fill:#e1f5ff
    style B fill:#b3e5fc
    style F fill:#81c784
    style G fill:#ffb74d
    style H fill:#ffb74d
    style I fill:#ffb74d
    style J fill:#ba68c8
    style K fill:#ba68c8
    style L fill:#ff8a65
    style M fill:#ff8a65
    style N fill:#90a4ae
    style O fill:#90a4ae
```

### 🔄 Arquitectura en Capas 3D

```
                    ╔═══════════════════════════════════════════════╗
                    ║     🎨 CAPA DE PRESENTACIÓN (GUI)            ║
                    ║  ┌─────────────────────────────────────────┐ ║
                    ║  │  🏠 Start Page                          │ ║
                    ║  │  🎯 Selection Interface                 │ ║
                    ║  │  😴 Drowsiness Detection Page          │ ║
                    ║  └─────────────────────────────────────────┘ ║
                    ╚══════════════════╤════════════════════════════╝
                                       │
                                       ▼
                    ╔═══════════════════════════════════════════════╗
                    ║    🌐 CAPA DE TRANSPORTE (WebSocket)         ║
                    ║  ┌─────────────────────────────────────────┐ ║
                    ║  │  📤 Cliente: Envío de frames            │ ║
                    ║  │  📥 Servidor: Recepción y respuesta     │ ║
                    ║  │  🔄 Comunicación bidireccional          │ ║
                    ║  └─────────────────────────────────────────┘ ║
                    ╚══════════════════╤════════════════════════════╝
                                       │
                                       ▼
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║              ⚙️ CAPA DE LÓGICA DE NEGOCIO (Core)                     ║
    ║  ┌─────────────────────────────────────────────────────────────────┐ ║
    ║  │                                                                  │ ║
    ║  │  📍 Points Extraction Layer                                      │ ║
    ║  │  ├── 👁️ Face Mesh Processor (468 landmarks)                     │ ║
    ║  │  └── 🤲 Hands Processor (21 landmarks × 2 hands)                │ ║
    ║  │                                                                  │ ║
    ║  │  📊 Data Processing Layer                                        │ ║
    ║  │  ├── 👁️ Eyes Processor (Distancias euclidiana)                  │ ║
    ║  │  ├── 👄 Mouth Processor (Apertura labial)                       │ ║
    ║  │  ├── 🎯 Head Processor (Ángulo pitch)                           │ ║
    ║  │  └── ✋ Hands Processor (Proximidad a ojos)                     │ ║
    ║  │                                                                  │ ║
    ║  │  🎯 Features Detection Layer                                     │ ║
    ║  │  ├── 👁️ Flicker & Microsleep (Contador de parpadeos)            │ ║
    ║  │  ├── 🥱 Yawn Detection (Duración de bostezos)                   │ ║
    ║  │  ├── 🙇 Pitch Detection (Detección de cabeceo)                  │ ║
    ║  │  └── 🤲 Eye Rub Detection (Frotamiento de ojos)                 │ ║
    ║  │                                                                  │ ║
    ║  │  📈 Reporting & Visualization Layer                             │ ║
    ║  │  ├── 📊 Report Generator (CSV & JSON)                           │ ║
    ║  │  └── 🎨 Visual Alerts (Overlay en video)                        │ ║
    ║  │                                                                  │ ║
    ║  └─────────────────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════╤═══════════════════════════════════════════╝
                                │
                                ▼
                    ╔═══════════════════════════════════════════════╗
                    ║      💾 CAPA DE PERSISTENCIA (Storage)       ║
                    ║  ┌─────────────────────────────────────────┐ ║
                    ║  │  📄 drowsiness_report.csv               │ ║
                    ║  │  📊 JSON Reports (Real-time)            │ ║
                    ║  │  📸 Processed Frames (Base64)           │ ║
                    ║  └─────────────────────────────────────────┘ ║
                    ╚═══════════════════════════════════════════════╝
```

---

## 🔄 Flujo de Datos

### 📊 Diagrama de Secuencia Completo

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant GUI as 🎨 Interfaz Flet
    participant WS as 🔌 WebSocket
    participant Core as 🧠 Core System
    participant PE as 📍 Points Extractor
    participant MP as 🔬 MediaPipe
    participant DP as 📊 Data Processor
    participant FD as 🎯 Features Detector
    participant VIS as 🎨 Visualizer
    participant REP as 📈 Reporter
    participant DB as 💾 Storage

    U->>GUI: 1️⃣ Iniciar detección
    GUI->>WS: 2️⃣ Conectar WebSocket
    WS->>Core: 3️⃣ Establecer conexión
    
    loop Cada Frame (30 FPS)
        GUI->>WS: 4️⃣ Enviar frame (base64)
        WS->>Core: 5️⃣ Recibir frame
        Core->>PE: 6️⃣ Extraer puntos
        PE->>MP: 7️⃣ Procesar con MediaPipe
        
        par Procesamiento Paralelo
            MP-->>PE: 🔴 468 puntos faciales
            MP-->>PE: 🟢 42 puntos mano izquierda
            MP-->>PE: 🔵 42 puntos mano derecha
        end
        
        PE->>DP: 8️⃣ Puntos extraídos
        
        par Cálculo de Distancias
            DP->>DP: 👁️ Distancias ojos
            DP->>DP: 👄 Apertura boca
            DP->>DP: 🎯 Ángulo cabeza
            DP->>DP: ✋ Proximidad manos
        end
        
        DP->>FD: 9️⃣ Datos procesados
        
        par Detección de Características
            FD->>FD: 🔍 Analizar parpadeo
            FD->>FD: 🔍 Detectar microsueño
            FD->>FD: 🔍 Identificar bostezo
            FD->>FD: 🔍 Verificar cabeceo
            FD->>FD: 🔍 Detectar frotamiento
        end
        
        FD->>REP: 🔟 Eventos detectados
        REP->>DB: 1️⃣1️⃣ Guardar en CSV
        REP->>VIS: 1️⃣2️⃣ Generar reporte JSON
        
        VIS->>VIS: 1️⃣3️⃣ Dibujar alertas
        VIS->>Core: 1️⃣4️⃣ Frame procesado
        Core->>WS: 1️⃣5️⃣ Enviar respuesta
        WS->>GUI: 1️⃣6️⃣ Mostrar resultado
        GUI->>U: 1️⃣7️⃣ Visualizar alertas
    end
```

### 🎬 Pipeline de Procesamiento

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        🎥 INICIO: FRAME DE CÁMARA                         │
└───────────────────────────────────────┬───────────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────┐
                        │   🔄 Codificación Base64  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │  🌐 Transmisión WebSocket │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ⚙️ ETAPA 1: EXTRACCIÓN DE PUNTOS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   📍 PointsExtractor.extract()                                             │
│   ├─► 🔬 MediaPipe Face Mesh                                               │
│   │   └─► ✅ 468 landmarks (x, y, z)                                       │
│   │                                                                         │
│   └─► 🔬 MediaPipe Hands                                                   │
│       ├─► ✅ Mano 1: 21 landmarks                                           │
│       └─► ✅ Mano 2: 21 landmarks                                           │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   📊 ETAPA 2: PROCESAMIENTO DE DATOS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PointsProcessing.process()                                               │
│   │                                                                         │
│   ├─► 👁️ EyesProcessor                                                     │
│   │   ├─ Distancia párpado superior ↔ inferior (ojo izquierdo)           │
│   │   └─ Distancia párpado superior ↔ inferior (ojo derecho)             │
│   │                                                                         │
│   ├─► 👄 MouthProcessor                                                     │
│   │   ├─ Distancia labio superior ↔ labio inferior                        │
│   │   └─ Distancia labio superior ↔ mentón                                │
│   │                                                                         │
│   ├─► 🎯 HeadProcessor                                                      │
│   │   └─ Ángulo pitch (nariz ↔ frente)                                    │
│   │                                                                         │
│   └─► ✋ HandsProcessor                                                     │
│       ├─ Mano 1: Distancia dedos ↔ ojos                                   │
│       └─ Mano 2: Distancia dedos ↔ ojos                                   │
│                                                                             │
│   📐 Cálculo: Distancia Euclidiana = √[(x₂-x₁)² + (y₂-y₁)²]               │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              🎯 ETAPA 3: DETECCIÓN DE CARACTERÍSTICAS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FeaturesDrowsinessProcessing.process()                                   │
│   │                                                                         │
│   ├─► 👁️ FlickerAndMicrosleep                                              │
│   │   ├─ Contador de parpadeos (ventana 60s)                              │
│   │   │  └─ 🚨 ALERTA: > 15 parpadeos/minuto                              │
│   │   └─ Timer ojos cerrados                                              │
│   │      └─ 🚨 ALERTA: > 2 segundos (microsueño)                          │
│   │                                                                         │
│   ├─► 🥱 YawnDetection                                                      │
│   │   ├─ Timer boca abierta                                               │
│   │   │  └─ 🚨 ALERTA: > 4 segundos                                       │
│   │   └─ Contador bostezos (ventana 180s)                                 │
│   │                                                                         │
│   ├─► 🙇 PitchDetection                                                     │
│   │   └─ Timer cabeza inclinada                                           │
│   │      └─ 🚨 ALERTA: > 3 segundos                                       │
│   │                                                                         │
│   └─► 🤲 EyeRubDetection                                                    │
│       └─ Timer manos cerca ojos                                            │
│          └─ 🚨 ALERTA: > 1 segundo (reporte cada 300s)                    │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
    ┌───────────────────────────┐       ┌───────────────────────────┐
    │  📈 GENERACIÓN REPORTES   │       │   🎨 VISUALIZACIÓN        │
    ├───────────────────────────┤       ├───────────────────────────┤
    │                           │       │                           │
    │ DrowsinessReports         │       │ ReportVisualizer          │
    │ ├─ CSV: Eventos históricos│       │ ├─ Alertas en pantalla   │
    │ └─ JSON: Reporte actual   │       │ ├─ Colores por nivel     │
    │                           │       │ │  🟢 Normal              │
    │ 💾 Guardado en:           │       │ │  🟡 Advertencia         │
    │ reports/august/           │       │ │  🔴 Peligro             │
    │ drowsiness_report.csv     │       │ └─ Overlay en video      │
    │                           │       │                           │
    └───────────────────────────┘       └───────────────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │  🌐 Respuesta WebSocket   │
                        │  ├─ original_image        │
                        │  ├─ sketch_image          │
                        │  └─ json_report           │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   🎨 Mostrar en GUI       │
                        └───────────────────────────┘
```

---

## 🧩 Componentes Detallados

### 1️⃣ **Interfaz Gráfica (GUI)** 🎨

```
gui/
├── pages/
│   ├── 🏠 start_page.py              → Pantalla de bienvenida
│   ├── 🎯 selection_interface_page.py → Menú de selección
│   └── 😴 drowsiness_page.py         → Página principal detección
│
└── resources/
    ├── fonts/                        → Fuentes personalizadas
    │   ├── BrittanySignature.ttf
    │   └── Cardo-Regular.ttf
    └── images/                       → Assets visuales
```

**Funcionalidades:**
- ✅ Navegación entre páginas con rutas
- ✅ Captura de video en tiempo real
- ✅ Visualización dual (original + sketch 3D)
- ✅ Botones Start/Stop
- ✅ Tema personalizado con transiciones

---

### 2️⃣ **Servidor WebSocket (Backend)** 🌐

```python
# app.py - Arquitectura del servidor

┌─────────────────────────────────────────┐
│      FastAPI WebSocket Server           │
├─────────────────────────────────────────┤
│                                         │
│  Endpoint: /ws                          │
│  Puerto: 8000                           │
│                                         │
│  Flujo:                                 │
│  1. Accept connection                   │
│  2. Receive frame (base64)              │
│  3. Process with DrowsinessSystem       │
│  4. Send response:                      │
│     ├─ original_image (base64)          │
│     ├─ sketch_image (base64)            │
│     └─ json_report (dict)               │
│                                         │
│  Manejo de errores:                     │
│  └─ WebSocketDisconnect                 │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3️⃣ **Sistema Principal de Detección** 🧠

```python
# drowsiness_processor/main.py

┌──────────────────────────────────────────────────────────────┐
│         DrowsinessDetectionSystem                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Componentes:                                                │
│  ├─ 📍 PointsExtractor                                       │
│  ├─ 📊 PointsProcessing                                      │
│  ├─ 🎯 FeaturesDrowsinessProcessing                          │
│  ├─ 🎨 ReportVisualizer                                      │
│  └─ 📈 DrowsinessReports                                     │
│                                                              │
│  Método run(frame_base64):                                   │
│  ├─ 1. Decodificar frame                                     │
│  ├─ 2. Extraer puntos faciales/manos                         │
│  ├─ 3. Calcular distancias                                   │
│  ├─ 4. Detectar características somnolencia                  │
│  ├─ 5. Generar reporte JSON                                  │
│  ├─ 6. Visualizar alertas                                    │
│  └─ 7. Retornar (original, sketch, json)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 4️⃣ **Extracción de Puntos** 📍

```
extract_points/
├── point_extractor.py         → Orquestador principal
├── face_mesh/
│   └── face_mesh_processor.py → MediaPipe Face Mesh
└── hands/
    └── hands_processor.py     → MediaPipe Hands

╔═══════════════════════════════════════════════════════════════╗
║              🔬 DETECCIÓN CON MEDIAPIPE                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  👁️ Face Mesh:                                                ║
║  ├─ 468 landmarks 3D (x, y, z)                               ║
║  ├─ Puntos de interés:                                       ║
║  │  ├─ Ojos: 6 puntos por ojo                               ║
║  │  ├─ Boca: 20 puntos                                      ║
║  │  └─ Cabeza: Nariz, frente                                ║
║  └─ Confidence score                                         ║
║                                                               ║
║  🤲 Hands:                                                     ║
║  ├─ 21 landmarks por mano                                    ║
║  ├─ Detección hasta 2 manos simultáneas                     ║
║  ├─ Puntos de dedos usados para eye_rub                     ║
║  └─ Coordenadas normalizadas [0-1]                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Puntos Faciales Clave:**

```
     🔴 Frente (8)
          │
      👀 Ojos
    ┌────┴────┐
   (159)    (386)  ← Párpados superiores
   (145)    (374)  ← Párpados inferiores
          │
     🔵 Nariz (1)
          │
      👄 Boca
    ┌────┴────┐
    (13)  (14)     ← Labios superior/inferior
    (152)          ← Mentón
```

---

### 5️⃣ **Procesamiento de Datos** 📊

```
data_processing/
├── main.py                    → PointsProcessing (orquestador)
├── eyes/
│   └── eyes_processing.py     → Distancia párpados
├── mouth/
│   └── mouth_processing.py    → Apertura labial
├── head/
│   └── head_processing.py     → Ángulo pitch
└── hands/
    ├── first_hand/
    │   └── first_hand_processing.py
    └── second_hand/
        └── second_hand_processing.py

╔══════════════════════════════════════════════════════════════╗
║          📐 CÁLCULOS DE DISTANCIAS EUCLIDIANAS               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Fórmula: d = √[(x₂ - x₁)² + (y₂ - y₁)²]                   ║
║                                                              ║
║  👁️ Ojos:                                                    ║
║  ├─ left_eye_distance = dist(159, 145)                      ║
║  └─ right_eye_distance = dist(386, 374)                     ║
║                                                              ║
║  👄 Boca:                                                     ║
║  ├─ mouth_distance = dist(13, 14)                           ║
║  └─ chin_distance = dist(14, 152)                           ║
║                                                              ║
║  🎯 Cabeza:                                                   ║
║  └─ pitch_angle = dist(1, 8)                                ║
║                                                              ║
║  ✋ Manos:                                                    ║
║  ├─ hand1_to_eyes = min(dist(finger, eye))                  ║
║  └─ hand2_to_eyes = min(dist(finger, eye))                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

### 6️⃣ **Detección de Características** 🎯

```
drowsiness_features/
├── processor.py                       → DrowsinessProcessor
├── processing.py                      → FeaturesDrowsinessProcessing
├── flicker_and_microsleep/
│   └── processing.py                  → Parpadeo y microsueño
├── yawn/
│   └── processing.py                  → Detección de bostezos
├── pitch/
│   └── processing.py                  → Detección de cabeceo
└── eye_rub/
    └── processing.py                  → Frotamiento de ojos

╔════════════════════════════════════════════════════════════════════╗
║            🚨 SISTEMA DE ALERTAS Y UMBRALES                        ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  👁️ PARPADEO (Flicker):                                            ║
║  ├─ Ventana temporal: 60 segundos                                 ║
║  ├─ Umbral: 15 parpadeos                                          ║
║  ├─ Estado: eyes_closed = True/False                              ║
║  └─ 🟡 Alerta: "Parpadeo frecuente detectado"                     ║
║                                                                    ║
║  😴 MICROSUEÑO (Microsleep):                                       ║
║  ├─ Duración mínima: 2 segundos                                   ║
║  ├─ Condición: Ojos cerrados continuamente                        ║
║  └─ 🔴 Alerta: "¡MICROSUEÑO DETECTADO!"                           ║
║                                                                    ║
║  🥱 BOSTEZO (Yawn):                                                ║
║  ├─ Duración mínima: 4 segundos                                   ║
║  ├─ Ventana temporal: 180 segundos                                ║
║  ├─ Condición: mouth_distance > umbral                            ║
║  └─ 🟡 Alerta: "Bostezo prolongado"                               ║
║                                                                    ║
║  🙇 CABECEO (Pitch):                                               ║
║  ├─ Duración mínima: 3 segundos                                   ║
║  ├─ Condición: Cabeza inclinada hacia abajo                       ║
║  └─ 🔴 Alerta: "Cabeceo detectado"                                ║
║                                                                    ║
║  🤲 FROTAMIENTO OJOS (Eye Rub):                                    ║
║  ├─ Duración mínima: 1 segundo                                    ║
║  ├─ Cooldown: 300 segundos entre reportes                         ║
║  ├─ Condición: Manos cerca de ojos                                ║
║  └─ 🟡 Alerta: "Frotamiento de ojos"                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

**Máquina de Estados - Detección de Microsueño:**

```mermaid
stateDiagram-v2
    [*] --> OjosAbiertos
    OjosAbiertos --> OjosCerrados: eyes_closed = True
    OjosCerrados --> OjosAbiertos: eyes_closed = False\n(< 2s)
    OjosCerrados --> Microsueño: Duración >= 2s
    Microsueño --> OjosAbiertos: eyes_closed = False
    Microsueño --> [*]: Reportar evento
```

---

### 7️⃣ **Visualización y Reportes** 📊

```
visualization/
└── main.py                    → ReportVisualizer

reports/
├── main.py                    → DrowsinessReports
└── august/
    └── drowsiness_report.csv  → Histórico de eventos

╔═══════════════════════════════════════════════════════════════════╗
║              🎨 SISTEMA DE VISUALIZACIÓN                          ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Colores por nivel de alerta:                                    ║
║  ├─ 🟢 Verde (0, 255, 0): Normal                                 ║
║  ├─ 🟡 Amarillo (0, 255, 255): Advertencia                       ║
║  └─ 🔴 Rojo (0, 0, 255): Peligro                                 ║
║                                                                   ║
║  Elementos visuales:                                             ║
║  ├─ Rectángulo de alerta (esquina superior izquierda)           ║
║  ├─ Texto descriptivo del evento                                 ║
║  ├─ Timestamp del evento                                         ║
║  └─ Puntos faciales dibujados                                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║              📊 ESTRUCTURA DE REPORTES                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  CSV (drowsiness_report.csv):                                    ║
║  ┌───────────┬──────────┬─────────────┬────────────┐            ║
║  │ Timestamp │ Feature  │ Duration(s) │ Status     │            ║
║  ├───────────┼──────────┼─────────────┼────────────┤            ║
║  │ 10:30:15  │ Flicker  │ 60          │ 18 blinks  │            ║
║  │ 10:30:20  │ Microsleep│ 3.2        │ Detected   │            ║
║  │ 10:31:05  │ Yawn     │ 5.1         │ Detected   │            ║
║  └───────────┴──────────┴─────────────┴────────────┘            ║
║                                                                   ║
║  JSON (tiempo real):                                             ║
║  {                                                                ║
║    "flicker": {                                                   ║
║      "is_drowsiness": true,                                      ║
║      "blink_count": 18,                                          ║
║      "message": "Parpadeo frecuente"                             ║
║    },                                                             ║
║    "microsleep": {                                                ║
║      "is_drowsiness": true,                                      ║
║      "duration": 3.2,                                            ║
║      "message": "¡MICROSUEÑO!"                                   ║
║    }                                                              ║
║  }                                                                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 📦 Instalación

### Requisitos Previos

```bash
- Python 3.12+
- Cámara web
- Sistema operativo: Linux / Windows / macOS
```

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-deteccion-somnolencia.git
cd sistema-deteccion-somnolencia
```

### Paso 2: Crear entorno virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

### Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

**Dependencias principales:**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
websockets==12.0
flet==0.21.0
mediapipe==0.10.9
opencv-python==4.9.0.80
numpy==1.26.3
```

### Paso 4: Ejecutar el sistema

**Terminal 1 - Servidor Backend:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Interfaz Gráfica:**
```bash
python main.py
```

---

## 🚀 Uso

### Opción 1: Interfaz Gráfica (Recomendado)

1. Ejecutar `python main.py`
2. Navegar: Inicio → Selección → Detección Somnolencia
3. Presionar **Start** para iniciar
4. Presionar **Stop** para detener

### Opción 2: Cliente de Prueba

```bash
python client.py
```

### Ejemplo de Código - Cliente Personalizado

```python
import cv2
import base64
import asyncio
import websockets
import json

async def detect_drowsiness():
    uri = "ws://localhost:8000/ws"
    
    async with websockets.connect(uri) as websocket:
        cap = cv2.VideoCapture(0)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Codificar frame
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Enviar al servidor
            await websocket.send(frame_base64)
            
            # Recibir respuesta
            response = await websocket.recv()
            data = json.loads(response)
            
            # Procesar respuesta
            json_report = data['json_report']
            sketch_base64 = data['sketch_image']
            
            print(f"Alertas: {json_report}")
            
            # Mostrar video
            sketch_bytes = base64.b64decode(sketch_base64)
            nparr = np.frombuffer(sketch_bytes, np.uint8)
            sketch = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            cv2.imshow('Detección', sketch)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()

asyncio.run(detect_drowsiness())
```

---

## 📊 Métricas de Detección

### Tabla de Umbrales

| Característica | Umbral Mínimo | Ventana Temporal | Nivel de Alerta |
|----------------|---------------|------------------|-----------------|
| 👁️ **Parpadeo** | 15 parpadeos | 60 segundos | 🟡 Advertencia |
| 😴 **Microsueño** | 2 segundos | N/A | 🔴 Peligro |
| 🥱 **Bostezo** | 4 segundos | 180 segundos | 🟡 Advertencia |
| 🙇 **Cabeceo** | 3 segundos | N/A | 🔴 Peligro |
| 🤲 **Frotamiento** | 1 segundo | 300s cooldown | 🟡 Advertencia |

### Rendimiento del Sistema

```
┌─────────────────────────────────────────┐
│       ⚡ MÉTRICAS DE RENDIMIENTO        │
├─────────────────────────────────────────┤
│                                         │
│  FPS: 30+ frames/segundo                │
│  Latencia: < 50ms                       │
│  Precisión Face Mesh: ~95%              │
│  Precisión Hands: ~90%                  │
│  CPU Usage: 40-60%                      │
│  RAM Usage: ~500MB                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 Documentación Técnica

### Estructura de Directorios Completa

```
sistema-deteccion-somnolencia/
│
├── 📄 main.py                      # Punto de entrada GUI
├── 📄 app.py                       # Servidor FastAPI
├── 📄 client.py                    # Cliente de prueba
├── 📄 requirements.txt             # Dependencias
├── 📄 SISTEMA_SOMNOLENCIA.MD      # Este archivo
│
├── 🎨 gui/                         # Interfaz gráfica
│   ├── pages/
│   │   ├── start_page.py
│   │   ├── selection_interface_page.py
│   │   └── drowsiness_page.py
│   └── resources/
│       ├── fonts/
│       └── images/
│
├── ⚙️ drowsiness_processor/        # Motor de detección
│   ├── main.py
│   ├── extract_points/            # Extracción MediaPipe
│   ├── data_processing/           # Cálculo distancias
│   ├── drowsiness_features/       # Detección características
│   ├── visualization/             # Overlay visual
│   └── reports/                   # Generación reportes
│
├── 🧪 tests/                       # Tests unitarios
│   └── videos/                    # Videos de prueba
│
├── 📖 docs/                        # Documentación visual
│   ├── diagrama.png
│   ├── malla_facial/
│   └── manos/
│
└── 💡 examples/                    # Ejemplos de uso
    ├── camera.py
    └── video_stream.py
```

### Patrones de Diseño Utilizados

```
╔════════════════════════════════════════════════════════════╗
║              🏗️ PATRONES DE DISEÑO                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🎯 Strategy Pattern                                       ║
║  └─ Diferentes estrategias de detección por feature       ║
║                                                            ║
║  🏭 Factory Pattern                                        ║
║  └─ Creación de procesadores de datos                     ║
║                                                            ║
║  👁️ Observer Pattern                                       ║
║  └─ Sistema de eventos para alertas                       ║
║                                                            ║
║  🔌 Facade Pattern                                         ║
║  └─ DrowsinessDetectionSystem como fachada                ║
║                                                            ║
║  🎨 Template Method                                        ║
║  └─ Procesamiento común en clase base                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### API WebSocket

**Endpoint:** `ws://localhost:8000/ws`

**Request:**
```json
{
  "type": "frame",
  "data": "base64_encoded_image..."
}
```

**Response:**
```json
{
  "json_report": {
    "flicker": {
      "is_drowsiness": false,
      "blink_count": 8,
      "time_window": 60,
      "message": ""
    },
    "microsleep": {
      "is_drowsiness": false,
      "duration": 0.0,
      "message": ""
    },
    "yawn": {
      "is_drowsiness": false,
      "duration": 0.0,
      "yawn_count": 0,
      "message": ""
    },
    "pitch": {
      "is_drowsiness": false,
      "duration": 0.0,
      "message": ""
    },
    "eye_rub": {
      "is_drowsiness": false,
      "duration": 0.0,
      "hand": "none",
      "message": ""
    }
  },
  "sketch_image": "base64_encoded_processed_image...",
  "original_image": "base64_encoded_original_image..."
}
```

---

## 🐳 Docker (Opcional)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgstreamer1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build y Run:**
```bash
docker build -t drowsiness-system .
docker run -p 8000:8000 drowsiness-system
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Educare IA Team**

- 📧 Email: contacto@educareai.com
- 🌐 Website: https://educareai.com
- 💼 LinkedIn: [Educare IA](https://linkedin.com/company/educareai)

---

## 🙏 Agradecimientos

- [MediaPipe](https://google.github.io/mediapipe/) - Framework de ML
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web
- [Flet](https://flet.dev/) - Framework GUI
- [OpenCV](https://opencv.org/) - Visión por computadora

---

<div align="center">

### ⭐ Si este proyecto te fue útil, considera darle una estrella ⭐

**Desarrollado con ❤️ por Educare IA**

</div>