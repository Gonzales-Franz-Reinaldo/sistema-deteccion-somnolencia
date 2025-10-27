// CONFIGURACIÓN DE RUTAS DE LA APLICACIÓN
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

// Pages
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import { AdminDashboardPage, GestionChoferesPage } from '../pages/admin';
import ChoferDashboardPage from '../pages/chofer/DashboardPage';

// Layouts
import AdminLayout from '../components/layout/AdminLayout';
import ChoferLayout from '../components/layout/ChoferLayout';

// Protected Routes
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Ruta raíz - Redirige según autenticación */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={user.rol === 'admin' ? '/admin/dashboard' : '/chofer/dashboard'}
              replace
            />
          ) : (
            <WelcomePage />
          )
        }
      />

      {/* Login - Redirige si ya está autenticado */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={user.rol === 'admin' ? '/admin/dashboard' : '/chofer/dashboard'}
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Rutas del Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="choferes" element={<GestionChoferesPage />} />
        <Route
          path="empresas"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        <Route
          path="reportes"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        <Route
          path="configuracion"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        {/* Redirección por defecto */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Rutas del Chofer */}
      <Route
        path="/chofer"
        element={
          <ProtectedRoute requiredRole="chofer">
            <ChoferLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ChoferDashboardPage />} />
        <Route
          path="monitoreo"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Monitoreo</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        <Route
          path="historial"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Historial de Viajes</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        <Route
          path="perfil"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              <p className="text-gray-600 mt-2">Módulo en desarrollo</p>
            </div>
          }
        />
        {/* Redirección por defecto */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 404 - Página no encontrada */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
              <a
                href="/"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;