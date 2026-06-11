import { Sun, Moon, Bell } from 'lucide-react'
import { C, t } from './tokens'

export default function DashHeader({ user, darkMode, setDarkMode }) {
  const tk = t(darkMode)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 22px 12px', background: tk.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
          marginRight: 11, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.orange}, #FF9A00)`,
          boxShadow: `0 4px 14px rgba(255,111,0,.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="21" fill="rgba(255,255,255,.18)"/>
            <circle cx="21" cy="16" r="7" fill="rgba(255,255,255,.8)"/>
            <ellipse cx="21" cy="38" rx="13" ry="9" fill="rgba(255,255,255,.8)"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#8899AA', fontWeight: 500 }}>Welcome Back</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: tk.text, marginTop: 1 }}>Hi {user?.username || 'Trader'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: tk.card, boxShadow: tk.iconShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none',
          }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: tk.card, boxShadow: tk.iconShadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="14" viewBox="0 0 30 20">
            <rect width="10" height="20" fill="#008751"/>
            <rect x="10" width="10" height="20" fill="#fff"/>
            <rect x="20" width="10" height="20" fill="#008751"/>
          </svg>
        </div>
        <button
          onClick={() => alert('Notifications coming soon')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: tk.card, boxShadow: tk.iconShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none',
          }}
        >
          <Bell size={15} color={tk.textMuted} />
        </button>
      </div>
    </div>
  )
}