import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

const O = '#ff6f00'
const B = '#001F54'

function TrophyIcon({ color, size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M16 8H10C10 8 8 18 16 22V8Z" fill={color}/>
      <path d="M32 8H38C38 8 40 18 32 22V8Z" fill={color}/>
      <rect x="20" y="30" width="8" height="6" rx="1" fill={color}/>
      <rect x="16" y="36" width="16" height="3" rx="1.5" fill={color}/>
      <path d="M16 8H32C32 28 24 30 24 30C24 30 16 28 16 8Z" fill={color}/>
      <ellipse cx="24" cy="17" rx="6" ry="3.5" fill="white" opacity="0.25"/>
    </svg>
  )
}

const LEVELS = [
  {
    name: 'Bronze', price: '$1', tierColor: '#cd7f32', glow: 'rgba(205,127,50,0.3)',
    multiplier: '1x', xp: '80 XP base', commission: '10%', vip: null,
    features: ['80 XP daily (1x multiplier)', '10% referral commission', 'Bronze badge', 'Standard withdrawal'],
  },
  {
    name: 'Silver', price: '$5', tierColor: '#c0c0c0', glow: 'rgba(192,192,192,0.3)',
    multiplier: '1.2x', xp: '96 XP', commission: '20%', vip: null,
    features: ['96 XP daily (1.2x multiplier)', '20% referral commission', 'Silver badge', 'Priority withdrawal'],
  },
  {
    name: 'Gold', price: '$10', tierColor: '#ffd700', glow: 'rgba(255,215,0,0.35)',
    multiplier: '1.5x', xp: '120 XP', commission: '40%', vip: null,
    features: ['120 XP daily (1.5x multiplier)', '40% referral commission', 'Gold badge', 'Same-day withdrawal'],
  },
  {
    name: 'Diamond', price: '$20', tierColor: O, glow: `${O}55`,
    multiplier: '2x', xp: '180 XP', commission: '50%', vip: '1 month free VIP',
    features: ['180 XP daily (2x multiplier)', '50% referral commission', 'Diamond badge', 'Instant withdrawal', '1 month VIP free'],
  },
]

function LevelCard({ level }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div onClick={() => setFlipped(f => !f)}
      style={{ perspective: 800, cursor: 'pointer', minWidth: 195, flex: '1 1 195px', scrollSnapAlign: 'start', height: 300 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: `2px solid ${level.tierColor}45`, background: '#111827', boxShadow: `0 4px 24px ${level.glow}` }}>
          {level.vip && <div style={{ position: 'absolute', top: 10, right: 10, background: O, color: 'white', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 999 }}>VIP</div>}
          <TrophyIcon color={level.tierColor} size={52} />
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: 'white' }}>{level.name}</p>
          <p style={{ fontWeight: 800, fontSize: 26, color: level.tierColor, lineHeight: 1 }}>{level.price}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: `${level.tierColor}20`, color: level.tierColor, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>{level.multiplier} · {level.xp}</span>
            <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 10, padding: '3px 8px', borderRadius: 999 }}>{level.commission} commission</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, marginTop: 4 }}>
            <span>Tap for details</span>
            <ArrowRight size={10} color={O} />
          </div>
        </div>
        {/* Back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, background: `linear-gradient(135deg,${B},#0a3080)`, border: `2px solid ${level.tierColor}`, boxShadow: `0 0 28px ${level.glow}` }}>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>{level.name} Benefits</p>
          {level.features.map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${level.tierColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={9} color={level.tierColor} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{b}</span>
            </div>
          ))}
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  )
}

export default function Levels() {
  return (
    <section id="levels" style={{ padding: '72px 20px', background: '#0d1220' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', color: O, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: `${O}15`, padding: '5px 14px', borderRadius: 999, marginBottom: 10 }}>Reward Tiers</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.6rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Level up, <span style={{ color: O }}>earn more</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 10, fontSize: 13 }}>Tap a card to reveal full benefits</p>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 12 }}>
          {LEVELS.map((lvl, i) => (
            <div key={lvl.name} className="reveal" style={{ transitionDelay: `${i * 0.08}s`, minWidth: 195, flex: '1 1 195px' }}>
              <LevelCard level={lvl} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
