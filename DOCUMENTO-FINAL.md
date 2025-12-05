# Sistema de Detección de Somnolencia — Documento Final

Este documento .md es la guía técnica completa del proyecto. Está organizado para facilitar: código fuente, arquitectura, tecnologías utilizadas, configuración, ejecución, operación, seguridad, monitoreo y resolución de problemas.

---

## 1. Código Fuente y Estructura
- Android (Edge): `DriverDrowsinessDetectorApp/`
- Backend (API + Procesamiento): `drowsiness-detecction-backend/`
- Frontend Web (Panel de Administración y Monitoreo): `drowsiness-detection-app/`
- Documentación: `docs/` y `Documentation.MD`
- Base de datos: `database/sistema_deteccion_somnolencia.sql`

Estructura general del repositorio:
- `DriverDrowsinessDetectorApp/` — Aplicación móvil Android (Kotlin, Compose, Hilt, CameraX, MediaPipe, Retrofit, Room).
- `drowsiness-detecction-backend/` — API REST y WebSocket (FastAPI), servicios, procesamiento y modelos.
- `drowsiness-detection-app/` — SPA en React + Vite para administración y monitoreo.
- `docs/` — Informes, planificación, guía de pruebas, monitoreo GPS, estrategias Edge–Cloud.

---

## 2. Arquitectura del Sistema
- **Edge (Android)**: Captura de vídeo (CameraX), extracción de rasgos con **MediaPipe Tasks Vision**, lectura de GPS, persistencia local (Room/DataStore) y sincronización con backend (Retrofit + WorkManager). Inyección de dependencias con Hilt.
- **Backend (FastAPI)**: Endpoints REST y WebSocket para autenticación, gestión de entidades (empresas, usuarios, viajes, eventos), procesamiento de somnolencia (eyes, mouth, head), emisión de notificaciones y reportes. Persistencia con SQLAlchemy. Configuración mediante `.env`.
- **Frontend (React + Vite)**: Panel web para gestión y monitoreo en tiempo real. Mapas con Leaflet/React-Leaflet, notificaciones con react-toastify, reportes PDF/Excel, rutas protegidas.

Flujo de datos (alto nivel):
1) Android detecta eventos de somnolencia y obtiene GPS/velocidad.
2) Envía datos al backend vía HTTP/WS.
3) Backend valida, persiste y distribuye notificaciones/eventos.
4) Frontend consume API/WS para visualizar en tiempo real y generar reportes.

---

## 3. Tecnologías Utilizadas
- **Android**: Kotlin, Jetpack Compose, CameraX, MediaPipe Tasks Vision, Hilt (DI), Retrofit, OkHttp, Room, DataStore, WorkManager, Coroutines.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, Pydantic, websockets, Mediapipe, OpenCV, Email/Notificaciones.
- **Frontend**: React 19, Vite 7, TypeScript 5.9, Leaflet, React-Leaflet, React Router 7, Axios, Tailwind CSS, jsPDF, xlsx.

## 4. Componente Edge (Android)
- Archivo de build: `DriverDrowsinessDetectorApp/app/build.gradle.kts`.
- Plugins: Android Application, Kotlin Android, Kotlin Compose, Dagger Hilt, KSP.
- SDK: `minSdk=30`, `targetSdk=36`, `compileSdk=36`, `Java/Kotlin 17`.
- `BuildConfig`:
  - `API_BASE_URL` en `defaultConfig`, `debug` y `release`. Ejemplo debug: `http://192.168.1.17:8000/`.
  - Timeouts: `CONNECT_TIMEOUT`, `READ_TIMEOUT`, `WRITE_TIMEOUT` (segundos, tipo `long`).
- Dependencias principales:
  - CameraX: `camera-core`, `camera-camera2`, `camera-lifecycle`, `camera-view`.
  - MediaPipe: `com.google.mediapipe:tasks-vision`.
  - Hilt, Navigation Compose.
  - Retrofit + OkHttp Interceptor.
  - Room (runtime/ktx + compiler KSP).
  - DataStore (preferences), WorkManager (+ Hilt Work).
  - GPS: `play-services-location`, permisos con `accompanist-permissions`.
- Modelos convertidos: `DriverDrowsinessDetectorApp/app/src/main/assets`.
  - Ubicar aquí los archivos de modelos necesarios para la inferencia offline.

Pasos de build y ejecución:
1) Ajustar `API_BASE_URL` (bloque `debug`) con la IP del backend.
2) Sincronizar Gradle y compilar en Android Studio.
3) Instalar en dispositivo (Android 12+ recomendado) y otorgar permisos de Cámara, Ubicación y Notificaciones.

---

## 5. Componente Backend (FastAPI)
- Carpeta: `drowsiness-detecction-backend/`
- Entrypoint: `app/main.py`
- Rutas: `app/api/v1/routers/` — `auth.py`, `empresas.py`, `eventos.py`, `gps_realtime.py`, `monitoring.py`, `users.py`, `viajes.py`, `websocket.py`
- Núcleo: `app/core/` — `config.py`, `security.py`, `middleware.py`, `permissions.py`
- Datos: `app/models/`, `app/crud/`, `app/schemas/`
- Servicios: `app/services/` — autenticación, notificaciones, GPS realtime, email, conexión WS
- Procesamiento: `app/drowsiness_processor/` — `data_processing`, `drowsiness_features`, `extract_points`, `visualization`, `reports`
- Configuración: `.env` (ver `.env.example`)
- Dependencias: `requirements.txt` (FastAPI, Uvicorn, SQLAlchemy, Mediapipe, OpenCV, websockets, etc.)

Ejecución (Windows PowerShell):
```powershell
# 1) Crear y activar entorno virtual
python -m venv .venv; .\.venv\Scripts\Activate.ps1

# 2) Instalar dependencias
pip install -r drowsiness-detecction-backend\requirements.txt

# 3) Configurar .env
Copy-Item drowsiness-detecction-backend\.env.example drowsiness-detecction-backend\.env
# Editar: DB_URL, SECRET_KEY, EMAIL, configuraciones de notificaciones

# 4) Ejecutar servidor
$env:PYTHONPATH = "drowsiness-detecction-backend"; \
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Notas:
- Abrir el puerto `8000` en firewall para acceso desde Android.
- Si usa Postgres, validar `DB_URL` y migraciones (Alembic, si aplica).

---

## 6. Componente Frontend Web (React + Vite)
- Carpeta: `drowsiness-detection-app/`
- Scripts (`package.json`): `dev`, `build`, `lint`, `preview`
- Dependencias: React 19, Leaflet/React-Leaflet, Router 7, Axios, Tailwind CSS, jsPDF, xlsx
- Estructura `src/`: `features/`, `pages/`, `routes/`, `providers/`, `components/`
- Variables de entorno: `.env` y `.env.example` (ej.: `VITE_API_BASE_URL`)

Desarrollo (Windows PowerShell):
```powershell
cd drowsiness-detection-app
npm install
Copy-Item .env.example .env
# Editar VITE_API_BASE_URL (ej.: http://192.168.1.17:8000)
npm run dev

# Producción
npm run build
npm run preview
```

---

## 7. Funcionamiento y Flujo de Datos
- Android captura frames, extrae puntos (face/hands/mouth/eyes/head) y calcula rasgos (parpadeo, micro-sueños, bostezo, inclinación, frotación de ojos) usando modelos en `app/src/main/assets`.
- Genera eventos y estados de viaje (GPS, velocidad, conductor) y los envía al backend.
- Backend valida, persiste y emite eventos en tiempo real (WS), gestiona notificaciones y reportes.
- Frontend consume API/WS, muestra mapas, lista eventos, estado del GPS/velocidad y permite reportes.

---

## 8. Configuración de Entorno y Variables
- **Android**: `API_BASE_URL`, `CONNECT_TIMEOUT`, `READ_TIMEOUT`, `WRITE_TIMEOUT` en `BuildConfig`.
- **Backend**: `.env` con `DB_URL`, `SECRET_KEY`, parámetros de email/notificaciones, configuraciones de CORS.
- **Frontend**: `.env` con `VITE_API_BASE_URL` y parámetros de despliegue.

Recomendaciones:
- Unificar IP/host entre Android y Frontend para apuntar al mismo backend.
- Documentar valores por entorno (dev, test, prod).

---

## 9. Seguridad y Buenas Prácticas
- Autenticación y autorización en backend (JWT/permissions).
- CORS configurado adecuadamente para el frontend.
- Almacenamiento seguro de secretos (no commitear `.env`).
- Validación de entrada con Pydantic y sanitización básica.
- HTTPS en producción (reverse proxy Nginx/Traefik con TLS).
- Logs de auditoría para eventos de somnolencia y acciones críticas.

---

## 10. Monitoreo, Reportes y Notificaciones
- Monitoreo GPS en tiempo real (Frontend: Leaflet; Backend: WS).
- Notificaciones de eventos de somnolencia (servicios en `app/services/`).
- Reportes PDF/Excel en el Frontend (`jsPDF`, `xlsx`).
- Visualizaciones y procesamiento adicional en `drowsiness_processor/visualization` y `reports`.

---

## 11. Pruebas y Calidad
- **Backend**: carpeta `test/` con pruebas de autenticación y endpoints de monitoreo.
- **Frontend**: `eslint` y verificación manual en desarrollo.
- **Android**: `androidTest/` y depuración con logcat.

Sugerencias:
- Integrar pruebas e2e para flujo de viaje/monitoreo.
- Añadir cobertura y CI (GitHub Actions).

---

## 12. Despliegue y Operación
Windows PowerShell (resumen):
```powershell
# Backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r drowsiness-detecction-backend\requirements.txt
$env:PYTHONPATH = "drowsiness-detecction-backend"; \
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd drowsiness-detection-app
npm install
Copy-Item .env.example .env
npm run build; npm run preview
```
Android (resumen):
- Ajustar `API_BASE_URL` y compilar con Android Studio.
- Verificar permisos y conectividad hacia la IP del backend.

---

## 12.1 Instaladores y Preparación de Entorno
- Guía completa de instalación por plataforma se encuentra en `INSTALADORES.md`.
- Incluye: Linux (solo comandos por prioridad) y Windows (enlaces .exe oficiales).

---

## 13. Solución de Problemas (Troubleshooting)
