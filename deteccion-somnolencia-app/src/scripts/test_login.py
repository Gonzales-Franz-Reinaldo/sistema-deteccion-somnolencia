"""
Script de prueba para verificar que el login funciona correctamente
"""
import bcrypt
import psycopg2
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from config.settings import DB_CONFIG

def test_login(username: str, password: str):
    """Probar login de un usuario"""
    print(f"\n{'='*60}")
    print(f"PROBANDO LOGIN: {username}")
    print(f"{'='*60}")
    
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
        
        # Buscar usuario
        cursor.execute(
            "SELECT usuario, password_hash, rol, nombre_completo FROM usuarios WHERE usuario = %s",
            (username,)
        )
        user = cursor.fetchone()
        
        if not user:
            print("❌ Usuario no encontrado")
            return False
        
        db_username, password_hash, rol, nombre = user
        
        print(f"✅ Usuario encontrado: {nombre} (Rol: {rol})")
        print(f"   Hash en BD: {password_hash[:50]}...")
        print(f"   Password a verificar: {password}")
        
        # Verificar contraseña
        if bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
            print("✅ CONTRASEÑA CORRECTA - Login exitoso")
            return True
        else:
            print("❌ CONTRASEÑA INCORRECTA - Login fallido")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def main():
    """Probar login de todos los usuarios"""
    print("\n" + "="*60)
    print("TEST DE AUTENTICACIÓN")
    print("="*60)
    
    # Usuarios a probar
    test_cases = [
        {"username": "admin", "password": "admin123"},
        {"username": "jperez", "password": "chofer123"},
        {"username": "mlopez", "password": "chofer123"},
        {"username": "admin", "password": "wrongpassword"},  # Test de contraseña incorrecta
    ]
    
    results = []
    for test in test_cases:
        result = test_login(test["username"], test["password"])
        results.append(result)
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE PRUEBAS")
    print("="*60)
    successful = sum(results[:-1])  # No contar el test de contraseña incorrecta
    print(f"✅ Exitosos: {successful}/3")
    print(f"❌ Fallidos: {3 - successful}/3")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()