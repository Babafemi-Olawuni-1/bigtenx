import { useCounter } from './hooks'

const O = '#ff6f00'

const STATS = [
  { value: 50000,   suffix: '+', label: 'Active Members' },
  { value: 1200000, suffix: '+', label: 'Points Distributed' },
  { value: 98,      suffix: '%', label: 'Payout Success' },
  { value: 4,       suffix: '',  label: 'Reward Levels', prefix: '' },
]

function StatItem({ value, suffix, label, prefix = '' }) {
  const [count, ref] = useCounter(value)
  const pct = Math.min((count / value) * 100, 100)
  const display = value >= 1000000
    ? `${(count / 1000000).toFixed(1)}M`
    : value >= 1000
    ? `${Math.floor(count / 1000)}K`
    : count

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 140, scrollSnapAlign: 'start', flexShrink: 0 }}>
      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: O, fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1 }}>
        {prefix}{display}{suffix}
      </p>
      <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: O, borderRadius: 2, width: `${pct}%`, transition: 'width 0.1s' }} />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>{label}</p>
    </div>
  )
}

export default function Stats() {
  return (
    <section id="stats" style={{ position: 'relative', padding: '64px 24px', background: '#001F54', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
        <svg width="100%" height="100%"><defs><pattern id="statsGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" /></pattern></defs><rect width="100%" height="100%" fill="url(#statsGrid)" /></svg>
      </div>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 200, background: `${O}10`, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', display: 'flex', gap: 48, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', justifyContent: 'center', paddingBottom: 8 }}>
        {STATS.map(s => <StatItem key={s.label} {...s} />)}
      </div>
    </section>
  )
}
