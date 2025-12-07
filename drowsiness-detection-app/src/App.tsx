import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './providers/AuthProvider';
import { NotificacionesProvider } from './providers/NotificacionesProvider';  
import { AppRoutes } from './routes/AppRoutes';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        
        <NotificacionesProvider>
          <AppRoutes />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </NotificacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;