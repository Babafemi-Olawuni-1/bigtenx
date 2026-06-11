import { useState } from 'react'
import { t, C } from '../dashboard/tokens'

export default function ContestPage({ user, darkMode, setDarkMode }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const contests = [
    {
      id: 1,
      title: '📋 Title',
      description: 'Top 1',
      criteria: 'Highest XP',
      reward: 'HP Laptop 8³',
      timeLeft: '30 days 04:02:10'
    },
    {
      id: 2,
      title: '📋 Title',
      description: 'Top 2',
      criteria: 'Highest Referee',
      reward: '4000 XP',
      timeLeft: '40 days 05:03:10'
    }
  ]

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Top Bar - FIXED: no extra space */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 16px', background: tk.bg,
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Contest</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: tk.iconShadow,
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

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {contests.map(contest => (
          <div key={contest.id} style={{
            margin: '0 16px 18px', background: tk.card, borderRadius: 18,
            padding: 20, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}`,
          }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: tk.text }}>{contest.title}</span>
            </div>
            <div style={{
              fontSize: 12, color: tk.text, fontWeight: 600, marginBottom: 16,
              background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc',
              padding: '8px 12px', borderRadius: 12,
            }}>{contest.description}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Criteria</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{contest.criteria}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward</span>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.orange, display: 'flex', alignItems: 'center', gap: 8 }}>
                {contest.reward}
                <span onClick={() => showToast(`Preview: ${contest.reward}`)} style={{ cursor: 'pointer' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke={C.orange} fill="none" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 8px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time left</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: tk.text, fontFamily: 'monospace' }}>{contest.timeLeft}</span>
            </div>
            
            <button
              onClick={() => showToast(`Leaderboard for ${contest.title}`)}
              style={{
                marginTop: 16, width: '100%', padding: 12, borderRadius: 14,
                background: C.orange, color: '#fff', fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 14px rgba(255,107,0,0.35)`, cursor: 'pointer', border: 'none',
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M3 3h18v2l-7 7v9l-4-2V12L3 5V3z"/>
              </svg>
              View Leaderboard
            </button>
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