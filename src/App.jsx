import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import useStore from './store/useStore'
import LandingPage from './components/LandingPage'
import AuthPage from './auth/AuthPage'
import Dashboard from './pages/Dashboard'
import AdminApp from './admin/AdminApp'

function App() {
  const { user, setUser, logout, darkMode, setDarkMode } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  // On mount: if there's no user in sessionStorage, make sure we're clean
  // (sessionStorage is already cleared on tab close, this is just a safety net)
  useEffect(() => {
    // Nothing to restore from localStorage — sessionStorage handles it automatically
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    logout()
    // Clear any task completion cache on logout
    sessionStorage.removeItem('bigtenx_completed_tasks')
    navigate('/')
  }

  const isAdminRoute = location.pathname.startsWith('/admin')
  if (isAdminRoute) return <AdminApp />

  // If logged in and trying to access auth pages, redirect to dashboard
  if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
    navigate('/dashboard')
    return null
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onGetStarted={() => navigate('/signup')}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />
      <Route
        path="/login"
        element={<AuthPage onLogin={handleLogin} initialView="login" />}
      />
      <Route
        path="/signup"
        element={<AuthPage onLogin={handleLogin} initialView="register" />}
      />
      <Route
        path="/dashboard"
        element={
          user
            ? <Dashboard user={user} onLogout={handleLogout} />
            : <AuthPage onLogin={handleLogin} initialView="login" />
        }
      />
      <Route
        path="/reset-password"
        element={<AuthPage onLogin={handleLogin} initialView="reset" />}
      />
    </Routes>
  )
}

export default App
