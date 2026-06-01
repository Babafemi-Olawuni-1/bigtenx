import { useState, useEffect } from 'react'
import { Gift, ExternalLink, Sun, Moon, CheckCircle, Clock, X } from 'lucide-react'
import { t, C } from './tokens'
import { API } from '../auth/api'

const PLATFORM_COLOR = {
  facebook: '#1877f2', tiktok: '#010101', instagram: '#e1306c',
  youtube: '#ff0000', 'twitter/x': '#000000', telegram: '#229ed9',
  whatsapp: '#25d366', other: C.orange,
}
function platformColor(p = '') { return PLATFORM_COLOR[p.toLowerCase()] || C.orange }

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800)
    return () => clearTimeout(id)
  }, [onDone])

  const bg = type === 'error' ? '#ef4444' : C.orange
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 20px',
      borderRadius: 30, fontSize: 13, fontWeight: 700, zIndex: 500,
      boxShadow: `0 4px 20px ${bg}55`, whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer({ expiresAt }) {
  const [label, setLabel]   = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now()
      if (diff <= 0) { setExpired(true); setLabel('Expired'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000)  / 60000)
      const s = Math.floor((diff % 60000)    / 1000)
      if (d > 0)      setLabel(`${d}d ${h}h left`)
      else if (h > 0) setLabel(`${h}h ${m}m ${s}s left`)
      else            setLabel(`${m}m ${s}s left`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!expiresAt) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: expired ? 'rgba(255,87,87,0.15)' : C.orange,
      color: expired ? '#FF5757' : '#000',
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      border: expired ? '1px solid rgba(255,87,87,0.3)' : 'none',
    }}>
      <Clock size={11} />
      {label || '…'}
    </span>
  )
}

// ── Task Detail Modal ─────────────────────────────────────────────────────────
function TaskDetailModal({ task, onClose, onSubmit, submitting, darkMode }) {
  const tk = t(darkMode)

  // For HOT offers with a universal code, pre-fill it.
  // For DAILY tasks, always leave blank — the admin gives the code to the user.
  const isHotUniversal = task.type === 'hot' && task.code_type === 'universal' && task.verify_code
  const [code, setCode] = useState(isHotUniversal ? task.verify_code : '')

  const steps = Array.isArray(task.steps) && task.steps.length > 0
    ? task.steps
    : [
        { title: 'Open Task Link',  description: 'Click the button below to open the task page' },
        { title: 'Complete Action', description: 'Like, follow, or comment as instructed' },
        { title: 'Enter Code',      description: 'Enter the verification code provided by the admin' },
      ]

  const rewardLabel = task.reward_type === 'cash'
    ? `$${task.reward_xp}`
    : `+${task.reward_xp} XP`

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: tk.card, borderRadius: 24,
          maxWidth: 500, width: '92%',
          padding: 24, maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: tk.text, margin: 0, flex: 1, paddingRight: 12 }}>
            {task.title}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(128,128,128,0.15)', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color={tk.textMuted} />
          </button>
        </div>

        {/* Platform + Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            background: `${platformColor(task.platform)}18`,
            color: platformColor(task.platform),
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            {task.platform || 'General'}
          </span>
          {/* Type badge */}
          <span style={{
            background: task.type === 'hot' ? 'rgba(255,87,87,0.12)' : 'rgba(52,211,153,0.12)',
            color: task.type === 'hot' ? '#FF5757' : '#34d399',
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>
            {task.type === 'hot' ? '🔥 Hot Offer' : '📋 Daily Task'}
          </span>
          {task.expires_at && <CountdownTimer expiresAt={task.expires_at} />}
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 6 }}>Description</h3>
            <p style={{ fontSize: 13, color: tk.textMuted, lineHeight: 1.6, margin: 0 }}>{task.description}</p>
          </div>
        )}

        {/* Steps */}
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 10 }}>How to Complete</h3>
          {steps.map((step, idx) => (
            <div key={step.id ?? idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '11px 14px', marginBottom: 8, borderRadius: 12,
              background: tk.cardBg || (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
              border: `1px solid ${tk.cardBorder}`,
            }}>
              {step.icon ? (
                <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{step.icon}</span>
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: C.orange,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                }}>
                  {idx + 1}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>
                  {step.title || `Step ${idx + 1}`}
                </div>
                {(step.description || step.hint) && (
                  <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 2 }}>
                    {step.description || step.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reward */}
        <div style={{
          background: `${C.orange}10`, borderRadius: 16, padding: '14px 18px', marginBottom: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: tk.textMuted }}>Reward</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.orange }}>{rewardLabel}</span>
        </div>

        {/* Open Link */}
        {task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 30,
              background: `${C.orange}10`, border: `1px solid ${C.orange}30`,
              color: C.orange, textDecoration: 'none',
              fontSize: 13, fontWeight: 600, marginBottom: 18,
            }}
          >
            <ExternalLink size={16} /> Open Task Link
          </a>
        )}

        {/*
          ── Verification code display rules ──────────────────────────────────
          HOT OFFER + universal code → show the code so user can copy/use it
          DAILY TASK                 → NEVER show the code; admin gives it to user
          HOT OFFER + individual     → user types in the code they received
        */}
        {isHotUniversal && (
          <div style={{
            marginBottom: 14, padding: '10px 14px', borderRadius: 12,
            background: `${C.orange}08`, border: `1px dashed ${C.orange}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: tk.textMuted }}>Verification code</span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: 16,
              color: C.orange, letterSpacing: 3,
            }}>
              {task.verify_code}
            </span>
          </div>
        )}

        {/* Code input */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: tk.text, marginBottom: 8, display: 'block' }}>
            {task.type === 'daily'
              ? 'Enter the code given to you by the admin'
              : 'Verification Code'}
          </label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder={task.type === 'daily' ? 'Enter code from admin' : 'Enter verification code'}
            style={{
              width: '100%', borderRadius: 12, padding: '12px',
              fontSize: 14, background: tk.card,
              border: `1px solid ${tk.cardBorder}`,
              color: tk.text, marginBottom: 16, boxSizing: 'border-box',
              fontFamily: 'monospace', letterSpacing: 1,
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: `1px solid ${tk.cardBorder}`,
              background: 'transparent', color: tk.textMuted, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Cancel
            </button>
            <button
              onClick={() => onSubmit(task.id, code)}
              disabled={submitting || !code.trim()}
              style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: 'none', background: C.orange,
                color: '#fff', fontWeight: 700, fontFamily: 'inherit',
                cursor: (submitting || !code.trim()) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !code.trim()) ? 0.6 : 1,
              }}
            >
              {submitting ? 'Verifying…' : 'Submit & Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TasksScreen({ user, updateUser, darkMode, setDarkMode }) {
  const tk = t(darkMode)
  const [tab, setTab]               = useState('daily')
  const [dailyTasks, setDailyTasks] = useState([])
  const [hotOffers,  setHotOffers]  = useState([])
  const [loading,    setLoading]    = useState(true)

  // Use sessionStorage so completed tasks reset when the browser is closed
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('bigtenx_completed_tasks') || '{}')
    } catch { return {} }
  })

  const [toast,        setToast]        = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // Load daily tasks
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/tasks/list.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setDailyTasks(d.tasks || []) })
      .catch(() => showToast('Failed to load tasks', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // Load hot offers
  useEffect(() => {
    fetch(`${API}/tasks/hot_offers.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setHotOffers(d.tasks || []) })
      .catch(err => console.error('Hot offers error:', err))
  }, [])

  const submitCode = async (taskId, code) => {
    if (!code.trim()) { showToast('Please enter a code', 'error'); return }
    if (!user?.id)    { showToast('Not logged in', 'error'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`${API}/tasks/verify_code.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, code: code.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (data.success) {
        // Mark task as completed in sessionStorage
        const next = { ...completedTasks, [taskId]: true }
        setCompletedTasks(next)
        sessionStorage.setItem('bigtenx_completed_tasks', JSON.stringify(next))

        // Update user balances in store — use server-returned values (authoritative)
        const updates = {}
        if (data.reward_type === 'cash') {
          updates.usd_balance = data.new_usd_balance
        } else {
          updates.coins = data.new_coins
        }
        // today_earnings comes from the server (handles day-rollover correctly)
        if (data.today_earnings !== undefined) {
          updates.today_earnings = data.today_earnings
        }
        updateUser(updates)

        const earned = data.amount_earned ?? data.xp_earned ?? 0
        showToast(
          data.reward_type === 'cash'
            ? `+$${earned} Cash earned! 🎉`
            : `+${earned} XP earned! 🎉`
        )
        setSelectedTask(null)
      } else {
        showToast(data.message || 'Verification failed', 'error')
      }
    } catch {
      showToast('Network error. Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const cardStyle = {
    borderRadius: 18, padding: 14, marginBottom: 10,
    display: 'flex', gap: 12,
    background: tk.card, border: `1px solid ${tk.cardBorder}`,
    cursor: 'pointer', transition: 'opacity 0.2s',
  }
  const iconBoxStyle = {
    width: 48, height: 48, borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: tk.textMuted }}>
        Loading tasks…
      </div>
    )
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 8px', background: tk.bg,
      }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: tk.text }}>Tasks</span>
        <button
          onClick={() => setDarkMode?.(!darkMode)}
          style={{
            width: 34, height: 34, borderRadius: '50%', background: tk.card,
            border: darkMode ? '1px solid rgba(255,111,0,0.22)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color='#001F54' />}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{
        margin: '8px 16px 0', borderRadius: 60, padding: 4,
        display: 'flex', background: darkMode ? '#081226' : '#fff',
      }}>
        {[
          { id: 'daily', label: `Daily Tasks (${dailyTasks.length})` },
          { id: 'hot',   label: `Hot Offers (${hotOffers.length})`   },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, textAlign: 'center', padding: '10px 0',
              fontSize: 13, fontWeight: 700, borderRadius: 60, cursor: 'pointer',
              border: 'none',
              background: tab === id ? C.orange : 'transparent',
              color: tab === id ? '#fff' : darkMode ? '#556677' : '#8899AA',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task lists */}
      <div style={{ padding: '16px' }}>

        {/* ── Daily Tasks ── */}
        {tab === 'daily' && dailyTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: tk.textMuted }}>
            No daily tasks available
          </div>
        )}
        {tab === 'daily' && dailyTasks.map(task => {
          const done   = !!completedTasks[task.id]
          const pColor = platformColor(task.platform)
          return (
            <div
              key={task.id}
              style={{ ...cardStyle, opacity: done ? 0.7 : 1 }}
              onClick={() => !done && setSelectedTask(task)}
            >
              <div style={{ ...iconBoxStyle, background: `${pColor}18` }}>
                <Gift size={22} color={pColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: tk.text }}>{task.title}</div>
                <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 4 }}>
                  {task.description || 'Complete this task to earn rewards'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>
                  {task.reward_type === 'cash' ? `$${task.reward_xp}` : `+${task.reward_xp} XP`}
                </div>
                {!done && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginTop: 6 }}>
                    View Task →
                  </div>
                )}
                {done && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <CheckCircle size={14} color="#4caf50" />
                    <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 600 }}>Completed</span>
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{
                  fontSize: 9, padding: '3px 8px', borderRadius: 20,
                  background: done ? '#e8f5e9' : (darkMode ? 'rgba(255,255,255,0.06)' : '#f0f2f5'),
                  color: done ? '#4caf50' : '#99AABB', fontWeight: 700,
                }}>
                  {done ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>
          )
        })}

        {/* ── Hot Offers ── */}
        {tab === 'hot' && hotOffers.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: tk.textMuted }}>
            No hot offers available
          </div>
        )}
        {tab === 'hot' && hotOffers.map(task => {
          const done      = !!completedTasks[task.id]
          const pColor    = platformColor(task.platform)
          const isExpired = task.expires_at && new Date(task.expires_at) < new Date()
          return (
            <div
              key={task.id}
              style={{ ...cardStyle, opacity: (isExpired || done) ? 0.65 : 1 }}
              onClick={() => !done && !isExpired && setSelectedTask(task)}
            >
              <div style={{ ...iconBoxStyle, background: `${pColor}18` }}>
                <Gift size={22} color={pColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: tk.text }}>{task.title}</span>
                  {task.expires_at && <CountdownTimer expiresAt={task.expires_at} />}
                </div>
                <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 4 }}>
                  {task.description || 'Complete this offer to earn rewards'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>
                  {task.reward_type === 'cash' ? `$${task.reward_xp}` : `+${task.reward_xp} XP`}
                </div>
                {!done && !isExpired && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginTop: 6 }}>
                    View Offer →
                  </div>
                )}
                {isExpired && !done && (
                  <div style={{ fontSize: 11, color: '#FF5757', marginTop: 6, fontWeight: 600 }}>Expired</div>
                )}
                {done && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <CheckCircle size={14} color="#4caf50" />
                    <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 600 }}>Completed</span>
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{
                  fontSize: 9, padding: '3px 8px', borderRadius: 20,
                  background: done ? '#e8f5e9' : (darkMode ? 'rgba(255,255,255,0.06)' : '#f0f2f5'),
                  color: done ? '#4caf50' : '#99AABB', fontWeight: 700,
                }}>
                  {done ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={submitCode}
          submitting={submitting}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
