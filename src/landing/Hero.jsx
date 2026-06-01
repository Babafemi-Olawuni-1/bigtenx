import { ArrowRight, Star } from 'lucide-react'
import { useTyping, useRipple, useConfetti } from './hooks'

const O = '#ff6f00'
const B = '#001F54'

function MeshBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div className="mesh-orb" style={{ width: 500, height: 500, background: `${O}14`, top: -100, left: -100, animationDuration: '10s' }} />
      <div className="mesh-orb" style={{ width: 400, height: 400, background: `${B}18`, bottom: -80, right: -80, animationDuration: '13s', animationDelay: '2s' }} />
      <div className="mesh-orb" style={{ width: 280, height: 280, background: `${O}10`, top: '40%', right: '8%', animationDuration: '8s', animationDelay: '1s' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
        <defs><pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#heroGrid)" />
      </svg>
      {[
        { size: 40, top: '22%', left: '7%', delay: '0s', dur: '6s' },
        { size: 28, top: '62%', left: '5%', delay: '0.8s', dur: '8s' },
        { size: 48, top: '16%', right: '7%', delay: '0.4s', dur: '7s' },
        { size: 32, top: '72%', right: '6%', delay: '1.5s', dur: '5s' },
        { size: 22, top: '42%', left: '11%', delay: '1.2s', dur: '9s' },
      ].map((c, i) => (
        <div key={i} className="animate-float" style={{ position: 'absolute', top: c.top, left: c.left, right: c.right, opacity: 0.18, animationDuration: c.dur, animationDelay: c.delay }}>
          <svg width={c.size} height={c.size} viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke={O} strokeWidth="2.5" />
            <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={O} fontWeight="bold">XP</text>
          </svg>
        </div>
      ))}
    </div>
  )
}

export default function Hero({ onGetStarted }) {
  const typed = useTyping(['Daily Tasks', 'Referrals', 'Network Growth', 'Level Rewards'], 65, 1800)
  const ripple = useRipple()
  const confetti = useConfetti()

  const handleStart = (e) => {
    ripple(e)
    confetti()
    setTimeout(onGetStarted, 500)
  }

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 60px', textAlign: 'center', overflow: 'hidden' }}>
      <MeshBg />

      {/* Badge */}
      <div className="fade-up" style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: `1px solid ${O}35`, borderRadius: 999, padding: '7px 14px', marginBottom: 28 }}>
        <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
          <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: O, opacity: 0.7 }} />
          <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: O, display: 'block' }} />
        </span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em' }}>
          ✨ Our Economy is Live — <span style={{ color: O }}>Join & Start Earning</span>
        </span>
      </div>

      {/* Headline */}
      <h1 className="fade-up delay-100" style={{ position: 'relative', zIndex: 1, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2.2rem, 7vw, 4.2rem)', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 14, maxWidth: 680 }}>
        <span style={{ color: 'white', display: 'block' }}>Contribute, Earn,</span>
        <span className="shimmer-text" style={{ display: 'block' }}>Build, Influence</span>
      </h1>

      {/* Typing */}
      <p className="fade-up delay-200" style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 10, minHeight: 26 }}>
        Earn through <span style={{ color: O, fontWeight: 600 }}>{typed}<span className="cursor" style={{ color: O }}>|</span></span>
      </p>
      <p className="fade-up delay-300" style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 400, marginBottom: 36 }}>
        Complete tasks, invite friends, and convert your points to real cash. No investment. No risk. Just your time.
      </p>

      {/* CTA */}
      <div className="fade-up delay-400" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, marginBottom: 40 }}>
        <button onClick={handleStart} className="ripple-container"
          style={{ width: '100%', background: O, color: 'white', border: 'none', borderRadius: 14, padding: '15px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 8px 28px ${O}45`, transition: 'all 0.2s', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${O}55` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 28px ${O}45` }}>
          Get Started Today
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Social proof */}
      <div className="fade-up delay-500" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={13} color={O} fill={O} />)}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, margin: 0 }}>4.9/5 rating</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Trusted by 50,000+ members</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.35 }}>
        <div style={{ width: 18, height: 28, borderRadius: 9, border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
          <div className="animate-bounce" style={{ width: 3, height: 7, borderRadius: 2, background: O }} />
        </div>
      </div>
    </section>
  )
}
