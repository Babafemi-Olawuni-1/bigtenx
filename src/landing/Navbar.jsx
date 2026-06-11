import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRipple } from './hooks'

const O = '#ff6f00'
const B = '#001F54'

export default function Navbar({ onLaunch }) {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const ripple = useRipple()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how' },
    { label: 'Levels', href: '#levels' },
    { label: 'Reviews', href: '#reviews' },
  ]

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: scrolled ? '10px 20px' : '16px 20px',
    background: 'rgba(10,15,30,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    transition: 'padding 0.3s ease',
    boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
  }

  return (
    <>
      <nav style={navStyle}>
        {/* Logo with text - BIG(white)TENX(orange) - FIXED spacing */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', margin: 0, padding: 0 }}>
          <img 
            src="/logo.png" 
            alt="BIGTENX" 
            style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 10, margin: 0, padding: 0 }}
            onError={e => { e.target.style.display = 'none' }} 
          />
          <span style={{ 
            fontFamily: "'Space Grotesk',sans-serif", 
            fontWeight: 800, 
            fontSize: 22, 
            letterSpacing: '-0.5px',
            padding: 0
          }}>
            <span style={{ color: 'white' }}>BIG</span>
            <span style={{ color: '#ff6f00' }}>TENX</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden-mobile">
          {links.map(l => (
            <a key={l.label} href={l.href}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = O}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Desktop launch button */}
          <button onClick={(e) => { ripple(e); setTimeout(onLaunch, 250) }}
            className="ripple-container hidden-mobile"
            style={{ background: O, color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 14px ${O}40` }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e06200'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'translateY(0)' }}>
            Launch App
          </button>

          {/* Hamburger - mobile only */}
          <button onClick={() => setDrawerOpen(true)} className="show-mobile"
            style={{ width: 38, height: 38, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ width: 18, height: 2, background: 'white', borderRadius: 2, display: 'block' }} />
            <span style={{ width: 13, height: 2, background: 'white', borderRadius: 2, display: 'block', alignSelf: 'flex-start', marginLeft: 2 }} />
            <span style={{ width: 18, height: 2, background: 'white', borderRadius: 2, display: 'block' }} />
          </button>
        </div>
      </nav>

      {/* Bottom sheet drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={() => setDrawerOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div className="slide-up" style={{ position: 'relative', background: '#111827', borderRadius: '24px 24px 0 0', padding: '16px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#374151', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              {/* Drawer logo - FIXED spacing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img 
                  src="/logo.png" 
                  alt="BIGTENX" 
                  style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, margin: 0, padding: 0 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18 }}>
                  <span style={{ color: 'white' }}>BIG</span>
                  <span style={{ color: '#ff6f00' }}>TENX</span>
                </span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#1f2937', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="white" />
              </button>
            </div>
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setDrawerOpen(false)}
                style={{ display: 'block', padding: '13px 14px', borderRadius: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 15, textDecoration: 'none', marginBottom: 2 }}>
                {l.label}
              </a>
            ))}
            <button onClick={() => { setDrawerOpen(false); onLaunch() }}
              style={{ width: '100%', background: O, color: 'white', border: 'none', borderRadius: 14, padding: '15px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 12, boxShadow: `0 4px 20px ${O}50` }}>
              Launch App
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </>
  )
}