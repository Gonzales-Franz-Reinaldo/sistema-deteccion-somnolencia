import flet as ft
from config.settings import APP_TITLE, WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT
from config.database import db
from services.auth_service import AuthService
from views.welcome_view import WelcomeView
from views.auth.login_view import LoginView
from views.admin.dashboard_view import AdminDashboardView
from views.client.dashboard_view import ClientDashboardView

def main(page: ft.Page):
    """Punto de entrada principal de la aplicación"""
    
    # Configuración de la ventana
    page.title = APP_TITLE
    page.window_width = WINDOW_WIDTH
    page.window_height = WINDOW_HEIGHT
    page.window_min_width = WINDOW_MIN_WIDTH
    page.window_min_height = WINDOW_MIN_HEIGHT
    page.window_resizable = True
    page.padding = 0
    page.spacing = 0
    
    # Tema
    page.theme_mode = ft.ThemeMode.LIGHT
    page.theme = ft.Theme(
        color_scheme_seed=ft.Colors.INDIGO,
        visual_density=ft.VisualDensity.COMFORTABLE,
    )
    
    # Conectar a la base de datos
    try:
        db.connect()
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        page.snack_bar = ft.SnackBar(
            content=ft.Text("Error al conectar con la base de datos. Verifique la configuración."),
            bgcolor=ft.Colors.RED,
        )
        page.snack_bar.open = True
        page.update()
        return
    
    # Instancia de AuthService
    auth_service = AuthService()
    
    def route_change(route):
        """Manejar cambios de ruta"""
        page.views.clear()
        
        # Verificar si hay sesión activa
        current_user = auth_service.get_current_user()
        
        print(f"Navegando a: {page.route} | Usuario: {current_user.nombre_completo if current_user else 'None'}")
        
        # Pantalla de bienvenida
        if page.route == "/":
            # Si hay sesión activa, redirigir al dashboard correspondiente
            if current_user:
                print(f"Sesión activa detectada, redirigiendo a dashboard de {current_user.rol}")
                if current_user.is_admin():
                    page.views.append(AdminDashboardView(page))
                elif current_user.is_chofer():
                    page.views.append(ClientDashboardView(page))
            else:
                page.views.append(WelcomeView(page))
        
        # Login
        elif page.route == "/login":
            # CAMBIO: Siempre mostrar login si el usuario navega explícitamente
            # Esto permite re-login después de logout
            if current_user:
                print(f"Usuario {current_user.usuario} ya autenticado, pero mostrando login por navegación explícita")
            page.views.append(LoginView(page))
        
        # Dashboard Admin
        elif page.route == "/admin/dashboard":
            page.views.append(AdminDashboardView(page))
        
        # Dashboard Cliente/Chofer
        elif page.route == "/client/dashboard":
            page.views.append(ClientDashboardView(page))
        
        # Ruta no encontrada
        else:
            if current_user:
                if current_user.is_admin():
                    page.views.append(AdminDashboardView(page))
                elif current_user.is_chofer():
                    page.views.append(ClientDashboardView(page))
            else:
                page.views.append(WelcomeView(page))
        
        page.update()
    
    def view_pop(view):
        """Manejar el botón atrás"""
        page.views.pop()
        if len(page.views) > 0:
            top_view = page.views[-1]
            page.go(top_view.route)
        else:
            page.go("/")
    
    # Asignar eventos
    page.on_route_change = route_change
    page.on_view_pop = view_pop
    
    # Verificar sesión al iniciar y redirigir automáticamente
    current_user = auth_service.get_current_user()
    if current_user:
        print(f"Sesión activa al iniciar, redirigiendo a dashboard de {current_user.rol}")
        if current_user.is_admin():
            page.go("/admin/dashboard")
        elif current_user.is_chofer():
            page.go("/client/dashboard")
    else:
        # Ir a la ruta inicial
        page.go(page.route if page.route else "/")

if __name__ == "__main__":
    ft.app(target=main)