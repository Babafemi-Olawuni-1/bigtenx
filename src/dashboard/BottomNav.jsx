import { Home, ClipboardList, Wallet, Users, User } from 'lucide-react'
import { C, t } from './tokens'

export default function BottomNav({ activeTab, setActiveTab, darkMode }) {
  const tk = t(darkMode)

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'squad', label: 'Squad', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: 500,
      margin: '0 auto',
      background: tk.card,
      borderTop: `1px solid ${tk.cardBorder}`,
      padding: '10px 16px 20px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 100,
      borderRadius: '20px 20px 0 0',
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 12,
            transition: 'all 0.2s',
            color: activeTab === item.id ? C.orange : tk.textMuted,
          }}
        >
          <item.icon size={22} />
          <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}