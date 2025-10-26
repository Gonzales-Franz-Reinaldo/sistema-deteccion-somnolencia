from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Crear engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verificar conexión antes de usar
    echo=settings.DEBUG,  # Log SQL queries en desarrollo
    pool_size=10,         # Conexiones en el pool
    max_overflow=20       # Conexiones adicionales si es necesario
)

# Crear SessionLocal factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obtener sesión de BD
    
    Uso en FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            ...
    
    Yields:
        Sesión de SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()