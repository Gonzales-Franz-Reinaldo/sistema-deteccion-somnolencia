import flet as ft
from config.settings import COLORS, APP_TITLE, APP_DESCRIPTION

class WelcomeView(ft.View):
    """Vista de bienvenida inicial del sistema"""
    
    def __init__(self, page: ft.Page):
        super().__init__(
            route="/",
            padding=0,
            spacing=0,
        )
        
        self.page = page
        
        self.controls = [
            ft.Container(
                content=ft.Column(
                    controls=[
                        # Icono del carro (emoji)
                        ft.Text(
                            "🚗",
                            size=100,
                        ),
                        
                        ft.Container(height=30),
                        
                        # Título principal
                        ft.Text(
                            APP_TITLE,
                            size=48,
                            weight=ft.FontWeight.BOLD,
                            color=ft.Colors.WHITE,  
                            text_align=ft.TextAlign.CENTER,
                        ),
                        
                        ft.Container(height=10),
                        
                        # Subtítulo
                        ft.Text(
                            APP_DESCRIPTION,
                            size=20,
                            color=ft.Colors.WHITE70,  
                            text_align=ft.TextAlign.CENTER,
                        ),
                        
                        ft.Container(height=60),
                        
                        # Botón "Comenzar"
                        ft.ElevatedButton(
                            content=ft.Container(
                                content=ft.Text(
                                    "Comenzar",
                                    size=18,
                                    weight=ft.FontWeight.BOLD,
                                ),
                                padding=ft.padding.symmetric(horizontal=50, vertical=15),
                            ),
                            style=ft.ButtonStyle(
                                bgcolor=ft.Colors.WHITE,  
                                color=COLORS["primary"],
                                shape=ft.RoundedRectangleBorder(radius=30),
                                elevation=5,
                            ),
                            on_click=lambda _: page.go("/login"),
                        ),
                    ],
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    alignment=ft.MainAxisAlignment.CENTER,
                    expand=True,
                ),
                gradient=ft.LinearGradient(
                    begin=ft.alignment.top_center,
                    end=ft.alignment.bottom_center,
                    colors=["#667eea", "#764ba2"],
                ),
                expand=True,
            )
        ]