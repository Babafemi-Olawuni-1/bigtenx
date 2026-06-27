// Tasks.jsx - PREMIUM FIN-TECH ADMIN UI
import { useState, useEffect, useCallback, useMemo } from 'react'
import { API, O } from './adminUtils'
import { 
  Plus, Edit, Trash2, Pause, Play, Copy, Calendar, Filter, X,
  Search, Users, CheckCircle, Clock, Tag, Layers, Eye, 
  TrendingUp, DollarSign, Zap, Activity, ChevronDown,
  AlertCircle, RefreshCw
} from 'lucide-react'

// ─── Premium Badge Component ──────────────────────────────────────────────────
function PremiumBadge({ children, color = O, bg = `${O}10`, border = `${O}20` }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      letterSpacing: '0.01em'
    }}>
      {children}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    active: { bg: '#10B98110', color: '#10B981', border: '#10B98120', label: 'Active', dot: '#10B981' },
    paused: { bg: '#F59E0B10', color: '#F59E0B', border: '#F59E0B20', label: 'Paused', dot: '#F59E0B' },
    completed: { bg: '#6366F110', color: '#6366F1', border: '#6366F120', label: 'Completed', dot: '#6366F1' }
  }
  const config = configs[status] || configs.active

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: config.dot,
        display: 'inline-block'
      }} />
      {config.label}
    </span>
  )
}

// ─── Analytics Card ──────────────────────────────────────────────────────────
function AnalyticsStat({ icon: Icon, label, value, color = O, sub }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #F1F4F9',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: `${color}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#5A6E8A' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#0A1E3C' }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: '#8899AA', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Tasks({ token, onNewTask, onEditTask }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
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

  const filteredTasks = useMemo(() => {
    let result = tasks

    // Apply filter
    if (filter === 'daily') result = result.filter(t => t.type === 'daily')
    else if (filter === 'hot') result = result.filter(t => t.type === 'hot')
    else if (filter === 'active') result = result.filter(t => t.active)
    else if (filter === 'paused') result = result.filter(t => !t.active)

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.title?.toLowerCase().includes(query) ||
        t.platform?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    return result
  }, [tasks, filter, searchQuery])

  const getTaskStatus = (task) => {
    if (!task.active) return 'paused'
    return 'active'
  }

  const getTypeColor = (type) => {
    return type === 'daily' ? '#10B981' : '#8B5CF6'
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        color: '#8899AA',
        fontSize: '14px',
        fontWeight: 500
      }}>
        <RefreshCw size={20} style={{ marginRight: 12, animation: 'spin 1s linear infinite' }} />
        Loading tasks...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#0A1E3C',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}>
              Task Management
            </h1>
            <p style={{ fontSize: '14px', color: '#5A6E8A', fontWeight: 400 }}>
              Manage tasks, track completion, and monitor performance
            </p>
          </div>
          <button
            onClick={() => onNewTask && onNewTask()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: O,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(255,111,0,0.25)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* ─── FILTER BAR ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '200px',
            maxWidth: '320px'
          }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8899AA'
            }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '12px',
                border: '1.5px solid #E9EDF2',
                fontSize: '13px',
                fontFamily: 'inherit',
                background: '#FFFFFF',
                color: '#0A1E3C',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = O}
              onBlur={e => e.target.style.borderColor = '#E9EDF2'}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'daily', label: 'Daily' },
              { id: 'hot', label: 'Hot Offers' },
              { id: 'active', label: 'Active' },
              { id: 'paused', label: 'Paused' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '1.5px solid',
                  borderColor: filter === f.id ? O : '#E9EDF2',
                  background: filter === f.id ? `${O}10` : '#fff',
                  color: filter === f.id ? O : '#5A6E8A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TASK LIST ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #E9EDF2',
            color: '#8899AA'
          }}>
            <Activity size={48} color="#CCDDEE" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#5A6E8A', marginBottom: 4 }}>
              No tasks found
            </p>
            <p style={{ fontSize: '13px' }}>Create your first task to get started</p>
          </div>
        )}

        {filteredTasks.map(task => {
          const status = getTaskStatus(task)
          const typeColor = getTypeColor(task.type)
          const completionRate = task.participants > 0 
            ? ((task.completed / task.participants) * 100).toFixed(1) 
            : 0

          return (
            <div 
              key={task.id} 
              onClick={() => showTaskAnalytics(task)}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '20px 24px',
                border: '1px solid #E9EDF2',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              {/* ─── CARD HEADER ─────────────────────────────────────────── */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '14px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '6px'
                  }}>
                    <h3 style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#0A1E3C',
                      margin: 0,
                      letterSpacing: '-0.01em'
                    }}>
                      {task.title}
                    </h3>
                    <PremiumBadge color={typeColor} bg={`${typeColor}10`} border={`${typeColor}20`}>
                      {task.type === 'daily' ? 'Daily' : 'Hot Offer'}
                    </PremiumBadge>
                    <StatusBadge status={status} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '13px',
                    color: '#5A6E8A'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={13} /> {task.platform}
                    </span>
                    {task.code_type === 'universal' && task.verify_code && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyCode(task.verify_code) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: O,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontFamily: 'inherit'
                        }}
                      >
                        <Copy size={12} /> {task.verify_code}
                      </button>
                    )}
                    {task.code_type === 'individual' && (
                      <span style={{ fontSize: '12px', color: '#5A6E8A' }}>
                        <Layers size={12} /> {task.individual_codes_count || 0} codes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── CARD METRICS ────────────────────────────────────────── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                padding: '16px 0',
                borderTop: '1px solid #F1F4F9',
                borderBottom: '1px solid #F1F4F9',
                marginBottom: '14px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#8899AA', fontWeight: 500 }}>Participants</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1E3C' }}>
                    {task.participants?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#8899AA', fontWeight: 500 }}>Completed</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1E3C' }}>
                    {task.completed?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#8899AA', fontWeight: 500 }}>Completion Rate</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1E3C' }}>
                    {completionRate}%
                  </div>
                </div>
                {task.type === 'hot' && task.remaining_slots !== null && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#8899AA', fontWeight: 500 }}>Remaining Slots</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0A1E3C' }}>
                      {task.remaining_slots}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: '#8899AA', fontWeight: 500 }}>Reward</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: O }}>
                    {task.reward_type === 'cash' ? `$${task.reward_xp}` : `${task.reward_xp} XP`}
                  </div>
                </div>
              </div>

              {/* ─── CARD FOOTER ─────────────────────────────────────────── */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ fontSize: '12px', color: '#8899AA' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Created {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditTask && onEditTask(task) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'none',
                      border: '1px solid #E9EDF2',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#5A6E8A',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FC' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'none',
                      border: '1px solid #E9EDF2',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: task.active ? '#F59E0B' : '#10B981',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FC' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    {task.active ? <Pause size={14} /> : <Play size={14} />}
                    {task.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'none',
                      border: '1px solid rgba(239,68,68,0.2)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── ANALYTICS DRAWER ────────────────────────────────────────────── */}
      {showAnalyticsModal && selectedTask && (
        <div
          onClick={() => setShowAnalyticsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E9EDF2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1E3C', margin: 0 }}>
                  {selectedTask.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#5A6E8A', marginTop: '2px' }}>
                  {selectedTask.platform} · {selectedTask.type === 'daily' ? 'Daily' : 'Hot Offer'}
                </p>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8899AA'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F8FC'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <AnalyticsStat 
                icon={Users} 
                label="Total Participants" 
                value={selectedTask.participants?.toLocaleString() || 0}
                color="#6366F1"
              />
              <AnalyticsStat 
                icon={CheckCircle} 
                label="Completed" 
                value={selectedTask.completed?.toLocaleString() || 0}
                color="#10B981"
              />
              <AnalyticsStat 
                icon={TrendingUp} 
                label="Completion Rate" 
                value={selectedTask.participants > 0 
                  ? `${((selectedTask.completed / selectedTask.participants) * 100).toFixed(1)}%` 
                  : '0%'}
                color="#8B5CF6"
              />
              <AnalyticsStat 
                icon={DollarSign} 
                label="Reward" 
                value={selectedTask.reward_type === 'cash' 
                  ? `$${selectedTask.reward_xp}` 
                  : `${selectedTask.reward_xp} XP`}
                color={O}
              />
              <AnalyticsStat 
                icon={Layers} 
                label="Codes Remaining" 
                value={selectedTask.code_type === 'individual'
                  ? selectedTask.individual_codes_count || 0
                  : selectedTask.verify_code ? 1 : 0}
                color="#14B8A6"
              />
              {selectedTask.type === 'hot' && (
                <AnalyticsStat 
                  icon={AlertCircle} 
                  label="Slots Remaining" 
                  value={selectedTask.remaining_slots ?? 0}
                  color="#F59E0B"
                />
              )}
              <AnalyticsStat 
                icon={Clock} 
                label="Created" 
                value={selectedTask.created_at 
                  ? new Date(selectedTask.created_at).toLocaleString() 
                  : '—'}
                color="#8899AA"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}