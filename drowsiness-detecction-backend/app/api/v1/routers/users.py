from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin_user, get_current_user
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    PasswordReset
)
from app.crud.user import user as user_crud
from app.models.user import Usuario

router = APIRouter()


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo chofer",
    description="**Solo Admin** puede registrar nuevos choferes en el sistema"
)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate = Body(
        ...,
        examples={
            "chofer_individual": {
                "summary": "Chofer Individual",
                "description": "Chofer que trabaja de forma independiente",
                "value": {
                    "usuario": "rsilva",
                    "password": "chofer123",
                    "email": "rsilva@email.com",
                    "nombre_completo": "Roberto Silva Gutiérrez",
                    "telefono": "+591 70111111",
                    "rol": "chofer",
                    "dni_ci": "11223344",
                    "genero": "masculino",
                    "nacionalidad": "Boliviana",
                    "fecha_nacimiento": "1988-05-10",
                    "direccion": "Calle Falsa #123",
                    "ciudad": "Cochabamba",
                    "codigo_postal": "00002",
                    "tipo_chofer": "individual",
                    "numero_licencia": "LIC-555666",
                    "categoria_licencia": "Categoría C"
                }
            },
            "chofer_empresa": {
                "summary": "Chofer de Empresa",
                "description": "Chofer empleado por una empresa de transporte",
                "value": {
                    "usuario": "mlopez",
                    "password": "chofer123",
                    "email": "mlopez@transcorp.com",
                    "nombre_completo": "María López González",
                    "telefono": "+591 70222222",
                    "rol": "chofer",
                    "dni_ci": "55667788",
                    "genero": "femenino",
                    "nacionalidad": "Boliviana",
                    "fecha_nacimiento": "1992-08-15",
                    "direccion": "Av. Principal #456",
                    "ciudad": "La Paz",
                    "codigo_postal": "00003",
                    "tipo_chofer": "empresa",
                    "id_empresa": 1,
                    "numero_licencia": "LIC-777888",
                    "categoria_licencia": "Categoría D"
                }
            }
        }
    ),
    current_user: Usuario = Depends(get_current_admin_user)
):
    
    # Validar que solo se creen choferes (no admins)
    if user_in.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden registrar usuarios con rol 'chofer'"
        )
    
    # Verificar duplicados
    if user_crud.get_by_usuario(db, usuario=user_in.usuario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario ya existe"
        )
    
    if user_crud.get_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    if user_in.dni_ci and user_crud.get_by_dni(db, dni_ci=user_in.dni_ci):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DNI/CI ya registrado"
        )
    
    user = user_crud.create(db, obj_in=user_in)
    return user


@router.get(
    "/",
    response_model=UserListResponse,
    summary="Listar choferes",
    description="**Solo Admin** - Obtiene lista paginada de choferes registrados"
)
def list_users(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Registros a saltar (paginación)"),
    limit: int = Query(100, ge=1, le=100, description="Límite de resultados"),
    activo: bool = Query(None, description="Filtrar por estado activo/inactivo"),
    tipo_chofer: str = Query(None, description="Filtrar por tipo (individual/empresa)"),
    id_empresa: int = Query(None, description="Filtrar por empresa"),
    current_user: Usuario = Depends(get_current_admin_user)
):
    
    # Solo mostrar choferes (no admins)
    query = db.query(user_crud.model).filter(user_crud.model.rol == "chofer")
    
    # Aplicar filtros
    if activo is not None:
        query = query.filter(user_crud.model.activo == activo)
    
    if tipo_chofer:
        query = query.filter(user_crud.model.tipo_chofer == tipo_chofer)
    
    if id_empresa:
        query = query.filter(user_crud.model.id_empresa == id_empresa)
    
    # Obtener resultados
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "users": users
    }


@router.get(
    "/search",
    response_model=List[UserResponse],
    summary="Buscar choferes",
    description="**Solo Admin** - Busca choferes por nombre, usuario o email"
)
def search_users(
    *,
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    current_user: Usuario = Depends(get_current_admin_user)
):

    users = user_crud.search(db, query=q)
    # Filtrar solo choferes
    return [u for u in users if u.rol == "chofer"]


@router.get(
    "/{id_usuario}",
    response_model=UserResponse,
    summary="Obtener chofer por ID",
    description="Obtiene detalles de un chofer específico"
)
def get_user(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    current_user: Usuario = Depends(get_current_user)
):
    
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Admin puede ver cualquier chofer
    if current_user.is_admin:
        return user
    
    # Chofer solo puede ver su propio perfil
    if current_user.id_usuario == id_usuario:
        return user
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tiene permisos para ver este usuario"
    )


@router.put(
    "/{id_usuario}",
    response_model=UserResponse,
    summary="Actualizar chofer",
    description="**Solo Admin** puede actualizar datos de un chofer"
)
def update_user(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    user_in: UserUpdate = Body(
        ...,
        example={
            "nombre_completo": "Juan Carlos Pérez Actualizado",
            "telefono": "+591 70999999",
            "direccion": "Nueva dirección #456",
            "activo": True
        }
    ),
    current_user: Usuario = Depends(get_current_admin_user)
):
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Solo permitir editar choferes
    if user.rol != "chofer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden editar usuarios con rol 'chofer'"
        )
    
    user = user_crud.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete(
    "/{id_usuario}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar chofer",
    description="**Solo Admin** - Elimina un chofer del sistema"
)
def delete_user(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    current_user: Usuario = Depends(get_current_admin_user)
):

    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir eliminar admins
    if user.rol == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden eliminar usuarios administradores"
        )
    
    user_crud.remove(db, id=id_usuario)
    return {"message": "Usuario eliminado exitosamente"}
    


@router.post(
    "/{id_usuario}/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Resetear contraseña",
    description="**Solo Admin** - Resetea la contraseña de un chofer"
)
def reset_password(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    password_in: PasswordReset = Body(
        ...,
        example={
            "new_password": "nueva_password_temporal_123"
        }
    ),
    current_user: Usuario = Depends(get_current_admin_user)
):
   
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir resetear contraseña de admins
    if user.rol == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede resetear contraseña de administradores"
        )
    
    user_crud.update_password(db, user=user, new_password=password_in.new_password)
    
    return {"message": "Contraseña reseteada exitosamente"}


@router.patch(
    "/{id_usuario}/activate",
    response_model=UserResponse,
    summary="Activar chofer",
    description="**Solo Admin** - Activa un chofer desactivado"
)
def activate_user(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    current_user: Usuario = Depends(get_current_admin_user)
):
    
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.activo = True
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.patch(
    "/{id_usuario}/deactivate",
    response_model=UserResponse,
    summary="Desactivar chofer",
    description="**Solo Admin** - Desactiva un chofer (no lo elimina)"
)
def deactivate_user(
    *,
    db: Session = Depends(get_db),
    id_usuario: int,
    current_user: Usuario = Depends(get_current_admin_user)
):
   
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.activo = False
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user