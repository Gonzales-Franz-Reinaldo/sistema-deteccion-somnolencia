from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    CRUD genérico con operaciones básicas
    
    Type Parameters:
        - ModelType: Modelo SQLAlchemy
        - CreateSchemaType: Schema Pydantic para creación
        - UpdateSchemaType: Schema Pydantic para actualización
    """
    
    def __init__(self, model: Type[ModelType]):
        """
        Inicializar CRUD con el modelo
        
        Args:
            model: Clase del modelo SQLAlchemy
        """
        self.model = model
    
    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Obtener un registro por ID
        
        Args:
            db: Sesión de BD
            id: ID del registro
            
        Returns:
            Instancia del modelo o None
        """
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModelType]:
        """
        Obtener múltiples registros con paginación
        
        Args:
            db: Sesión de BD
            skip: Número de registros a saltar
            limit: Número máximo de registros a retornar
            
        Returns:
            Lista de instancias del modelo
        """
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Crear un nuevo registro
        
        Args:
            db: Sesión de BD
            obj_in: Schema Pydantic con datos para crear
            
        Returns:
            Instancia del modelo creada
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Actualizar un registro existente
        
        Args:
            db: Sesión de BD
            db_obj: Instancia actual del modelo
            obj_in: Schema Pydantic o dict con datos a actualizar
            
        Returns:
            Instancia del modelo actualizada
        """
        obj_data = jsonable_encoder(db_obj)
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> ModelType:
        """
        Eliminar un registro
        
        Args:
            db: Sesión de BD
            id: ID del registro a eliminar
            
        Returns:
            Instancia del modelo eliminada
        """
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj