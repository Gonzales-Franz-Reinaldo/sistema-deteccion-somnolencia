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