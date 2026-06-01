import { ArrowLeft, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const O = '#ff6f00'

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Sora', sans-serif", color: 'white' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap'); ul,ol{padding-left:20px;margin:8px 0} li{margin-bottom:6px}`}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="BIGTENX" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 7 }} onError={e => e.target.style.display = 'none'} />
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800}}>BIG<span style={{color:O}}>TENX</span></span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = O}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
          <ArrowLeft size={14} /> Back to home
        </Link>
      </nav>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #001F54 0%, #0a3080 100%)', padding: '48px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: `${O}10`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'white', margin: '0 0 8px', position: 'relative' }}>{title}</h1>
        {subtitle && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0, position: 'relative' }}>{subtitle}</p>}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>© 2025 BIGTENX. All rights reserved.</p>
      </div>
    </div>
  )
}
