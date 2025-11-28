# Configuración de Google Maps API

Esta guía te ayudará a configurar las credenciales de Google Maps API para el módulo de Monitoreo de Viajes en Tiempo Real.

---

## 📋 Requisitos Previos

- Cuenta de Google
- Proyecto en Google Cloud Console
- Tarjeta de crédito (solo para verificación, Google ofrece $200 USD gratis mensuales)

---

## 🚀 Paso a Paso

### 1. Acceder a Google Cloud Console

Ve a: https://console.cloud.google.com/

Si no tienes un proyecto, créalo:
- Haz clic en el selector de proyecto (arriba a la izquierda)
- Clic en **"NUEVO PROYECTO"**
- Nombre: `Sistema Detección Somnolencia` (o el que prefieras)
- Clic en **"CREAR"**

---

### 2. Habilitar las APIs Necesarias

**a) Ve a la Biblioteca de APIs:**
- Menú lateral → **"APIs y servicios"** → **"Biblioteca"**

**b) Habilitar Maps JavaScript API:**
1. Busca: `Maps JavaScript API`
2. Haz clic en el resultado
3. Presiona el botón **"HABILITAR"**
4. Espera unos segundos

**c) Habilitar Geocoding API:**
1. Regresa a la biblioteca (flecha atrás o clic en "Biblioteca")
2. Busca: `Geocoding API`
3. Haz clic en el resultado
4. Presiona **"HABILITAR"**

> ⚠️ **Importante**: Sin estas APIs habilitadas, la clave no funcionará.

---

### 3. Crear la Clave API

**a) Ir a Credenciales:**
- Menú lateral → **"APIs y servicios"** → **"Credenciales"**

**b) Crear nueva clave:**
1. Clic en **"+ CREAR CREDENCIALES"** (arriba)
2. Selecciona **"Clave de API"**
3. Se generará una clave automáticamente

**c) Copiar la clave:**
- Aparecerá un diálogo con tu API Key
- Formato: `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q`
- **¡Cópiala ahora!** (también puedes verla después)

---

### 4. Configurar Restricciones (IMPORTANTE)

**⚠️ Sin restricciones, cualquiera puede usar tu clave y consumir tu crédito.**

**a) Editar la clave recién creada:**
- Haz clic en el nombre de la clave en la lista
- O haz clic en el ícono del lápiz ✏️

**b) Restricciones de Aplicaciones:**
1. Selecciona: **"Referentes HTTP (sitios web)"**
2. Clic en **"AGREGAR UN ELEMENTO"**
3. Agrega estas URLs (una por línea):
   ```
   http://localhost:5173/*
   http://localhost:5174/*
   http://127.0.0.1:5173/*
   ```
4. Para producción, agrega tu dominio:
   ```
   https://tudominio.com/*
   ```

**c) Restricciones de API:**
1. Selecciona: **"Restringir clave"**
2. En el desplegable, busca y marca **SOLO estas 2**:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
3. Deja todas las demás desmarcadas

**d) NO marques:**
- ❌ "Autenticar las llamadas a la API a través de una cuenta de servicio"
- Solo se necesita para APIs empresariales como Vertex AI

**e) Guardar:**
- Clic en **"GUARDAR"** (abajo)

---

### 5. Configurar Variables de Entorno

**a) Abrir el archivo `.env`:**

Ruta: `drowsiness-detection-app/.env`

**b) Pegar la clave:**

```env
# ========================
# CONFIGURACIÓN FRONTEND (Vite + React)
# ========================

# URL del Backend API (FastAPI en puerto 8000)
VITE_API_URL=http://localhost:8000

# Google Maps API Key
# Obtener en: https://console.cloud.google.com/apis/credentials
# Reemplazar con tu clave real
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q

# NOTA: El WebSocket se construye automáticamente desde VITE_API_URL
# http://localhost:8000 → ws://localhost:8000/api/v1/monitoring/viaje/{id}/stream
```

**c) Reemplazar:**
- Borra `YOUR_GOOGLE_MAPS_API_KEY_HERE`
- Pega tu clave real copiada del paso 3

---

### 6. Reiniciar el Servidor de Desarrollo

**a) Detener el servidor actual:**
- En la terminal del frontend, presiona `Ctrl + C`

**b) Reiniciar:**
```bash
cd drowsiness-detection-app
npm run dev
```

**c) Verificar que cargó la nueva variable:**
- El servidor debería iniciar sin errores
- Abre: http://localhost:5173

---

### 7. Probar la Funcionalidad

**a) Navegar a Monitoreo de Viajes:**
1. Inicia sesión como administrador
2. Ve a **"Monitoreo Viajes"** en el menú lateral
3. Haz clic en cualquier viaje activo

**b) Verificar el mapa:**
- ✅ El mapa de Google Maps debería cargarse correctamente
- ✅ NO debería aparecer el error: "Falta VITE_GOOGLE_MAPS_API_KEY"
- ✅ Deberías ver el marcador de posición y la polyline

**c) Probar posiciones en tiempo real:**
1. Haz clic en el botón **"+ Posición Test"** (arriba a la derecha)
2. Observa cómo:
   - El marcador se mueve
   - La polyline (línea morada) se extiende
   - El contador de posiciones aumenta

---

## 🔧 Solución de Problemas

### Error: "Falta VITE_GOOGLE_MAPS_API_KEY"
**Causa**: La variable no está en el `.env` o el servidor no se reinició.

**Solución**:
1. Verifica que el `.env` tenga la línea: `VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui`
2. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

---

### Error: "This page can't load Google Maps correctly"
**Causa**: API key inválida o APIs no habilitadas.

**Solución**:
1. Verifica que **Maps JavaScript API** esté habilitada (paso 2b)
2. Verifica que **Geocoding API** esté habilitada (paso 2c)
3. Espera 1-2 minutos (las APIs tardan en propagarse)
4. Verifica que la clave no tenga espacios extra

---

### Error: "RefererNotAllowedMapError"
**Causa**: La URL actual no está en las restricciones.

**Solución**:
1. Ve a Google Cloud Console → Credenciales
2. Edita tu clave API
3. En "Restricciones de aplicaciones", agrega:
   ```
   http://localhost:5173/*
   ```
4. Guarda y espera 1-2 minutos

---

### El mapa no se actualiza en tiempo real
**Causa**: WebSocket no está conectado.

**Solución**:
1. Verifica que el backend esté corriendo en puerto 8000
2. Verifica que `VITE_API_URL=http://localhost:8000` en `.env`
3. Abre la consola del navegador (F12) y busca errores de WebSocket
4. Verifica los logs del backend (terminal donde corre uvicorn)

---

## 💰 Costos y Límites

### Nivel Gratuito de Google Maps Platform:
- **$200 USD** de crédito gratis cada mes
- **28,000 cargas de mapa** gratis mensuales
- **40,000 llamadas a Geocoding** gratis mensuales

### Para desarrollo típico:
- El sistema de monitoreo consume ~100 cargas/día
- **Total mensual**: ~3,000 cargas = **Gratis** ✅

### Configurar límites (recomendado):
1. Google Cloud Console → **"APIs y servicios"** → **"Cuotas"**
2. Busca "Maps JavaScript API"
3. Establece un límite diario: `1000 solicitudes/día`
4. Esto evita sorpresas si alguien usa indebidamente tu clave

---

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas:
- Restricción por referentes HTTP (solo tu localhost/dominio)
- Restricción por API (solo Maps y Geocoding)
- Variable de entorno (no hardcodeada en el código)
- `.env` en `.gitignore` (no se sube a GitHub)

### ⚠️ NUNCA hagas esto:
- ❌ Subir el `.env` a GitHub público
- ❌ Compartir tu API key en foros/chats
- ❌ Dejar la clave sin restricciones
- ❌ Usar la misma clave en frontend y backend

### 🔐 Si tu clave se filtra:
1. Ve a Google Cloud Console → Credenciales
2. Encuentra tu clave comprometida
3. Haz clic en los 3 puntos → **"Regenerar clave"**
4. Actualiza el `.env` con la nueva clave
5. Reinicia el servidor

---

## 📚 Recursos Adicionales

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Best Practices](https://developers.google.com/maps/documentation/javascript/best-practices)

---

## ✅ Checklist de Verificación

Antes de considerar la configuración completa:

- [ ] Proyecto creado en Google Cloud Console
- [ ] Maps JavaScript API habilitada
- [ ] Geocoding API habilitada
- [ ] Clave API creada
- [ ] Restricciones de referentes HTTP configuradas
- [ ] Restricciones de API configuradas
- [ ] Clave pegada en `.env` del frontend
- [ ] Servidor frontend reiniciado
- [ ] Mapa carga correctamente en la interfaz
- [ ] Posiciones de prueba funcionan
- [ ] WebSocket conectado (badge verde)
- [ ] Polyline se actualiza en tiempo real

---

**¡Configuración completa!** 🎉

Si tienes problemas, revisa la sección de "Solución de Problemas" o consulta los logs del navegador (F12 → Console) y del backend (terminal de uvicorn).
