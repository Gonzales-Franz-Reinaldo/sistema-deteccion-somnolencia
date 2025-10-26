mi_proyecto_backend/
├── app/                          # Núcleo de la aplicación
│   ├── __init__.py
│   ├── main.py                   # Punto de entrada: crea la app FastAPI
│   ├── core/                     # Configuraciones y utilidades globales
│   │   ├── __init__.py
│   │   ├── config.py             # Variables de entorno (e.g., DB_URL, SECRET_KEY)
│   │   └── security.py           # JWT, hashing de passwords (usando passlib, jwt)
│   ├── api/                      # Capa de Presentación: Endpoints y Routers
│   │   ├── __init__.py
│   │   ├── deps.py               # Dependencias inyectadas (e.g., get_db, get_current_user)
│   │   └── v1/                   # Versión API (v1 para future-proof)
│   │       ├── __init__.py
│   │       ├── routers/          # Routers modulares por feature
│   │       │   ├── __init__.py
│   │       │   ├── users.py      # Router para /users (GET, POST, etc.)
│   │       │   └── auth.py       # Router para /auth (login, register)
│   │       └── schemas/          # Modelos Pydantic para requests/responses
│   │           ├── __init__.py
│   │           ├── user.py       # UserCreate, UserResponse
│   │           └── auth.py       # LoginRequest
│   ├── models/                   # Capa de Datos: Modelos de DB (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── base.py               # Base class para todos los modelos
│   │   └── user.py               # Modelo User (id, email, hashed_password)
│   ├── schemas/                  # Schemas Pydantic globales (si no van en api/)
│   │   ├── __init__.py
│   │   └── error.py              # HTTPException schemas
│   ├── crud/                     # Capa de Acceso a Datos: Operaciones CRUD
│   │   ├── __init__.py
│   │   ├── base.py               # Clase base para CRUD
│   │   └── user.py               # Funciones: get_user, create_user, etc.
│   ├── services/                 # Capa de Lógica de Negocio: Services
│   │   ├── __init__.py
│   │   └── user_service.py       # Lógica compleja: validar email, enviar notifs
│   └── db/                       # Gestión de Base de Datos
│       ├── __init__.py
│       ├── base_class.py         # Motor DB (e.g., create_engine)
│       ├── session.py            # Gestor de sesiones (get_db)
│       └── migrations/           # Alembic para migraciones (opcional)
├── tests/                        # Tests unitarios e integrales
│   ├── __init__.py
│   ├── conftest.py               # Fixtures pytest
│   └── test_routers/             # Tests por router
├── requirements.txt              # Dependencias: fastapi, uvicorn, sqlalchemy, pydantic, etc.
├── .env                          # Variables de entorno (git ignore)
├── .gitignore
└── README.md                     # Docs del proyecto

## Instrucciones de Instalación y Ejecución
Paso 1: Instalar dependencias

### cd /home/franz/workspace/projects/sistema-deteccion-somnolencia/
### drowsiness-detecction-backend

# Crear entorno virtual (si no existe)
python -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

## Paso 2: Configurar variables de entorno

# Generar SECRET_KEY seguro
openssl rand -hex 32   -> Ejecutar en la terminal para generar el Api Key y pegar en .env

# Editar .env con tus credenciales
nano .env

Contenido mínimo de .env:

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=sistema_deteccion_somnolencia

SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6  # Generado con openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

DEBUG=True
ENVIRONMENT=development

## Paso 3: Verificar conexión a la base de datos
# Entrar a PostgreSQL
psql -U postgres -d sistema_deteccion_somnolencia

# Verificar que existan las tablas
\dt

# Verificar que exista al menos un usuario
SELECT usuario, rol, activo FROM usuarios;

## Paso 4: Ejecutar la aplicación
# Opción 1: Ejecutar directamente
python -m app.main

# Opción 2: Usar uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Para que funcione el login con las credenciales válidas ejecutar el scrip test/regenerate_password
- python test/regenerate_passwords.py

