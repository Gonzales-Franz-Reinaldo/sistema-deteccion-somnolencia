import flet as ft
from components.navbar import NavBar
from config.settings import COLORS
from services.auth_service import AuthService

class AdminDashboardView(ft.View):
    """Dashboard del administrador"""
    
    def __init__(self, page: ft.Page):
        super().__init__(
            route="/admin/dashboard",
            padding=0,
            spacing=0,
        )
        
        self.page = page
        self.auth_service = AuthService()  
        
        # Obtener usuario actual
        current_user = self.auth_service.get_current_user()
        
        # Si no hay usuario, redirigir al login
        if not current_user:
            print("AdminDashboard: No hay usuario autenticado, redirigiendo a login")
            page.go("/login")
            return
        
        # Verificar que sea admin
        if not current_user.is_admin():
            print(f"AdminDashboard: Usuario {current_user.usuario} no es admin")
            page.go("/login")
            return
        
        
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
                                    "Panel de Control Administrativo",
                                    size=18,
                                    color=COLORS["text_secondary"],
                                ),
                                
                                ft.Container(height=30),
                                
                                # Estadísticas
                                ft.Row(
                                    controls=[
                                        self._create_stat_card("Choferes", "24", ft.Icons.PEOPLE, COLORS["success"]),
                                        self._create_stat_card("Sesiones", "156", ft.Icons.DIRECTIONS_CAR, COLORS["info"]),
                                        self._create_stat_card("Alertas", "47", ft.Icons.WARNING, COLORS["warning"]),
                                        self._create_stat_card("Críticos", "3", ft.Icons.ERROR, COLORS["danger"]),
                                    ],
                                    spacing=20,
                                    wrap=True,
                                ),
                            ],
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
    
    def _create_stat_card(self, title: str, value: str, icon: str, color: str):
        """Crear tarjeta de estadística"""
        return ft.Container(
            content=ft.Column(
                controls=[
                    ft.Row(
                        controls=[
                            ft.Icon(icon, size=40, color=color),
                            ft.Column(
                                controls=[
                                    ft.Text(value, size=28, weight=ft.FontWeight.BOLD, color=color),
                                    ft.Text(title, size=14, color=COLORS["text_secondary"]),
                                ],
                                spacing=0,
                            ),
                        ],
                        alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                    ),
                ],
            ),
            bgcolor=ft.Colors.WHITE,
            border_radius=15,
            padding=20,
            width=280,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=10,
                color=ft.Colors.with_opacity(0.1, ft.Colors.BLACK),
            ),
        )