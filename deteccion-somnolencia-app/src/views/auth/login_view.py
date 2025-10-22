import flet as ft
from config.settings import COLORS
from services.auth_service import AuthService

class LoginView(ft.View):
    """Vista de login universal (Admin + Chofer)"""
    
    def __init__(self, page: ft.Page):
        super().__init__(
            route="/login",
            padding=0,
            spacing=0,
        )
        
        self.page = page
        self.auth_service = AuthService()
        
        # Campos del formulario
        self.username_field = ft.TextField(
            label="Usuario",
            prefix_icon=ft.Icons.PERSON,
            border_radius=10,
            filled=True,
            bgcolor=ft.Colors.WHITE,
            hint_text="usuario",
            autofocus=True,
            border_color=COLORS["border"],
            focused_border_color=COLORS["primary"],
        )
        
        self.password_field = ft.TextField(
            label="Contraseña",
            prefix_icon=ft.Icons.LOCK,
            password=True,
            can_reveal_password=True,
            border_radius=10,
            filled=True,
            bgcolor=ft.Colors.WHITE,
            hint_text="••••••",
            on_submit=lambda _: self._on_login(None),
            border_color=COLORS["border"],
            focused_border_color=COLORS["primary"],
        )
        
        self.remember_checkbox = ft.Checkbox(
            label="Recordar sesión",
            value=False,
            active_color=COLORS["primary"],
        )
        
        # Banner de alerta (inicialmente visible con 3 intentos)
        warning_light = "#fff3cd"  # Color naranja claro para el fondo
        warning_border = "#ffeaa7"  # Borde más claro
        
        self.alert_banner = ft.Container(
            visible=True,
            content=ft.Row(
                controls=[
                    ft.Icon(
                        ft.Icons.WARNING_AMBER,
                        color=COLORS["warning"],
                        size=20,
                    ),
                    ft.Text(
                        "¡3 intentos fallidos bloquearán la cuenta!",
                        size=12,
                        color=COLORS["text_primary"],
                        weight=ft.FontWeight.W_500,
                    ),
                ],
                spacing=8,
                alignment=ft.MainAxisAlignment.CENTER,
            ),
            bgcolor=warning_light,
            border=ft.border.all(1, warning_border),
            border_radius=8,
            padding=ft.padding.all(12),
        )
        
        self.controls = [
            # Header superior
            ft.Container(
                content=ft.Row(
                    [
                        ft.Icon(
                            ft.Icons.DRIVE_ETA,
                            color=ft.Colors.WHITE,
                            size=24,
                        ),
                        ft.Text(
                            "Sistema de Detección de Somnolencia",
                            size=18,
                            weight=ft.FontWeight.BOLD,
                            color=ft.Colors.WHITE,
                        ),
                    ],
                    alignment=ft.MainAxisAlignment.START,
                    spacing=10,
                ),
                bgcolor=COLORS["primary"],
                padding=ft.padding.symmetric(horizontal=20, vertical=10),
                height=60,
            ),
            
            # Contenedor principal centrado
            ft.Container(
                content=ft.Column(
                    [
                        ft.Container(height=50),  # Espacio superior
                        
                        # Tarjeta de login centrada
                        ft.Container(
                            content=ft.Column(
                                [
                                    # Icono de acceso
                                    ft.Container(
                                        content=ft.Icon(
                                            ft.Icons.BUILD,  # Icono de herramientas/wrench
                                            size=48,
                                            color=COLORS["primary"],
                                        ),
                                        alignment=ft.alignment.center,
                                        height=60,
                                    ),
                                    
                                    # Título
                                    ft.Text(
                                        "Acceso Usuario",
                                        size=24,
                                        weight=ft.FontWeight.BOLD,
                                        color=COLORS["text_primary"],
                                        text_align=ft.TextAlign.CENTER,
                                    ),
                                    
                                    ft.Container(height=8),
                                    
                                    # Info banner azul
                                    ft.Container(
                                        content=ft.Row(
                                            [
                                                ft.Icon(
                                                    ft.Icons.INFO_OUTLINE,
                                                    color=COLORS["info"],
                                                    size=20,
                                                ),
                                                ft.Text(
                                                    "Use sus credenciales de administrador para acceder",
                                                    size=13,
                                                    color=COLORS["text_secondary"],
                                                ),
                                            ],
                                            spacing=8,
                                            alignment=ft.MainAxisAlignment.CENTER,
                                        ),
                                        bgcolor=COLORS["info"] + "0A",  # Azul claro semi-transparente
                                        border=ft.border.all(1, COLORS["info"]),
                                        border_radius=8,
                                        padding=ft.padding.all(12),
                                    ),
                                    
                                    ft.Container(height=24),
                                    
                                    # Formulario
                                    self.username_field,
                                    ft.Container(height=12),
                                    self.password_field,
                                    ft.Container(height=16),
                                    ft.Container(
                                        content=self.remember_checkbox,
                                        alignment=ft.alignment.center_left,
                                    ),
                                    
                                    ft.Container(height=24),
                                    
                                    # Botón Iniciar Sesión
                                    ft.ElevatedButton(
                                        content=ft.Row(
                                            [
                                                ft.Icon(ft.Icons.LOGIN, size=20),
                                                ft.Text("Iniciar Sesión", size=16),
                                            ],
                                            alignment=ft.MainAxisAlignment.CENTER,
                                            spacing=8,
                                        ),
                                        width="100%",
                                        height=48,
                                        style=ft.ButtonStyle(
                                            bgcolor=COLORS["primary"],
                                            color=ft.Colors.WHITE,
                                            shape=ft.RoundedRectangleBorder(radius=10),
                                        ),
                                        on_click=self._on_login,
                                    ),
                                    
                                    ft.Container(height=12),
                                    
                                    # Botón Cancelar
                                    ft.OutlinedButton(
                                        "Cancelar",
                                        width="100%",
                                        height=44,
                                        style=ft.ButtonStyle(
                                            color=COLORS["text_secondary"],
                                            side=ft.BorderSide(1, COLORS["border"]),
                                            shape=ft.RoundedRectangleBorder(radius=10),
                                        ),
                                        on_click=lambda _: page.go("/"),
                                    ),
                                    
                                    ft.Container(height=20),
                                    
                                    # Banner de alerta
                                    self.alert_banner,
                                    
                                ],
                                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                                spacing=0,
                            ),
                            width=400,
                            padding=ft.padding.all(32),
                            bgcolor=ft.Colors.WHITE,
                            border_radius=16,
                            shadow=ft.BoxShadow(
                                spread_radius=0,
                                blur_radius=20,
                                color=ft.Colors.BLACK12,
                                offset=ft.Offset(0, 4),
                            ),
                        ),
                        
                        ft.Container(expand=True),  # Espacio inferior para centrar
                    ],
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=0,
                ),
                expand=True,
                padding=ft.padding.all(20),
                alignment=ft.alignment.center,
                bgcolor=COLORS["background"],
            ),
        ]
    
    def _on_login(self, e):
        """Manejar evento de login"""
        
        # Validación básica
        if not self.username_field.value or not self.password_field.value:
            self._show_error("Por favor complete todos los campos")
            return
        
        # Mostrar indicador de carga
        self.page.splash = ft.ProgressBar(width=self.page.width, color=COLORS["primary"])
        self.page.update()
        
        # Intentar login
        result = self.auth_service.login(
            self.username_field.value.strip(),
            self.password_field.value
        )
        
        # Ocultar indicador de carga
        self.page.splash = None
        
        print(f"DEBUG: Resultado del login: {result}")
        
        if result["success"]:
            user = result["user"]
            print(f"Login exitoso - Usuario: {user.nombre_completo}, Rol: {user.rol}")
            
            # Redirigir según rol
            if user.is_admin():
                print("Redirigiendo a /admin/dashboard")
                self.page.go("/admin/dashboard")
            elif user.is_chofer():
                print("Redirigiendo a /client/dashboard")
                self.page.go("/client/dashboard")
        else:
            print(f"Login fallido: {result['message']}")
            # Mostrar mensaje de error
            self._show_error(result["message"])
            
            # Actualizar alerta de intentos restantes
            if result["attempts_left"] > 0:
                self._update_attempts_warning(result["attempts_left"])
                self.alert_banner.visible = True
            else:
                self.alert_banner.visible = False
            
            # Limpiar contraseña
            self.password_field.value = ""
            self.password_field.focus()
        
        self.page.update()
    
    def _update_attempts_warning(self, attempts_left: int):
        """Actualizar advertencia de intentos restantes"""
        warning_light = "#fff3cd"  # Color naranja claro para el fondo
        warning_border = "#ffeaa7"  # Borde más claro
        
        self.alert_banner.content = ft.Row(
            controls=[
                ft.Icon(
                    ft.Icons.WARNING_AMBER,
                    color=COLORS["warning"],
                    size=20,
                ),
                ft.Text(
                    f"¡{attempts_left} intentos fallidos bloquearán la cuenta!",
                    size=12,
                    color=COLORS["text_primary"],
                    weight=ft.FontWeight.W_500,
                ),
            ],
            spacing=8,
            alignment=ft.MainAxisAlignment.CENTER,
        )
        self.alert_banner.bgcolor = warning_light
        self.alert_banner.border = ft.border.all(1, warning_border)
    
    def _show_error(self, message: str):
        """Mostrar mensaje de error"""
        self.page.snack_bar = ft.SnackBar(
            content=ft.Row(
                controls=[
                    ft.Icon(ft.Icons.ERROR_OUTLINE, color=ft.Colors.WHITE),
                    ft.Text(message, color=ft.Colors.WHITE),
                ],
                spacing=10,
            ),
            bgcolor=COLORS["danger"],
            duration=3000,
        )
        self.page.snack_bar.open = True
        self.page.update()