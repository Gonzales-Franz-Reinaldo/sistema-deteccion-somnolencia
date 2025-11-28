# Sistema de Deteccion de Somnolencia en Tiempo Real.

## Conceptos introductorios:
- Este repositorio contiene el código fuente en Python para ejecutar y utilizar nuestro sistema de etiquetado automatico con el fin de entrenar modelos de detección de objetos.
- Para iniciar recomendamos ver algunos conceptos introductorios con el fin de entender un poco mejor todo el funcionamiento, por eso te dejamos la explicacion en este [video.](https://youtu.be/PQ71QvvFbA8?si=r77MhBOwhD5UDZx3)
- Los modelos lo puedes encontrar [aqui.]([https://github.com/IDEA-Research/GroundingDINO](https://github.com/google-ai-edge/mediapipe))

## Características

- **Procesamiento en tiempo real:** Utiliza Mediapipe para detectar puntos clave faciales y de las manos.
- **Interfaz gráfica:** Desarrollada con Flet para mostrar los resultados de la detección.
- **Dockerizable:** Facilita la ejecución en servidores remotos.
- **API robusta:** Utiliza FastAPI para ofrecer un backend modular y extensible.

### Monitoreo de Viajes (Nuevo Módulo)

Permite observar en tiempo real la ubicación (GPS) y las alertas de somnolencia de cada chofer durante sus viajes.

Flujo resumido:
1. El chofer inicia un viaje creando una `SesionViaje` (estado `activa`).
2. El dispositivo del chofer envía su posición cada 30–60 segundos: `POST /api/v1/monitoring/viaje/{id}/posicion`.
3. El administrador visualiza viajes activos en `/admin/monitoreo-viajes` (métricas + tarjetas).
4. Al abrir un viaje específico `/admin/monitoreo-viajes/:id` se abre WebSocket `ws /api/v1/monitoring/viaje/{id}/stream` que entrega nuevas posiciones y alertas.
5. El chofer finaliza el viaje con `POST /api/v1/monitoring/viaje/{id}/finalizar` (registra `fecha_fin`, `ubicacion_fin` y duración).

Endpoints clave:
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/monitoring/viajes-activos` | Viajes activos con última posición |
| GET | `/api/v1/monitoring/viaje/{id}/posiciones` | Posiciones paginadas cronológicas |
| POST | `/api/v1/monitoring/viaje/{id}/posicion` | Registrar nueva posición (rol chofer) |
| POST | `/api/v1/monitoring/viaje/{id}/finalizar` | Finalizar sesión de viaje |
| GET | `/api/v1/monitoring/metrics` | Métricas: choferes totales, activos, alertas hoy |
| WS | `/api/v1/monitoring/viaje/{id}/stream` | Stream de posiciones y alertas en vivo |

Modelo posición (`PosicionViaje`): lat, lng, velocidad, heading, timestamp, origen. Índice compuesto `(id_sesion, timestamp)` optimiza consultas.

Frontend: páginas `MonitoreoViajesPage` (lista + métricas) y `MonitoreoViajeDetallePage` (mapa Google + ruta + alertas en tiempo real). Requiere variable `VITE_GOOGLE_MAPS_API_KEY` en `.env` del frontend.


## Requisitos:
Para utilizar este código, asegúrese de cumplir con los siguientes requisitos previos:

- Sistema operativo compatible: Windows, Linux o macOS
- Versión de Python: 3.10 o superior
- Version CUDA: 11.7
- Paquetes adicionales: NumPy, OpenCV, Flet, etc. Consulte el archivo [requirements.txt](https://github.com/AprendeIngenia/driver_fatigue_detection/blob/012943fa6e02abbf65fde26573ce52e710f0a5a8/requirements.txt) para ver la lista completa de dependencias.
- Docker (opcional para despliegue en contenedor)

## Instalación

#### 1. Clonar el repositorio

Clona este repositorio en tu máquina local:

```bash
git clone https://github.com/tu_usuario/drowsiness-detection.git
cd drowsiness-detection
```

#### 2. Crear y activar entorno virtual
```bash
python -m venv venv
```

Activar venv en Windows
```bash
./venv/Scripts/activate
```

Activar venv en Linux
```bash
source venv/bin/acitvate
```

#### 3. Instalar dependencias 
```bash
pip install -r requirements.txt
```

#### 4. Ejecutar el servidor
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

#### 5. Ejecutar interfaz grafica
```bash
flet main.py
```

## Dockerizacion
#### 1. Construir la imagen Docker
```bash
docker build -t drowsiness-server .
```

#### 2. Ejecutar el contenedor:
```bash
docker run -d -p 8000:8000 --name drowsiness-server drowsiness-server
```
Ó
```bash
docker start drowsiness-server
```


#### 3. Ejecutar interfaz grafica
```bash
flet main.py
``` 

#### 4. Detener el contenedor
```bash
docker stop drowsiness-server
``` 

#### 5. Revisar estado del contenedor
```bash
docker ps -a
```

## Contacto
