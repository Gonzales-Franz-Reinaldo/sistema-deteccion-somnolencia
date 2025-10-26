from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.core.middleware import setup_middlewares
from app.api.v1.routers import auth, empresas, users

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## 🚗 Sistema de Detección de Somnolencia - API REST
    
    API completa para el sistema de monitoreo de somnolencia en conductores.
    
    ### 🔐 Autenticación
    
    Esta API usa **JWT Bearer Token** para autenticación.
    
    **Pasos para usar en Swagger:**
    
    1. **Login**: Endpoint `POST /api/v1/auth/login`
       ```json
       {
           "username": "admin",
           "password": "admin123"
       }
       ```
    
    2. **Obtener token**: Copiar el `access_token` de la respuesta
    
    3. **Autorizar**: Click en 🔓 **"Authorize"** (arriba a la derecha)
       - Pegar el token
       - Click "Authorize"
    
    4. **Usar endpoints**: Ahora tienes acceso a todos los endpoints según tu rol
    
    ---
    
    ### Pasos para usar en Postman:
    
    1. **Login**: `POST http://localhost:8000/api/v1/auth/login`
       - Headers: `Content-Type: application/json`
       - Body (raw JSON):
         ```json
         {
             "username": "admin",
             "password": "admin123"
         }
         ```
    
    2. **Copiar token**: Copiar el `access_token` de la respuesta
    
    3. **Configurar auth en requests**:
       - Tab `Authorization`
       - Type: `Bearer Token`
       - Token: Pegar el `access_token`
    
    ---
    
    ## 📚 Características
    
    * **Autenticación JWT** - Tokens de acceso (30 min) y refresh (7 días)
    * **Control de Roles** - Admin con permisos completos, Chofer con permisos limitados
    * **CRUD Completo** - Gestión de choferes y empresas (solo admin)
    * **Seguridad** - Bloqueo por intentos fallidos, tokens en blacklist
    * **Documentación** - Swagger UI interactivo y ReDoc
    
    ---
    
    ## 🔗 Enlaces
    
    * **Documentación Swagger**: [/docs](/docs)
    * **Documentación ReDoc**: [/redoc](/redoc)
    * **Health Check**: [/health](/health)
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Equipo de Desarrollo",
        "email": "dev@sistema-somnolencia.com"
    },
    license_info={
        "name": "MIT",
    }
)

# Configurar esquema de seguridad OAuth2 en Swagger
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=app.description,
        routes=app.routes,
    )
    
    # Agregar esquema de seguridad
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Ingrese el token JWT obtenido del endpoint /auth/login"
        }
    }
    
    # Aplicar seguridad a todos los endpoints excepto login y refresh
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if path not in ["/api/v1/auth/login", "/api/v1/auth/refresh"]:
                openapi_schema["paths"][path][method]["security"] = [{"Bearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Configurar middlewares
setup_middlewares(app)

# Incluir routers con tags para organización en Swagger
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["🔐 Autenticación"]
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_PREFIX}/users",
    tags=["👥 Gestión de Choferes (Solo Admin)"]
)

app.include_router(
    empresas.router,
    prefix=f"{settings.API_V1_PREFIX}/empresas",
    tags=["🏢 Gestión de Empresas (Solo Admin)"]
)


@app.get("/", tags=["ℹ️ Info"])
def root():
    """
    **Endpoint raíz**
    
    Retorna información básica de la API
    """
    return {
        "message": "Sistema de Detección de Somnolencia - API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "🟢 Operativo",
        "roles": {
            "admin": "Gestión completa del sistema",
            "chofer": "Solo login y monitoreo personal"
        }
    }


@app.get("/health", tags=["ℹ️ Info"])
def health_check():
    """
    **Health Check**
    
    Endpoint para verificar que la API está funcionando
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )