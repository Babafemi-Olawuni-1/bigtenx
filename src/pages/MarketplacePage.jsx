import { useState } from 'react'
import { t, C } from '../dashboard/tokens'

export default function MarketplacePage({ user, darkMode, setDarkMode }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const items = [
    { id: 1, title: 'Title', description: 'Description of the item', xp: 800, stock: 0, maxStock: 10, price: 30 },
    { id: 2, title: 'Title', description: 'Description of the item', xp: 800, stock: 0, maxStock: 10, price: 30 }
  ]

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 20px 16px', background: tk.bg,
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Marketplace</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: tk.shadowSm,
            }}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Scroll Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        <div style={{ margin: '0 16px 20px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: tk.text, marginBottom: 4 }}>Available (2)</h2>
          <p style={{ fontSize: 13, color: tk.textMuted }}>Limited time offers</p>
        </div>

        {items.map(item => (
          <div key={item.id} style={{
            margin: '0 16px 18px', background: tk.card, borderRadius: 18,
            padding: 16, boxShadow: tk.shadowSm, border: `1px solid ${tk.cardBorder}`,
            display: 'flex', gap: 16,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: `linear-gradient(135deg, #1e3a5f, #0f2040)`,
              border: `1px solid rgba(255,107,0,0.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: tk.text }}>{item.title}</span>
                <span onClick={() => showToast(`Preview: ${item.title}`)} style={{ cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </span>
              </div>
              <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 12, lineHeight: 1.4 }}>{item.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 800, color: C.orange }}>
                  <svg width="14" height="14" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={C.orange}/></svg>
                  +{item.xp} XP
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: tk.textMuted }}>{item.stock}/{item.maxStock} bought</span>
              </div>
              <button
                onClick={() => showToast(`Buy Now: $${item.price}`)}
                style={{
                  width: '100%', padding: 10, borderRadius: 12,
                  background: C.orange, color: '#fff', fontWeight: 800, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer', border: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Buy now ${item.price}
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: C.orange, color: '#fff', padding: '10px 22px', borderRadius: 50,
          fontSize: 13, fontWeight: 700, zIndex: 999,
        }}>{toast}</div>
      )}
    </div>
  )
}