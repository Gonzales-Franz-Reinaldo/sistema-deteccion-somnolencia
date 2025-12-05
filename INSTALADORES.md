# Instaladores de la Aplicación

Este documento reúne todo lo necesario para instalar y preparar el entorno del proyecto en Linux (solo comandos, ordenados por prioridad) y en Windows (enlaces oficiales a ejecutables .exe).

Componentes del proyecto:
- Backend (FastAPI) en `drowsiness-detecction-backend`
- Frontend (React + Vite) en `drowsiness-detection-app`
- App Android en `DriverDrowsinessDetectorApp`

---

## Linux (Ubuntu/Debian) — Solo comandos (por prioridad)

Notas:
- Ejecuta estos comandos en una terminal Bash con privilegios de sudo.
- Ajusta versiones según disponibilidad y distro.

### 1) Base del sistema y utilidades
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential ca-certificates gnupg lsb-release
```

### 2) Python 3 + venv + pip (Backend)
```bash
# Instalar Python 3 y herramientas
sudo apt install -y python3 python3-venv python3-pip

# Crear y activar entorno virtual en el repositorio
cd drowsiness-detecction-backend
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependencias del backend
pip install --upgrade pip
pip install -r requirements.txt

# (Opcional) Salir del entorno virtual
deactivate
```

### 3) Node.js + npm vía nvm (Frontend)
```bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Cargar nvm en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Instalar Node LTS (recomendado)
nvm install --lts
nvm use --lts

# Instalar dependencias del frontend
cd "$HOME/sistema-deteccion-somnolencia/drowsiness-detection-app"
npm install
```

### 4) OpenJDK 17 (requerido por Android/Gradle)
```bash
sudo apt install -y openjdk-17-jdk
java -version
```

### 5) Android Studio y SDK (Android)

Opción A (snap, simple):
```bash
sudo snap install android-studio --classic
```

Opción B (solo SDK por comandos, requiere cmdline-tools):
```bash
# Crear carpeta para SDK
mkdir -p "$HOME/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"

# Descarga cmdline-tools (usualmente a través de Android Studio). Si ya cuentas con cmdline-tools:
# Asegura que sdkmanager esté disponible en:
# $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager
# Instala paquetes (ajusta API level según disponibilidad)
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_SDK_ROOT" \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "cmdline-tools;latest"

# Aceptar licencias
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses --sdk_root="$ANDROID_SDK_ROOT"

# Variables de entorno persistentes (agregar a ~/.bashrc)
cat << 'EOF' >> "$HOME/.bashrc"
export ANDROID_SDK_ROOT="$HOME/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$PATH"
EOF
source "$HOME/.bashrc"
```

### 6) ADB y reglas udev (opcional)
```bash
sudo apt install -y adb
# Reglas udev para dispositivos Android (ejemplo genérico)
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android.rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### 7) PostgreSQL (opcional, si usas BD local)
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
# Crear usuario/BD (ejemplo)
sudo -u postgres createuser -P drowsy_user
sudo -u postgres createdb drowsy_db -O drowsy_user
```

### 8) Verificación rápida y ejecución
```bash
# Backend (FastAPI)
cd "$HOME/sistema-deteccion-somnolencia/drowsiness-detecction-backend"
python3 -m venv .venv; source .venv/bin/activate
cp .env.example .env
# Edita .env (DB_URL, SECRET_KEY, etc.)
export PYTHONPATH=.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (React + Vite)
cd "$HOME/sistema-deteccion-somnolencia/drowsiness-detection-app"
npm run dev
```

Android:
- Abre Android Studio (snap) y sincroniza Gradle.
- Ajusta `API_BASE_URL` en `DriverDrowsinessDetectorApp/app/build.gradle.kts`.
- Conecta el dispositivo y habilita depuración USB.

---

## Windows — Enlaces a ejecutables (.exe)

Instala en este orden (enlaces oficiales):

1) Git
- https://git-scm.com/download/win

2) Python 3 (Windows)
- https://www.python.org/downloads/windows/

3) Node.js (LTS)
- https://nodejs.org/en/download

4) JDK 17 (Temurin)
- https://adoptium.net/temurin/releases/?version=17

5) Android Studio
- https://developer.android.com/studio

6) VS Code (opcional)
- https://code.visualstudio.com/Download

7) Gradle (opcional, el proyecto usa wrapper)
- https://gradle.org/releases/

8) PostgreSQL (opcional)
- https://www.postgresql.org/download/windows/

### Pasos mínimos post-instalación (Windows PowerShell)
```powershell
# Backend
cd drowsiness-detecction-backend
py -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
$env:PYTHONPATH = "drowsiness-detecction-backend"; \
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd ..\drowsiness-detection-app
npm install
npm run dev
```

Android:
- Abre Android Studio, instala SDK y herramientas.
- Ajusta `API_BASE_URL` en `DriverDrowsinessDetectorApp/app/build.gradle.kts`.
- Compila e instala en dispositivo.

---

## Notas finales
- Ajusta IP/host del backend en Android (`API_BASE_URL`) y Frontend (`VITE_API_BASE_URL`).
- Verifica firewall/puerto 8000.
- Para distros distintas de Ubuntu/Debian, reemplaza `apt` por el gestor de paquetes correspondiente.
