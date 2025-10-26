from sqlalchemy.ext.declarative import as_declarative, declared_attr
from typing import Any


@as_declarative()
class Base:
    """
    Base class para todos los modelos SQLAlchemy
    Provee __tablename__ automático basado en el nombre de la clase
    """
    
    id: Any
    __name__: str
    
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Genera el nombre de la tabla automáticamente
        Convierte CamelCase a snake_case
        Ejemplo: Usuario -> usuarios
        """
        return cls.__name__.lower() + "s"