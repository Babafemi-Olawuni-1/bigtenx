import { useState } from 'react'
import { Moon, Sun, Bell, X, Check } from 'lucide-react'
import { t, C } from './tokens'
import { getFlagEmoji } from './countryFlags'
import { API } from '../auth/api'

export default function DashHeader({ user, darkMode, setDarkMode, onNotifUpdate }) {
  const tk = t(darkMode)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState(user.notifications || [])
  const unread = notifs.filter(n => !n.read).length

  const openNotifs = async () => {
    setShowNotifs(true)
    if (unread > 0 && user.id) {
      try {
        await fetch(`${API}/notifications/index.php?action=read&user_id=${user.id}`)
        setNotifs(prev => prev.map(n => ({ ...n, read: true })))
        if (onNotifUpdate) onNotifUpdate()
      } catch {}
    }
  }

  const flag = getFlagEmoji(user.country || 'Nigeria')

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 10px', background: tk.bg }}>
        {/* Avatar + greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${C.orange},#FF9A00)`, boxShadow: `0 4px 14px rgba(255,111,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="42" height="42" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="21" fill="rgba(255,255,255,0.18)" />
              <circle cx="21" cy="16" r="7" fill="rgba(255,255,255,0.85)" />
              <ellipse cx="21" cy="38" rx="13" ry="9" fill="rgba(255,255,255,0.85)" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: tk.textMuted, fontWeight: 500 }}>Welcome Back</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: tk.text, marginTop: 1 }}>Hi {user.username}</div>
          </div>
        </div>

        {/* Icons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ width: 34, height: 34, borderRadius: '50%', background: tk.iconBg, border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none', boxShadow: tk.iconShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
          </button>

          {/* Country flag */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: tk.iconBg, border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none', boxShadow: tk.iconShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            {flag}
          </div>

          {/* Bell */}
          <button onClick={openNotifs}
            style={{ width: 34, height: 34, borderRadius: '50%', background: tk.iconBg, border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none', boxShadow: tk.iconShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
            <Bell size={15} color={darkMode ? 'rgba(255,255,255,0.75)' : C.navy} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: C.orange, border: `2px solid ${tk.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications panel */}
      {showNotifs && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={() => setShowNotifs(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: darkMode ? '#111827' : '#fff', borderRadius: '24px 24px 0 0', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: darkMode ? '#374151' : '#e5e7eb', margin: '12px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 17, color: darkMode ? '#fff' : C.navy }}>Notifications</span>
              <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,31,84,0.5)' }}><X size={18} /></button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 16px 24px', flex: 1 }}>
              {notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,31,84,0.35)', fontSize: 13 }}>
                  No notifications yet
                </div>
              ) : notifs.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.06)'}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.read ? (darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6') : `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                    {n.type === 'streak' ? '🔥' : n.type === 'task' ? '✅' : n.type === 'referral' ? '👥' : '🔔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: darkMode ? (n.read ? 'rgba(255,255,255,0.5)' : '#fff') : (n.read ? 'rgba(0,31,84,0.5)' : C.navy), margin: '0 0 3px', fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                    <p style={{ fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,31,84,0.35)', margin: 0 }}>{new Date(n.time).toLocaleString()}</p>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
