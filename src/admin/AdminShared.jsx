import { useEffect } from 'react'
import { AlertCircle, Check, Home, CheckSquare, Users, DollarSign } from 'lucide-react'
import { O, DARK_CARD, getTheme } from './adminUtils'

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  const bg = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : O
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:bg, color:'#fff', padding:'11px 22px', borderRadius:50, fontSize:13, fontWeight:700, zIndex:9999, display:'flex', alignItems:'center', gap:8, boxShadow:`0 8px 32px ${bg}55`, whiteSpace:'nowrap', pointerEvents:'none' }}>
      {type === 'error' ? <AlertCircle size={15}/> : <Check size={15}/>}
      {msg}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ on, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{ width:46, height:26, borderRadius:13, background: on ? O : 'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', position:'relative', flexShrink:0 }}>
      <span style={{ position:'absolute', width:20, height:20, borderRadius:'50%', background:'#fff', top:3, left: on ? 23 : 3, transition:'left .2s' }}/>
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = O, bg }) {
  return <span style={{ background: bg || `${color}18`, color, borderRadius:50, padding:'3px 11px', fontSize:11, fontWeight:700 }}>{children}</span>
}

// ── Field label wrapper ───────────────────────────────────────────────────────
export function Field({ label, hint, darkMode, children }) {
  return (
    <div>
      <label style={{ display:'block', color: darkMode ? 'rgba(255,255,255,0.5)' : '#8899AA', fontSize:11, fontWeight:700, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:5 }}>{hint}</p>}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, color = O }) {
  return (
    <div style={{ background:'linear-gradient(135deg,#131b2e 0%,#0d1526 100%)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, padding:'20px 22px', display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:16, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={22} color={color}/>
      </div>
      <div>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
        <p style={{ color:'#fff', fontWeight:800, fontSize:24, margin:0, lineHeight:1 }}>
          {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
        </p>
      </div>
    </div>
  )
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
export function AdminBottomNav({ tab, setTab }) {
  const items = [
    { id:'overview', label:'Overview', icon:Home },
    { id:'tasks',    label:'Tasks',    icon:CheckSquare },
    { id:'users',    label:'Users',    icon:Users },
    { id:'revenue',  label:'Revenue',  icon:DollarSign },
  ]
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:DARK_CARD, borderTop:'1px solid rgba(255,111,0,0.1)', padding:'10px 16px 20px', display:'flex', justifyContent:'space-around', zIndex:100, borderRadius:'20px 20px 0 0' }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setTab(item.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:'8px 16px', borderRadius:12, color: tab === item.id ? O : 'rgba(255,255,255,0.35)', fontFamily:'inherit' }}>
          <item.icon size={22}/>
          <span style={{ fontSize:11, fontWeight:600 }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
