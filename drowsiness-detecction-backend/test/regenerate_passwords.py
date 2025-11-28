"""
Script para regenerar hashes de contraseñas con bcrypt nativo
"""
import sys
import os

# Añade la raíz del proyecto al path
project_root = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, os.path.abspath(project_root))

import bcrypt
from sqlalchemy import create_engine, text
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """Generar hash bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def regenerate_passwords():
    """Regenerar passwords de usuarios de prueba"""
    
    # Crear conexión
    engine = create_engine(settings.DATABASE_URL)
    
    # Usuarios de prueba con contraseñas conocidas
    users_to_update = [
        ('admin', 'admin123'),
        ('jperez', 'chofer123'),
        ('franz', 'franz123'),
    ]
    
    with engine.connect() as conn:
        for usuario, password in users_to_update:
            new_hash = get_password_hash(password)
            
            result = conn.execute(
                text("UPDATE usuarios SET password_hash = :hash WHERE usuario = :usuario"),
                {"hash": new_hash, "usuario": usuario}
            )
            conn.commit()
            
            print(f"✅ Usuario '{usuario}' actualizado - Hash: {new_hash[:30]}...")
    
    print("\n🎉 Todos los passwords fueron regenerados exitosamente")


if __name__ == "__main__":
    print("🔧 Regenerando hashes de contraseñas...")
    print(f"📍 Base de datos: {settings.DB_NAME}")
    print("-" * 50)
    
    regenerate_passwords()