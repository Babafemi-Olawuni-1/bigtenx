import { t, C } from './tokens'

const SERVICES = [
  { id: 'levels',      label: 'Levels',      screen: 'levels',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 5h12v8a6 6 0 0 1-12 0z"/></svg> },
  { id: 'referral',    label: 'Referral',    screen: 'refer',      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'contest',     label: 'Contest',     screen: 'contest',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="5"/><path d="M6 12h4M8 10v4"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg> },
  { id: 'stake',       label: 'Vault',       screen: 'vault',      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v5c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 15v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4"/><path d="M4 10v5"/><path d="M20 10v5"/></svg> },
  { id: 'exchange',    label: 'Exchange',    screen: 'exchange',   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/></svg> },
  { id: 'academy',     label: 'Academy',     screen: 'academy',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg> },
  { id: 'marketplace', label: 'Marketplace', screen: 'marketplace', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: 'more',        label: 'More',        screen: 'more',       icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg> },
]

export default function ServicesGrid({ darkMode, onServiceClick }) {
  const tk = t(darkMode)

  const handleClick = (service) => {
    // Map service labels to screen names for navigation
    const screenMap = {
      'Vault': 'vault',
      'Referral': 'refer',
      'Levels': 'levels',
      'Contest': 'contest',
      'Exchange': 'exchange',
      'Academy': 'academy',
      'Marketplace': 'marketplace',
      'More': 'more'
    }
    const screen = screenMap[service.label]
    onServiceClick(service.label, screen)
  }

  return (
    <div style={{ margin: '0 16px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: tk.text }}>Ecosystem</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, cursor: 'pointer', textShadow: darkMode ? `0 0 8px rgba(255,111,0,0.5)` : 'none' }}>See all</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
        {SERVICES.map(s => (
          <button 
            key={s.id} 
            onClick={() => handleClick(s)}
            style={{ 
              background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 16, 
              padding: '15px 6px 12px', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', gap: 8, cursor: 'pointer', 
              transition: 'transform 0.15s, box-shadow 0.15s', 
              boxShadow: darkMode ? `0 0 10px rgba(255,111,0,0.06)` : '0 2px 10px rgba(0,31,84,0.07)', 
              fontFamily: 'inherit' 
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.transform = 'translateY(-2px)'; 
              e.currentTarget.style.boxShadow = darkMode ? `0 0 26px rgba(255,111,0,0.3)` : '0 8px 22px rgba(0,31,84,0.13)' 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = darkMode ? `0 0 10px rgba(255,111,0,0.06)` : '0 2px 10px rgba(0,31,84,0.07)' 
            }}
          >
            <span style={{ color: C.orange, filter: darkMode ? `drop-shadow(0 0 6px rgba(255,111,0,0.6))` : 'none', display: 'flex' }}>
              {s.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: tk.textMuted, textAlign: 'center', lineHeight: 1.3 }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}