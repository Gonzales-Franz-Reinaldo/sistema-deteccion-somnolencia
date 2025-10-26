from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_active_user
from app.schemas.token import Token, RefreshTokenRequest
from app.schemas.user import UserResponse, PasswordChange
from app.services.auth_service import auth_service
from app.models.user import Usuario
from app.crud.user import user as user_crud

router = APIRouter()


@router.post("/login", response_model=dict, status_code=status.HTTP_200_OK)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    **Login de usuario**
    
    Autentica al usuario y retorna tokens JWT (access + refresh)
    
    **Parámetros:**
    - `username`: Nombre de usuario
    - `password`: Contraseña
    
    **Respuesta exitosa (200):**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "user": {
            "id_usuario": 1,
            "usuario": "admin",
            "nombre_completo": "Administrador del Sistema",
            "email": "admin@sistema.com",
            "rol": "admin",
            "primer_inicio": false
        }
    }
    ```
    
    **Errores:**
    - `401`: Credenciales inválidas
    - `403`: Usuario inactivo
    - `429`: Cuenta bloqueada por intentos fallidos
    """
    return auth_service.authenticate_user(
        db=db,
        usuario=form_data.username,
        password=form_data.password
    )


@router.post("/refresh", response_model=dict, status_code=status.HTTP_200_OK)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    **Renovar Access Token**
    
    Genera un nuevo access token usando un refresh token válido
    
    **Body:**
    ```json
    {
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    
    **Respuesta exitosa (200):**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer"
    }
    ```
    
    **Errores:**
    - `401`: Refresh token inválido o expirado
    - `404`: Usuario no encontrado
    - `403`: Usuario inactivo
    """
    return auth_service.refresh_access_token(
        db=db,
        refresh_token=request.refresh_token
    )


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_current_user_info(
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    **Obtener información del usuario actual**
    
    Retorna los datos del usuario autenticado
    
    **Requiere:** Token JWT válido en el header `Authorization: Bearer <token>`
    
    **Respuesta exitosa (200):**
    ```json
    {
        "id_usuario": 1,
        "usuario": "admin",
        "nombre_completo": "Administrador del Sistema",
        "email": "admin@sistema.com",
        "rol": "admin",
        "activo": true,
        "primer_inicio": false,
        "fecha_registro": "2025-10-22T02:09:04.485128",
        "ultima_sesion": "2025-10-22T03:30:15.123456"
    }
    ```
    
    **Errores:**
    - `401`: Token inválido o expirado
    - `403`: Usuario inactivo
    """
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    **Cambiar contraseña del usuario actual**
    
    Permite al usuario cambiar su propia contraseña
    
    **Requiere:** Token JWT válido
    
    **Body:**
    ```json
    {
        "current_password": "password_actual",
        "new_password": "nueva_password_123"
    }
    ```
    
    **Respuesta exitosa (200):**
    ```json
    {
        "message": "Contraseña actualizada exitosamente"
    }
    ```
    
    **Errores:**
    - `401`: Contraseña actual incorrecta
    - `400`: Nueva contraseña inválida
    """
    
    # Verificar contraseña actual
    user = user_crud.authenticate(
        db,
        usuario=current_user.usuario,
        password=password_data.current_password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña actual incorrecta"
        )
    
    # Actualizar contraseña
    user_crud.update_password(
        db,
        user=current_user,
        new_password=password_data.new_password
    )
    
    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    **Cerrar sesión**
    
    Endpoint para cerrar sesión (en el frontend se debe eliminar el token)
    
    **Nota:** Como usamos JWT stateless, el token seguirá siendo válido hasta
    que expire. El cliente debe eliminar el token del almacenamiento local.
    
    **Respuesta exitosa (200):**
    ```json
    {
        "message": "Sesión cerrada exitosamente"
    }
    ```
    """
    return {
        "message": "Sesión cerrada exitosamente",
        "user": current_user.usuario
    }