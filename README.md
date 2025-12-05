# 🚗 Sistema de Detección de Somnolencia en Conductores

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/Python-3.12+-yellow.svg)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9+-purple.svg)
![React](https://img.shields.io/badge/React-18+-cyan.svg)

**Sistema integral de monitoreo de somnolencia para conductores profesionales mediante Inteligencia Artificial**

[Características](#-características) •
[Arquitectura](#-arquitectura) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[API](#-documentación-api) •
[Contribuir](#-contribuir)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
  - [Backend (FastAPI)](#1-backend-fastapi)
  - [Frontend Web (React)](#2-frontend-web-react)
  - [App Móvil (Android)](#3-app-móvil-android)
- [Base de Datos](#-base-de-datos)
- [Documentación API](#-documentación-api)
- [Flujos del Sistema](#-flujos-del-sistema)
- [Seguridad](#-seguridad)
- [Pruebas](#-pruebas)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripción General

El **Sistema de Detección de Somnolencia** es una solución tecnológica integral diseñada para prevenir accidentes de tránsito causados por fatiga o somnolencia en conductores profesionales. Utiliza **Inteligencia Artificial** y **Computer Vision** para detectar en tiempo real signos de somnolencia y alertar inmediatamente al conductor.

### 🏗 Componentes del Sistema

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| **Backend API** | FastAPI (Python) | API REST + WebSockets para gestión y tiempo real |
| **Frontend Web** | React + TypeScript | Panel de administración para supervisores |
| **App Móvil** | Android (Kotlin) | Aplicación de detección con MediaPipe |
| **Base de Datos** | PostgreSQL | Almacenamiento persistente de datos |

---

## ✨ Características

### 🔍 Detección de Somnolencia (IA)

- **Microsueño**: Ojos cerrados ≥ 2 segundos
- **Cabeceo**: Inclinación de cabeza ≥ 3 segundos
- **Parpadeo Excesivo**: > 20 parpadeos en 60 segundos
- **Bostezo Frecuente**: > 3 bostezos en 180 segundos
- **Frotamiento de Ojos**: > 3 frotamientos en 300 segundos

### 📱 Aplicación Móvil

- ✅ Procesamiento **100% local** con MediaPipe
- ✅ Funciona **sin conexión a internet**
- ✅ Alarmas sonoras inmediatas
- ✅ Sincronización automática cuando hay conexión
- ✅ GPS tracking en tiempo real
- ✅ Historial de viajes y eventos

### 🖥 Panel de Administración

- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de choferes y empresas
- ✅ Monitoreo GPS en vivo
- ✅ Notificaciones WebSocket instantáneas
- ✅ Reportes exportables (Excel/PDF)
- ✅ Historial completo de eventos

### 🔒 Seguridad

- ✅ Autenticación JWT con tokens de acceso y refresh
- ✅ Control de roles (Admin/Chofer)
- ✅ Bloqueo por intentos fallidos
- ✅ Tokens en blacklist
- ✅ HTTPS en producción

---

## 🏛 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARQUITECTURA HÍBRIDA                               │
│                        (Edge Computing + Cloud Sync)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   📱 APP ANDROID    │     │   ☁️ BACKEND API    │     │   🖥 WEB ADMIN      │
│   (Edge Device)     │     │   (FastAPI)         │     │   (React)           │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│                     │     │                     │     │                     │
│ • MediaPipe IA      │────▶│ • REST API         │◀────│ • Dashboard         │
│ • CameraX           │     │ • WebSocket        │     │ • Gestión Choferes  │
│ • Room Database     │     │ • PostgreSQL       │     │ • Reportes          │
│ • GPS Tracking      │     │ • JWT Auth         │     │ • Monitoreo GPS     │
│ • Alarmas Locales   │     │ • Notificaciones   │     │ • Notificaciones    │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         │      HTTP/WebSocket       │      HTTP/WebSocket       │
         └───────────────────────────┴───────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   🗄 PostgreSQL     │
                          │   Base de Datos    │
                          └────────────────────┘
```

### Flujo de Datos

```
1. DETECCIÓN (App Android)
   📷 Cámara → 🧠 MediaPipe → 🔍 Análisis IA → 🔔 Alerta Local

2. SINCRONIZACIÓN (Cuando hay conexión)
   📱 Room DB → 🌐 API REST → 🗄 PostgreSQL

3. NOTIFICACIÓN (Tiempo Real)
   📱 WebSocket → ☁️ Backend → 🖥 Web Admin (Notificación Push)

4. MONITOREO GPS (Tiempo Real)
   📍 GPS → 📱 WebSocket → ☁️ Backend → 🗺 Mapa Web Admin
```

---

## 🛠 Tecnologías Utilizadas

### Backend (FastAPI)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Python | 3.12+ | Lenguaje principal |
| FastAPI | 0.104+ | Framework API REST |
| SQLAlchemy | 2.0+ | ORM |
| PostgreSQL | 15+ | Base de datos |
| Pydantic | 2.0+ | Validación de datos |
| JWT | - | Autenticación |
| WebSockets | - | Comunicación tiempo real |
| Uvicorn | - | Servidor ASGI |

### Frontend Web (React)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18+ | Framework UI |
| TypeScript | 5.0+ | Tipado estático |
| Vite | 5.0+ | Build tool |
| TailwindCSS | 3.0+ | Estilos |
| React Router | 6+ | Navegación |
| Axios | - | Cliente HTTP |
| Zustand | - | Estado global |
| Leaflet | - | Mapas GPS |

### App Móvil (Android)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Kotlin | 1.9+ | Lenguaje principal |
| Jetpack Compose | 1.5+ | UI declarativa |
| MediaPipe | 0.10+ | Detección facial IA |
| CameraX | 1.3+ | Captura de video |
| Room | 2.6+ | Base de datos local |
| Hilt | 2.48+ | Inyección de dependencias |
| Retrofit | 2.9+ | Cliente HTTP |
| OkHttp | 4.12+ | Networking |
| WorkManager | 2.9+ | Tareas en background |
| DataStore | 1.0+ | Preferencias |

---

## 📁 Estructura del Proyecto

```
sistema-deteccion-somnolencia/
│
├── 📂 drowsiness-detecction-backend/    # Backend FastAPI
│   ├── app/
│   │   ├── api/v1/routers/              # Endpoints REST
│   │   │   ├── auth.py                  # Autenticación
│   │   │   ├── usuarios.py              # Gestión usuarios
│   │   │   ├── viajes.py                # Gestión viajes
│   │   │   ├── eventos.py               # Eventos somnolencia
│   │   │   ├── websocket.py             # WebSocket handlers
│   │   │   └── gps_realtime.py          # GPS tiempo real
│   │   ├── core/                        # Configuración
│   │   │   ├── config.py                # Variables de entorno
│   │   │   ├── security.py              # JWT, hashing
│   │   │   └── middleware.py            # Middlewares
│   │   ├── crud/                        # Operaciones CRUD
│   │   ├── models/                      # Modelos SQLAlchemy
│   │   ├── schemas/                     # Schemas Pydantic
│   │   ├── services/                    # Lógica de negocio
│   │   │   ├── connection_manager.py    # WebSocket manager
│   │   │   ├── notification_service.py  # Notificaciones
│   │   │   └── gps_realtime_manager.py  # GPS manager
│   │   └── main.py                      # Entry point
│   ├── requirements.txt
│   └── .env.example
│
├── 📂 drowsiness-detection-app/         # Frontend React
│   ├── src/
│   │   ├── components/                  # Componentes reutilizables
│   │   │   ├── common/                  # Botones, Cards, Inputs
│   │   │   ├── layout/                  # Layouts Admin/Chofer
│   │   │   └── notificaciones/          # Sistema notificaciones
│   │   ├── features/                    # Módulos por feature
│   │   │   ├── auth/                    # Autenticación
│   │   │   ├── choferes/                # Gestión choferes
│   │   │   ├── viajes/                  # Gestión viajes
│   │   │   ├── eventos/                 # Eventos somnolencia
│   │   │   ├── monitoreo/               # Monitoreo GPS
│   │   │   └── reportes/                # Generación reportes
│   │   ├── pages/                       # Páginas/Rutas
│   │   │   ├── admin/                   # Páginas admin
│   │   │   └── chofer/                  # Páginas chofer
│   │   ├── providers/                   # Context providers
│   │   ├── hooks/                       # Custom hooks
│   │   ├── lib/                         # Utilidades
│   │   └── routes/                      # Configuración rutas
│   ├── package.json
│   └── .env.example
│
├── 📂 DriverDrowsinessDetectorApp/      # App Android
│   ├── app/src/main/
│   │   ├── java/.../
│   │   │   ├── di/                      # Dependency Injection
│   │   │   │   ├── AppModule.kt
│   │   │   │   ├── DatabaseModule.kt
│   │   │   │   ├── NetworkModule.kt
│   │   │   │   └── UseCaseModule.kt
│   │   │   ├── data/                    # Capa de datos
│   │   │   │   ├── local/               # Room Database
│   │   │   │   │   ├── dao/             # DAOs
│   │   │   │   │   ├── entity/          # Entidades
│   │   │   │   │   └── database/        # AppDatabase
│   │   │   │   ├── remote/              # API
│   │   │   │   │   ├── api/             # Interfaces Retrofit
│   │   │   │   │   ├── dto/             # DTOs
│   │   │   │   │   └── interceptor/     # Interceptors
│   │   │   │   ├── repository/          # Implementaciones
│   │   │   │   └── sync/                # Sincronización
│   │   │   ├── domain/                  # Capa de dominio
│   │   │   │   ├── model/               # Modelos de negocio
│   │   │   │   ├── repository/          # Interfaces
│   │   │   │   └── usecase/             # Casos de uso
│   │   │   │       ├── monitoring/      # Detección IA
│   │   │   │       ├── sync/            # Sincronización
│   │   │   │       └── evento/          # Eventos
│   │   │   ├── presentation/            # Capa UI
│   │   │   │   ├── auth/                # Login
│   │   │   │   ├── dashboard/           # Dashboard
│   │   │   │   └── monitoring/          # Monitoreo
│   │   │   ├── services/                # Servicios Android
│   │   │   └── util/                    # Utilidades
│   │   ├── assets/models/               # Modelos MediaPipe
│   │   └── res/                         # Recursos
│   ├── build.gradle.kts
│   └── gradle/libs.versions.toml
│
├── 📂 database/
│   └── sistema_deteccion_somnolencia.sql  # Script SQL
│
├── 📂 docs/                             # Documentación
│   ├── Documentacion-Proyecto.md
│   ├── notificaciones-eventos.md
│   └── PLANIFICACION-SYNC.md
│
└── README.md                            # Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Python** 3.12 o superior
- **Node.js** 18 o superior
- **Android Studio** Hedgehog o superior
- **PostgreSQL** 15 o superior
- **Git**

---

### 1. Backend (FastAPI)

#### 1.1 Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-deteccion-somnolencia.git
cd sistema-deteccion-somnolencia/drowsiness-detecction-backend
```

#### 1.2 Crear entorno virtual

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

#### 1.3 Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 1.4 Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/somnolencia_db

# Seguridad
SECRET_KEY=tu-secret-key-muy-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Entorno
ENVIRONMENT=development
DEBUG=True

# CORS (separar por comas)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 1.5 Crear base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE somnolencia_db;

# Salir
\q
```

#### 1.6 Ejecutar migraciones

```bash
# Las tablas se crean automáticamente al iniciar
```

#### 1.7 Crear usuario admin inicial

```bash
python test/regenerate_passwords.py
```

#### 1.8 Iniciar servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 1.9 Verificar instalación

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

### 2. Frontend Web (React)

#### 2.1 Navegar al directorio

```bash
cd drowsiness-detection-app
```

#### 2.2 Instalar dependencias

```bash
npm install
```

#### 2.3 Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

#### 2.4 Iniciar servidor de desarrollo

```bash
npm run dev
```

#### 2.5 Verificar instalación

- **Aplicación**: http://localhost:5173

#### 2.6 Build para producción

```bash
npm run build
npm run preview  # Para probar el build
```

---

### 3. App Móvil (Android)

#### 3.1 Abrir en Android Studio

1. Abrir Android Studio
2. File → Open
3. Seleccionar `DriverDrowsinessDetectorApp/`
4. Esperar sincronización de Gradle

#### 3.2 Configurar URL del servidor

Editar `app/build.gradle.kts`:

```kotlin
android {
    defaultConfig {
        // Cambiar IP por la de tu servidor
        buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8000\"")
    }
}
```

#### 3.3 Descargar modelos MediaPipe

```bash
# Crear directorio
mkdir -p app/src/main/assets/models

# Descargar Face Landmarker
wget -O app/src/main/assets/models/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task

# Descargar Hand Landmarker (opcional)
wget -O app/src/main/assets/models/hand_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
```

#### 3.4 Compilar y ejecutar

1. Conectar dispositivo Android (USB debugging habilitado)
2. Run → Run 'app'
3. O usar: `./gradlew installDebug`

#### 3.5 Permisos requeridos

La app solicitará automáticamente:
- 📷 Cámara
- 📍 Ubicación
- 🔊 Audio
- 🔔 Notificaciones

---

## 🗄 Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    empresas     │       │    usuarios     │       │     viajes      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id_empresa (PK) │◀──────│ id_empresa (FK) │       │ id_viaje (PK)   │
│ nombre          │       │ id_usuario (PK) │◀──────│ id_chofer (FK)  │
│ ruc             │       │ usuario         │       │ fecha_inicio    │
│ direccion       │       │ contraseña_hash │       │ fecha_fin       │
│ telefono        │       │ nombre_completo │       │ estado          │
│ activo          │       │ rol             │       │ km_recorridos   │
│ created_at      │       │ activo          │       │ origen          │
└─────────────────┘       │ created_at      │       │ destino         │
                          └─────────────────┘       └─────────────────┘
                                   │                        │
                                   │                        │
                                   ▼                        ▼
                          ┌─────────────────────────────────────┐
                          │      eventos_somnolencia            │
                          ├─────────────────────────────────────┤
                          │ id_evento (PK)                      │
                          │ id_viaje (FK)                       │
                          │ id_chofer (FK)                      │
                          │ tipo_evento                         │
                          │ nivel_severidad                     │
                          │ duracion_segundos                   │
                          │ timestamp_evento                    │
                          │ latitud                             │
                          │ longitud                            │
                          │ velocidad_kmh                       │
                          │ sincronizado_offline                │
                          └─────────────────────────────────────┘
```

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `empresas` | Empresas de transporte |
| `usuarios` | Administradores y choferes |
| `viajes` | Registro de viajes |
| `eventos_somnolencia` | Eventos detectados |
| `tokens_blacklist` | Tokens invalidados |

### Script de Creación

```bash
psql -U postgres -d somnolencia_db -f database/sistema_deteccion_somnolencia.sql
```

---

## 📚 Documentación API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/me` | Usuario actual |

### Usuarios (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/users/` | Listar usuarios |
| POST | `/api/v1/users/` | Crear usuario |
| GET | `/api/v1/users/{id}` | Obtener usuario |
| PUT | `/api/v1/users/{id}` | Actualizar usuario |
| DELETE | `/api/v1/users/{id}` | Eliminar usuario |

### Viajes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/viajes/` | Listar viajes |
| POST | `/api/v1/viajes/iniciar` | Iniciar viaje |
| PUT | `/api/v1/viajes/{id}/finalizar` | Finalizar viaje |
| GET | `/api/v1/viajes/{id}` | Detalle viaje |

### Eventos de Somnolencia

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/eventos/` | Listar eventos |
| POST | `/api/v1/eventos/` | Crear evento |
| POST | `/api/v1/eventos/batch` | Crear eventos (batch) |
| GET | `/api/v1/eventos/estadisticas` | Estadísticas |

### WebSocket

| Endpoint | Descripción |
|----------|-------------|
| `/ws/admin` | Notificaciones para admins |
| `/ws/gps/{id_viaje}` | GPS en tiempo real |
| `/ws/chofer/{id_viaje}` | Eventos del chofer |

### Ejemplo de Uso

```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Respuesta
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id_usuario": 1,
    "usuario": "admin",
    "nombre_completo": "Administrador",
    "rol": "admin"
  }
}

# Usar token en requests
curl -X GET "http://localhost:8000/api/v1/users/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 🔄 Flujos del Sistema

### 1. Flujo de Detección de Somnolencia

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DETECCIÓN                           │
└─────────────────────────────────────────────────────────────────┘

    📷 Cámara (30 FPS)
         │
         ▼
    🧠 MediaPipe Face Landmarker
         │ (468 puntos faciales)
         ▼
    ┌────────────────────────────────────────┐
    │         ANÁLISIS DE MÉTRICAS           │
    ├────────────────────────────────────────┤
    │ • EAR (Eye Aspect Ratio)              │
    │ • MAR (Mouth Aspect Ratio)            │
    │ • Head Pose (Pitch, Yaw, Roll)        │
    │ • Distancias oculares                 │
    │ • Frecuencia de parpadeo              │
    └────────────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────────────┐
    │         DETECTORES DE EVENTOS          │
    ├────────────────────────────────────────┤
    │ • DetectMicrosleepUseCase             │
    │ • DetectNoddingUseCase                │
    │ • DetectBlinkUseCase                  │
    │ • DetectYawnUseCase                   │
    │ • DetectEyeRubUseCase                 │
    └────────────────────────────────────────┘
         │
         ▼
    ¿Evento detectado?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         └──▶ Continuar monitoreo
    │
    ├──▶ 🔔 Alarma sonora INMEDIATA
    │
    ├──▶ 💾 Guardar en Room DB
    │
    └──▶ 📤 Sincronizar (si hay conexión)
              │
              ▼
         📡 Backend API
              │
              ▼
         🔔 WebSocket → 🖥 Admin Web
```

### 2. Flujo de Sincronización Offline/Online

```
┌─────────────────────────────────────────────────────────────────┐
│                FLUJO DE SINCRONIZACIÓN                          │
└─────────────────────────────────────────────────────────────────┘

    📱 App Android
         │
         ▼
    ┌────────────────────────────────────────┐
    │    Evento de Somnolencia Detectado     │
    └────────────────────────────────────────┘
         │
         ▼
    💾 Guardar en Room Database
    (sincronizado = false)
         │
         ▼
    ¿Hay conexión a internet?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
    │    Continuar guardando
    │    en Room (offline)
    │         │
    ▼         │
    📤 Enviar al Backend ◀──────────────────┘
    POST /api/v1/eventos/batch    (cuando vuelve la conexión)
         │
         ▼
    ¿Éxito?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
    │    Reintentar
    │    (max 3 intentos)
    │         │
    ▼         │
    💾 Actualizar Room ◀───────────────────┘
    (sincronizado = true)
```

### 3. Flujo de Notificaciones en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────┐
│            FLUJO DE NOTIFICACIONES WEBSOCKET                    │
└─────────────────────────────────────────────────────────────────┘

    📱 App Android (Chofer)
         │
         │ Evento Crítico
         │ (microsueño/cabeceo)
         │
         ▼
    📡 WebSocket: /ws/chofer/{id_viaje}
         │
         ▼
    ☁️ Backend FastAPI
         │
         ├──▶ 💾 Guardar en PostgreSQL
         │
         └──▶ 📡 ConnectionManager
                   │
                   ▼
              Broadcast a Admins
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │     WebSocket: /ws/admin             │
    └──────────────────────────────────────┘
                   │
                   ▼
    🖥 Panel Web Admin
         │
         ├──▶ 🔔 Notificación Toast
         │
         ├──▶ 🔊 Sonido de alerta
         │
         └──▶ 📊 Actualizar Dashboard
```

---

## 🔐 Seguridad

### Autenticación JWT

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO JWT                                   │
└─────────────────────────────────────────────────────────────────┘

    1. Login
       POST /auth/login
       { username, password }
              │
              ▼
       Validar credenciales
              │
              ▼
       Generar tokens:
       • access_token (30 min)
       • refresh_token (7 días)
              │
              ▼
       Respuesta al cliente

    2. Request con Token
       GET /api/v1/resource
       Header: Authorization: Bearer {access_token}
              │
              ▼
       Validar token:
       • Firma válida
       • No expirado
       • No en blacklist
              │
              ▼
       Procesar request

    3. Refresh Token
       POST /auth/refresh
       { refresh_token }
              │
              ▼
       Validar refresh_token
              │
              ▼
       Generar nuevo access_token

    4. Logout
       POST /auth/logout
              │
              ▼
       Agregar token a blacklist
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **admin** | CRUD usuarios, ver todos los viajes/eventos, gestionar empresas, dashboard completo |
| **chofer** | Ver viajes propios, crear eventos, sincronizar datos |

### Buenas Prácticas Implementadas

- ✅ Passwords hasheados con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Refresh tokens para renovación
- ✅ Blacklist de tokens revocados
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de entrada con Pydantic
- ✅ CORS configurado correctamente
- ✅ Headers de seguridad HTTP

---

## 🧪 Pruebas

### Backend

```bash
cd drowsiness-detecction-backend

# Ejecutar tests
pytest

# Con coverage
pytest --cov=app --cov-report=html

# Tests específicos
pytest test/test_auth.py -v
```

### Frontend

```bash
cd drowsiness-detection-app

# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests e2e (si configurados)
npm run test:e2e
```

### Android

```bash
cd DriverDrowsinessDetectorApp

# Tests unitarios
./gradlew test

# Tests instrumentados
./gradlew connectedAndroidTest

# Lint
./gradlew lint
```

---

## 🚢 Despliegue

### Backend (Docker)

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build y run
docker build -t somnolencia-backend .
docker run -d -p 8000:8000 --env-file .env somnolencia-backend
```

### Frontend (Nginx)

```nginx
# nginx.conf
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        root /var/www/drowsiness-app;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: somnolencia_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./drowsiness-detecction-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/somnolencia_db
    depends_on:
      - db

  frontend:
    build: ./drowsiness-detection-app
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 🤝 Contribuir

### Flujo de Trabajo

1. **Fork** del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear **Pull Request**

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, sin cambios de código
refactor: refactorización de código
test: agregar/modificar tests
chore: tareas de mantenimiento
```

### Estructura de Branches

```
main
  └── develop
        ├── feature/nueva-funcionalidad
        ├── feature/otra-funcionalidad
        ├── bugfix/correccion-critica
        └── hotfix/parche-urgente
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Franz González** - *Desarrollo Full Stack* - [@franzgonzalez](https://github.com/franzgonzalez)

---

## 🙏 Agradecimientos

- [MediaPipe](https://developers.google.com/mediapipe) - Detección facial
- [FastAPI](https://fastapi.tiangolo.com/) - Framework backend
- [React](https://react.dev/) - Framework frontend
- [Jetpack Compose](https://developer.android.com/jetpack/compose) - UI Android

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

Hecho con ❤️ para la seguridad vial

</div>