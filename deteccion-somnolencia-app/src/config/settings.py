import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de la aplicación
APP_TITLE = "Sistema de Detección de Somnolencia"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Tecnología de IA para tu seguridad vial"

# Dimensiones de ventana
WINDOW_WIDTH = 1600
WINDOW_HEIGHT = 1000
WINDOW_MIN_WIDTH = 1200
WINDOW_MIN_HEIGHT = 800

# Colores del tema (basados en tus mockups)
COLORS = {
    "primary": "#667eea",           # Morado principal
    "primary_dark": "#5a67d8",      # Morado oscuro
    "primary_light": "#a5b4fc",     # Morado claro
    "secondary": "#f6ad55",         # Naranja
    "danger": "#f56565",            # Rojo
    "success": "#48bb78",           # Verde
    "warning": "#ed8936",           # Amarillo/Naranja
    "info": "#4299e1",              # Azul
    "background": "#f7fafc",        # Gris muy claro
    "surface": "#ffffff",           # Blanco
    "border": "#e2e8f0",            # Gris claro
    "text_primary": "#2d3748",      # Gris oscuro
    "text_secondary": "#718096",    # Gris medio
}

# Base de datos
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# Seguridad
MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", 3))
SESSION_TIMEOUT = int(os.getenv("SESSION_TIMEOUT", 3600))
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-change-me")