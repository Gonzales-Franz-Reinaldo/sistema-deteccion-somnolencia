import flet as ft
from components.navbar import NavBar
from config.settings import COLORS
from services.auth_service import AuthService

class ClientDashboardView(ft.View):
    """Dashboard del chofer/cliente"""
    
    def __init__(self, page: ft.Page):
        super().__init__(
            route="/client/dashboard",
            padding=0,
            spacing=0,
        )
        
        self.page = page
        self.auth_service = AuthService()  
        
        # Obtener usuario actual
        current_user = self.auth_service.get_current_user()
        
        # Si no hay usuario, redirigir al login
        if not current_user:
            print("ClientDashboard: No hay usuario autenticado, redirigiendo a login")
            page.go("/login")
            return
        
        # Verificar que sea chofer
        if not current_user.is_chofer():
            print(f"ClientDashboard: Usuario {current_user.usuario} no es chofer")
            page.go("/login")
            return
        
        print(f"ClientDashboard: Cargando para {current_user.nombre_completo}")
        
        self.controls = [
            ft.Column(
                controls=[
                    NavBar(page, current_user),
                    
                    # Contenido del dashboard
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Text(
                                    f"Bienvenido, {current_user.nombre_completo}",
                                    size=32,
                                    weight=ft.FontWeight.BOLD,
                                    color=COLORS["primary"],
                                ),
                                
                                ft.Container(height=20),
                                
                                ft.Text(
                                    "Panel del Chofer",
                                    size=18,
                                    color=COLORS["text_secondary"],
                                ),
                                
                                ft.Container(height=30),
                                
                                # Botón para iniciar sesión de monitoreo
                                ft.ElevatedButton(
                                    content=ft.Row(
                                        controls=[
                                            ft.Icon(ft.Icons.PLAY_CIRCLE, size=30),
                                            ft.Text("Iniciar Monitoreo", size=18),
                                        ],
                                        alignment=ft.MainAxisAlignment.CENTER,
                                        spacing=10,
                                    ),
                                    style=ft.ButtonStyle(
                                        bgcolor=COLORS["success"],
                                        color=ft.Colors.WHITE,
                                        padding=20,
                                    ),
                                    width=300,
                                    height=70,
                                ),
                            ],
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=10,
                        ),
                        padding=40,
                        expand=True,
                    ),
                ],
                spacing=0,
                expand=True,
            )
        ]