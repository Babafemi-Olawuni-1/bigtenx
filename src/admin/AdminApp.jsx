import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('bigtenx_admin_token') || '')

  const handleLogin = (t) => {
    localStorage.setItem('bigtenx_admin_token', t)
    setToken(t)
  }
  const handleLogout = () => {
    localStorage.removeItem('bigtenx_admin_token')
    setToken('')
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />
  return <AdminDashboard token={token} onLogout={handleLogout} />
}
