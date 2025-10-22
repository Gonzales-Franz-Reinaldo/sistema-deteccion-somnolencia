from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class User:
    """Modelo de Usuario"""
    id_usuario: int
    usuario: str
    rol: str  # 'admin' o 'chofer'
    nombre_completo: str
    email: str
    telefono: Optional[str] = None
    activo: bool = True
    primer_inicio: bool = True
    fecha_registro: Optional[datetime] = None
    ultima_sesion: Optional[datetime] = None
    
    # Datos adicionales para chofer
    dni_ci: Optional[str] = None
    genero: Optional[str] = None
    tipo_chofer: Optional[str] = None  # 'individual' o 'empresa'
    id_empresa: Optional[int] = None
    numero_licencia: Optional[str] = None
    
    def is_admin(self) -> bool:
        """Verificar si el usuario es administrador"""
        return self.rol == "admin"
    
    def is_chofer(self) -> bool:
        """Verificar si el usuario es chofer"""
        return self.rol == "chofer"
    
    def to_dict(self) -> dict:
        """Convertir a diccionario"""
        return {
            "id_usuario": self.id_usuario,
            "usuario": self.usuario,
            "rol": self.rol,
            "nombre_completo": self.nombre_completo,
            "email": self.email,
            "activo": self.activo,
        }