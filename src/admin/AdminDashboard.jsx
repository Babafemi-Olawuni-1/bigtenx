import { useState, useEffect, useCallback } from 'react'
import { API } from './adminUtils'
import AdminHeader from './AdminHeader'
import AdminTaskForm from './AdminTaskForm'
import { Toast, AdminBottomNav } from './AdminShared'
import { OverviewTab, TasksTab, UsersTab, RevenueTab } from './AdminTabs'

const BLANK = {
  title:'', description:'', type:'daily', platform:'Facebook',
  url:'', reward:50, reward_type:'xp', apply_multiplier:1,
  code_type:'universal', verify_code:'', individual_count:10,
  hot_limit_type:'timer', expires_at:'', max_users:'', steps:[]
}

export default function AdminDashboard({ token, onLogout }) {
  const [tab,          setTab]          = useState('overview')
  const [darkMode,     setDarkMode]     = useState(true)
  const [stats,        setStats]        = useState(null)
  const [tasks,        setTasks]        = useState([])
  const [users,        setUsers]        = useState([])
  const [showForm,     setShowForm]     = useState(false)
  const [editingTask,  setEditingTask]  = useState(null)
  const [form,         setForm]         = useState(BLANK)
  const [selectedUser, setSelectedUser] = useState('')
  const [targetLevel,  setTargetLevel]  = useState(1)
  const [targetVip,    setTargetVip]    = useState(false)
  const [monthRevenue, setMonthRevenue] = useState('')
  const [savedRevenue, setSavedRevenue] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [toast,        setToast]        = useState(null)

  const headers = { 'Content-Type':'application/json', 'X-Admin-Token': token }
  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try { const r = await fetch(`${API}/admin/stats.php`, { headers }); const d = await r.json(); if (d.success) setStats(d.stats) } catch {}
  }, [])

  const loadTasks = useCallback(async () => {
    try { const r = await fetch(`${API}/admin/tasks.php`, { headers }); const d = await r.json(); if (d.success) setTasks(d.tasks) } catch { showToast('Failed to load tasks','error') }
  }, [])

  const loadUsers = useCallback(async () => {
    try { const r = await fetch(`${API}/admin/users.php`, { headers }); const d = await r.json(); if (d.success) setUsers(d.users) } catch {}
  }, [])

  const loadRevenue = useCallback(async () => {
    try { const r = await fetch(`${API}/admin/revenue.php`, { headers }); const d = await r.json(); if (d.success) setSavedRevenue(d.month_revenue) } catch {}
  }, [])

  useEffect(() => { loadStats(); loadTasks(); loadUsers(); loadRevenue() }, [])

  // ── Task CRUD ─────────────────────────────────────────────────────────────────
  const resetForm = () => { setForm(BLANK); setEditingTask(null); setShowForm(false) }

  const handleEditTask = (task) => {
    setEditingTask(task.id)
    setForm({
      title:           task.title           || '',
      description:     task.description     || '',
      type:            task.type            || 'daily',
      platform:        task.platform        || 'Facebook',
      url:             task.url             || '',
      reward:          task.reward_xp       || 50,
      reward_type:     task.reward_type     || 'xp',
      apply_multiplier: task.apply_multiplier ?? 1,
      code_type:       task.code_type       || 'universal',
      verify_code:     task.verify_code     || '',
      individual_count: 10,
      hot_limit_type:  task.expires_at ? 'timer' : (task.max_users ? 'users' : 'timer'),
      expires_at:      task.expires_at      || '',
      max_users:       task.max_users       || '',
      steps:           Array.isArray(task.steps) ? task.steps : [],
    })
    setShowForm(true)
  }

  const submitTask = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { showToast('Task title required','error'); return }
    if (!form.url.trim())   { showToast('URL required','error'); return }
    setLoading(true)
    try {
      const payload = {
        title:            form.title,
        description:      form.description,
        type:             form.type,
        url:              form.url,
        platform:         form.platform,
        reward_xp:        form.reward,
        reward:           form.reward,
        reward_type:      form.reward_type,
        apply_multiplier: form.apply_multiplier,
        code_type:        form.code_type,
        verify_code:      form.code_type === 'universal' ? (form.verify_code || null) : null,
        individual_count: form.individual_count || 10,
        hot_limit_type:   form.hot_limit_type || 'timer',
        expires_at:       form.expires_at  || null,
        max_users:        form.max_users   || null,
        steps:            form.steps,
      }
      if (editingTask) payload.id = editingTask

      const r = await fetch(`${API}/admin/tasks.php`, {
        method: editingTask ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (d.success) {
        // If individual code type, generate the codes now
        if (!editingTask && payload.code_type === 'individual' && d.task_id) {
          try {
            const codeCount = form.individual_count || 10
            const cr = await fetch(`${API}/admin/task_codes.php`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ task_id: d.task_id, count: codeCount }),
            })
            const cd = await cr.json()
            if (cd.success) {
              showToast(`Task created! ${cd.count} individual codes generated.`)
            } else {
              showToast(`Task created but code generation failed: ${cd.message}`, 'error')
            }
          } catch {
            showToast('Task created but failed to generate codes', 'error')
          }
        } else {
          showToast(editingTask ? 'Task updated!' : `Task created! Code: ${d.verify_code || 'N/A'}`)
        }
        resetForm()
        loadTasks()
        loadStats()
      } else {
        showToast(d.message || 'Save failed', 'error')
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTask = async (id) => {
    try {
      await fetch(`${API}/admin/tasks.php`, { method:'PATCH', headers, body:JSON.stringify({ id }) })
      loadTasks()
    } catch { showToast('Toggle failed','error') }
  }

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task permanently?')) return
    try {
      const r = await fetch(`${API}/admin/tasks.php?id=${id}`, { method:'DELETE', headers })
      const d = await r.json()
      if (d.success) {
        showToast('Task deleted')
        loadTasks()
        loadStats()
      } else {
        showToast(d.message || 'Delete failed', 'error')
      }
    } catch { showToast('Network error during delete', 'error') }
  }

  const handleCopyCode = (code) => { navigator.clipboard.writeText(code); showToast('Code copied!','info') }

  // ── User upgrade ──────────────────────────────────────────────────────────────
  const handleUpgradeUser = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/admin/update_user_level.php`, { method:'POST', headers, body:JSON.stringify({ user_id:selectedUser, level:targetLevel, is_vip:targetVip?1:0 }) })
      const d = await r.json()
      if (d.success) { showToast(d.message); loadUsers(); loadStats() }
      else showToast(d.message,'error')
    } catch { showToast('Error updating user','error') }
    finally { setLoading(false) }
  }

  // ── Revenue ───────────────────────────────────────────────────────────────────
  const handleSaveRevenue = async () => {
    const val = parseFloat(monthRevenue)
    if (isNaN(val) || val < 0) { showToast('Enter a valid amount','error'); return }
    try {
      const r = await fetch(`${API}/admin/revenue.php`, { method:'POST', headers, body:JSON.stringify({ month_revenue:val }) })
      const d = await r.json()
      if (d.success) { setSavedRevenue(val); setMonthRevenue(''); showToast('Revenue updated!') }
      else showToast(d.message,'error')
    } catch { showToast('Network error','error') }
  }

  const handleRefresh = () => { loadStats(); loadUsers(); loadTasks(); showToast('Refreshed','info') }

  return (
    <div style={{ minHeight:'100vh', background: darkMode ? '#050816' : '#F7F8FC', fontFamily:"'Sora',sans-serif", paddingBottom:90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;}input:focus,select:focus,textarea:focus{border-color:#FF6F00!important;}option{background:#131b2e;}`}</style>

      <AdminHeader darkMode={darkMode} setDarkMode={setDarkMode} onLogout={onLogout}/>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'24px 16px' }}>
        {tab === 'overview' && (
          <OverviewTab stats={stats} savedRevenue={savedRevenue} darkMode={darkMode} onRefresh={handleRefresh}/>
        )}
        {tab === 'tasks' && (
          <TasksTab
            tasks={tasks} darkMode={darkMode} token={token}
            onNew={() => { resetForm(); setShowForm(true) }}
            onEdit={handleEditTask}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onCopy={handleCopyCode}
          />
        )}
        {tab === 'users' && (
          <UsersTab
            users={users} darkMode={darkMode}
            selectedUser={selectedUser} setSelectedUser={setSelectedUser}
            targetLevel={targetLevel}   setTargetLevel={setTargetLevel}
            targetVip={targetVip}       setTargetVip={setTargetVip}
            onUpgrade={handleUpgradeUser} loading={loading}
          />
        )}
        {tab === 'revenue' && (
          <RevenueTab
            savedRevenue={savedRevenue}
            monthRevenue={monthRevenue} setMonthRevenue={setMonthRevenue}
            onSave={handleSaveRevenue}  darkMode={darkMode}
          />
        )}
      </div>

      <AdminBottomNav tab={tab} setTab={setTab}/>

      {showForm && (
        <AdminTaskForm
          editingTask={editingTask} form={form} setForm={setForm}
          onSubmit={submitTask} onClose={resetForm} loading={loading}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  )
}
