import { useState } from 'react'
import { Gift, CheckCircle2, Lock, Users, TrendingUp, Shield, ChevronDown } from 'lucide-react'
import { useTilt } from './hooks'

const O = '#ff6f00'

const FEATURES = [
  { icon: Gift,        title: '100 Points on Signup',    short: 'Receive 100 welcome points instantly when you join BIGTENX. Activate your account to unlock earning access.',                                                  long: 'Your 100 welcome points are credited the moment you register. Activate your account by upgrading to any level to start earning daily.' },
  { icon: CheckCircle2,title: 'Daily Task Rewards',       short: 'Complete daily tasks, maintain streaks, and grow your point balance through consistent participation.',                                                        long: 'Tasks refresh every 24 hours. The longer your streak, the higher your multiplier — up to 2x your base reward at Diamond level.' },
  { icon: Lock,        title: 'Stake Points',             short: 'Stake your earned points inside the Vault to unlock cash rewards.',                                                                                             long: 'Accumulate at least 1,000 XP, stake them in the Vault, and convert to real cash. Minimum withdrawal is $3.' },
  { icon: Users,       title: 'Network Commissions',      short: 'Build your network and earn commissions whenever your referrals purchase levels inside the ecosystem.',                                                         long: 'Earn 10%–50% commission on every level purchase your referrals make — for life. The more active your network, the more passive income you generate.' },
  { icon: TrendingUp,  title: 'Rank Up & Earn More',      short: 'Unlock higher levels, bigger rewards, and exclusive opportunities as you grow.',                                                                               long: 'Each level unlocks higher XP multipliers, bigger referral commissions, and exclusive VIP perks. Diamond members earn 2x base XP daily.' },
  { icon: Shield,      title: 'Secure & Transparent',     short: 'Track your earnings and withdrawals in real time with a secure and transparent system built for trust.',                                                        long: 'All transactions are logged and verifiable. Your balance is protected with industry-standard encryption and two-factor authentication.' },
]

function Card({ icon: Icon, title, short, long }) {
  const [open, setOpen] = useState(false)
  const tilt = useTilt(7)

  return (
    <div {...tilt} onClick={() => setOpen(o => !o)}
      style={{ background: '#111827', borderRadius: 18, padding: 22, border: `2px solid ${open ? O : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.25s', boxShadow: open ? `0 8px 32px ${O}25` : '0 2px 12px rgba(0,0,0,0.2)', willChange: 'transform' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: open ? O : `${O}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, transition: 'all 0.25s', transform: open ? 'scale(1.08)' : 'scale(1)' }}>
        <Icon size={20} color={open ? 'white' : O} />
      </div>
      <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 7 }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{short}</p>
      <div style={{ overflow: 'hidden', maxHeight: open ? 100 : 0, transition: 'max-height 0.35s ease', marginTop: open ? 10 : 0 }}>
        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.65 }}>{long}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, color: O, fontSize: 11, fontWeight: 600 }}>
        <span>{open ? 'Show less' : 'Learn more'}</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" style={{ padding: '72px 20px', background: '#0a0f1e' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', color: O, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: `${O}15`, padding: '5px 14px', borderRadius: 999, marginBottom: 10 }}>Why BIGTENX</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.6rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Everything you need to<br /><span style={{ color: O }}>earn consistently</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 10, fontSize: 14 }}>Tap any card to learn more</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
              <Card {...f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
