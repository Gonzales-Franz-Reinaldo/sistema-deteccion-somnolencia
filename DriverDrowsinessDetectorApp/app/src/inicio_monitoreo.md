📋 PLANIFICACIÓN FASE 2: INICIAR MONITOREO
Analizando la documentación, arquitectura actual y estructura del proyecto, aquí está la planificación completa para implementar la funcionalidad "Iniciar Monitoreo".

🎯 OBJETIVO DE LA FASE 2
Permitir que el chofer inicie una sesión de monitoreo de somnolencia en tiempo real, solicitando permisos necesarios, creando un registro en la base de datos local y preparando la interfaz para el streaming de video con análisis de IA.


📊 FLUJO DE USUARIO
graph TD
    A[DashboardScreen] -->|Tap "Comenzar Viaje"| B{Verificar Permisos}
    B -->|No concedidos| C[Solicitar Permisos]
    C -->|Concedidos| D[Crear Sesión en Room DB]
    C -->|Rechazados| E[Mostrar Error]
    B -->|Ya concedidos| D
    D --> F[Navegar a MonitoringScreen]
    F --> G[Iniciar CameraX Preview]
    F --> H[Iniciar GPS Tracking]
    F --> I[Iniciar Servicio Foreground]
    G --> J[Streaming + Análisis IA]


🏗️ ARQUITECTURA TÉCNICA
1. TECNOLOGÍAS A UTILIZAR
Componente	Tecnología	Propósito
Cámara	CameraX	Captura de video frontal para análisis facial
IA/ML	MediaPipe Face Landmarker	Detección de 478 puntos faciales
GPS	FusedLocationProviderClient	Tracking de ubicación en tiempo real
Base de Datos	Room Database	Almacenamiento local de sesiones/alertas
Servicio	Foreground Service	Mantener monitoreo activo en background
Notificaciones	NotificationCompat	Alertas críticas de somnolencia
Audio	MediaPlayer	Reproducir alarmas sonoras
Permisos	Accompanist Permissions	Gestión de permisos en Compose


2. COMPONENTES DE LA SOLUCIÓN
A. Base de Datos Local (Room)
Entidades a Crear:

SessionEntity - Registro de sesión de viaje
AlertEntity - Alertas de somnolencia detectadas
LocationEntity - Puntos GPS durante el viaje
MetricsEntity - Métricas faciales capturadas (EAR, MAR, etc.)
DAOs a Crear:

SessionDao - CRUD de sesiones
AlertDao - CRUD de alertas
LocationDao - CRUD de ubicaciones
MetricsDao - CRUD de métricas
B. Capa de Datos (Repository Pattern)
Repositorios:

SessionRepository - Gestión de sesiones
AlertRepository - Gestión de alertas
LocationRepository - Gestión de ubicación
MonitoringRepository - Coordinación del monitoreo
C. Casos de Uso (Business Logic)
Session Management:

StartSessionUseCase - Iniciar sesión de viaje
EndSessionUseCase - Finalizar sesión
PauseSessionUseCase - Pausar sesión
GetActiveSessionUseCase - Obtener sesión activa
Monitoring:

ProcessFrameUseCase - Procesar frames de video
DetectDrowsinessUseCase - Detectar somnolencia
CalculateEARUseCase - Calcular Eye Aspect Ratio
CalculateMARUseCase - Calcular Mouth Aspect Ratio
DetectHeadPoseUseCase - Detectar posición de cabeza
Alerts:

TriggerAlertUseCase - Disparar alerta
SaveAlertUseCase - Guardar alerta en DB
PlayAlarmUseCase - Reproducir alarma sonora
Location:

TrackLocationUseCase - Iniciar tracking GPS
SaveLocationUseCase - Guardar punto GPS
D. Presentación (UI/UX)
MonitoringScreen (Pantalla Principal):

Componentes Visuales:

CameraPreview - Vista de cámara frontal
FaceLandmarksOverlay - Dibujo de puntos faciales (debug)
MetricsDisplay - Mostrar EAR, MAR, Head Pose en tiempo real
AlertBanner - Banner de alerta (aparece si detecta somnolencia)
SessionControls - Botones: Pausar / Finalizar / Configuración
StatusIndicator - Indicador de estado: Normal / Alerta / Crítico
GPSIndicator - Indicador de GPS activo
TimerDisplay - Temporizador de sesión



E. Foreground Service
MonitoringService:

Propósito: Mantener el monitoreo activo incluso si la app va a background
Características:
Notificación persistente
Procesamiento continuo de frames
Tracking GPS en intervalos
Detección y disparo de alertas

📁 ESTRUCTURA DE CARPETAS Y ARCHIVOS A CREAR
Basándome en la estructura del README.md y la arquitectura Clean, aquí están TODAS las carpetas y archivos que necesitarás crear manualmente:

1. 📂 data/local/ - BASE DE DATOS (Room)
data/local/entity/
SessionEntity.kt
AlertEntity.kt
LocationEntity.kt
MetricsEntity.kt

data/local/dao/
SessionDao.kt
AlertDao.kt
LocationDao.kt
MetricsDao.kt

data/local/database/
AppDatabase.kt

2. 📂 data/repository/ - IMPLEMENTACIONES DE REPOSITORIOS
SessionRepositoryImpl.kt
AlertRepositoryImpl.kt
LocationRepositoryImpl.kt
MonitoringRepositoryImpl.kt

3. 📂 domain/ - LÓGICA DE NEGOCIO
domain/model/
Session.kt
SessionStatus.kt (enum: ACTIVE, PAUSED, FINISHED)
Alert.kt
AlertType.kt (enum: MICROSLEEP, YAWN, BLINK, HEAD_DROP, EYE_RUB)
AlertLevel.kt (enum: NORMAL, WARNING, CRITICAL)
Location.kt
MetricasSomnolencia.kt
HeadPose.kt

domain/repository/ (Interfaces)
SessionRepository.kt
AlertRepository.kt
LocationRepository.kt
MonitoringRepository.kt

domain/usecase/session/
StartSessionUseCase.kt
EndSessionUseCase.kt
PauseSessionUseCase.kt
ResumeSessionUseCase.kt
GetActiveSessionUseCase.kt

domain/usecase/monitoring/
ProcessFrameUseCase.kt
DetectDrowsinessUseCase.kt
CalculateEARUseCase.kt
CalculateMARUseCase.kt
DetectHeadPoseUseCase.kt

domain/usecase/alert/
TriggerAlertUseCase.kt
SaveAlertUseCase.kt
GetAlertsHistoryUseCase.kt
PlayAlarmUseCase.kt

domain/usecase/location/
TrackLocationUseCase.kt
SaveLocationUseCase.kt
GetCurrentLocationUseCase.kt


4. 📂 presentation/monitoring/ - PANTALLA DE MONITOREO
presentation/monitoring/ui/
MonitoringScreen.kt
MonitoringUiState.kt

presentation/monitoring/ui/components/
CameraPreview.kt
FaceLandmarksOverlay.kt
MetricsDisplay.kt
AlertBanner.kt
SessionControls.kt
StatusIndicator.kt
GPSIndicator.kt
TimerDisplay.kt
PermissionRequestDialog.kt

presentation/monitoring/
MonitoringViewModel.kt

presentation/monitoring/service/
MonitoringService.kt
MonitoringServiceBinder.kt
MonitoringNotification.kt

5. 📂 util/ - UTILIDADES
PermissionsUtil.kt (helper para verificar permisos)
MediaPipeUtil.kt (helpers para MediaPipe)
CameraUtil.kt (helpers para CameraX)
AlarmUtil.kt (reproducir alarmas)
DateTimeUtil.kt (formateo de fechas/horas)

6. 📂 di/ - DEPENDENCY INJECTION
DatabaseModule.kt (provee Room Database y DAOs)
RepositoryModule.kt (provee repositorios)
UseCaseModule.kt (provee casos de uso)
MonitoringModule.kt (provee MonitoringService)

7. 📂 res/ - RECURSOS
res/raw/ (crear carpeta)
alert_low.mp3 (sonido alerta baja)
alert_medium.mp3 (sonido alerta media)
alert_critical.mp3 (sonido alerta crítica)

res/drawable/
ic_alert.xml (icono de alerta)
ic_eye.xml (icono de ojo)
ic_gps.xml (icono de GPS)
ic_camera.xml (icono de cámara)
ic_pause.xml (icono pausar)
ic_stop.xml (icono detener)


res/values/strings.xml (actualizar)
<resources>
    <!-- Monitoring Screen -->
    <string name="monitoring_title">Monitoreo Activo</string>
    <string name="monitoring_start">Comenzar Viaje</string>
    <string name="monitoring_pause">Pausar</string>
    <string name="monitoring_resume">Reanudar</string>
    <string name="monitoring_stop">Finalizar Viaje</string>
    
    <!-- Permissions -->
    <string name="permission_camera_required">Permiso de cámara requerido</string>
    <string name="permission_location_required">Permiso de ubicación requerido</string>
    <string name="permission_notification_required">Permiso de notificaciones requerido</string>
    
    <!-- Alerts -->
    <string name="alert_microsleep">¡Microsueño detectado!</string>
    <string name="alert_yawn">Bostezo detectado</string>
    <string name="alert_blink">Parpadeo excesivo</string>
    <string name="alert_head_drop">Cabeceo detectado</string>
</resources>


8. 📂 assets/models/ (crear carpeta)
Descargar modelos MediaPipe:
face_landmarker.task (modelo de detección facial - ~3MB)

URL de descarga:
https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task

🔧 DEPENDENCIAS ADICIONALES
Agregar al build.gradle.kts:
dependencies {
    // ...existing code...

    // CameraX
    val cameraxVersion = "1.3.1"
    implementation("androidx.camera:camera-core:$cameraxVersion")
    implementation("androidx.camera:camera-camera2:$cameraxVersion")
    implementation("androidx.camera:camera-lifecycle:$cameraxVersion")
    implementation("androidx.camera:camera-view:$cameraxVersion")

    // MediaPipe
    implementation("com.google.mediapipe:tasks-vision:0.10.9")

    // Location (GPS)
    implementation("com.google.android.gms:play-services-location:21.0.1")

    // Permissions (Compose)
    implementation("com.google.accompanist:accompanist-permissions:0.32.0")

    // WorkManager (para sync en background)
    implementation("androidx.work:work-runtime-ktx:2.9.0")
}



📋 CHECKLIST DE IMPLEMENTACIÓN
Fase 2.1: Base de Datos Local
 Crear entidades Room (SessionEntity, AlertEntity, LocationEntity, MetricsEntity)
 Crear DAOs
 Crear AppDatabase.kt
 Configurar DatabaseModule.kt en Hilt
Fase 2.2: Domain Layer
 Crear modelos de dominio
 Crear interfaces de repositorios
 Crear casos de uso de sesión
 Crear casos de uso de monitoreo
 Crear casos de uso de alertas
 Crear casos de uso de ubicación
Fase 2.3: Data Layer
 Implementar repositorios
 Configurar RepositoryModule.kt
Fase 2.4: Presentation Layer
 Crear MonitoringScreen.kt
 Crear componentes UI
 Crear MonitoringViewModel.kt
 Crear MonitoringUiState.kt
Fase 2.5: Servicios
 Crear MonitoringService.kt
 Crear notificaciones persistentes
 Configurar en AndroidManifest.xml
Fase 2.6: Utilidades
 Crear PermissionsUtil.kt
 Crear MediaPipeUtil.kt
 Crear CameraUtil.kt
 Crear AlarmUtil.kt
Fase 2.7: Recursos
 Descargar modelo MediaPipe
 Agregar sonidos de alarma
 Crear iconos vectoriales
 Actualizar strings.xml
Fase 2.8: Integración
 Conectar DashboardScreen con MonitoringScreen
 Probar permisos
 Probar creación de sesión
 Probar navegación
🎯 PRÓXIMOS PASOS
Una vez creada toda la estructura de carpetas y archivos, comenzaremos a implementar en este orden:

Base de Datos Room (entidades + DAOs + AppDatabase)
Domain Models (modelos de negocio)
Repositorios (implementaciones)
Casos de Uso (lógica de negocio)
ViewModel (estado y lógica de UI)
UI Components (componentes visuales)
MonitoringScreen (pantalla completa)
MonitoringService (servicio foreground)
Integración final (conectar todo)
✅ RESUMEN
Total de archivos a crear: ~60 archivos

Carpetas principales:

data/local/ (8 archivos)
domain/ (23 archivos)
presentation/monitoring/ (15 archivos)
util/ (5 archivos)
di/ (4 archivos actualizar)
res/ (recursos + strings)
¿Listo para comenzar a crear la estructura? 🚀




# DESPUES LO SIGUIENTE

2. INICIAR MONITOREO 
   - Chofer presiona "Comenzar Viaje" 
   - App solicita permisos: 
     * Cámara 
     * Ubicación (GPS) 
     * Audio (alarma) 
     * Notificaciones 
   - App crea registro en Room Database: 
     INSERT INTO viajes (id_chofer, inicio, estado) 
 
3. PROCESAMIENTO EN FOREGROUND SERVICE 
   - Service se ejecuta aunque app minimizada 
   - Muestra notificación persistente: 
     "🚗 Sistema de detección activo" 
   - No se puede cerrar sin detener viaje 
 
 
Ciclo de Detección (Loop Principal) 
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