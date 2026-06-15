// AdminApp.jsx - with correct paths
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import Users from './Users'
import Vault from './Vault'
import XPLevels from './XPLevels'
import Referral from './Referral'
import Marketplace from './Marketplace'
import Contests from './Contests'
import Tasks from './Tasks'
import Carousel from './Carousel'
import Analytics from './Analytics'
import Notifications from './Notifications'
import Academy from './Academy'
import Exchange from './Exchange'
import Squad from './Squad'
import SystemSettings from './SystemSettings'

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

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminDashboard token={token} />} />
        <Route path="/admin/users" element={<Users token={token} />} />
        <Route path="/admin/vault" element={<Vault token={token} />} />
        <Route path="/admin/xp-levels" element={<XPLevels token={token} />} />
        <Route path="/admin/referral" element={<Referral token={token} />} />
        <Route path="/admin/marketplace" element={<Marketplace token={token} />} />
        <Route path="/admin/contests" element={<Contests token={token} />} />
        <Route path="/admin/tasks" element={<Tasks token={token} />} />
        <Route path="/admin/carousel" element={<Carousel token={token} />} />
        <Route path="/admin/analytics" element={<Analytics token={token} />} />
        <Route path="/admin/notifications" element={<Notifications token={token} />} />
        <Route path="/admin/academy" element={<Academy />} />
        <Route path="/admin/exchange" element={<Exchange />} />
        <Route path="/admin/squad" element={<Squad />} />
        <Route path="/admin/settings" element={<SystemSettings token={token} />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </AdminLayout>
  )
}