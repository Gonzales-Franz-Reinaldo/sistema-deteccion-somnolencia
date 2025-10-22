import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict
import pickle
import os
from config.database import db
from models.user import User

class AuthService:
    """Servicio de autenticación y gestión de usuarios (Singleton)"""
    
    _instance = None
    SESSION_FILE = "session.pkl"  # Archivo para persistir sesión
    SESSION_DURATION_MINUTES = 15  # Duración de sesión en minutos
    
    def __new__(cls):
        """Implementar patrón Singleton"""
        if cls._instance is None:
            cls._instance = super(AuthService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Inicializar solo una vez"""
        if self._initialized:
            return
        
        self._initialized = True
        self.login_attempts = {}
        self.current_user: Optional[User] = None
        self.session_expiry: Optional[datetime] = None
        
        # Intentar restaurar sesión desde archivo
        self._restore_session()
    
    def login(self, username: str, password: str) -> Dict:
        """
        Autenticar usuario
        
        Returns:
            dict con:
            - success: bool
            - user: User object o None
            - message: str
            - attempts_left: int (si falla)
        """
        try:

            # Verificar intentos fallidos
            if username in self.login_attempts:
                if self.login_attempts[username] >= 3:
                    return {
                        "success": False,
                        "user": None,
                        "message": "Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.",
                        "attempts_left": 0
                    }
            
            # Buscar usuario en la base de datos
            with db.get_cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        id_usuario, usuario, password_hash, rol, nombre_completo, 
                        email, telefono, activo, primer_inicio, fecha_registro, 
                        ultima_sesion, dni_ci, genero, tipo_chofer, id_empresa, 
                        numero_licencia
                    FROM usuarios 
                    WHERE usuario = %s AND activo = TRUE
                """, (username,))
                
                user_data = cursor.fetchone()
                
                if not user_data:
                    self._increment_login_attempts(username)
                    return {
                        "success": False,
                        "user": None,
                        "message": "Usuario no encontrado o inactivo",
                        "attempts_left": 3 - self.login_attempts.get(username, 0)
                    }
                
                # Verificar contraseña
                password_hash = user_data["password_hash"]
                if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                    self._increment_login_attempts(username)
                    return {
                        "success": False,
                        "user": None,
                        "message": "Contraseña incorrecta",
                        "attempts_left": 3 - self.login_attempts.get(username, 0)
                    }
                
                # Login exitoso - Crear objeto User
                user = User(
                    id_usuario=user_data["id_usuario"],
                    usuario=user_data["usuario"],
                    rol=user_data["rol"],
                    nombre_completo=user_data["nombre_completo"],
                    email=user_data["email"],
                    telefono=user_data["telefono"],
                    activo=user_data["activo"],
                    primer_inicio=user_data["primer_inicio"],
                    fecha_registro=user_data["fecha_registro"],
                    ultima_sesion=user_data["ultima_sesion"],
                    dni_ci=user_data["dni_ci"],
                    genero=user_data["genero"],
                    tipo_chofer=user_data["tipo_chofer"],
                    id_empresa=user_data["id_empresa"],
                    numero_licencia=user_data["numero_licencia"],
                )
                
                # Actualizar última sesión
                cursor.execute("""
                    UPDATE usuarios 
                    SET ultima_sesion = %s 
                    WHERE id_usuario = %s
                """, (datetime.now(), user.id_usuario))
                
                # Limpiar intentos fallidos
                if username in self.login_attempts:
                    del self.login_attempts[username]
                
                # Guardar usuario actual y establecer expiración
                self.current_user = user
                self.session_expiry = datetime.now() + timedelta(minutes=self.SESSION_DURATION_MINUTES)
                
                # Persistir sesión
                self._save_session()
                
                print(f"Usuario guardado en sesión: {user.nombre_completo} (ID: {user.id_usuario}, Rol: {user.rol})")
                print(f"Sesión expira en: {self.SESSION_DURATION_MINUTES} minutos ({self.session_expiry.strftime('%H:%M:%S')})")
                
                return {
                    "success": True,
                    "user": user,
                    "message": "Login exitoso",
                    "attempts_left": 3
                }
        
        except Exception as e:
            print(f"Error en login: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "user": None,
                "message": f"Error en el servidor: {str(e)}",
                "attempts_left": 3
            }
    
    def logout(self):
        """Cerrar sesión"""
        if self.current_user:
            print(f"Cerrando sesión de: {self.current_user.nombre_completo}")
        
        self.current_user = None
        self.session_expiry = None
        
        # Eliminar archivo de sesión
        self._delete_session()
        
        print("Sesión cerrada correctamente")
    
    def get_current_user(self) -> Optional[User]:
        """Obtener usuario actual y verificar si la sesión sigue válida"""
        
        # Si no hay usuario, no hay sesión
        if not self.current_user:
            print("No hay usuario en sesión")
            return None
        
        # Verificar si la sesión ha expirado
        if self.session_expiry and datetime.now() > self.session_expiry:
            print(f"Sesión expirada para: {self.current_user.nombre_completo}")
            self.logout()
            return None
        
        # Renovar tiempo de expiración (cada vez que se accede)
        self._renew_session()
        
        print(f"Usuario en sesión: {self.current_user.nombre_completo} (Rol: {self.current_user.rol})")
        print(f"esión expira en: {(self.session_expiry - datetime.now()).seconds // 60} minutos")
        
        return self.current_user
    
    def is_session_active(self) -> bool:
        """Verificar si hay una sesión activa"""
        user = self.get_current_user()
        return user is not None
    
    def _renew_session(self):
        """Renovar tiempo de expiración de la sesión"""
        if self.current_user:
            self.session_expiry = datetime.now() + timedelta(minutes=self.SESSION_DURATION_MINUTES)
            self._save_session()
    
    def _save_session(self):
        """Guardar sesión en archivo para persistencia"""
        try:
            session_data = {
                "user": self.current_user,
                "expiry": self.session_expiry
            }
            with open(self.SESSION_FILE, 'wb') as f:
                pickle.dump(session_data, f)
            print("Sesión guardada en archivo")
        except Exception as e:
            print(f"Error al guardar sesión: {e}")
    
    def _restore_session(self):
        """Restaurar sesión desde archivo"""
        try:
            if os.path.exists(self.SESSION_FILE):
                with open(self.SESSION_FILE, 'rb') as f:
                    session_data = pickle.load(f)
                
                # Verificar si la sesión no ha expirado
                if session_data["expiry"] > datetime.now():
                    self.current_user = session_data["user"]
                    self.session_expiry = session_data["expiry"]
                    print(f"Sesión restaurada: {self.current_user.nombre_completo}")
                    print(f"Expira en: {(self.session_expiry - datetime.now()).seconds // 60} minutos")
                else:
                    print("Sesión expirada, eliminando archivo")
                    self._delete_session()
        except Exception as e:
            print(f"Error al restaurar sesión: {e}")
            self._delete_session()
    
    def _delete_session(self):
        """Eliminar archivo de sesión"""
        try:
            if os.path.exists(self.SESSION_FILE):
                os.remove(self.SESSION_FILE)
                print("Archivo de sesión eliminado")
        except Exception as e:
            print(f"Error al eliminar sesión: {e}")
    
    def _increment_login_attempts(self, username: str):
        """Incrementar contador de intentos fallidos"""
        if username not in self.login_attempts:
            self.login_attempts[username] = 0
        self.login_attempts[username] += 1
        print(f"Intento fallido #{self.login_attempts[username]} para: {username}")
    
    def reset_login_attempts(self, username: str):
        """Resetear intentos fallidos (solo admin)"""
        if username in self.login_attempts:
            del self.login_attempts[username]
            print(f"Intentos reseteados para: {username}")