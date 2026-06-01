import { Sun, Moon, LogOut, Shield } from 'lucide-react'
import { O, O2, getTheme } from './adminUtils'

export default function AdminHeader({ darkMode, setDarkMode, onLogout }) {
  const tk = getTheme(darkMode)
  return (
    <header style={{ background: darkMode ? 'rgba(8,14,29,0.95)' : '#fff', backdropFilter:'blur(20px)', borderBottom:`1px solid ${tk.border}`, padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, height:62 }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${O},${O2})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Shield size={18} color="#fff"/>
        </div>
        <div>
          <span style={{ fontWeight:900, fontSize:16, color:tk.text }}>BIG<span style={{ color:O }}>TENX</span></span>
          <span style={{ color:tk.muted, fontSize:11, marginLeft:8 }}>Admin</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <button onClick={() => setDarkMode(d => !d)} style={{ width:34, height:34, borderRadius:'50%', background:tk.card, border:`1px solid ${tk.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {darkMode ? <Sun size={15} color={O}/> : <Moon size={15} color="#001F54"/>}
        </button>
        <button onClick={onLogout} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'8px 14px', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          <LogOut size={13}/> Logout
        </button>
      </div>
    </header>
  )
}
