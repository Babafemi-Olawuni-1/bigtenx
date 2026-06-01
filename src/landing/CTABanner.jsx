import { ArrowRight, Zap, Users, Gift } from 'lucide-react'
import { useRipple, useConfetti } from './hooks'

const O = '#ff6f00'
const B = '#001F54'

export default function CTABanner({ onGetStarted }) {
  const ripple = useRipple()
  const confetti = useConfetti()

  const handleClick = (e) => {
    ripple(e)
    confetti()
    setTimeout(onGetStarted, 600)
  }

  return (
    <section style={{ padding: '64px 20px' }} className="reveal">
      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', background: B, borderRadius: 28, padding: '56px 40px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, borderRadius: '50%', background: `${O}10`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: `${O}06`, filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
          <svg width="100%" height="100%"><defs><pattern id="ctaGrid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#ctaGrid)" /></svg>
        </div>
        <div className="animate-float" style={{ position: 'absolute', top: 24, left: 28, opacity: 0.2, animationDuration: '6s' }}><Gift size={28} color={O} /></div>
        <div className="animate-float" style={{ position: 'absolute', bottom: 28, right: 32, opacity: 0.2, animationDuration: '8s', animationDelay: '1s' }}><Users size={24} color="#ff9a3c" /></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="glow-pulse" style={{ width: 64, height: 64, borderRadius: 18, background: O, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 8px 32px ${O}60` }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: 'white', fontSize: 'clamp(1.6rem,4vw,2.4rem)', marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Join 50,000+ active members
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 24px' }}>
            Contribute and earn rewards for cash inside BIGTENX.
          </p>

          {/* Perks row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            {['100 Free Points', 'Daily Tasks', 'Get Paid'].map(p => (
              <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: O, display: 'inline-block' }} />
                {p}
              </span>
            ))}
          </div>

          <button onClick={handleClick} className="ripple-container"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: O, color: 'white', border: 'none', borderRadius: 16, padding: '16px 36px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 32px ${O}50`, transition: 'all 0.2s', overflow: 'hidden', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e06200'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'translateY(0)' }}>
            Create Account to Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
