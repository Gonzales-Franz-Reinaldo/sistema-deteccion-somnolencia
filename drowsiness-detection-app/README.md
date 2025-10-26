proyecto-frontend-app/
├── public/                 # Estáticos (imágenes públicas, favicon)
├── src/
│   ├── assets/             # Imágenes, fonts, SVGs (importa con ?react para Vite)
│   ├── components/         # UI compartida (atómica y layouts)
│   │   ├── common/         # Atómicos: Button.tsx, Input.tsx, Modal.tsx (usa Tailwind)
│   │   │   └── index.ts    # Barrel export
│   │   ├── layout/         # Navbar.tsx, Footer.tsx, Sidebar.tsx
│   │   │   └── index.ts
│   │   └── index.ts        # Exporta todo de components
│   ├── features/           # Núcleo: features encapsuladas
│   │   ├── auth/           # Ejemplo
│   │   │   ├── components/ # LoginForm.tsx (solo para auth)
│   │   │   ├── hooks/      # useAuth.ts
│   │   │   ├── services/   # authApi.ts (llamadas específicas; usa global client)
│   │   │   ├── types.ts    # User, Credentials (o folder si crece)
│   │   │   └── index.ts    # Exporta públicos
│   │   └── products/       # Similar: components/, hooks/, services/, types.ts, index.ts
│   ├── hooks/              # Globales: useDebounce.ts, useLocalStorage.ts
│   │   └── index.ts
│   ├── lib/                # Utilidades puras y config
│   │   ├── api/            # client.ts (instancia Axios global con baseURL, interceptors)
│   │   ├── utils/          # formatDate.ts, classNames.ts (para Tailwind condicional)
│   │   ├── constants/      # API_URL, THEME_COLORS
│   │   └── index.ts
│   ├── pages/              # Páginas/rutas (de aquí importas en routes)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx   # Usa components de auth feature
│   │   ├── ProductsPage.tsx
│   │   └── layouts/       # Opcional: AuthLayout.tsx para rutas protegidas
│   ├── providers/          # Wrappers globales
│   │   └── AppProviders.tsx # <AuthProvider><ThemeProvider><Router>...</>
│   │       └── index.ts
│   ├── routes/             # Lógica de enrutamiento
│   │   ├── AppRoutes.tsx   # <Routes> con <Route path="/" element={<HomePage />} />
│   │   └── ProtectedRoute.tsx
│   │       └── index.ts
│   ├── store/              # Estado global (Zustand/Context/Redux)
│   │   └── index.ts        # createStore o providers
│   ├── styles/             # Globales
│   │   └── globals.css     # @tailwind base; components; utilities;
│   ├── types/              # Globales TS: AppState, RouteParams
│   │   └── index.ts
│   ├── App.tsx             # Raíz: <AppProviders><AppRoutes /></AppProviders>
│   ├── main.tsx            # ReactDOM.render(<App />, root)
│--- .env  
├── .eslintrc.cjs           # O .config.js si prefieres
├── .gitignore
├── index.html              # <div id="root"></div>
├── package.json
├-- tsconfig.app.json       
├── tsconfig.json           
├── tsconfig.node.json
└── vite.config.ts          # Plugins React, aliases @