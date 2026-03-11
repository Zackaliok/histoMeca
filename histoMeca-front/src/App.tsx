import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { authService } from './services/authService'
import { ToastProvider } from './context/ToastContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
