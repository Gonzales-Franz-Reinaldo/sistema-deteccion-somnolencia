"""
Script para generar hashes de contraseñas y actualizar la base de datos
Ejecutar una sola vez para configurar usuarios iniciales
"""
import bcrypt
import psycopg2
from pathlib import Path
import sys

# Agregar el directorio src al path
sys.path.append(str(Path(__file__).parent.parent))

from config.settings import DB_CONFIG

def generate_hash(password: str) -> str:
    """Generar hash bcrypt para una contraseña"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def update_user_password(cursor, username: str, password: str):
    """Actualizar contraseña de un usuario"""
    password_hash = generate_hash(password)
    cursor.execute(
        "UPDATE usuarios SET password_hash = %s WHERE usuario = %s",
        (password_hash, username)
    )
    print(f"✅ Contraseña actualizada para usuario: {username}")
    print(f"   Hash generado: {password_hash[:50]}...")
    return password_hash

def main():
    """Actualizar contraseñas de usuarios iniciales"""
    
    print("=" * 60)
    print("GENERADOR DE HASHES DE CONTRASEÑAS")
    print("=" * 60)
    print()
    
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"]
        )
        cursor = conn.cursor()
        
        print("✅ Conexión exitosa a PostgreSQL")
        print()
        
        # Usuarios a actualizar
        users = [
            {"username": "admin", "password": "admin123"},
            {"username": "jperez", "password": "chofer123"},
            {"username": "mlopez", "password": "chofer123"},
        ]
        
        print("🔐 Generando hashes y actualizando base de datos...")
        print()
        
        for user in users:
            update_user_password(cursor, user["username"], user["password"])
        
        # Confirmar cambios
        conn.commit()
        print()
        print("=" * 60)
        print("✅ TODAS LAS CONTRASEÑAS ACTUALIZADAS CORRECTAMENTE")
        print("=" * 60)
        print()
        print("Credenciales de acceso:")
        print("-" * 60)
        for user in users:
            print(f"  Usuario: {user['username']:10} | Contraseña: {user['password']}")
        print("-" * 60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()