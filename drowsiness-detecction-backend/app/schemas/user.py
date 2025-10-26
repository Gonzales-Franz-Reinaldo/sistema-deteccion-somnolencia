from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime, date
from enum import Enum


class RolEnum(str, Enum):
    """Roles disponibles en el sistema"""
    ADMIN = "admin"
    CHOFER = "chofer"


class GeneroEnum(str, Enum):
    """Géneros disponibles"""
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"


class TipoChoferEnum(str, Enum):
    """Tipos de chofer"""
    INDIVIDUAL = "individual"
    EMPRESA = "empresa"


# ============================================
# SCHEMAS BASE
# ============================================

class UserBase(BaseModel):
    """Schema base para Usuario"""
    usuario: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    nombre_completo: str = Field(..., min_length=3, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    rol: RolEnum


# ============================================
# SCHEMAS PARA CREACIÓN
# ============================================

class UserCreate(UserBase):
    """Schema para crear un usuario nuevo"""
    password: str = Field(..., min_length=6, max_length=100)
    
    # Datos adicionales para chofer
    dni_ci: Optional[str] = Field(None, max_length=20)
    genero: Optional[GeneroEnum] = None
    nacionalidad: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=20)
    
    # Información laboral
    tipo_chofer: Optional[TipoChoferEnum] = None
    id_empresa: Optional[int] = None
    numero_licencia: Optional[str] = Field(None, max_length=50)
    categoria_licencia: Optional[str] = Field(None, max_length=50)
    
    @validator("dni_ci", "genero", "tipo_chofer")
    def validate_chofer_required_fields(cls, v, values):
        """Validar que los choferes tengan campos obligatorios"""
        if values.get("rol") == RolEnum.CHOFER and v is None:
            raise ValueError("Este campo es obligatorio para choferes")
        return v


class UserUpdate(BaseModel):
    """Schema para actualizar un usuario"""
    email: Optional[EmailStr] = None
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    dni_ci: Optional[str] = Field(None, max_length=20)
    genero: Optional[GeneroEnum] = None
    nacionalidad: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=20)
    numero_licencia: Optional[str] = Field(None, max_length=50)
    categoria_licencia: Optional[str] = Field(None, max_length=50)
    activo: Optional[bool] = None


class PasswordChange(BaseModel):
    """Schema para cambio de contraseña"""
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class PasswordReset(BaseModel):
    """Schema para resetear contraseña (admin)"""
    new_password: str = Field(..., min_length=6, max_length=100)


# ============================================
# SCHEMAS PARA RESPUESTA
# ============================================

class UserResponse(UserBase):
    """Schema para respuesta de usuario"""
    id_usuario: int
    dni_ci: Optional[str] = None
    genero: Optional[str] = None
    nacionalidad: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None
    tipo_chofer: Optional[str] = None
    id_empresa: Optional[int] = None
    numero_licencia: Optional[str] = None
    categoria_licencia: Optional[str] = None
    activo: bool
    primer_inicio: bool
    fecha_registro: datetime
    ultima_sesion: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Pydantic V2 (antes era orm_mode = True)


class UserListResponse(BaseModel):
    """Schema para listado de usuarios con paginación"""
    total: int
    page: int
    page_size: int
    users: list[UserResponse]