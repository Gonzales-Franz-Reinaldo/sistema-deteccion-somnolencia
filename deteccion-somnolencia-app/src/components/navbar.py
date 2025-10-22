import flet as ft
from config.settings import COLORS, APP_TITLE
from models.user import User
from services.auth_service import AuthService

class NavBar(ft.Container):
    """Barra de navegación superior"""
    
    def __init__(self, page: ft.Page, user: User):
        self.page = page
        self.user = user
        self.auth_service = AuthService()
        
        super().__init__(
            content=ft.Row(
                controls=[
                    # Logo y título
                    ft.Row(
                        controls=[
                            ft.Icon(
                                ft.Icons.REMOVE_RED_EYE_OUTLINED,
                                size=30,
                                color=ft.Colors.WHITE,
                            ),
                            ft.Text(
                                APP_TITLE,
                                size=18,
                                weight=ft.FontWeight.BOLD,
                                color=ft.Colors.WHITE,
                            ),
                        ],
                        spacing=10,
                    ),
                    
                    # Usuario y acciones
                    ft.Row(
                        controls=[
                            # Badge de rol
                            ft.Container(
                                content=ft.Text(
                                    user.rol.upper(),
                                    size=12,
                                    weight=ft.FontWeight.BOLD,
                                    color=ft.Colors.WHITE,
                                ),
                                bgcolor=ft.Colors.with_opacity(0.3, ft.Colors.WHITE),
                                padding=ft.padding.symmetric(horizontal=12, vertical=6),
                                border_radius=20,
                            ),
                            
                            # Nombre del usuario
                            ft.Row(
                                controls=[
                                    ft.Icon(ft.Icons.PERSON, color=ft.Colors.WHITE, size=20),
                                    ft.Text(
                                        user.nombre_completo,
                                        color=ft.Colors.WHITE,
                                        size=14,
                                    ),
                                ],
                                spacing=8,
                            ),
                            
                            #  BOTÓN DE LOGOUT DIRECTO (SIN DIÁLOGO)
                            ft.ElevatedButton(
                                content=ft.Row(
                                    [
                                        ft.Icon(ft.Icons.LOGOUT, size=18),
                                        ft.Text("Salir", size=14),
                                    ],
                                    spacing=5,
                                ),
                                style=ft.ButtonStyle(
                                    bgcolor=ft.Colors.with_opacity(0.2, ft.Colors.WHITE),
                                    color=ft.Colors.WHITE,
                                ),
                                on_click=self._do_logout, 
                            ),
                        ],
                        spacing=15,
                    ),
                ],
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            ),
            gradient=ft.LinearGradient(
                begin=ft.alignment.center_left,
                end=ft.alignment.center_right,
                colors=["#667eea", "#764ba2"],
            ),
            padding=ft.padding.symmetric(horizontal=30, vertical=15),
            height=70,
        )
    
    def _do_logout(self, e):
        """Ejecutar logout DIRECTAMENTE"""
        print(f"CERRANDO SESIÓN de: {self.user.nombre_completo}")
        
        # 1. Cerrar sesión
        self.auth_service.logout()
        
        # 2. Limpiar vistas
        self.page.views.clear()
        
        # 3. Mostrar notificación
        self.page.snack_bar = ft.SnackBar(
            content=ft.Text("Sesión cerrada", color=ft.Colors.WHITE),
            bgcolor=COLORS["success"],
        )
        self.page.snack_bar.open = True
        
        # 4. Redirigir
        print("Redirigiendo a /login")
        self.page.go("/login")