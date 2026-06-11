import { useState, useEffect } from 'react'
import { C, t } from './tokens'

const SLIDES = [
  { title: 'Invite friends and earn', highlight: 'more rewards!', sub: 'Earn points together', action: 'referral' },
  { title: 'Complete daily tasks and', highlight: 'grow your balance!', sub: 'New tasks every 24 hours', action: 'tasks' },
  { title: 'Stake your coins and', highlight: 'earn passive income!', sub: 'Minimum 100 coins to stake', action: 'vault' },
]

export default function PromoCarousel({ darkMode, onAction }) {
  const [active, setActive] = useState(0)
  const tk = t(darkMode)

  useEffect(() => {
    const interval = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 4000)
    return () => clearInterval(interval)
  }, [])

  const slide = SLIDES[active]

  const handleCardClick = () => {
    if (onAction && slide.action) {
      onAction(slide.action)
    }
  }

  return (
    <div style={{ margin: '0 16px 10px' }}>
      <div 
        onClick={handleCardClick}
        style={{ 
          borderRadius: 22, 
          background: darkMode 
            ? 'linear-gradient(135deg, #081226 0%, #0D1F42 55%, #081226 100%)' 
            : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 65%, ${C.navy} 100%)`, 
          padding: '22px 16px 22px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          position: 'relative', 
          overflow: 'hidden', 
          minHeight: 124, 
          cursor: 'pointer',
          border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none', 
          boxShadow: darkMode 
            ? `0 0 34px rgba(255,111,0,0.12)` 
            : '0 8px 28px rgba(0,31,84,0.18)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -28, right: 88, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,111,0,0.1)', pointerEvents: 'none' }} />
        {darkMode && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(255,111,0,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />}

        {/* Text Content */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.38, marginBottom: 4 }}>
            {slide.title}<br /><span style={{ color: C.orange }}>{slide.highlight}</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', marginBottom: 0 }}>{slide.sub}</div>
        </div>

        {/* Gift Icon */}
        <div style={{ 
          zIndex: 1, 
          marginLeft: 8, 
          flexShrink: 0, 
          filter: darkMode ? `drop-shadow(0 0 20px rgba(255,140,0,0.6))` : 'none', 
          color: 'rgba(255,255,255,0.88)' 
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5" rx="2"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
      </div>

      {/* Navigation Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
        {SLIDES.map((_, i) => (
          <div 
            key={i} 
            onClick={() => setActive(i)} 
            style={{ 
              height: 7, 
              borderRadius: 4, 
              background: i === active ? C.orange : (darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,31,84,0.15)'), 
              width: i === active ? 20 : 7, 
              transition: 'all 0.2s', 
              cursor: 'pointer',
              boxShadow: i === active && darkMode ? `0 0 8px rgba(255,111,0,0.6)` : 'none'
            }} 
          />
        ))}
      </div>
    </div>
  )
}