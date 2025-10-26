from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.middleware import setup_middlewares
from app.api.v1.routers import auth

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para Sistema de Detección de Somnolencia en Conductores",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar middlewares
setup_middlewares(app)

# Incluir routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["Autenticación"]
)


@app.get("/")
def root():
    """
    **Endpoint raíz**
    
    Retorna información básica de la API
    """
    return {
        "message": "Sistema de Detección de Somnolencia - API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "🟢 Operativo"
    }


@app.get("/health")
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