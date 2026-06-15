// Tasks.jsx - COMPLETELY FIXED (no syntax errors)
import { useState, useEffect, useCallback } from 'react'
import { API, O } from './adminUtils'
import { Plus, Edit, Trash2, Pause, Play, Copy, Calendar, Filter, X } from 'lucide-react'

function Badge({ children, color, bg }) {
  return (
    <span style={{
      background: bg || `${color}15`,
      color: color,
      borderRadius: 30,
      padding: '3px 10px',
      fontSize: 10,
      fontWeight: 700
    }}>{children}</span>
  )
}

export default function Tasks({ token, onNewTask, onEditTask }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/tasks.php`, { headers })
      const data = await res.json()
      if (data.success) setTasks(data.tasks)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleToggleTask = async (id) => {
    try {
      await fetch(`${API}/admin/tasks.php`, { method: 'PATCH', headers, body: JSON.stringify({ id }) })
      loadTasks()
    } catch (err) { alert('Toggle failed') }
  }

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task permanently?')) return
    try {
      const res = await fetch(`${API}/admin/tasks.php?id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) { loadTasks(); alert('Task deleted') }
      else alert(data.message || 'Delete failed')
    } catch (err) { alert('Network error') }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert('Code copied!')
  }

  const showTaskAnalytics = (task) => {
    setSelectedTask(task)
    setShowAnalyticsModal(true)
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.type === filter)

  const getBadgeClass = (task) => {
    if (!task.active) return { bg: '#DC262615', color: '#DC2626' }
    if (task.type === 'daily') return { bg: '#10B98115', color: '#10B981' }
    return { bg: `${O}15`, color: O }
  }

  const getBadgeText = (task) => {
    if (!task.active) return 'PAUSED'
    if (task.type === 'daily') return 'Daily'
    return 'Hot Offer'
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>Loading tasks...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>Task Management</h1>
        <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Create, edit, and manage user tasks</p>
      </div>

      {/* Filter and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px', borderRadius: 30, border: 'none',
              background: filter === 'all' ? O : '#F7F8FC',
              color: filter === 'all' ? '#fff' : '#5A6E8A',
              fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('daily')}
            style={{
              padding: '8px 16px', borderRadius: 30, border: 'none',
              background: filter === 'daily' ? O : '#F7F8FC',
              color: filter === 'daily' ? '#fff' : '#5A6E8A',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Calendar size={12} /> Daily
          </button>
          <button
            onClick={() => setFilter('hot')}
            style={{
              padding: '8px 16px', borderRadius: 30, border: 'none',
              background: filter === 'hot' ? O : '#F7F8FC',
              color: filter === 'hot' ? '#fff' : '#5A6E8A',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Filter size={12} /> Hot Offers
          </button>
        </div>
        <button
          onClick={() => onNewTask && onNewTask()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: O, border: 'none', borderRadius: 30,
            padding: '8px 20px', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 24, border: '1px solid #E9EDF2', color: '#8899AA' }}>
            No tasks found. Create your first task!
          </div>
        )}
        {filteredTasks.map(task => {
          const badge = getBadgeClass(task)
          return (
            <div 
              key={task.id} 
              onClick={() => showTaskAnalytics(task)}
              style={{
                background: '#fff', borderRadius: 20, padding: 14,
                border: task.active ? `1px solid ${O}30` : '1px solid #E9EDF2',
                boxShadow: '0 2px 8px rgba(0,31,84,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {/* Title and badges */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#001F54' }}>{task.title}</span>
                    <Badge color={badge.color} bg={badge.bg}>
                      {getBadgeText(task)}
                    </Badge>
                  </div>
                  {/* Platform */}
                  <div style={{ fontSize: 11, color: '#8899AA', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>🌐 {task.platform}</span>
                    {task.type === 'hot' && task.active && (
                      <span style={{ background: `${O}1A`, padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>
                        🔥 {task.hotCount || 0} users
                      </span>
                    )}
                  </div>
                  {/* Reward */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: O, marginBottom: 8 }}>
                    🎁 Reward: {task.reward_type === 'cash' ? `$${task.reward_xp}` : `${task.reward_xp} XP`}
                  </div>
                  {/* Codes */}
                  <div style={{ fontSize: 11, color: '#001F54', background: '#F7F8FC', display: 'inline-block', padding: '4px 10px', borderRadius: 20 }}>
                    📱 Codes ({task.verify_code || task.individual_codes_count || 0})
                  </div>
                  {/* Stats Preview */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid #E9EDF2', fontSize: 11, color: '#8899AA' }}>
                    <div>👥 <span style={{ color: '#001F54', fontWeight: 700 }}>{task.participants?.toLocaleString() || 0}</span> participated</div>
                    <div>✅ <span style={{ color: '#001F54', fontWeight: 700 }}>{task.completed?.toLocaleString() || 0}</span> completed</div>
                  </div>
                  {/* Universal code - click to copy */}
                  {task.code_type === 'universal' && task.verify_code && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyCode(task.verify_code) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, marginTop: 8,
                        background: `${O}12`, border: 'none', borderRadius: 8,
                        padding: '4px 12px', color: O, fontSize: 11,
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Copy size={11} /> {task.verify_code}
                    </button>
                  )}
                </div>

                {/* Action Buttons - prevent click from triggering card click */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id) }}
                    title={task.active ? 'Pause' : 'Activate'}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: task.active ? `${O}15` : '#F7F8FC',
                      border: `1px solid ${task.active ? `${O}30` : '#E9EDF2'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {task.active ? <Pause size={15} color={O} /> : <Play size={15} color="#10B981" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditTask && onEditTask(task) }}
                    title="Edit"
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Edit size={15} color="#6366f1" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                    title="Delete"
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={15} color="#f87171" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedTask && (
        <div
          onClick={() => setShowAnalyticsModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', width: '100%', maxWidth: 380, borderRadius: 28,
              overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid #E9EDF2',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fff'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#001F54' }}>{selectedTask.title}</h3>
              <button onClick={() => setShowAnalyticsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#8899AA" />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>👥 Total Participants</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: O }}>{selectedTask.participants?.toLocaleString() || 0}</span>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>✅ Completed</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: O }}>{selectedTask.completed?.toLocaleString() || 0}</span>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>📊 Completion Rate</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: O }}>
                  {selectedTask.participants > 0 
                    ? ((selectedTask.completed / selectedTask.participants) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>🎁 Reward</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: O }}>
                  {selectedTask.reward_type === 'cash' ? `$${selectedTask.reward_xp}` : `${selectedTask.reward_xp} XP`}
                </span>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>📱 Codes Remaining</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: O }}>{selectedTask.codes || 0}</span>
              </div>
              {selectedTask.type === 'hot' && (
                <div style={{ background: '#F7F8FC', borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>🔥 Hot Offer Views</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: O }}>{selectedTask.hotCount || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}