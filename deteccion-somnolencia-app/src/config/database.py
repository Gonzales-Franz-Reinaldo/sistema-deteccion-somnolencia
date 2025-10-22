import psycopg2
from psycopg2.extras import RealDictCursor
from config.settings import DB_CONFIG
from contextlib import contextmanager

class DatabaseConnection:
    """Gestor de conexión a PostgreSQL"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self.config = DB_CONFIG
        self._connection = None
    
    def connect(self):
        """Establecer conexión a la base de datos"""
        try:
            self._connection = psycopg2.connect(
                host=self.config["host"],
                port=self.config["port"],
                database=self.config["database"],
                user=self.config["user"],
                password=self.config["password"],
                cursor_factory=RealDictCursor
            )
            print("Conexión a PostgreSQL exitosa")
            return self._connection
        except Exception as e:
            print(f"Error al conectar a PostgreSQL: {e}")
            raise
    
    def disconnect(self):
        """Cerrar conexión"""
        if self._connection:
            self._connection.close()
            print("Conexión cerrada")
    
    @contextmanager
    def get_cursor(self):
        """Context manager para obtener cursor"""
        if not self._connection or self._connection.closed:
            self.connect()
        
        cursor = self._connection.cursor()
        try:
            yield cursor
            self._connection.commit()
        except Exception as e:
            self._connection.rollback()
            raise e
        finally:
            cursor.close()

# Instancia global
db = DatabaseConnection()