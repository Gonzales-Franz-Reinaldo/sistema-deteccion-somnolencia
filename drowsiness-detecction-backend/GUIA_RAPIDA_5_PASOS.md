# 📧 Guía Completa - Sistema de Notificaciones por Email

## 🎯 Resumen Ejecutivo
Esta guía te lleva paso a paso para activar y probar las notificaciones por email en el sistema.

---

## ❓ ACLARACIONES IMPORTANTES ANTES DE EMPEZAR

### **1. ¿Qué correo debo usar?**
**Respuesta:** Puedes usar **CUALQUIER cuenta de Gmail** que tengas.

**Opciones válidas:**
- ✅ Tu Gmail personal: `tu.email@gmail.com`
- ✅ Un Gmail nuevo creado para el sistema: `sistema.somnolencia@gmail.com`
- ✅ El Gmail del administrador (si quieres, pero no es obligatorio)
- ✅ Cualquier Gmail al que tengas acceso

**Lo importante:**
- Tener acceso a la cuenta Gmail
- Poder generar un "App Password" (contraseña de aplicación)
- Ese email será el **remitente** de todas las notificaciones

### **2. ¿Cómo funciona el flujo de emails?**

```
Backend del Sistema
    ↓
Conecta a Gmail SMTP con TU email configurado
    ↓
ENVÍA DESDE: tu-email-configurado@gmail.com
    ↓
ENVÍA HACIA: email-del-chofer@gmail.com (de la base de datos)
```

**Ejemplo práctico:**
1. Configuras en `.env`: `SMTP_USER=notificaciones2024@gmail.com`
2. Registras un chofer con email: `juan.perez@gmail.com`
3. Al marcar el checkbox, el sistema envía email:
   - **Desde:** notificaciones2024@gmail.com (tu configuración)
   - **Hacia:** juan.perez@gmail.com (email del chofer)

### **3. ¿El email del admin tiene que coincidir?**
**NO.** El email del administrador del sistema y el email SMTP son **completamente independientes**.

**Ejemplo:**
- Admin inicia sesión con: `admin@miempresa.com`
- Sistema envía notificaciones desde: `notificaciones@gmail.com`

Son dos cosas diferentes y pueden ser emails distintos sin problema.

### **4. ¿A quién se envían las notificaciones?**

**📧 Email de Credenciales:**
- Se envía al **email del chofer** que ingresas en el formulario de registro
- Solo si marcas el checkbox ☑ "Enviar credenciales por email al chofer"

**📧 Email de Viaje:**
- Se envía al **email del chofer** que está asignado al viaje (desde la BD)
- Solo si marcas el checkbox ☑ "Enviar viaje por email al chofer"

**IMPORTANTE:** Los choferes deben tener un email válido para recibir notificaciones.

### **5. ¿Necesito Gmail Workspace o cuenta pagada?**
**NO.** Funciona perfectamente con una cuenta Gmail **gratuita** normal.

### **6. ¿Por qué "App Password" y no mi contraseña normal?**

**Seguridad de Google:** Gmail no permite que aplicaciones externas usen tu contraseña normal.

**App Password:**
- Es una contraseña de 16 caracteres generada por Google
- Es específica para esta aplicación
- Si se compromete, la revocas y generas otra
- No afecta tu cuenta principal de Gmail
- Es más seguro que usar tu contraseña real

### **7. ¿Qué pasa si NO configuro el email?**

El sistema **sigue funcionando perfectamente**:
- ✅ Los choferes se registran sin problema
- ✅ Los viajes se asignan sin problema
- ❌ Solo no se envían las notificaciones por email

El email es **opcional** y no bloquea ninguna funcionalidad principal.

### **8. ¿Cuánto tardan en llegar los emails?**

Normalmente **menos de 1 minuto**.

**Si no llega:**
1. Revisa la carpeta **SPAM** (los primeros emails suelen ir ahí)
2. Verifica que escribiste bien el email del chofer
3. Revisa los logs del backend para ver si hay errores

### **9. ¿Qué contienen los emails?**

**Email 1 - Credenciales:**
- Saludo personalizado con el nombre del chofer
- Usuario y contraseña temporal
- Advertencia de seguridad (solo informativa)
- Diseño profesional con gradiente morado

**Email 2 - Viaje Asignado:**
- Saludo personalizado
- Origen y destino
- Fecha, hora, duración estimada
- Distancia y observaciones (si existen)
- Empresa asignada
- Diseño profesional con gradiente verde

---

## 📝 PASO 1: Generar Gmail App Password

### ¿Qué necesitas?
- Cuenta de Gmail
- 5 minutos de tiempo

### ¿Cómo hacerlo?
1. Ve a: https://myaccount.google.com/security
2. Busca **"Verificación en 2 pasos"** → Actívala si no está
3. Al final de la página, busca **"Contraseñas de aplicaciones"**
4. Haz clic → Selecciona **"Correo"** y **"Otro"**
5. Escribe: **"Sistema Detección Somnolencia"**
6. Haz clic en **"Generar"**
7. **¡IMPORTANTE!** Copia estos 16 caracteres:
   ```
   Ejemplo: abcd efgh ijkl mnop
   ```
   ⚠️ Se muestra solo una vez. Si la pierdes, deberás generar otra.

### ✅ Resultado
Tienes una contraseña de 16 caracteres (sin espacios).

---

## 📝 PASO 2: Configurar `.env`

### ¿Qué necesitas?
- La contraseña del Paso 1
- Editor de texto

### ¿Cómo hacerlo?
1. Abre el archivo `.env` en:
   ```
   D:\sistema-deteccion-somnolencia\drowsiness-detecction-backend\.env
   ```

2. Agrega al final del archivo:
   ```env
   # Email SMTP (Gmail)
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   EMAIL_FROM_ADDRESS=tu-email@gmail.com
   ```

3. **REEMPLAZA** los valores de ejemplo:
   - `tu-email@gmail.com` → Tu email real de Gmail
   - `abcdefghijklmnop` → La contraseña de 16 caracteres del Paso 1 (SIN ESPACIOS)

### ✅ Ejemplo Real
```env
# Email SMTP (Gmail)
SMTP_USER=sistema.somnolencia@gmail.com
SMTP_PASSWORD=xyzw1234abcd5678
EMAIL_FROM_ADDRESS=sistema.somnolencia@gmail.com
```

### ⚠️ IMPORTANTE
- NO uses tu contraseña normal de Gmail
- Usa la contraseña de aplicación de 16 caracteres
- Escribe la contraseña SIN ESPACIOS

---

## 📝 PASO 3: Reiniciar el Backend

### ¿Qué necesitas?
- El backend debe estar corriendo

### ¿Cómo hacerlo?

**Opción A: Desde VS Code Terminal**
1. Abre terminal en VS Code (`Ctrl + ~`)
2. Detén el servidor: `Ctrl + C`
3. Reinicia:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

**Opción B: Con Docker**
```powershell
docker-compose down
docker-compose up --build -d
```

### ✅ Resultado
Backend reiniciado y configuración cargada.

---

## 📝 PASO 4: Probar Envío de Credenciales

### ¿Qué necesitas?
- Acceso como administrador
- Un email real al que tengas acceso

### ¿Cómo hacerlo?
1. Ve a **"Registrar Chofer"**
2. Completa el formulario:
   - Nombre: Juan Pérez Test
   - Email: **tu-email-personal@gmail.com** ← MUY IMPORTANTE: Usa TU email
   - Usuario: jperez.test
   - (Demás campos normales)
3. **MARCA EL CHECKBOX:**
   ```
   ☑ Enviar credenciales por email al chofer
   ```
4. Haz clic en **"Registrar Chofer"**

### ✅ Resultado Esperado

**En la interfaz:**
- ✅ "Chofer registrado exitosamente"

**En tu email (revisa en 1 minuto):**
- Asunto: 🔐 Credenciales de Acceso - Sistema Detección Somnolencia
- Contenido: Email bonito con usuario y contraseña

**Si no llega:**
- Revisa la carpeta **SPAM** (es normal en primer envío)
- Márcalo como "No es spam"

**En los logs del backend:**
```
INFO: ✉️ Credenciales enviadas por email a tu-email-personal@gmail.com
```

---

## 📝 PASO 5: Probar Envío de Viaje

### ¿Qué necesitas?
- El chofer del Paso 4 (Juan Pérez Test)
- Una empresa registrada

### ¿Cómo hacerlo?
1. Ve a **"Asignar Viaje/Ruta"**
2. Completa el formulario:
   - Chofer: Juan Pérez Test
   - Origen: Quito - Centro
   - Destino: Guayaquil - Terminal
   - Fecha: Mañana
   - Hora: 08:00
   - Duración: 8 horas 30 minutos
   - Distancia: 420 km
   - Observaciones: Viaje de prueba
3. **MARCA EL CHECKBOX:**
   ```
   ☑ Enviar viaje por email al chofer
   ```
4. Haz clic en **"Asignar Viaje"**

### ✅ Resultado Esperado

**En la interfaz:**
- ✅ "Viaje asignado exitosamente"

**En tu email:**
- Asunto: 🚗 Nueva Ruta Asignada - [fecha]
- Contenido: Email bonito con todos los detalles del viaje

**En los logs:**
```
INFO: ✉️ Detalles del viaje enviados a tu-email-personal@gmail.com
```

---

## 🎉 ¡Felicitaciones!

Si completaste los 5 pasos y recibiste ambos emails, el sistema está funcionando perfectamente.

---

## ❌ ¿Algo salió mal?

### Problema: No llegan los emails

**Solución 1: Revisa SPAM**
- Los primeros emails suelen ir a spam
- Marca como "No es spam"

**Solución 2: Verifica la contraseña**
```env
# ❌ MAL
SMTP_PASSWORD=abcd efgh ijkl mnop  # Con espacios

# ✅ BIEN
SMTP_PASSWORD=abcdefghijklmnop  # Sin espacios
```

**Solución 3: Verifica los logs**
```powershell
# Busca mensajes de error
# Debería decir: "✉️ Credenciales enviadas por email..."
# Si dice: "⚠️ Error enviando credenciales..." hay un problema
```

**Solución 4: Regenera App Password**
1. Ve nuevamente a Google Account → Seguridad
2. Elimina la contraseña anterior
3. Genera una nueva
4. Actualiza `.env`
5. Reinicia el backend

---

## 📞 Más Ayuda

Si necesitas más detalles, consulta:
- **GUIA_PRUEBAS_EMAIL.md** - Guía completa detallada
- **RESUMEN_IMPLEMENTACION_EMAIL.md** - Documentación técnica

---

## 📋 Checklist Final

- [ ] Gmail App Password generado (16 caracteres)
- [ ] Variables agregadas a `.env` (3 variables)
- [ ] Backend reiniciado
- [ ] Probado email de credenciales ✅
- [ ] Probado email de viaje ✅
- [ ] Ambos emails recibidos correctamente

**Si marcaste todo ✅, el sistema está listo para usar!** 🎉

---

## 💡 Tip Pro

Para pruebas futuras:
- **CON checkbox marcado** → Envía email
- **SIN checkbox marcado** → NO envía email

Así puedes elegir cuándo notificar y cuándo no.

---

## 📊 Resumen Visual del Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│         CASO 1: REGISTRAR CHOFER CON EMAIL              │
└─────────────────────────────────────────────────────────┘
                        │
    1. Admin registra chofer
       └─ Ingresa datos: nombre, email, teléfono, etc.
       └─ ☑ Marca "Enviar credenciales por email"
                        │
                        ▼
    2. Backend crea usuario en BD
       └─ Genera contraseña temporal
       └─ Guarda usuario con contraseña hasheada
                        │
                        ▼
    3. Backend envía email SMTP
       └─ Desde: tu-email-configurado@gmail.com
       └─ Hacia: email-del-chofer@gmail.com
       └─ Contenido: Usuario + Contraseña temporal
                        │
                        ▼
    4. Chofer recibe email
       └─ Ve su usuario: jperez
       └─ Ve su contraseña: X9kL2mN5pQ
       └─ Puede iniciar sesión en el sistema
                        │
                        ▼
    ✅ CHOFER NOTIFICADO Y LISTO PARA TRABAJAR


┌─────────────────────────────────────────────────────────┐
│         CASO 2: ASIGNAR VIAJE CON EMAIL                 │
└─────────────────────────────────────────────────────────┘
                        │
    1. Admin asigna viaje a chofer
       └─ Selecciona chofer existente
       └─ Ingresa: origen, destino, fecha, hora, etc.
       └─ ☑ Marca "Enviar viaje por email"
                        │
                        ▼
    2. Backend crea viaje en BD
       └─ Valida disponibilidad del chofer
       └─ Asigna viaje al chofer
                        │
                        ▼
    3. Backend envía email SMTP
       └─ Desde: tu-email-configurado@gmail.com
       └─ Hacia: email-del-chofer@gmail.com (de la BD)
       └─ Contenido: Detalles completos del viaje
                        │
                        ▼
    4. Chofer recibe email
       └─ Ve origen y destino
       └─ Ve fecha y hora
       └─ Ve duración y distancia
       └─ Ve observaciones importantes
                        │
                        ▼
    ✅ CHOFER NOTIFICADO Y PREPARADO PARA EL VIAJE
```

---

## 🔒 Nota de Seguridad

### **Advertencia en Email de Credenciales**

El email de credenciales incluye este mensaje:

> ⚠️ IMPORTANTE: Por razones de seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.

**ACLARACIÓN:** Este mensaje es **solo informativo**. 

El sistema actualmente **NO tiene implementada** la funcionalidad de cambio de contraseña por parte del usuario. El mensaje se incluye como buena práctica de seguridad, pero los choferes no podrán cambiar su contraseña por el momento.

Si en el futuro decides implementar esta funcionalidad, el mensaje ya estará presente en los emails.

---

## 📝 Checklist de Archivos del Sistema

### **Archivos de Código Modificados:**
- [✅] `app/core/config.py` - Configuración SMTP agregada
- [✅] `app/services/email.py` - Servicio de email completo (590 líneas)
- [✅] `app/services/__init__.py` - Package initializer
- [✅] `app/api/v1/routers/users.py` - Integración email credenciales
- [✅] `app/api/v1/routers/viajes.py` - Integración email viajes

### **Archivo de Configuración:**
- [⏳] `.env` - **DEBES CONFIGURAR** con tus credenciales Gmail

### **Estado:**
- ✅ Código implementado y sin errores
- ✅ Sistema listo para configuración
- ⏳ Pendiente: Configurar Gmail App Password

---

## 🎉 ¡Ya Casi Terminamos!

Después de completar los 5 pasos de esta guía:

✅ Sistema de notificaciones completamente funcional  
✅ Emails profesionales con diseño atractivo  
✅ Flujo automático al registrar choferes  
✅ Flujo automático al asignar viajes  
✅ Manejo robusto de errores  
✅ Sistema no se bloquea si falla el email  

---

**Última actualización:** Noviembre 2024
**Versión:** 2.0 - Guía Completa Unificada
