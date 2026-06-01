import { useEffect, useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'

const O = '#ff6f00'

const REVIEWS = [
  { name: 'Amara O.', handle: '@amara_earns', avatar: 'AO', avatarBg: O, stars: 5, text: 'I was skeptical at first, but I withdrew my first $5 within a week. The daily tasks are simple and the referral system is genuinely passive income.' },
  { name: 'Chidi N.', handle: '@chidi_ng', avatar: 'CN', avatarBg: '#001F54', stars: 5, text: 'Reached Gold tier in 3 weeks. The level system keeps you motivated. Diamond VIP is the goal — the $20/day reward is real.' },
  { name: 'Fatima B.', handle: '@fatima_b', avatar: 'FB', avatarBg: '#0a3080', stars: 5, text: 'Invited 12 friends and now I earn passively every day from their activity. BIGTENX is the most transparent earning platform I have used.' },
  { name: 'Emeka T.', handle: '@emeka_t', avatar: 'ET', avatarBg: '#7c3aed', stars: 5, text: 'The staking feature is a game changer. I stake my points and watch them grow while I sleep. Withdrew $15 last week alone.' },
  { name: 'Ngozi A.', handle: '@ngozi_a', avatar: 'NA', avatarBg: '#0891b2', stars: 5, text: 'Diamond tier is worth every penny. 50% referral commission means my friends basically pay my subscription. Brilliant system.' },
]

export default function Testimonials() {
  const trackRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const total = REVIEWS.length

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % total)
    }, 3000)
    return () => clearInterval(interval)
  }, [total])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cardWidth = track.scrollWidth / total
    track.scrollTo({ left: current * cardWidth, behavior: 'smooth' })
  }, [current, total])

  return (
    <section id="reviews" style={{ padding: '72px 20px', background: '#0a0f1e', overflow: 'hidden' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', color: O, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: `${O}15`, padding: '5px 14px', borderRadius: 999, marginBottom: 10 }}>Social Proof</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.6rem)', color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Real people, <span style={{ color: O }}>real earnings</span>
          </h2>
        </div>

        {/* Auto-sliding track */}
        <div ref={trackRef} style={{ display: 'flex', gap: 16, overflowX: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          {REVIEWS.map((r, i) => (
            <div key={r.name}
              style={{ minWidth: 'min(300px, 85vw)', flex: '0 0 min(300px, 85vw)', scrollSnapAlign: 'start', background: '#111827', borderRadius: 18, padding: 22, border: `2px solid ${i === current ? O + '50' : 'rgba(255,255,255,0.06)'}`, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.4s', boxShadow: i === current ? `0 8px 32px ${O}20` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 13 }}>{r.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{r.handle}</p>
                  </div>
                </div>
                <Quote size={18} color={O} style={{ opacity: 0.3, flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={12} color={O} fill={O} />)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65, flex: 1 }}>"{r.text}"</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {REVIEWS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? O : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}
