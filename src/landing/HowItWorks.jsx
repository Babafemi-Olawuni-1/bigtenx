import { Gift, CheckCircle2, Lock } from 'lucide-react'

const O = '#ff6f00'

const STEPS = [
  { step: '01', icon: Gift,         title: 'Create Your Account',       desc: 'Join BIGTENX in under 60 seconds, receive 100 welcome points instantly, and activate your account to unlock the full economy.' },
  { step: '02', icon: CheckCircle2, title: 'Complete Daily Missions',    desc: 'Earn points daily by completing tasks, participating in campaigns, and growing your network through consistent activity.' },
  { step: '03', icon: Lock,         title: 'Stake & Unlock Rewards',     desc: 'Stake your earned points inside the Vault to unlock withdrawals, reward multipliers, and real cash earnings.' },
]

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: '72px 20px', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', color: O, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: `${O}15`, padding: '5px 14px', borderRadius: 999, marginBottom: 10 }}>Simple Process</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.6rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Up and earning in <span style={{ color: O }}>3 steps</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, position: 'relative' }}>
          {STEPS.map(({ step, icon: Icon, title, desc }, i) => (
            <div key={step} className="reveal" style={{ transitionDelay: `${i * 0.12}s`, position: 'relative' }}>
              <div style={{ background: '#111827', borderRadius: 18, padding: 26, border: '2px solid rgba(255,255,255,0.06)', textAlign: 'center', transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${O}50`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${O}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: O, color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 999, boxShadow: `0 4px 12px ${O}50` }}>{step}</div>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${O}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px auto 18px' }}>
                  <Icon size={24} color={O} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
