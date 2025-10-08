# 🎨 Mockups del Sistema de Detección de Somnolencia

<div align="center">

**Visualización de Interfaces en Consola**

[Inicio](#-pantalla-de-inicio) •
[Dashboard](#-dashboard-principal) •
[Detección Activa](#-modo-detección-activa) •
[Alertas](#-sistema-de-alertas) •
[Reportes](#-pantalla-de-reportes)

</div>

---

## 🖥️ Pantalla de Inicio

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    ███████╗██████╗ ██╗   ██╗ ██████╗ █████╗ ██████╗ ███████╗ ║
║                    ██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝ ║
║                    █████╗  ██║  ██║██║   ██║██║     ███████║██████╔╝█████╗   ║
║                    ██╔══╝  ██║  ██║██║   ██║██║     ██╔══██║██╔══██╗██╔══╝   ║
║                    ███████╗██████╔╝╚██████╔╝╚██████╗██║  ██║██║  ██║███████╗ ║
║                    ╚══════╝╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ║
║                                                                               ║
║                         Sistema de Detección de Somnolencia                  ║
║                                   v1.0.0                                      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║                            🚀 INICIANDO SISTEMA...                           ║
║                                                                               ║
║   [████████████████████████████████████████████] 100%                        ║
║                                                                               ║
║   ✓ Cargando MediaPipe Face Mesh (468 landmarks)                            ║
║   ✓ Inicializando MediaPipe Hands                                            ║
║   ✓ Conectando con servidor WebSocket (ws://localhost:8000)                 ║
║   ✓ Configurando sistema de alertas                                          ║
║   ✓ Preparando generador de reportes                                         ║
║                                                                               ║
║                                                                               ║
║                    Presione [ENTER] para continuar...                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Animación HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .console-container {
        background: #0a0e27;
        border: 3px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        font-family: 'Courier New', monospace;
        color: #00ff41;
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
        max-width: 800px;
        margin: 20px auto;
    }
    .title {
        text-align: center;
        font-size: 24px;
        margin-bottom: 20px;
        text-shadow: 0 0 10px #00ff41;
        animation: glow 2s ease-in-out infinite;
    }
    .loading-bar {
        width: 100%;
        height: 30px;
        background: #1a1f3a;
        border-radius: 15px;
        overflow: hidden;
        margin: 20px 0;
    }
    .loading-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff41, #00cc33);
        animation: loading 3s ease-in-out infinite;
    }
    .status-line {
        margin: 10px 0;
        opacity: 0;
        animation: fadeIn 0.5s ease-in forwards;
    }
    .status-line:nth-child(1) { animation-delay: 0.5s; }
    .status-line:nth-child(2) { animation-delay: 1s; }
    .status-line:nth-child(3) { animation-delay: 1.5s; }
    .status-line:nth-child(4) { animation-delay: 2s; }
    .status-line:nth-child(5) { animation-delay: 2.5s; }
    @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
    }
    @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41; }
        50% { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41; }
    }
    @keyframes fadeIn {
        to { opacity: 1; }
    }
</style>
</head>
<body>
<div class="console-container">
    <div class="title">
        ═══ EDUCARE IA - SISTEMA DE DETECCIÓN DE SOMNOLENCIA ═══
    </div>
    <div style="text-align: center; margin: 20px 0;">
        🚀 INICIANDO SISTEMA...
    </div>
    <div class="loading-bar">
        <div class="loading-fill"></div>
    </div>
    <div class="status-line">✓ Cargando MediaPipe Face Mesh (468 landmarks)</div>
    <div class="status-line">✓ Inicializando MediaPipe Hands</div>
    <div class="status-line">✓ Conectando con servidor WebSocket</div>
    <div class="status-line">✓ Configurando sistema de alertas</div>
    <div class="status-line">✓ Preparando generador de reportes</div>
</div>
</body>
</html>
```

</details>

---

## 📊 Dashboard Principal

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🎯 EDUCARE IA - DASHBOARD PRINCIPAL                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  [1] 😴 Iniciar Detección de Somnolencia                                     ║
║  [2] 📊 Ver Reportes y Estadísticas                                          ║
║  [3] ⚙️  Configuración del Sistema                                            ║
║  [4] ℹ️  Información y Ayuda                                                  ║
║  [5] 🚪 Salir                                                                 ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📈 ESTADO DEL SISTEMA                                                        ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                         │ ║
║  │  🟢 Servidor WebSocket:     CONECTADO (ws://localhost:8000)            │ ║
║  │  🟢 MediaPipe Face Mesh:    ACTIVO                                      │ ║
║  │  🟢 MediaPipe Hands:        ACTIVO                                      │ ║
║  │  🟢 Cámara:                 DISPONIBLE (Resolución: 1920x1080)         │ ║
║  │  📊 FPS:                    30.2 frames/segundo                         │ ║
║  │  💾 Espacio en disco:       15.4 GB disponibles                         │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  📅 ÚLTIMA SESIÓN                                                             ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                         │ ║
║  │  🕐 Fecha:              07 de Octubre, 2025 - 14:32:15                 │ ║
║  │  ⏱️  Duración:           45 minutos 23 segundos                          │ ║
║  │  🚨 Alertas generadas:  7 eventos detectados                           │ ║
║  │     ├─ 👁️  Parpadeos:    3 eventos                                      │ ║
║  │     ├─ 🥱 Bostezos:      2 eventos                                      │ ║
║  │     └─ 😴 Microsueños:   2 eventos                                      │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  💡 TIP: Use las teclas [↑] [↓] para navegar y [ENTER] para seleccionar     ║
║                                                                               ║
║  Seleccione una opción: _                                                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Dashboard Interactivo HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .dashboard {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
        border: 3px solid #00d4ff;
        border-radius: 15px;
        padding: 25px;
        font-family: 'Courier New', monospace;
        color: #00d4ff;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
        max-width: 900px;
        margin: 20px auto;
    }
    .header {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        border-bottom: 2px solid #00d4ff;
        padding-bottom: 15px;
        margin-bottom: 20px;
        animation: headerPulse 3s ease-in-out infinite;
    }
    .menu-item {
        padding: 12px 20px;
        margin: 10px 0;
        background: rgba(0, 212, 255, 0.1);
        border-left: 4px solid #00d4ff;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .menu-item:hover {
        background: rgba(0, 212, 255, 0.3);
        transform: translateX(10px);
        border-left-width: 8px;
    }
    .status-panel {
        background: rgba(0, 255, 65, 0.05);
        border: 2px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .status-item {
        margin: 8px 0;
        display: flex;
        align-items: center;
    }
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #00ff41;
        margin-right: 10px;
        animation: blink 2s ease-in-out infinite;
    }
    .metrics-panel {
        background: rgba(255, 165, 0, 0.05);
        border: 2px solid #ffa500;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .metric-bar {
        height: 8px;
        background: #1a1f3a;
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
    }
    .metric-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffa500, #ff6b00);
        animation: pulse 2s ease-in-out infinite;
    }
    @keyframes headerPulse {
        0%, 100% { text-shadow: 0 0 10px #00d4ff; }
        50% { text-shadow: 0 0 20px #00d4ff, 0 0 30px #00d4ff; }
    }
    @keyframes blink {
        0%, 100% { opacity: 1; box-shadow: 0 0 10px #00ff41; }
        50% { opacity: 0.5; }
    }
    @keyframes pulse {
        0%, 100% { width: 85%; }
        50% { width: 95%; }
    }
</style>
</head>
<body>
<div class="dashboard">
    <div class="header">
        🎯 EDUCARE IA - DASHBOARD PRINCIPAL
    </div>
    
    <div style="margin: 20px 0;">
        <div class="menu-item">
            [1] 😴 Iniciar Detección de Somnolencia
        </div>
        <div class="menu-item">
            [2] 📊 Ver Reportes y Estadísticas
        </div>
        <div class="menu-item">
            [3] ⚙️ Configuración del Sistema
        </div>
        <div class="menu-item">
            [4] ℹ️ Información y Ayuda
        </div>
        <div class="menu-item">
            [5] 🚪 Salir
        </div>
    </div>

    <div class="status-panel">
        <div style="font-weight: bold; margin-bottom: 15px;">📈 ESTADO DEL SISTEMA</div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>Servidor WebSocket: CONECTADO</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>MediaPipe Face Mesh: ACTIVO (468 landmarks)</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>MediaPipe Hands: ACTIVO</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>Cámara: DISPONIBLE (1920x1080 @ 30 FPS)</span>
        </div>
    </div>

    <div class="metrics-panel">
        <div style="font-weight: bold; margin-bottom: 15px;">📅 ÚLTIMA SESIÓN</div>
        <div>🕐 Fecha: 07 de Octubre, 2025 - 14:32:15</div>
        <div>⏱️ Duración: 45 minutos 23 segundos</div>
        <div style="margin-top: 15px;">🚨 Alertas generadas:</div>
        <div style="margin-left: 20px;">
            <div>👁️ Parpadeos: 3 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 40%;"></div></div>
            <div>🥱 Bostezos: 2 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 28%;"></div></div>
            <div>😴 Microsueños: 2 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 28%;"></div></div>
        </div>
    </div>

    <div style="text-align: center; color: #ffa500; margin-top: 20px;">
        💡 TIP: Use las teclas [↑] [↓] para navegar y [ENTER] para seleccionar
    </div>
</div>
</body>
</html>
```

</details>

---

## 🎥 Modo Detección Activa

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║              😴 SISTEMA DE DETECCIÓN DE SOMNOLENCIA - ACTIVO                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────┐  ┌───────────────────────────────────────┐   ║
║  │                           │  │   📊 MÉTRICAS EN TIEMPO REAL          │   ║
║  │    🎥 VIDEO EN VIVO       │  ├───────────────────────────────────────┤   ║
║  │                           │  │                                       │   ║
║  │    [FRAME CAPTURADO]      │  │  ⏱️  Tiempo activo: 00:15:32          │   ║
║  │                           │  │  🎯 FPS: 30.5                         │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  👤 Rostro detectado: ✓               │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │                                       │   ║
║  │   ▓▓▓▓▓▓👁️  ▓▓👁️  ▓▓▓▓    │  │  📍 PUNTOS DETECTADOS:                │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  ├─ Rostro: 468 landmarks             │   ║
║  │   ▓▓▓▓▓▓▓▓👃▓▓▓▓▓▓▓▓▓    │  │  ├─ Mano izq: 21 points               │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  └─ Mano der: 21 points               │   ║
║  │   ▓▓▓▓▓▓▓▓👄▓▓▓▓▓▓▓▓▓    │  │                                       │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  🔍 ANÁLISIS DE DISTANCIAS:           │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  ├─ Ojo izq: 0.024                    │   ║
║  │                           │  │  ├─ Ojo der: 0.026                    │   ║
║  │  Resolución: 1920x1080    │  │  ├─ Boca: 0.015                       │   ║
║  └───────────────────────────┘  │  └─ Ángulo pitch: 12°                 │   ║
║                                  └───────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🚦 ESTADO DE CARACTERÍSTICAS                                         │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  👁️  Parpadeo:     🟢 NORMAL    │ Contador: 8/60s  │ Umbral: 15     │   ║
║  │  😴 Microsueño:   🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 2.0s   │   ║
║  │  🥱 Bostezo:      🟢 NORMAL    │ Contador: 0/180s │ Umbral: 4.0s   │   ║
║  │  🙇 Cabeceo:      🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 3.0s   │   ║
║  │  🤲 Frot. ojos:   🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 1.0s   │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📜 REGISTRO DE EVENTOS (Últimos 5)                                   │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │  [00:14:22] ℹ️  Sistema iniciado correctamente                        │   ║
║  │  [00:14:45] 🟢 Primera detección facial exitosa                       │   ║
║  │  [00:15:12] 🟢 Calibración de umbrales completada                     │   ║
║  │  [00:15:28] ℹ️  Guardado automático de checkpoint                     │   ║
║  │  [00:15:32] 🟢 Sistema funcionando correctamente                      │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  [S] Detener  [P] Pausa  [R] Reiniciar  [C] Configurar  [ESC] Menú         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Modo Detección Activo HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .detection-console {
        background: #000814;
        border: 3px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        font-family: 'Courier New', monospace;
        color: #00ff41;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
        max-width: 1200px;
        margin: 20px auto;
    }
    .console-header {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        border-bottom: 2px solid #00ff41;
        padding-bottom: 10px;
        margin-bottom: 20px;
        animation: headerGlow 2s ease-in-out infinite;
    }
    .video-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
    }
    .video-frame {
        background: #0a1128;
        border: 2px solid #00d4ff;
        border-radius: 8px;
        padding: 15px;
        min-height: 300px;
        position: relative;
        overflow: hidden;
    }
    .face-ascii {
        text-align: center;
        font-size: 32px;
        margin: 40px 0;
        animation: float 3s ease-in-out infinite;
    }
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 15px 0;
    }
    .metric-item {
        background: rgba(0, 212, 255, 0.1);
        padding: 8px;
        border-radius: 5px;
        border-left: 3px solid #00d4ff;
    }
    .status-row {
        display: grid;
        grid-template-columns: 150px 120px 1fr 1fr;
        padding: 10px;
        margin: 5px 0;
        background: rgba(0, 255, 65, 0.05);
        border-radius: 5px;
        align-items: center;
    }
    .status-indicator {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        animation: pulse 2s ease-in-out infinite;
    }
    .status-green {
        background: #00ff41;
        box-shadow: 0 0 10px #00ff41;
    }
    .status-yellow {
        background: #ffff00;
        box-shadow: 0 0 10px #ffff00;
    }
    .status-red {
        background: #ff0000;
        box-shadow: 0 0 10px #ff0000;
    }
    .event-log {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #666;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        max-height: 150px;
        overflow-y: auto;
    }
    .event-line {
        margin: 5px 0;
        opacity: 0;
        animation: slideIn 0.5s ease-out forwards;
    }
    .event-line:nth-child(1) { animation-delay: 0s; }
    .event-line:nth-child(2) { animation-delay: 0.2s; }
    .event-line:nth-child(3) { animation-delay: 0.4s; }
    .event-line:nth-child(4) { animation-delay: 0.6s; }
    .event-line:nth-child(5) { animation-delay: 0.8s; }
    .control-bar {
        text-align: center;
        margin-top: 20px;
        padding: 15px;
        background: rgba(0, 212, 255, 0.1);
        border-radius: 8px;
        border: 1px solid #00d4ff;
    }
    @keyframes headerGlow {
        0%, 100% { text-shadow: 0 0 10px #00ff41; }
        50% { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41; }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .progress-bar {
        height: 6px;
        background: #0a1128;
        border-radius: 3px;
        margin: 8px 0;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff41, #00cc33);
        border-radius: 3px;
        animation: progress 2s ease-in-out infinite;
    }
    @keyframes progress {
        0% { width: 50%; }
        50% { width: 80%; }
        100% { width: 50%; }
    }
</style>
</head>
<body>
<div class="detection-console">
    <div class="console-header">
        😴 SISTEMA DE DETECCIÓN DE SOMNOLENCIA - ACTIVO
    </div>
    
    <div class="video-panel">
        <div class="video-frame">
            <div style="font-weight: bold; margin-bottom: 10px;">🎥 VIDEO EN VIVO</div>
            <div class="face-ascii">
                <div>👁️ &nbsp;&nbsp;&nbsp; 👁️</div>
                <div>&nbsp;&nbsp; 👃</div>
                <div>&nbsp;&nbsp; 👄</div>
            </div>
            <div style="text-align: center; color: #00d4ff;">
                Resolución: 1920x1080 @ 30 FPS
            </div>
        </div>
        
        <div class="video-frame">
            <div style="font-weight: bold; margin-bottom: 10px;">📊 MÉTRICAS EN TIEMPO REAL</div>
            <div class="metrics-grid">
                <div class="metric-item">⏱️ Tiempo: 00:15:32</div>
                <div class="metric-item">🎯 FPS: 30.5</div>
                <div class="metric-item">👤 Rostro: ✓</div>
                <div class="metric-item">🤲 Manos: 2</div>
            </div>
            <div style="margin-top: 15px;">
                <div style="font-weight: bold; margin-bottom: 8px;">📍 PUNTOS DETECTADOS:</div>
                <div style="margin-left: 15px;">
                    <div>Rostro: 468 landmarks</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 100%;"></div></div>
                    <div>Mano izq: 21 points</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 85%;"></div></div>
                    <div>Mano der: 21 points</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 85%;"></div></div>
                </div>
            </div>
        </div>
    </div>

    <div style="background: rgba(0, 255, 65, 0.05); border: 2px solid #00ff41; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <div style="font-weight: bold; margin-bottom: 15px;">🚦 ESTADO DE CARACTERÍSTICAS</div>
        
        <div class="status-row">
            <div>👁️ Parpadeo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Contador: 8/60s</div>
            <div>Umbral: 15</div>
        </div>
        
        <div class="status-row">
            <div>😴 Microsueño:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 2.0s</div>
        </div>
        
        <div class="status-row">
            <div>🥱 Bostezo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Contador: 0/180s</div>
            <div>Umbral: 4.0s</div>
        </div>
        
        <div class="status-row">
            <div>🙇 Cabeceo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 3.0s</div>
        </div>
        
        <div class="status-row">
            <div>🤲 Frot. ojos:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 1.0s</div>
        </div>
    </div>

    <div class="event-log">
        <div style="font-weight: bold; margin-bottom: 10px;">📜 REGISTRO DE EVENTOS (Últimos 5)</div>
        <div class="event-line">[00:14:22] ℹ️ Sistema iniciado correctamente</div>
        <div class="event-line">[00:14:45] 🟢 Primera detección facial exitosa</div>
        <div class="event-line">[00:15:12] 🟢 Calibración de umbrales completada</div>
        <div class="event-line">[00:15:28] ℹ️ Guardado automático de checkpoint</div>
        <div class="event-line">[00:15:32] 🟢 Sistema funcionando correctamente</div>
    </div>

    <div class="control-bar">
        [S] Detener &nbsp;|&nbsp; [P] Pausa &nbsp;|&nbsp; [R] Reiniciar &nbsp;|&nbsp; [C] Configurar &nbsp;|&nbsp; [ESC] Menú
    </div>
</div>
</body>
</html>
```

</details>

---

## 🚨 Sistema de Alertas

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 ¡ALERTA DE SOMNOLENCIA DETECTADA!                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ██████╗ ███████╗██╗     ██╗ ██████╗ ██████╗  ██████╗                       ║
║   ██╔══██╗██╔════╝██║     ██║██╔════╝ ██╔══██╗██╔═══██╗                      ║
║   ██████╔╝█████╗  ██║     ██║██║  ███╗██████╔╝██║   ██║                      ║
║   ██╔═══╝ ██╔══╝  ██║     ██║██║   ██║██╔══██╗██║   ██║                      ║
║   ██║     ███████╗███████╗██║╚██████╔╝██║  ██║╚██████╔╝                      ║
║   ╚═╝     ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🔴 NIVEL DE ALERTA: CRÍTICO                                          │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  😴 MICROSUEÑO DETECTADO                                             │   ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │   ║
║  │                                                                       │   ║
║  │  📊 Detalles del evento:                                             │   ║
║  │  ├─ ⏱️  Duración: 3.4 segundos                                        │   ║
║  │  ├─ ⚠️  Umbral crítico: 2.0 segundos                                  │   ║
║  │  ├─ 📈 Nivel de confianza: 98.7%                                     │   ║
║  │  ├─ 🕐 Timestamp: 07/10/2025 - 14:48:52                             │   ║
║  │  └─ 📍 Frame #28,456                                                 │   ║
║  │                                                                       │   ║
║  │  👁️  Estado de ojos:                                                  │   ║
║  │  ├─ Ojo izquierdo: CERRADO (3.4s)                                   │   ║
║  │  └─ Ojo derecho: CERRADO (3.4s)                                     │   ║
║  │                                                                       │   ║
║  │  🔍 Factores adicionales detectados:                                 │   ║
║  │  ├─ ✓ Parpadeo frecuente previo (18 parpadeos/min)                  │   ║
║  │  ├─ ✓ Bostezo reciente (hace 45 segundos)                           │   ║
║  │  └─ ✓ Ligero cabeceo detectado                                      │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  💡 RECOMENDACIONES INMEDIATAS                                        │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  🛑 1. DETENGA el vehículo/actividad de forma segura                │   ║
║  │  ☕ 2. Tome un descanso de al menos 15-20 minutos                    │   ║
║  │  🚶 3. Realice ejercicios de estiramiento                            │   ║
║  │  💧 4. Hidrátese adecuadamente                                       │   ║
║  │  😴 5. Considere tomar una siesta corta (15-20 min)                 │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📊 ESTADÍSTICAS DE LA SESIÓN ACTUAL                                  │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  Tiempo total: 1h 12min 34s                                          │   ║
║  │  Total de alertas: 12 eventos                                        │   ║
║  │                                                                       │   ║
║  │  🔴 Críticas:   3  ████████░░░░░░░░░░░░░░░  25%                     │   ║
║  │  🟡 Advertencia: 7  ██████████████████░░░░░  58%                     │   ║
║  │  🟢 Informativas: 2  ████░░░░░░░░░░░░░░░░░░  17%                     │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ⚠️  Esta alerta ha sido guardada en el reporte automático                   ║
║      Archivo: reports/august/drowsiness_report.csv                           ║
║                                                                               ║
║  [A] Reconocer alerta  [D] Descartar  [P] Pausar sistema  [ESC] Continuar   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Sistema de Alertas HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .alert-console {
        background: linear-gradient(135deg, #1a0000 0%, #330000 100%);
        border: 4px solid #ff0000;
        border-radius: 15px;
        padding: 30px;
        font-family: 'Courier New', monospace;
        color: #ff3333;
        box-shadow: 0 0 40px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(255, 0, 0, 0.1);
        max-width: 1000px;
        margin: 20px auto;
        animation: alertPulse 1.5s ease-in-out infinite;
    }
    .alert-header {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        color: #ff0000;
        text-shadow: 0 0 20px #ff0000;
        margin-bottom: 30px;
        animation: dangerBlink 1s ease-in-out infinite;
    }
    .danger-panel {
        background: rgba(255, 0, 0, 0.1);
        border: 3px solid #ff0000;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
    }
    .warning-level {
        background: #ff0000;
        color: #fff;
        padding: 15px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
        animation: warningPulse 0.5s ease-in-out infinite;
    }
    .event-details {
        margin: 20px 0;
        padding: 15px;
        background: rgba(255, 51, 51, 0.05);
        border-left: 4px solid #ff3333;
        border-radius: 5px;
    }
    .detail-item {
        margin: 8px 0;
        padding-left: 20px;
    }
    .recommendations-box {
        background: rgba(255, 165, 0, 0.1);
        border: 2px solid #ffa500;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .recommendation-item {
        margin: 10px 0;
        padding: 10px;
        background: rgba(255, 165, 0, 0.05);
        border-left: 3px solid #ffa500;
        border-radius: 5px;
        color: #ffa500;
    }
    .stats-bar {
        height: 25px;
        background: #1a0000;
        border-radius: 12px;
        overflow: hidden;
        margin: 10px 0;
        border: 1px solid #ff3333;
    }
    .stats-fill-critical {
        height: 100%;
        background: linear-gradient(90deg, #ff0000, #cc0000);
        float: left;
        animation: fillBar 2s ease-out;
    }
    .stats-fill-warning {
        height: 100%;
        background: linear-gradient(90deg, #ffff00, #ffaa00);
        float: left;
        animation: fillBar 2s ease-out;
    }
    .stats-fill-info {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #00cc00);
        float: left;
        animation: fillBar 2s ease-out;
    }
    @keyframes alertPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255, 0, 0, 0.6); }
        50% { box-shadow: 0 0 60px rgba(255, 0, 0, 0.9), 0 0 80px rgba(255, 0, 0, 0.5); }
    }
    @keyframes dangerBlink {
        0%, 100% { opacity: 1; text-shadow: 0 0 20px #ff0000; }
        50% { opacity: 0.7; text-shadow: 0 0 40px #ff0000, 0 0 60px #ff0000; }
    }
    @keyframes warningPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    @keyframes fillBar {
        from { width: 0; }
        to { width: 100%; }
    }
    .control-buttons {
        text-align: center;
        margin-top: 30px;
        padding: 20px;
        background: rgba(255, 0, 0, 0.1);
        border: 2px solid #ff3333;
        border-radius: 10px;
        font-size: 16px;
    }
</style>
</head>
<body>
<div class="alert-console">
    <div class="alert-header">
        🚨 ¡ALERTA DE SOMNOLENCIA DETECTADA! 🚨
    </div>
    
    <div class="danger-panel">
        <div class="warning-level">
            🔴 NIVEL DE ALERTA: CRÍTICO
        </div>
        
        <div style="font-size: 20px; text-align: center; margin: 20px 0; color: #ff0000;">
            😴 MICROSUEÑO DETECTADO
        </div>
        
        <div style="text-align: center; color: #ff3333; font-size: 40px; margin: 20px 0;">
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 15px; color: #ff6666;">📊 Detalles del evento:</div>
            <div class="detail-item">⏱️ Duración: 3.4 segundos</div>
            <div class="detail-item">⚠️ Umbral crítico: 2.0 segundos</div>
            <div class="detail-item">📈 Nivel de confianza: 98.7%</div>
            <div class="detail-item">🕐 Timestamp: 07/10/2025 - 14:48:52</div>
            <div class="detail-item">📍 Frame #28,456</div>
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff6666;">👁️ Estado de ojos:</div>
            <div class="detail-item">Ojo izquierdo: CERRADO (3.4s)</div>
            <div class="detail-item">Ojo derecho: CERRADO (3.4s)</div>
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff6666;">🔍 Factores adicionales detectados:</div>
            <div class="detail-item">✓ Parpadeo frecuente previo (18 parpadeos/min)</div>
            <div class="detail-item">✓ Bostezo reciente (hace 45 segundos)</div>
            <div class="detail-item">✓ Ligero cabeceo detectado</div>
        </div>
    </div>

    <div class="recommendations-box">
        <div style="font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 18px;">
            💡 RECOMENDACIONES INMEDIATAS
        </div>
        <div class="recommendation-item">🛑 1. DETENGA el vehículo/actividad de forma segura</div>
        <div class="recommendation-item">☕ 2. Tome un descanso de al menos 15-20 minutos</div>
        <div class="recommendation-item">🚶 3. Realice ejercicios de estiramiento</div>
        <div class="recommendation-item">💧 4. Hidrátese adecuadamente</div>
        <div class="recommendation-item">😴 5. Considere tomar una siesta corta (15-20 min)</div>
    </div>

    <div class="danger-panel">
        <div style="font-weight: bold; margin-bottom: 15px; color: #ff6666; text-align: center;">
            📊 ESTADÍSTICAS DE LA SESIÓN ACTUAL
        </div>
        <div style="text-align: center; margin: 15px 0;">
            Tiempo total: 1h 12min 34s | Total de alertas: 12 eventos
        </div>
        
        <div style="margin: 20px 0;">
            <div style="margin: 10px 0;">🔴 Críticas: 3 (25%)</div>
            <div class="stats-bar">
                <div class="stats-fill-critical" style="width: 25%;"></div>
            </div>
            
            <div style="margin: 10px 0;">🟡 Advertencia: 7 (58%)</div>
            <div class="stats-bar">
                <div class="stats-fill-warning" style="width: 58%;"></div>
            </div>
            
            <div style="margin: 10px 0;">🟢 Informativas: 2 (17%)</div>
            <div class="stats-bar">
                <div class="stats-fill-info" style="width: 17%;"></div>
            </div>
        </div>
    </div>

    <div style="text-align: center; color: #ffa500; margin: 20px 0;">
        ⚠️ Esta alerta ha sido guardada en el reporte automático<br>
        Archivo: reports/august/drowsiness_report.csv
    </div>

    <div class="control-buttons">
        [A] Reconocer alerta &nbsp;|&nbsp; [D] Descartar &nbsp;|&nbsp; [P] Pausar sistema &nbsp;|&nbsp; [ESC] Continuar
    </div>
</div>
</body>
</html>
```

</details>

---

## 📈 Pantalla de Reportes

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                 📊 REPORTES Y ESTADÍSTICAS DEL SISTEMA                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📅 Período: Última semana (01-07 Octubre 2025)                              ║
║  📁 Archivo: reports/august/drowsiness_report.csv                            ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📈 RESUMEN GENERAL                                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  ⏱️  Total de sesiones:        24 sesiones                            │   ║
║  │  🕐 Tiempo total de monitoreo: 18h 45min 32s                         │   ║
║  │  📊 Promedio por sesión:       47min 18s                             │   ║
║  │  🚨 Total de alertas:          156 eventos                           │   ║
║  │  📉 Promedio de alertas:       6.5 eventos/sesión                    │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🎯 DISTRIBUCIÓN POR TIPO DE EVENTO                                   │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  👁️  Parpadeo frecuente:      62 eventos (39.7%)                      │   ║
║  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  😴 Microsueño:               38 eventos (24.4%)                      │   ║
║  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🥱 Bostezo prolongado:        31 eventos (19.9%)                     │   ║
║  │  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🙇 Cabeceo:                  18 eventos (11.5%)                      │   ║
║  │  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🤲 Frotamiento de ojos:       7 eventos (4.5%)                       │   ║
║  │  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  ⏰ DISTRIBUCIÓN TEMPORAL (por hora del día)                          │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  00:00-06:00  ████████████████████████████████░░░░░░░░  45 eventos   │   ║
║  │  06:00-12:00  ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░  22 eventos   │   ║
║  │  12:00-18:00  ████████████████████░░░░░░░░░░░░░░░░░░░  31 eventos   │   ║
║  │  18:00-24:00  ████████████████████████████████████████  58 eventos   │   ║
║  │                                                                       │   ║
║  │  💡 Pico de alertas: 22:00-02:00 (horario de mayor riesgo)          │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🏆 TOP 5 SESIONES CON MÁS ALERTAS                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  1. 📅 05/10/2025 23:15  |  ⏱️  52min  |  🚨 18 alertas  |  🔴🔴🔴    │   ║
║  │  2. 📅 03/10/2025 21:40  |  ⏱️  48min  |  🚨 15 alertas  |  🔴🔴      │   ║
║  │  3. 📅 07/10/2025 01:20  |  ⏱️  65min  |  🚨 14 alertas  |  🔴🔴      │   ║
║  │  4. 📅 02/10/2025 22:55  |  ⏱️  44min  |  🚨 12 alertas  |  🔴        │   ║
║  │  5. 📅 04/10/2025 00:35  |  ⏱️  58min  |  🚨 11 alertas  |  🔴        │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📋 ÚLTIMOS 10 EVENTOS REGISTRADOS                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  [07/10 14:48:52] 🔴 Microsueño    | 3.4s  | Frame #28456            │   ║
║  │  [07/10 14:43:18] 🟡 Bostezo       | 4.8s  | Frame #27892            │   ║
║  │  [07// filepath: /home/franz/workspace/projects/sistema-deteccion-somnolencia/mockups-sistema-somnolencia.md
# 🎨 Mockups del Sistema de Detección de Somnolencia

<div align="center">

**Visualización de Interfaces en Consola**

[Inicio](#-pantalla-de-inicio) •
[Dashboard](#-dashboard-principal) •
[Detección Activa](#-modo-detección-activa) •
[Alertas](#-sistema-de-alertas) •
[Reportes](#-pantalla-de-reportes)

</div>

---

## 🖥️ Pantalla de Inicio

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    ███████╗██████╗ ██╗   ██╗ ██████╗ █████╗ ██████╗ ███████╗ ║
║                    ██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝ ║
║                    █████╗  ██║  ██║██║   ██║██║     ███████║██████╔╝█████╗   ║
║                    ██╔══╝  ██║  ██║██║   ██║██║     ██╔══██║██╔══██╗██╔══╝   ║
║                    ███████╗██████╔╝╚██████╔╝╚██████╗██║  ██║██║  ██║███████╗ ║
║                    ╚══════╝╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ║
║                                                                               ║
║                         Sistema de Detección de Somnolencia                  ║
║                                   v1.0.0                                      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║                            🚀 INICIANDO SISTEMA...                           ║
║                                                                               ║
║   [████████████████████████████████████████████] 100%                        ║
║                                                                               ║
║   ✓ Cargando MediaPipe Face Mesh (468 landmarks)                            ║
║   ✓ Inicializando MediaPipe Hands                                            ║
║   ✓ Conectando con servidor WebSocket (ws://localhost:8000)                 ║
║   ✓ Configurando sistema de alertas                                          ║
║   ✓ Preparando generador de reportes                                         ║
║                                                                               ║
║                                                                               ║
║                    Presione [ENTER] para continuar...                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Animación HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .console-container {
        background: #0a0e27;
        border: 3px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        font-family: 'Courier New', monospace;
        color: #00ff41;
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
        max-width: 800px;
        margin: 20px auto;
    }
    .title {
        text-align: center;
        font-size: 24px;
        margin-bottom: 20px;
        text-shadow: 0 0 10px #00ff41;
        animation: glow 2s ease-in-out infinite;
    }
    .loading-bar {
        width: 100%;
        height: 30px;
        background: #1a1f3a;
        border-radius: 15px;
        overflow: hidden;
        margin: 20px 0;
    }
    .loading-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff41, #00cc33);
        animation: loading 3s ease-in-out infinite;
    }
    .status-line {
        margin: 10px 0;
        opacity: 0;
        animation: fadeIn 0.5s ease-in forwards;
    }
    .status-line:nth-child(1) { animation-delay: 0.5s; }
    .status-line:nth-child(2) { animation-delay: 1s; }
    .status-line:nth-child(3) { animation-delay: 1.5s; }
    .status-line:nth-child(4) { animation-delay: 2s; }
    .status-line:nth-child(5) { animation-delay: 2.5s; }
    @keyframes loading {
        0% { width: 0%; }
        100% { width: 100%; }
    }
    @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41; }
        50% { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41; }
    }
    @keyframes fadeIn {
        to { opacity: 1; }
    }
</style>
</head>
<body>
<div class="console-container">
    <div class="title">
        ═══ EDUCARE IA - SISTEMA DE DETECCIÓN DE SOMNOLENCIA ═══
    </div>
    <div style="text-align: center; margin: 20px 0;">
        🚀 INICIANDO SISTEMA...
    </div>
    <div class="loading-bar">
        <div class="loading-fill"></div>
    </div>
    <div class="status-line">✓ Cargando MediaPipe Face Mesh (468 landmarks)</div>
    <div class="status-line">✓ Inicializando MediaPipe Hands</div>
    <div class="status-line">✓ Conectando con servidor WebSocket</div>
    <div class="status-line">✓ Configurando sistema de alertas</div>
    <div class="status-line">✓ Preparando generador de reportes</div>
</div>
</body>
</html>
```

</details>

---

## 📊 Dashboard Principal

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🎯 EDUCARE IA - DASHBOARD PRINCIPAL                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  [1] 😴 Iniciar Detección de Somnolencia                                     ║
║  [2] 📊 Ver Reportes y Estadísticas                                          ║
║  [3] ⚙️  Configuración del Sistema                                            ║
║  [4] ℹ️  Información y Ayuda                                                  ║
║  [5] 🚪 Salir                                                                 ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📈 ESTADO DEL SISTEMA                                                        ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                         │ ║
║  │  🟢 Servidor WebSocket:     CONECTADO (ws://localhost:8000)            │ ║
║  │  🟢 MediaPipe Face Mesh:    ACTIVO                                      │ ║
║  │  🟢 MediaPipe Hands:        ACTIVO                                      │ ║
║  │  🟢 Cámara:                 DISPONIBLE (Resolución: 1920x1080)         │ ║
║  │  📊 FPS:                    30.2 frames/segundo                         │ ║
║  │  💾 Espacio en disco:       15.4 GB disponibles                         │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  📅 ÚLTIMA SESIÓN                                                             ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                         │ ║
║  │  🕐 Fecha:              07 de Octubre, 2025 - 14:32:15                 │ ║
║  │  ⏱️  Duración:           45 minutos 23 segundos                          │ ║
║  │  🚨 Alertas generadas:  7 eventos detectados                           │ ║
║  │     ├─ 👁️  Parpadeos:    3 eventos                                      │ ║
║  │     ├─ 🥱 Bostezos:      2 eventos                                      │ ║
║  │     └─ 😴 Microsueños:   2 eventos                                      │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  💡 TIP: Use las teclas [↑] [↓] para navegar y [ENTER] para seleccionar     ║
║                                                                               ║
║  Seleccione una opción: _                                                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Dashboard Interactivo HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .dashboard {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
        border: 3px solid #00d4ff;
        border-radius: 15px;
        padding: 25px;
        font-family: 'Courier New', monospace;
        color: #00d4ff;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
        max-width: 900px;
        margin: 20px auto;
    }
    .header {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        border-bottom: 2px solid #00d4ff;
        padding-bottom: 15px;
        margin-bottom: 20px;
        animation: headerPulse 3s ease-in-out infinite;
    }
    .menu-item {
        padding: 12px 20px;
        margin: 10px 0;
        background: rgba(0, 212, 255, 0.1);
        border-left: 4px solid #00d4ff;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .menu-item:hover {
        background: rgba(0, 212, 255, 0.3);
        transform: translateX(10px);
        border-left-width: 8px;
    }
    .status-panel {
        background: rgba(0, 255, 65, 0.05);
        border: 2px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .status-item {
        margin: 8px 0;
        display: flex;
        align-items: center;
    }
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #00ff41;
        margin-right: 10px;
        animation: blink 2s ease-in-out infinite;
    }
    .metrics-panel {
        background: rgba(255, 165, 0, 0.05);
        border: 2px solid #ffa500;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .metric-bar {
        height: 8px;
        background: #1a1f3a;
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
    }
    .metric-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffa500, #ff6b00);
        animation: pulse 2s ease-in-out infinite;
    }
    @keyframes headerPulse {
        0%, 100% { text-shadow: 0 0 10px #00d4ff; }
        50% { text-shadow: 0 0 20px #00d4ff, 0 0 30px #00d4ff; }
    }
    @keyframes blink {
        0%, 100% { opacity: 1; box-shadow: 0 0 10px #00ff41; }
        50% { opacity: 0.5; }
    }
    @keyframes pulse {
        0%, 100% { width: 85%; }
        50% { width: 95%; }
    }
</style>
</head>
<body>
<div class="dashboard">
    <div class="header">
        🎯 EDUCARE IA - DASHBOARD PRINCIPAL
    </div>
    
    <div style="margin: 20px 0;">
        <div class="menu-item">
            [1] 😴 Iniciar Detección de Somnolencia
        </div>
        <div class="menu-item">
            [2] 📊 Ver Reportes y Estadísticas
        </div>
        <div class="menu-item">
            [3] ⚙️ Configuración del Sistema
        </div>
        <div class="menu-item">
            [4] ℹ️ Información y Ayuda
        </div>
        <div class="menu-item">
            [5] 🚪 Salir
        </div>
    </div>

    <div class="status-panel">
        <div style="font-weight: bold; margin-bottom: 15px;">📈 ESTADO DEL SISTEMA</div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>Servidor WebSocket: CONECTADO</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>MediaPipe Face Mesh: ACTIVO (468 landmarks)</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>MediaPipe Hands: ACTIVO</span>
        </div>
        <div class="status-item">
            <span class="status-indicator"></span>
            <span>Cámara: DISPONIBLE (1920x1080 @ 30 FPS)</span>
        </div>
    </div>

    <div class="metrics-panel">
        <div style="font-weight: bold; margin-bottom: 15px;">📅 ÚLTIMA SESIÓN</div>
        <div>🕐 Fecha: 07 de Octubre, 2025 - 14:32:15</div>
        <div>⏱️ Duración: 45 minutos 23 segundos</div>
        <div style="margin-top: 15px;">🚨 Alertas generadas:</div>
        <div style="margin-left: 20px;">
            <div>👁️ Parpadeos: 3 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 40%;"></div></div>
            <div>🥱 Bostezos: 2 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 28%;"></div></div>
            <div>😴 Microsueños: 2 eventos</div>
            <div class="metric-bar"><div class="metric-fill" style="width: 28%;"></div></div>
        </div>
    </div>

    <div style="text-align: center; color: #ffa500; margin-top: 20px;">
        💡 TIP: Use las teclas [↑] [↓] para navegar y [ENTER] para seleccionar
    </div>
</div>
</body>
</html>
```

</details>

---

## 🎥 Modo Detección Activa

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║              😴 SISTEMA DE DETECCIÓN DE SOMNOLENCIA - ACTIVO                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────┐  ┌───────────────────────────────────────┐   ║
║  │                           │  │   📊 MÉTRICAS EN TIEMPO REAL          │   ║
║  │    🎥 VIDEO EN VIVO       │  ├───────────────────────────────────────┤   ║
║  │                           │  │                                       │   ║
║  │    [FRAME CAPTURADO]      │  │  ⏱️  Tiempo activo: 00:15:32          │   ║
║  │                           │  │  🎯 FPS: 30.5                         │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  👤 Rostro detectado: ✓               │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │                                       │   ║
║  │   ▓▓▓▓▓▓👁️  ▓▓👁️  ▓▓▓▓    │  │  📍 PUNTOS DETECTADOS:                │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  ├─ Rostro: 468 landmarks             │   ║
║  │   ▓▓▓▓▓▓▓▓👃▓▓▓▓▓▓▓▓▓    │  │  ├─ Mano izq: 21 points               │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  └─ Mano der: 21 points               │   ║
║  │   ▓▓▓▓▓▓▓▓👄▓▓▓▓▓▓▓▓▓    │  │                                       │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  🔍 ANÁLISIS DE DISTANCIAS:           │   ║
║  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │  │  ├─ Ojo izq: 0.024                    │   ║
║  │                           │  │  ├─ Ojo der: 0.026                    │   ║
║  │  Resolución: 1920x1080    │  │  ├─ Boca: 0.015                       │   ║
║  └───────────────────────────┘  │  └─ Ángulo pitch: 12°                 │   ║
║                                  └───────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🚦 ESTADO DE CARACTERÍSTICAS                                         │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  👁️  Parpadeo:     🟢 NORMAL    │ Contador: 8/60s  │ Umbral: 15     │   ║
║  │  😴 Microsueño:   🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 2.0s   │   ║
║  │  🥱 Bostezo:      🟢 NORMAL    │ Contador: 0/180s │ Umbral: 4.0s   │   ║
║  │  🙇 Cabeceo:      🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 3.0s   │   ║
║  │  🤲 Frot. ojos:   🟢 NORMAL    │ Duración: 0.0s   │ Umbral: 1.0s   │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📜 REGISTRO DE EVENTOS (Últimos 5)                                   │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │  [00:14:22] ℹ️  Sistema iniciado correctamente                        │   ║
║  │  [00:14:45] 🟢 Primera detección facial exitosa                       │   ║
║  │  [00:15:12] 🟢 Calibración de umbrales completada                     │   ║
║  │  [00:15:28] ℹ️  Guardado automático de checkpoint                     │   ║
║  │  [00:15:32] 🟢 Sistema funcionando correctamente                      │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  [S] Detener  [P] Pausa  [R] Reiniciar  [C] Configurar  [ESC] Menú         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Modo Detección Activo HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .detection-console {
        background: #000814;
        border: 3px solid #00ff41;
        border-radius: 10px;
        padding: 20px;
        font-family: 'Courier New', monospace;
        color: #00ff41;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
        max-width: 1200px;
        margin: 20px auto;
    }
    .console-header {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        border-bottom: 2px solid #00ff41;
        padding-bottom: 10px;
        margin-bottom: 20px;
        animation: headerGlow 2s ease-in-out infinite;
    }
    .video-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
    }
    .video-frame {
        background: #0a1128;
        border: 2px solid #00d4ff;
        border-radius: 8px;
        padding: 15px;
        min-height: 300px;
        position: relative;
        overflow: hidden;
    }
    .face-ascii {
        text-align: center;
        font-size: 32px;
        margin: 40px 0;
        animation: float 3s ease-in-out infinite;
    }
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 15px 0;
    }
    .metric-item {
        background: rgba(0, 212, 255, 0.1);
        padding: 8px;
        border-radius: 5px;
        border-left: 3px solid #00d4ff;
    }
    .status-row {
        display: grid;
        grid-template-columns: 150px 120px 1fr 1fr;
        padding: 10px;
        margin: 5px 0;
        background: rgba(0, 255, 65, 0.05);
        border-radius: 5px;
        align-items: center;
    }
    .status-indicator {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        animation: pulse 2s ease-in-out infinite;
    }
    .status-green {
        background: #00ff41;
        box-shadow: 0 0 10px #00ff41;
    }
    .status-yellow {
        background: #ffff00;
        box-shadow: 0 0 10px #ffff00;
    }
    .status-red {
        background: #ff0000;
        box-shadow: 0 0 10px #ff0000;
    }
    .event-log {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #666;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        max-height: 150px;
        overflow-y: auto;
    }
    .event-line {
        margin: 5px 0;
        opacity: 0;
        animation: slideIn 0.5s ease-out forwards;
    }
    .event-line:nth-child(1) { animation-delay: 0s; }
    .event-line:nth-child(2) { animation-delay: 0.2s; }
    .event-line:nth-child(3) { animation-delay: 0.4s; }
    .event-line:nth-child(4) { animation-delay: 0.6s; }
    .event-line:nth-child(5) { animation-delay: 0.8s; }
    .control-bar {
        text-align: center;
        margin-top: 20px;
        padding: 15px;
        background: rgba(0, 212, 255, 0.1);
        border-radius: 8px;
        border: 1px solid #00d4ff;
    }
    @keyframes headerGlow {
        0%, 100% { text-shadow: 0 0 10px #00ff41; }
        50% { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41; }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .progress-bar {
        height: 6px;
        background: #0a1128;
        border-radius: 3px;
        margin: 8px 0;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff41, #00cc33);
        border-radius: 3px;
        animation: progress 2s ease-in-out infinite;
    }
    @keyframes progress {
        0% { width: 50%; }
        50% { width: 80%; }
        100% { width: 50%; }
    }
</style>
</head>
<body>
<div class="detection-console">
    <div class="console-header">
        😴 SISTEMA DE DETECCIÓN DE SOMNOLENCIA - ACTIVO
    </div>
    
    <div class="video-panel">
        <div class="video-frame">
            <div style="font-weight: bold; margin-bottom: 10px;">🎥 VIDEO EN VIVO</div>
            <div class="face-ascii">
                <div>👁️ &nbsp;&nbsp;&nbsp; 👁️</div>
                <div>&nbsp;&nbsp; 👃</div>
                <div>&nbsp;&nbsp; 👄</div>
            </div>
            <div style="text-align: center; color: #00d4ff;">
                Resolución: 1920x1080 @ 30 FPS
            </div>
        </div>
        
        <div class="video-frame">
            <div style="font-weight: bold; margin-bottom: 10px;">📊 MÉTRICAS EN TIEMPO REAL</div>
            <div class="metrics-grid">
                <div class="metric-item">⏱️ Tiempo: 00:15:32</div>
                <div class="metric-item">🎯 FPS: 30.5</div>
                <div class="metric-item">👤 Rostro: ✓</div>
                <div class="metric-item">🤲 Manos: 2</div>
            </div>
            <div style="margin-top: 15px;">
                <div style="font-weight: bold; margin-bottom: 8px;">📍 PUNTOS DETECTADOS:</div>
                <div style="margin-left: 15px;">
                    <div>Rostro: 468 landmarks</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 100%;"></div></div>
                    <div>Mano izq: 21 points</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 85%;"></div></div>
                    <div>Mano der: 21 points</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: 85%;"></div></div>
                </div>
            </div>
        </div>
    </div>

    <div style="background: rgba(0, 255, 65, 0.05); border: 2px solid #00ff41; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <div style="font-weight: bold; margin-bottom: 15px;">🚦 ESTADO DE CARACTERÍSTICAS</div>
        
        <div class="status-row">
            <div>👁️ Parpadeo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Contador: 8/60s</div>
            <div>Umbral: 15</div>
        </div>
        
        <div class="status-row">
            <div>😴 Microsueño:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 2.0s</div>
        </div>
        
        <div class="status-row">
            <div>🥱 Bostezo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Contador: 0/180s</div>
            <div>Umbral: 4.0s</div>
        </div>
        
        <div class="status-row">
            <div>🙇 Cabeceo:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 3.0s</div>
        </div>
        
        <div class="status-row">
            <div>🤲 Frot. ojos:</div>
            <div><span class="status-indicator status-green"></span>NORMAL</div>
            <div>Duración: 0.0s</div>
            <div>Umbral: 1.0s</div>
        </div>
    </div>

    <div class="event-log">
        <div style="font-weight: bold; margin-bottom: 10px;">📜 REGISTRO DE EVENTOS (Últimos 5)</div>
        <div class="event-line">[00:14:22] ℹ️ Sistema iniciado correctamente</div>
        <div class="event-line">[00:14:45] 🟢 Primera detección facial exitosa</div>
        <div class="event-line">[00:15:12] 🟢 Calibración de umbrales completada</div>
        <div class="event-line">[00:15:28] ℹ️ Guardado automático de checkpoint</div>
        <div class="event-line">[00:15:32] 🟢 Sistema funcionando correctamente</div>
    </div>

    <div class="control-bar">
        [S] Detener &nbsp;|&nbsp; [P] Pausa &nbsp;|&nbsp; [R] Reiniciar &nbsp;|&nbsp; [C] Configurar &nbsp;|&nbsp; [ESC] Menú
    </div>
</div>
</body>
</html>
```

</details>

---

## 🚨 Sistema de Alertas

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 ¡ALERTA DE SOMNOLENCIA DETECTADA!                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ██████╗ ███████╗██╗     ██╗ ██████╗ ██████╗  ██████╗                       ║
║   ██╔══██╗██╔════╝██║     ██║██╔════╝ ██╔══██╗██╔═══██╗                      ║
║   ██████╔╝█████╗  ██║     ██║██║  ███╗██████╔╝██║   ██║                      ║
║   ██╔═══╝ ██╔══╝  ██║     ██║██║   ██║██╔══██╗██║   ██║                      ║
║   ██║     ███████╗███████╗██║╚██████╔╝██║  ██║╚██████╔╝                      ║
║   ╚═╝     ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🔴 NIVEL DE ALERTA: CRÍTICO                                          │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  😴 MICROSUEÑO DETECTADO                                             │   ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │   ║
║  │                                                                       │   ║
║  │  📊 Detalles del evento:                                             │   ║
║  │  ├─ ⏱️  Duración: 3.4 segundos                                        │   ║
║  │  ├─ ⚠️  Umbral crítico: 2.0 segundos                                  │   ║
║  │  ├─ 📈 Nivel de confianza: 98.7%                                     │   ║
║  │  ├─ 🕐 Timestamp: 07/10/2025 - 14:48:52                             │   ║
║  │  └─ 📍 Frame #28,456                                                 │   ║
║  │                                                                       │   ║
║  │  👁️  Estado de ojos:                                                  │   ║
║  │  ├─ Ojo izquierdo: CERRADO (3.4s)                                   │   ║
║  │  └─ Ojo derecho: CERRADO (3.4s)                                     │   ║
║  │                                                                       │   ║
║  │  🔍 Factores adicionales detectados:                                 │   ║
║  │  ├─ ✓ Parpadeo frecuente previo (18 parpadeos/min)                  │   ║
║  │  ├─ ✓ Bostezo reciente (hace 45 segundos)                           │   ║
║  │  └─ ✓ Ligero cabeceo detectado                                      │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  💡 RECOMENDACIONES INMEDIATAS                                        │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  🛑 1. DETENGA el vehículo/actividad de forma segura                │   ║
║  │  ☕ 2. Tome un descanso de al menos 15-20 minutos                    │   ║
║  │  🚶 3. Realice ejercicios de estiramiento                            │   ║
║  │  💧 4. Hidrátese adecuadamente                                       │   ║
║  │  😴 5. Considere tomar una siesta corta (15-20 min)                 │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📊 ESTADÍSTICAS DE LA SESIÓN ACTUAL                                  │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  Tiempo total: 1h 12min 34s                                          │   ║
║  │  Total de alertas: 12 eventos                                        │   ║
║  │                                                                       │   ║
║  │  🔴 Críticas:   3  ████████░░░░░░░░░░░░░░░  25%                     │   ║
║  │  🟡 Advertencia: 7  ██████████████████░░░░░  58%                     │   ║
║  │  🟢 Informativas: 2  ████░░░░░░░░░░░░░░░░░░  17%                     │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ⚠️  Esta alerta ha sido guardada en el reporte automático                   ║
║      Archivo: reports/august/drowsiness_report.csv                           ║
║                                                                               ║
║  [A] Reconocer alerta  [D] Descartar  [P] Pausar sistema  [ESC] Continuar   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🎯 Ver Sistema de Alertas HTML</b></summary>

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .alert-console {
        background: linear-gradient(135deg, #1a0000 0%, #330000 100%);
        border: 4px solid #ff0000;
        border-radius: 15px;
        padding: 30px;
        font-family: 'Courier New', monospace;
        color: #ff3333;
        box-shadow: 0 0 40px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(255, 0, 0, 0.1);
        max-width: 1000px;
        margin: 20px auto;
        animation: alertPulse 1.5s ease-in-out infinite;
    }
    .alert-header {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        color: #ff0000;
        text-shadow: 0 0 20px #ff0000;
        margin-bottom: 30px;
        animation: dangerBlink 1s ease-in-out infinite;
    }
    .danger-panel {
        background: rgba(255, 0, 0, 0.1);
        border: 3px solid #ff0000;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
    }
    .warning-level {
        background: #ff0000;
        color: #fff;
        padding: 15px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
        animation: warningPulse 0.5s ease-in-out infinite;
    }
    .event-details {
        margin: 20px 0;
        padding: 15px;
        background: rgba(255, 51, 51, 0.05);
        border-left: 4px solid #ff3333;
        border-radius: 5px;
    }
    .detail-item {
        margin: 8px 0;
        padding-left: 20px;
    }
    .recommendations-box {
        background: rgba(255, 165, 0, 0.1);
        border: 2px solid #ffa500;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
    }
    .recommendation-item {
        margin: 10px 0;
        padding: 10px;
        background: rgba(255, 165, 0, 0.05);
        border-left: 3px solid #ffa500;
        border-radius: 5px;
        color: #ffa500;
    }
    .stats-bar {
        height: 25px;
        background: #1a0000;
        border-radius: 12px;
        overflow: hidden;
        margin: 10px 0;
        border: 1px solid #ff3333;
    }
    .stats-fill-critical {
        height: 100%;
        background: linear-gradient(90deg, #ff0000, #cc0000);
        float: left;
        animation: fillBar 2s ease-out;
    }
    .stats-fill-warning {
        height: 100%;
        background: linear-gradient(90deg, #ffff00, #ffaa00);
        float: left;
        animation: fillBar 2s ease-out;
    }
    .stats-fill-info {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #00cc00);
        float: left;
        animation: fillBar 2s ease-out;
    }
    @keyframes alertPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255, 0, 0, 0.6); }
        50% { box-shadow: 0 0 60px rgba(255, 0, 0, 0.9), 0 0 80px rgba(255, 0, 0, 0.5); }
    }
    @keyframes dangerBlink {
        0%, 100% { opacity: 1; text-shadow: 0 0 20px #ff0000; }
        50% { opacity: 0.7; text-shadow: 0 0 40px #ff0000, 0 0 60px #ff0000; }
    }
    @keyframes warningPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    @keyframes fillBar {
        from { width: 0; }
        to { width: 100%; }
    }
    .control-buttons {
        text-align: center;
        margin-top: 30px;
        padding: 20px;
        background: rgba(255, 0, 0, 0.1);
        border: 2px solid #ff3333;
        border-radius: 10px;
        font-size: 16px;
    }
</style>
</head>
<body>
<div class="alert-console">
    <div class="alert-header">
        🚨 ¡ALERTA DE SOMNOLENCIA DETECTADA! 🚨
    </div>
    
    <div class="danger-panel">
        <div class="warning-level">
            🔴 NIVEL DE ALERTA: CRÍTICO
        </div>
        
        <div style="font-size: 20px; text-align: center; margin: 20px 0; color: #ff0000;">
            😴 MICROSUEÑO DETECTADO
        </div>
        
        <div style="text-align: center; color: #ff3333; font-size: 40px; margin: 20px 0;">
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 15px; color: #ff6666;">📊 Detalles del evento:</div>
            <div class="detail-item">⏱️ Duración: 3.4 segundos</div>
            <div class="detail-item">⚠️ Umbral crítico: 2.0 segundos</div>
            <div class="detail-item">📈 Nivel de confianza: 98.7%</div>
            <div class="detail-item">🕐 Timestamp: 07/10/2025 - 14:48:52</div>
            <div class="detail-item">📍 Frame #28,456</div>
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff6666;">👁️ Estado de ojos:</div>
            <div class="detail-item">Ojo izquierdo: CERRADO (3.4s)</div>
            <div class="detail-item">Ojo derecho: CERRADO (3.4s)</div>
        </div>
        
        <div class="event-details">
            <div style="font-weight: bold; margin-bottom: 10px; color: #ff6666;">🔍 Factores adicionales detectados:</div>
            <div class="detail-item">✓ Parpadeo frecuente previo (18 parpadeos/min)</div>
            <div class="detail-item">✓ Bostezo reciente (hace 45 segundos)</div>
            <div class="detail-item">✓ Ligero cabeceo detectado</div>
        </div>
    </div>

    <div class="recommendations-box">
        <div style="font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 18px;">
            💡 RECOMENDACIONES INMEDIATAS
        </div>
        <div class="recommendation-item">🛑 1. DETENGA el vehículo/actividad de forma segura</div>
        <div class="recommendation-item">☕ 2. Tome un descanso de al menos 15-20 minutos</div>
        <div class="recommendation-item">🚶 3. Realice ejercicios de estiramiento</div>
        <div class="recommendation-item">💧 4. Hidrátese adecuadamente</div>
        <div class="recommendation-item">😴 5. Considere tomar una siesta corta (15-20 min)</div>
    </div>

    <div class="danger-panel">
        <div style="font-weight: bold; margin-bottom: 15px; color: #ff6666; text-align: center;">
            📊 ESTADÍSTICAS DE LA SESIÓN ACTUAL
        </div>
        <div style="text-align: center; margin: 15px 0;">
            Tiempo total: 1h 12min 34s | Total de alertas: 12 eventos
        </div>
        
        <div style="margin: 20px 0;">
            <div style="margin: 10px 0;">🔴 Críticas: 3 (25%)</div>
            <div class="stats-bar">
                <div class="stats-fill-critical" style="width: 25%;"></div>
            </div>
            
            <div style="margin: 10px 0;">🟡 Advertencia: 7 (58%)</div>
            <div class="stats-bar">
                <div class="stats-fill-warning" style="width: 58%;"></div>
            </div>
            
            <div style="margin: 10px 0;">🟢 Informativas: 2 (17%)</div>
            <div class="stats-bar">
                <div class="stats-fill-info" style="width: 17%;"></div>
            </div>
        </div>
    </div>

    <div style="text-align: center; color: #ffa500; margin: 20px 0;">
        ⚠️ Esta alerta ha sido guardada en el reporte automático<br>
        Archivo: reports/august/drowsiness_report.csv
    </div>

    <div class="control-buttons">
        [A] Reconocer alerta &nbsp;|&nbsp; [D] Descartar &nbsp;|&nbsp; [P] Pausar sistema &nbsp;|&nbsp; [ESC] Continuar
    </div>
</div>
</body>
</html>
```

</details>

---

## 📈 Pantalla de Reportes

```ascii
╔═══════════════════════════════════════════════════════════════════════════════╗
║                 📊 REPORTES Y ESTADÍSTICAS DEL SISTEMA                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📅 Período: Última semana (01-07 Octubre 2025)                              ║
║  📁 Archivo: reports/august/drowsiness_report.csv                            ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📈 RESUMEN GENERAL                                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  ⏱️  Total de sesiones:        24 sesiones                            │   ║
║  │  🕐 Tiempo total de monitoreo: 18h 45min 32s                         │   ║
║  │  📊 Promedio por sesión:       47min 18s                             │   ║
║  │  🚨 Total de alertas:          156 eventos                           │   ║
║  │  📉 Promedio de alertas:       6.5 eventos/sesión                    │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🎯 DISTRIBUCIÓN POR TIPO DE EVENTO                                   │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  👁️  Parpadeo frecuente:      62 eventos (39.7%)                      │   ║
║  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  😴 Microsueño:               38 eventos (24.4%)                      │   ║
║  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🥱 Bostezo prolongado:        31 eventos (19.9%)                     │   ║
║  │  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🙇 Cabeceo:                  18 eventos (11.5%)                      │   ║
║  │  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  │  🤲 Frotamiento de ojos:       7 eventos (4.5%)                       │   ║
║  │  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                     │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  ⏰ DISTRIBUCIÓN TEMPORAL (por hora del día)                          │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  00:00-06:00  ████████████████████████████████░░░░░░░░  45 eventos   │   ║
║  │  06:00-12:00  ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░  22 eventos   │   ║
║  │  12:00-18:00  ████████████████████░░░░░░░░░░░░░░░░░░░  31 eventos   │   ║
║  │  18:00-24:00  ████████████████████████████████████████  58 eventos   │   ║
║  │                                                                       │   ║
║  │  💡 Pico de alertas: 22:00-02:00 (horario de mayor riesgo)          │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  🏆 TOP 5 SESIONES CON MÁS ALERTAS                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  1. 📅 05/10/2025 23:15  |  ⏱️  52min  |  🚨 18 alertas  |  🔴🔴🔴    │   ║
║  │  2. 📅 03/10/2025 21:40  |  ⏱️  48min  |  🚨 15 alertas  |  🔴🔴      │   ║
║  │  3. 📅 07/10/2025 01:20  |  ⏱️  65min  |  🚨 14 alertas  |  🔴🔴      │   ║
║  │  4. 📅 02/10/2025 22:55  |  ⏱️  44min  |  🚨 12 alertas  |  🔴        │   ║
║  │  5. 📅 04/10/2025 00:35  |  ⏱️  58min  |  🚨 11 alertas  |  🔴        │   ║
║  │                                                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │  📋 ÚLTIMOS 10 EVENTOS REGISTRADOS                                    │   ║
║  ├───────────────────────────────────────────────────────────────────────┤   ║
║  │                                                                       │   ║
║  │  [07/10 14:48:52] 🔴 Microsueño    | 3.4s  | Frame #28456            │   ║
║  │  [07/10 14:43:18] 🟡 Bostezo       | 4.8s  | Frame #27892            │   ║
║  │  [07