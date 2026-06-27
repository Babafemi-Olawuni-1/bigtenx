// AdminApp.jsx - COMPLETE FIXED VERSION with Task Form Integration
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
import AdminTaskForm from './AdminTaskForm'
import { API } from './adminUtils'

// ─── DEFAULT FORM STATE ──────────────────────────────────────────────────────
const DEFAULT_TASK_FORM = {
  type: 'daily',
  platform: 'Instagram',
  title: '',
  description: '',
  url: '',
  reward: 0,
  reward_type: 'xp',
  apply_multiplier: 1,
  code_type: 'universal',
  verify_code: '',
  individual_count: 10,
  hot_limit_type: 'timer',
  expires_at: '',
  max_users: '',
  steps: []
}

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('bigtenx_admin_token') || '')

  // ─── TASK FORM STATE ──────────────────────────────────────────────
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState(DEFAULT_TASK_FORM)
  const [formLoading, setFormLoading] = useState(false)

  const handleLogin = (t) => {
    localStorage.setItem('bigtenx_admin_token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('bigtenx_admin_token')
    setToken('')
  }

  // ─── OPEN TASK FORM ──────────────────────────────────────────────
  const openTaskForm = (task = null) => {
    if (task) {
      setEditingTask(task.id)
      setTaskForm({
        type: task.type || 'daily',
        platform: task.platform || 'Instagram',
        title: task.title || '',
        description: task.description || '',
        url: task.url || '',
        reward: task.reward_xp || 0,
        reward_type: task.reward_type || 'xp',
        apply_multiplier: task.apply_multiplier ?? 1,
        code_type: task.code_type || 'universal',
        verify_code: task.verify_code || '',
        individual_count: 10,
        hot_limit_type: task.expires_at ? 'timer' : (task.max_users ? 'users' : 'timer'),
        expires_at: task.expires_at || '',
        max_users: task.max_users || '',
        steps: Array.isArray(task.steps) ? task.steps : []
      })
    } else {
      setEditingTask(null)
      setTaskForm(DEFAULT_TASK_FORM)
    }
    setShowTaskForm(true)
  }

  // ─── TASK FORM SUBMIT HANDLER ─────────────────────────────────────
  const handleTaskSubmit = async (formData) => {
    setFormLoading(true)
    try {
      const method = editingTask ? 'PUT' : 'POST'
      const url = `${API}/admin/tasks.php`
      
      const payload = {
        ...formData,
        id: editingTask || undefined,
        reward_xp: formData.reward,
        reward: formData.reward,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        platform: formData.platform,
        url: formData.url || null,
        reward_type: formData.reward_type,
        apply_multiplier: formData.apply_multiplier,
        code_type: formData.code_type,
        verify_code: formData.code_type === 'universal' ? formData.verify_code : null,
        individual_count: formData.individual_count || 10,
        hot_limit_type: formData.hot_limit_type || 'timer',
        expires_at: formData.expires_at || null,
        max_users: formData.max_users || null,
        steps: formData.steps || [],
        active: 1
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      if (data.success) {
        alert(editingTask ? 'Task updated successfully!' : `Task created! Code: ${data.verify_code || 'N/A'}`)
        setShowTaskForm(false)
        setEditingTask(null)
        setTaskForm(DEFAULT_TASK_FORM)
        // Refresh the page to reload tasks
        window.location.reload()
      } else {
        alert(data.message || 'Failed to save task')
      }
    } catch (error) {
      alert('Network error: ' + error.message)
    } finally {
      setFormLoading(false)
    }
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
        
        {/* ─── TASKS ROUTE WITH FORM ────────────────────────────────── */}
        <Route
          path="/admin/tasks"
          element={
            <>
              <Tasks
                token={token}
                onNewTask={() => openTaskForm(null)}
                onEditTask={(task) => openTaskForm(task)}
              />

              {showTaskForm && (
                <AdminTaskForm
                  editingTask={editingTask}
                  form={taskForm}
                  setForm={setTaskForm}
                  onSubmit={handleTaskSubmit}
                  onClose={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                    setTaskForm(DEFAULT_TASK_FORM)
                  }}
                  loading={formLoading}
                />
              )}
            </>
          }
        />
        
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