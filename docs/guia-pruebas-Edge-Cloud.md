# 🧪 Guía de Pruebas - Sistema Edge → Cloud

## 📋 Resumen del Sistema

```
📱 APP ANDROID                    ☁️ BACKEND                    🖥️ ADMIN
┌─────────────┐                  ┌─────────────┐               ┌─────────────┐
│ 1. Detecta  │                  │             │               │             │
│    evento   │                  │             │               │             │
│             │                  │             │               │             │
│ 2. Guarda   │───── SYNC ──────►│ 4. Recibe   │── WebSocket ─►│ 5. Ve       │
│    en Room  │                  │    eventos  │               │    alertas  │
│    + GPS    │                  │             │               │             │
│             │                  │             │               │             │
│ 3. Alarma   │                  │             │               │             │
│    local    │                  │             │               │             │
└─────────────┘                  └─────────────┘               └─────────────┘
     ▲                                                              
     │ Funciona OFFLINE                                             
```

---

## 🔧 Preparación

### Iniciar Backend
```bash
cd drowsiness-detecction-backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Verificar
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

---

## 👨‍✈️ Pruebas como CHOFER

### 1. Login en App Android
| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir app | Pantalla de login |
| 2 | Ingresar: `jperez` / `chofer123` | Login exitoso |
| 3 | Ver dashboard | Botón "Iniciar Monitoreo" visible |

### 2. Detección de Eventos (CON Internet)
| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Iniciar monitoreo | Cámara activa, métricas visibles |
| 2 | Cerrar ojos 3+ segundos | 🔴 Alarma + Banner "MICROSUEÑO" |
| 3 | Verificar en Room* | Evento guardado con `sincronizado=true` |

### 3. Detección de Eventos (SIN Internet)
| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Activar modo avión | Sin conexión |
| 2 | Provocar 3 eventos | Alarmas suenan normalmente |
| 3 | Verificar en Room* | Eventos con `sincronizado=false` |
| 4 | Desactivar modo avión | Esperar 1-2 minutos |
| 5 | Verificar en Room* | Eventos cambian a `sincronizado=true` |

> *Usar Database Inspector en Android Studio

### Tipos de Eventos a Probar
| Evento | Cómo Provocarlo | Severidad |
|--------|-----------------|-----------|
| Microsueño | Cerrar ojos 3+ seg | CRITICAL |
| Cabeceo | Inclinar cabeza 3+ seg | CRITICAL |
| Bostezo | Abrir boca ampliamente 3+ veces | HIGH |
| Parpadeo | Parpadear rápido 20+ veces/min | MEDIUM |

---

## 👔 Pruebas como ADMIN

### 1. Login en Swagger
| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | `POST /api/v1/auth/login` con `admin`/`admin123` | Token JWT |
| 2 | Click "Authorize" → pegar token | Endpoints accesibles |

### 2. Ver Eventos
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/eventos/recientes?minutos=60` | Eventos última hora |
| `GET /api/v1/eventos/chofer/{id}` | Eventos de un chofer |
| `GET /api/v1/eventos/estadisticas/generales` | Resumen general |

### 3. WebSocket (Notificaciones Tiempo Real)
```python
# Test con Python
import asyncio
import websockets

async def test():
    uri = "ws://localhost:8000/api/v1/ws/admin?token=TU_JWT_TOKEN"
    async with websockets.connect(uri) as ws:
        print("Conectado, esperando eventos...")
        while True:
            msg = await ws.recv()
            print(f"🔔 {msg}")

asyncio.run(test())
```

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Conectar WebSocket | Mensaje "connection_established" |
| 2 | Provocar microsueño en app | Mensaje instantáneo con datos del evento |

---

## ✅ Checklist de Verificación

### Backend
- [ ] Login retorna token JWT
- [ ] `POST /eventos` crea evento
- [ ] `POST /eventos/batch` procesa múltiples
- [ ] `GET /eventos/recientes` filtra correctamente
- [ ] WebSocket notifica eventos críticos

### Android
- [ ] Login guarda token
- [ ] Detección de microsueño funciona
- [ ] Eventos se guardan en Room
- [ ] GPS captura ubicación
- [ ] Sincronización automática funciona
- [ ] Modo offline no crashea

### Integración
- [ ] Evento detectado → Room → Backend → WebSocket
- [ ] Eventos offline se sincronizan al reconectar

---

## 🐛 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Sync no funciona | Token expirado | Re-login |
| GPS siempre NULL | Sin permisos | Verificar permisos en Settings |
| WebSocket no conecta | Token inválido | Usar token reciente |
| Eventos no se guardan | Sesión no iniciada | Verificar `SessionManager` |

---

## 📱 Logs Importantes

### Android (Logcat)
```
TAG: MonitoringViewModel, SyncWorker, EventoSomnolenciaRepository
```

### Backend (Terminal)
```
INFO: POST /api/v1/eventos
INFO: Broadcasting to X admins
```