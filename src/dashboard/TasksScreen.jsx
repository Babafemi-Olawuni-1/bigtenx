import { useState, useEffect, useCallback } from 'react'
import {
  Sun, Moon, CheckCircle, Clock, X, ExternalLink,
  Eye, ThumbsUp, Heart, Star, Bell, Mail,
  Share2, Download, Upload, Lock, Unlock, Settings, User, Users,
  Calendar, MapPin, Camera, Image, Video, Music, Headphones,
  Phone, MessageCircle, Send, Gift, Award, Trophy, Bookmark,
  Flag, Tag, Search, Globe, Shield, Target, TrendingUp,
  Activity, Layers, Copy, Clipboard, Hash, AlertCircle, Zap,
  Play, Link, MousePointer, Filter, Edit3, BarChart2, ChevronRight
} from 'lucide-react'
import { t, C } from './tokens'
import { API } from '../auth/api'

// ── Icon map (matches AdminTaskForm) ─────────────────────────────────────────
const ICON_MAP = {
  ExternalLink, Eye, ThumbsUp, Heart, Star, Bell, Mail,
  Share2, Download, Upload, Lock, Unlock, Settings, User, Users,
  Calendar, Clock, MapPin, Camera, Image, Video, Music, Headphones,
  Phone, MessageCircle, Send, Gift, Award, Trophy, Bookmark,
  Flag, Tag, Search, Globe, Shield, Target, TrendingUp,
  Activity, Layers, Copy, Clipboard, Hash, AlertCircle, Zap,
  Play, Link, MousePointer, CheckCircle, Filter, Edit3, BarChart2,
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

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({ expiresAt, style: extraStyle = {} }) {
  const [display, setDisplay] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now()
      if (diff <= 0) { setExpired(true); setDisplay('Expired'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor(diff / 3600000) % 24
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setDisplay(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!expiresAt) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background: expired ? 'rgba(255,87,87,0.15)' : C.orange, color: expired ? '#FF5757' : '#000', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, border: expired ? '1px solid rgba(255,87,87,0.3)' : 'none', ...extraStyle }}>
      <Clock size={10} /> {display || '…'}
    </span>
  )
}

// ── Task Detail Modal ─────────────────────────────────────────────────────────
function TaskModal({ task, onClose, onSubmit, darkMode, dailyExpiry }) {
  const tk = t(darkMode)

  const isHotUniversal = task.type === 'hot' && task.code_type === 'universal' && task.verify_code
  const [code,    setCode]    = useState(isHotUniversal ? task.verify_code : '')
  const [error,   setError]   = useState('')    // inline — no toast on error
  const [loading, setLoading] = useState(false)

  // Default steps only used when admin created none
  const defaultSteps = [
    { id: 1, icon: 'ExternalLink', title: 'Open Task Link',  description: 'Click a step link below to open the task page', link: task.url },
    { id: 2, icon: 'CheckCircle',  title: 'Complete Action', description: 'Follow, like, or comment as required' },
    { id: 3, icon: 'Send',         title: 'Enter Code',      description: task.type === 'daily' ? 'Enter the code given to you by the admin' : 'Enter the verification code shown below' },
  ]
  const rawSteps = Array.isArray(task.steps) && task.steps.length > 0 ? task.steps : defaultSteps
  // Drop the "Open Task Link" default step when there is no URL
  const steps = task.url ? rawSteps : rawSteps.filter(s => s.title !== 'Open Task Link')

  // Reward display — $X.XX for cash, +X XP for xp
  const rewardLabel = task.reward_type === 'cash'
    ? `$${parseFloat(task.reward_xp).toFixed(2)}`
    : `+${task.reward_xp} XP`

  // Type badge — always from task.type, never hardcoded
  const isHot     = task.type === 'hot'
  const typeLabel = isHot ? '🔥 Hot Offer'  : '📋 Daily Task'
  const typeColor = isHot ? '#FF5757'        : '#34d399'
  const typeBg    = isHot ? 'rgba(255,87,87,0.12)' : 'rgba(52,211,153,0.12)'

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
        onSubmit(task.id, data)   // hand back to parent — parent closes modal
      } else {
        // Show error RIGHT HERE in the modal — do NOT close, do NOT toast
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

        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(128,128,128,0.3)', margin:'12px auto 0' }} />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 10px' }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:tk.text, margin:0, flex:1, paddingRight:12 }}>{task.title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(128,128,128,0.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color={tk.textMuted} />
          </button>
        </div>

        <div style={{ padding:'0 20px' }}>

          {/* Tags row */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            <span style={{ background:`${platformColor(task.platform)}18`, color:platformColor(task.platform), padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
              {task.platform || 'General'}
            </span>
            {/* Type badge — always accurate */}
            <span style={{ background:typeBg, color:typeColor, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
              {typeLabel}
            </span>
            {isHot  && task.expires_at && <Countdown expiresAt={task.expires_at} />}
            {!isHot && dailyExpiry     && <Countdown expiresAt={dailyExpiry} />}
            {isHot  && task.max_users  && (
              <span style={{ background:'rgba(99,102,241,0.12)', color:'#818cf8', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                {task.completions ?? 0}/{task.max_users} claimed
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p style={{ fontSize:13, color:tk.textMuted, lineHeight:1.6, margin:'0 0 16px' }}>{task.description}</p>
          )}

          {/* Steps — only the selected icon, NO orange box wrapper */}
          <h3 style={{ fontSize:13, fontWeight:700, color:tk.text, marginBottom:10 }}>How to Complete</h3>
          {steps.map((step, idx) => {
            const hasLink = !!(step.link || step.url)
            const Tag     = hasLink ? 'a' : 'div'
            const linkProps = hasLink
              ? { href: step.link || step.url, target:'_blank', rel:'noopener noreferrer', style:{ textDecoration:'none', display:'block' } }
              : { style:{ display:'block' } }
            return (
              <Tag key={step.id ?? idx} {...linkProps}>
                <div
                  style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 14px', marginBottom:8, borderRadius:13, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border:`1px solid ${tk.cardBorder}`, cursor: hasLink ? 'pointer' : 'default', transition:'border-color 0.15s', opacity: hasLink ? 1 : 0.88 }}
                  onMouseEnter={e => { if (hasLink) e.currentTarget.style.borderColor = `${C.orange}55` }}
                  onMouseLeave={e => { if (hasLink) e.currentTarget.style.borderColor = tk.cardBorder }}
                >
                  {/* Just the icon — no coloured box */}
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

          {/* Reward box */}
          <div style={{ background:`${C.orange}10`, borderRadius:14, padding:'12px 16px', marginTop:16, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:tk.textMuted }}>Your reward</span>
            <span style={{ fontSize:22, fontWeight:800, color:C.orange }}>{rewardLabel}</span>
          </div>

          {/* Pre-filled universal code (hot offer only) */}
          {isHotUniversal && (
            <div style={{ marginBottom:12, padding:'10px 14px', borderRadius:12, background:`${C.orange}08`, border:`1px dashed ${C.orange}40`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:tk.textMuted }}>Your code</span>
              <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:17, color:C.orange, letterSpacing:3 }}>{task.verify_code}</span>
            </div>
          )}

          {/* ── Inline error box — visible directly in modal, no "Verifying" ── */}
          {error && (
            <div style={{ marginBottom:12, padding:'10px 14px', borderRadius:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle size={15} color="#f87171" style={{ flexShrink:0 }} />
              <span style={{ fontSize:13, color:'#f87171', fontWeight:500 }}>{error}</span>
            </div>
          )}

          {/* Code input */}
          <label style={{ fontSize:13, fontWeight:600, color:tk.text, marginBottom:8, display:'block' }}>
            {!isHot ? 'Enter the code given to you by admin' : 'Verification Code'}
          </label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            placeholder={!isHot ? 'Enter code from admin' : 'Enter verification code'}
            style={{ width:'100%', borderRadius:12, padding:'13px', fontSize:15, background:tk.card, border:`1px solid ${error ? 'rgba(239,68,68,0.5)' : tk.cardBorder}`, color:tk.text, marginBottom:14, boxSizing:'border-box', fontFamily:'monospace', letterSpacing:2, outline:'none' }}
          />

          {/* Buttons */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:12, border:`1px solid ${tk.cardBorder}`, background:'transparent', color:tk.textMuted, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              style={{ flex:2, padding:'13px', borderRadius:12, border:'none', background:(!code.trim() || loading) ? `${C.orange}55` : C.orange, color:'#fff', fontWeight:700, cursor:(!code.trim() || loading) ? 'not-allowed' : 'pointer', fontFamily:'inherit', fontSize:13 }}
            >
              {loading ? 'Checking…' : 'Submit & Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, done, darkMode, onOpen, dailyExpiry }) {
  const tk        = t(darkMode)
  const isExpired = task.expires_at && new Date(task.expires_at) < new Date()
  const isFull    = task.max_users && (task.completions ?? 0) >= task.max_users
  const pColor    = platformColor(task.platform)
  const disabled  = done || isExpired || isFull

  return (
    <div
      onClick={() => !disabled && onOpen(task)}
      style={{ background:tk.card, border:`1px solid ${done ? 'rgba(34,197,94,0.3)' : disabled ? tk.cardBorder : `${C.orange}25`}`, borderRadius:18, padding:'14px 16px', marginBottom:10, cursor:disabled ? 'default' : 'pointer', opacity: isExpired || isFull ? 0.6 : 1, position:'relative', overflow:'hidden', transition:'border-color 0.2s' }}
    >
      {/* Left accent bar */}
      <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', borderRadius:'18px 0 0 18px', background: done ? '#22c55e' : disabled ? 'rgba(128,128,128,0.3)' : C.orange }} />

      <div style={{ display:'flex', gap:12, alignItems:'flex-start', paddingLeft:8 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:`${pColor}15`, border:`1px solid ${pColor}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Gift size={20} color={pColor} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:700, color:tk.text }}>{task.title}</span>
            {task.type === 'hot'   && task.expires_at && <Countdown expiresAt={task.expires_at} />}
            {task.type === 'daily' && dailyExpiry     && <Countdown expiresAt={dailyExpiry} />}
          </div>

          <div style={{ fontSize:11, color:tk.textMuted, marginBottom:10, lineHeight:1.4 }}>
            {task.description || 'Complete this task to earn rewards'}
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${tk.cardBorder}` }}>
            {/* Reward — correct format */}
            <span style={{ fontSize:12, fontWeight:700, color:C.orange }}>
              {task.reward_type === 'cash' ? `$${parseFloat(task.reward_xp).toFixed(2)}` : `+${task.reward_xp} XP`}
            </span>

            {task.max_users && !done && (
              <span style={{ fontSize:11, color:'#818cf8', fontWeight:600 }}>
                {task.completions ?? 0}/{task.max_users} claimed
              </span>
            )}

            {done
              ? <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#22c55e', fontWeight:600 }}><CheckCircle size={13} /> Done</span>
              : isExpired ? <span style={{ fontSize:11, color:'#FF5757', fontWeight:600 }}>Expired</span>
              : isFull    ? <span style={{ fontSize:11, color:'#f59e0b', fontWeight:600 }}>Full</span>
              : <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:C.orange, fontWeight:700 }}>View <ChevronRight size={13} /></span>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TasksScreen({ user, updateUser, darkMode, setDarkMode }) {
  const tk = t(darkMode)

  const [tab,          setTab]          = useState('daily')
  const [dailyTasks,   setDailyTasks]   = useState([])
  const [hotOffers,    setHotOffers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [dailyTimers,  setDailyTimers]  = useState({})
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bigtenx_completed_tasks') || '{}') }
    catch { return {} }
  })
  const [toast,        setToast]        = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
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

  // Restore daily timers from session
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('bigtenx_daily_timers') || '{}')
      setDailyTimers(saved)
    } catch {}
  }, [])

  // Start the 24h daily task timer
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
        sessionStorage.setItem('bigtenx_daily_timers', JSON.stringify(next))
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

  // ── Called by modal after successful verification ──────────────────────────
  const handleSuccess = (taskId, data) => {
    // Mark completed in session
    const next = { ...completedTasks, [taskId]: true }
    setCompletedTasks(next)
    sessionStorage.setItem('bigtenx_completed_tasks', JSON.stringify(next))

    // Update store balances
    const updates = {}
    if (data.reward_type === 'cash') {
      updates.usd_balance = data.new_usd_balance
      // Track cash earned today separately so BalanceCard can show both
      const prevCash = parseFloat(user?.today_earnings_cash ?? 0)
      updates.today_earnings_cash = parseFloat((prevCash + (data.amount_earned ?? 0)).toFixed(2))
    } else {
      updates.coins = data.new_coins
      if (data.today_earnings !== undefined) updates.today_earnings = data.today_earnings
    }
    updateUser(updates)

    // Toast — correct format: +$1.00 for cash, +50 XP for xp
    const earnedLabel = data.reward_type === 'cash'
      ? `+$${parseFloat(data.amount_earned ?? 0).toFixed(2)}`
      : `+${data.amount_earned ?? data.xp_earned ?? 0} XP`
    showToast(`${earnedLabel} earned! 🎉`)
    setSelectedTask(null)
  }

  // ── Split into pending / completed ─────────────────────────────────────────
  const currentTasks  = tab === 'daily' ? dailyTasks : hotOffers
  const pendingTasks  = currentTasks.filter(t => !completedTasks[t.id])
  const completedList = currentTasks.filter(t =>  completedTasks[t.id])

  const tabCounts = {
    daily: dailyTasks.filter(t => !completedTasks[t.id]).length,
    hot:   hotOffers.filter(t  => !completedTasks[t.id]).length,
  }

  if (loading) {
    return <div style={{ padding:40, textAlign:'center', color:tk.textMuted }}>Loading tasks…</div>
  }

  return (
    <div style={{ background:tk.bg, minHeight:'100%', paddingBottom:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 16px 10px' }}>
        <span style={{ fontSize:20, fontWeight:800, color:tk.text }}>Tasks</span>
        <button
          onClick={() => setDarkMode?.(!darkMode)}
          style={{ width:34, height:34, borderRadius:'50%', background:tk.card, border: darkMode ? '1px solid rgba(255,111,0,0.22)' : 'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ margin:'0 16px 16px', borderRadius:60, padding:4, display:'flex', background: darkMode ? '#081226' : '#fff' }}>
        {[
          { id:'daily', label:`Daily Tasks (${tabCounts.daily})` },
          { id:'hot',   label:`Hot Offers (${tabCounts.hot})` },
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

      {/* Task list */}
      <div style={{ padding:'0 16px' }}>

        {/* Empty state */}
        {pendingTasks.length === 0 && completedList.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:tk.textMuted }}>
            <div style={{ fontSize:14, fontWeight:600 }}>
              No {tab === 'daily' ? 'daily tasks' : 'hot offers'} available
            </div>
          </div>
        )}

        {pendingTasks.length === 0 && completedList.length > 0 && (
          <div style={{ textAlign:'center', padding:'20px 0 8px', color:tk.textMuted, fontSize:13 }}>
            All tasks completed for now!
          </div>
        )}

        {/* ── Pending tasks first ── */}
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

        {/* ── Completed section — always at the bottom ── */}
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
