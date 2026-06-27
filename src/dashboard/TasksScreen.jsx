import { useState, useEffect, useCallback } from 'react'
import {
  Sun, Moon, CheckCircle, Clock, X, ExternalLink,
  Eye, ThumbsUp, Heart, Star, Bell, Mail,
  Share2, Download, Upload, Lock, Unlock, Settings, User, Users,
  Calendar, MapPin, Camera, Image, Video, Music, Headphones,
  Phone, MessageCircle, Send, Gift, Award, Trophy, Bookmark,
  Flag, Tag, Search, Globe, Shield, Target, TrendingUp,
  Activity, Layers, Copy, Clipboard, Hash, AlertCircle, Zap,
  Play, Link, MousePointer, Filter, Edit3, BarChart2, ChevronRight, UsersRound
} from 'lucide-react'
import { t, C } from './tokens'
import { API } from '../auth/api'
import GlobalTimer from '../components/GlobalTimer'

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  ExternalLink, Eye, ThumbsUp, Heart, Star, Bell, Mail,
  Share2, Download, Upload, Lock, Unlock, Settings, User, Users,
  Calendar, Clock, MapPin, Camera, Image, Video, Music, Headphones,
  Phone, MessageCircle, Send, Gift, Award, Trophy, Bookmark,
  Flag, Tag, Search, Globe, Shield, Target, TrendingUp,
  Activity, Layers, Copy, Clipboard, Hash, AlertCircle, Zap,
  Play, Link, MousePointer, CheckCircle, Filter, Edit3, BarChart2, UsersRound,
}
function StepIcon({ name, size = 18, color = '#fff' }) {
  const Icon = ICON_MAP[name] || ExternalLink
  return <Icon size={size} color={color} />
}

const PLATFORM_COLOR = {
  facebook: '#1877f2', tiktok: '#010101', instagram: '#e1306c',
  youtube: '#ff0000', 'twitter/x': '#000000', telegram: '#229ed9',
  whatsapp: '#25d366', other: C.orange,
}
function platformColor(p = '') { return PLATFORM_COLOR[p.toLowerCase()] || C.orange }

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 3000); return () => clearTimeout(id) }, [onDone])
  const bg = type === 'error' ? '#ef4444' : C.orange
  return (
    <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)', background:bg, color:'#fff', padding:'10px 22px', borderRadius:30, fontSize:13, fontWeight:700, zIndex:600, boxShadow:`0 4px 20px ${bg}55`, whiteSpace:'nowrap', pointerEvents:'none' }}>
      {msg}
    </div>
  )
}

// ── Countdown Timer (plain text, no background) ───────────────────────────────
function Countdown({ expiresAt }) {
  const [display, setDisplay] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now()
      if (diff <= 0) { setExpired(true); setDisplay('Expired'); return }
      const totalHours = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const hStr = String(totalHours).padStart(2, '0')
      const mStr = String(m).padStart(2, '0')
      const sStr = String(s).padStart(2, '0')
      setDisplay(`${hStr}:${mStr}:${sStr}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!expiresAt) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: expired ? '#ef4444' : '#94a3b8', fontWeight: 500 }}>
      <Clock size={11} />
      {display || '…'}
    </span>
  )
}

// ── Task Detail Modal ─────────────────────────────────────────────────────────
function TaskModal({ task, onClose, onSubmit, darkMode, dailyExpiry }) {
  const tk = t(darkMode)

  const isHot = task.type === 'hot'
  const isExpired = isHot && task.expires_at && new Date(task.expires_at) < new Date()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const defaultSteps = [
    { id: 1, icon: 'ExternalLink', title: 'Open Task Link', description: 'Click a step link below to open the task page', link: task.url },
    { id: 2, icon: 'CheckCircle', title: 'Complete Action', description: 'Follow, like, or comment as required' },
    { id: 3, icon: 'Send', title: 'Enter Code', description: 'Enter the verification code provided by the admin' },
  ]
  const rawSteps = Array.isArray(task.steps) && task.steps.length > 0 ? task.steps : defaultSteps
  const steps = task.url ? rawSteps : rawSteps.filter(s => s.title !== 'Open Task Link')

  const rewardLabel = task.reward_type === 'cash'
    ? `$${parseFloat(task.reward_xp).toFixed(2)}`
    : `+${task.reward_xp} XP`

  const typeLabel = isHot ? '🔥 Hot Offer' : '📋 Daily Task'
  const typeColor = isHot ? '#FF5757' : '#34d399'
  const typeBg = isHot ? 'rgba(255,87,87,0.12)' : 'rgba(52,211,153,0.12)'

  const handleSubmit = async () => {
    if (!code.trim()) { setError('Please enter a verification code'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/tasks/verify_code.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: task._userId, code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.success) {
        onSubmit(task.id, data)
      } else {
        setError(data.message || 'Invalid code. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.85)', backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:tk.card, borderRadius:'24px 24px 0 0', maxWidth:500, width:'100%', maxHeight:'92vh', overflowY:'auto', paddingBottom:32 }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(128,128,128,0.3)', margin:'12px auto 0' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 10px' }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:tk.text, margin:0, flex:1, paddingRight:12 }}>{task.title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(128,128,128,0.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color={tk.textMuted} />
          </button>
        </div>
        <div style={{ padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            <span style={{ background:`${platformColor(task.platform)}18`, color:platformColor(task.platform), padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
              {task.platform || 'General'}
            </span>
            <span style={{ background:typeBg, color:typeColor, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
              {typeLabel}
            </span>
            {isHot && task.expires_at && <Countdown expiresAt={task.expires_at} />}
            {!isHot && dailyExpiry && <Countdown expiresAt={dailyExpiry} />}
          </div>
          
          {task.description && (
            <p style={{ fontSize:13, color:tk.textMuted, lineHeight:1.6, margin:'0 0 16px' }}>{task.description}</p>
          )}
          
          <h3 style={{ fontSize:13, fontWeight:700, color:tk.text, marginBottom:10 }}>How to Complete</h3>
          {steps.map((step, idx) => {
            const hasLink = !!(step.link || step.url)
            const Tag = hasLink ? 'a' : 'div'
            const linkProps = hasLink
              ? { href: step.link || step.url, target:'_blank', rel:'noopener noreferrer', style:{ textDecoration:'none', display:'block' } }
              : { style:{ display:'block' } }
            return (
              <Tag key={step.id ?? idx} {...linkProps}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 14px', marginBottom:8, borderRadius:13, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border:`1px solid ${tk.cardBorder}`, cursor: hasLink ? 'pointer' : 'default', transition:'border-color 0.15s' }}
                  onMouseEnter={e => { if (hasLink) e.currentTarget.style.borderColor = `${C.orange}55` }}
                  onMouseLeave={e => { if (hasLink) e.currentTarget.style.borderColor = tk.cardBorder }}
                >
                  <div style={{ width:24, paddingTop:1, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <StepIcon name={step.icon || 'ExternalLink'} size={17} color={C.orange} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:tk.text, display:'flex', alignItems:'center', gap:5 }}>
                      {step.title || `Step ${idx + 1}`}
                      {hasLink && <ExternalLink size={11} color={C.orange} />}
                    </div>
                    {(step.description || step.hint) && (
                      <div style={{ fontSize:11, color:tk.textMuted, marginTop:2, lineHeight:1.5 }}>
                        {step.description || step.hint}
                      </div>
                    )}
                  </div>
                </div>
              </Tag>
            )
          })}
          
          <div style={{ background:`${C.orange}10`, borderRadius:14, padding:'12px 16px', marginTop:16, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:tk.textMuted }}>Your reward</span>
            <span style={{ fontSize:22, fontWeight:800, color:C.orange }}>{rewardLabel}</span>
          </div>
          
          {error && (
            <div style={{ marginBottom:12, padding:'10px 14px', borderRadius:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle size={15} color="#f87171" style={{ flexShrink:0 }} />
              <span style={{ fontSize:13, color:'#f87171', fontWeight:500 }}>{error}</span>
            </div>
          )}
          
          <label style={{ fontSize:13, fontWeight:600, color:tk.text, marginBottom:8, display:'block' }}>
            Verification Code
          </label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            placeholder="Enter the code provided by the admin"
            style={{ width:'100%', borderRadius:12, padding:'13px', fontSize:15, background:tk.card, border:`1px solid ${error ? 'rgba(239,68,68,0.5)' : tk.cardBorder}`, color:tk.text, marginBottom:14, boxSizing:'border-box', fontFamily:'monospace', letterSpacing:2, outline:'none' }}
          />
          
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:12, border:`1px solid ${tk.cardBorder}`, background:'transparent', color:tk.textMuted, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim() || isExpired}
              style={{ flex:2, padding:'13px', borderRadius:12, border:'none', background:(!code.trim() || loading || isExpired) ? `${C.orange}55` : C.orange, color:'#fff', fontWeight:700, cursor:(!code.trim() || loading || isExpired) ? 'not-allowed' : 'pointer', fontFamily:'inherit', fontSize:13 }}
            >
              {isExpired ? 'Expired' : loading ? 'Checking…' : 'Submit & Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, done, darkMode, onOpen, dailyExpiry }) {
  const tk = t(darkMode)
  const isExpired = task.expires_at && new Date(task.expires_at) < new Date()
  const isFull = task.max_users && (task.completions ?? 0) >= task.max_users
  const pColor = platformColor(task.platform)
  const disabled = done || isExpired || isFull

  const getCenterDisplay = () => {
    if (task.type === 'hot' && task.expires_at && !isExpired) {
      return <Countdown expiresAt={task.expires_at} />
    }
    if (task.type === 'hot' && task.max_users) {
      const claimed = task.completions ?? 0
      const total = task.max_users
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#818cf8', fontWeight: 500 }}>
          <UsersRound size={11} />
          {claimed}/{total} claimed
        </span>
      )
    }
    if (task.type === 'daily' && dailyExpiry && !done) {
      return <Countdown expiresAt={dailyExpiry} />
    }
    return null
  }

  return (
    <div
      onClick={() => !disabled && onOpen(task)}
      style={{ background:tk.card, border:`1px solid ${done ? 'rgba(34,197,94,0.3)' : disabled ? tk.cardBorder : `${C.orange}25`}`, borderRadius:18, padding:'14px 16px', marginBottom:10, cursor:disabled ? 'default' : 'pointer', opacity: isExpired || isFull ? 0.6 : 1, position:'relative', overflow:'hidden', transition:'border-color 0.2s' }}
    >
      <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', borderRadius:'18px 0 0 18px', background: done ? '#22c55e' : disabled ? 'rgba(128,128,128,0.3)' : C.orange }} />
      <div style={{ display:'flex', gap:12, alignItems:'flex-start', paddingLeft:8 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:`${pColor}15`, border:`1px solid ${pColor}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Gift size={20} color={pColor} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:700, color:tk.text }}>{task.title}</span>
          </div>

          <div style={{ fontSize:11, color:tk.textMuted, marginBottom:10, lineHeight:1.4 }}>
            {task.description || 'Complete this task to earn rewards'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${tk.cardBorder}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>
              {task.reward_type === 'cash' ? `$${parseFloat(task.reward_xp).toFixed(2)}` : `+${task.reward_xp} XP`}
            </span>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {getCenterDisplay()}
            </div>

            <div style={{ minWidth: 70, textAlign: 'right' }}>
              {!done && !isExpired && !isFull && (
                <span style={{ fontSize: 11, fontWeight: 400, fontStyle: 'italic', fontFamily: "'Segoe Script', 'Brush Script MT', 'Pacifico', 'Comic Sans MS', cursive", color: C.orange, opacity: 0.85 }}>
                  Pending
                </span>
              )}
              {done && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22c55e', fontWeight: 600, justifyContent: 'flex-end' }}>
                  <CheckCircle size={13} /> Completed
                </span>
              )}
              {isExpired && !done && (
                <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Expired</span>
              )}
              {isFull && !done && (
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Full</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TasksScreen({ user, updateUser, darkMode, setDarkMode }) {
  const tk = t(darkMode)

  const [tab, setTab] = useState('daily')
  const [dailyTasks, setDailyTasks] = useState([])
  const [hotOffers, setHotOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dailyTimers, setDailyTimers] = useState({})
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bigtenx_completed_tasks') || '{}') }
    catch { return {} }
  })
  const [toast, setToast] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/tasks/list.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setDailyTasks(d.tasks || []) })
      .catch(() => showToast('Failed to load tasks', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API}/tasks/hot_offers.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setHotOffers(d.tasks || []) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user?.id) return;
    
    fetch(`${API}/tasks/user_completions.php?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.completed_tasks) {
          const completedMap = {};
          data.completed_tasks.forEach(taskId => {
            completedMap[taskId] = true;
          });
          setCompletedTasks(completedMap);
          localStorage.setItem('bigtenx_completed_tasks', JSON.stringify(completedMap));
        }
      })
      .catch(err => console.error('Failed to load completed tasks:', err));
  }, [user?.id]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bigtenx_daily_timers') || '{}')
      setDailyTimers(saved)
    } catch {}
  }, [])

  const startDailyTask = async (taskId) => {
    if (!user?.id) return null
    try {
      const res = await fetch(`${API}/tasks/start_daily.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, task_id: taskId }),
      })
      const d = await res.json()
      if (d.success) {
        const next = { ...dailyTimers, [taskId]: d.expires_at }
        setDailyTimers(next)
        localStorage.setItem('bigtenx_daily_timers', JSON.stringify(next))
        return d.expires_at
      }
    } catch {}
    return null
  }

  const handleOpen = useCallback(async (task) => {
    const withUser = { ...task, _userId: user?.id }
    if (task.type === 'daily' && !dailyTimers[task.id]) {
      const expiry = await startDailyTask(task.id)
      setSelectedTask({ ...withUser, _dailyExpiry: expiry })
    } else {
      setSelectedTask(withUser)
    }
  }, [dailyTimers, user?.id])

  const handleSuccess = (taskId, data) => {
    const next = { ...completedTasks, [taskId]: true }
    setCompletedTasks(next)
    localStorage.setItem('bigtenx_completed_tasks', JSON.stringify(next))

    const updates = {}
    if (data.reward_type === 'cash') {
      updates.usd_balance = data.new_usd_balance
    } else {
      updates.coins = data.new_coins
      if (data.today_earnings !== undefined) updates.today_earnings = data.today_earnings
    }
    updateUser(updates)

    const earnedLabel = data.reward_type === 'cash'
      ? `+$${parseFloat(data.amount_earned ?? 0).toFixed(2)}`
      : `+${data.amount_earned ?? data.xp_earned ?? 0} XP`
    showToast(`${earnedLabel} earned! 🎉`)
    setSelectedTask(null)
  }

  const currentTasks = tab === 'daily' ? dailyTasks : hotOffers
  const pendingTasks = currentTasks.filter(t => !completedTasks[t.id])
  const completedList = currentTasks.filter(t => completedTasks[t.id])

  const tabCounts = {
    daily: dailyTasks.filter(t => !completedTasks[t.id]).length,
    hot: hotOffers.filter(t => !completedTasks[t.id]).length,
  }

  if (loading) {
    return <div style={{ padding:40, textAlign:'center', color:tk.textMuted }}>Loading tasks…</div>
  }

  return (
    <div style={{ background:tk.bg, minHeight:'100%', paddingBottom:20 }}>
      {/* Header with Global Timer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 16px 10px' }}>
        <span style={{ fontSize:20, fontWeight:800, color:tk.text }}>Tasks</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GlobalTimer darkMode={darkMode} />
          <button
            onClick={() => setDarkMode?.(!darkMode)}
            style={{ width:34, height:34, borderRadius:'50%', background:tk.card, border: darkMode ? '1px solid rgba(255,111,0,0.22)' : 'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
          >
            {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
          </button>
        </div>
      </div>

      <div style={{ margin:'0 16px 16px', borderRadius:60, padding:4, display:'flex', background: darkMode ? '#081226' : '#fff' }}>
        {[
          { id:'daily', label:`Daily Tasks (${tabCounts.daily})` },
          { id:'hot', label:`Hot Offers (${tabCounts.hot})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ flex:1, textAlign:'center', padding:'10px 0', fontSize:13, fontWeight:700, borderRadius:60, cursor:'pointer', border:'none', background: tab === id ? C.orange : 'transparent', color: tab === id ? '#fff' : darkMode ? '#556677' : '#8899AA' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>
        {pendingTasks.length === 0 && completedList.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:tk.textMuted }}>
            <div style={{ fontSize:14, fontWeight:600 }}>
              No {tab === 'daily' ? 'daily tasks' : 'hot offers'} available
            </div>
          </div>
        )}

        {pendingTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            done={false}
            darkMode={darkMode}
            onOpen={handleOpen}
            dailyExpiry={dailyTimers[task.id] || null}
          />
        ))}

        {completedList.length > 0 && (
          <>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:tk.textMuted, padding:'14px 2px 8px', borderTop: pendingTasks.length > 0 ? `1px solid ${tk.cardBorder}` : 'none', marginTop: pendingTasks.length > 0 ? 6 : 0 }}>
              Completed ({completedList.length})
            </div>
            {completedList.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                done={true}
                darkMode={darkMode}
                onOpen={handleOpen}
                dailyExpiry={dailyTimers[task.id] || null}
              />
            ))}
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleSuccess}
          darkMode={darkMode}
          dailyExpiry={selectedTask._dailyExpiry || dailyTimers[selectedTask.id] || null}
        />
      )}
    </div>
  )
}