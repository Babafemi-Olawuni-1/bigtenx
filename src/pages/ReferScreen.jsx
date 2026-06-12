import { useState } from 'react'
import { Sun, Moon, Copy, Share2, Trophy, X, ArrowLeft } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

const TIERS = [
  { letter: 'B', name: 'Bronze', percent: '20%', price: '$1', color: '#FF6B00' },
  { letter: 'S', name: 'Silver', percent: '30%', price: '$5', color: '#7A8AAD' },
  { letter: 'G', name: 'Gold', percent: '40%', price: '$10', color: '#E5A100' },
  { letter: 'D', name: 'Diamond', percent: '50%', price: '$50', color: '#FF6B00' },
  { letter: 'V', name: 'VIP', percent: '$1', price: '$100', color: '#7C3AED' },
]

function LeaderboardModal({ onClose, darkMode }) {
  const tk = t(darkMode)
  const [leaderboard] = useState([
    { name: 'Femtech', earnings: 850000, avatar: 'F', color: '#E5A100' },
    { name: 'Ayo', earnings: 475600, avatar: 'A', color: '#059669' },
    { name: 'Sayi', earnings: 30000, avatar: 'S', color: '#7C3AED' },
    { name: 'Kunle', earnings: 18200, avatar: 'K', color: '#DC2626' },
    { name: 'BigBoss', earnings: 12500, avatar: 'B', color: '#0891B2' },
  ])
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: tk.card, borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 500, maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: tk.cardBorder, margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${tk.cardBorder}` }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: tk.text }}>🏆 Leaderboard</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.orange }}><svg viewBox="0 0 24 24" width="14" height="14" stroke={C.orange} fill="none" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>This Week</div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,31,84,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} stroke={tk.textMuted} /></button>
          </div>
        </div>
        <div style={{ margin: '14px 16px 10px', background: darkMode ? '#1a2333' : '#FFF5EC', border: `1.5px solid rgba(255,107,0,.25)`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: C.orange, fontFamily: 'monospace', minWidth: 32 }}>#407</span>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #FF8C00)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>M</div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: tk.text }}>mrmillionx <span style={{ fontSize: 11, color: tk.textMuted, fontWeight: 500 }}>(You)</span></span>
          <span style={{ fontSize: 14, fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>$4,000</span>
        </div>
        <div style={{ padding: '4px 16px 32px', overflowY: 'auto' }}>
          {leaderboard.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 6, background: darkMode ? 'rgba(255,255,255,0.03)' : '#fafbfd', border: `1px solid ${tk.cardBorder}` }}>
              <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>{idx < 3 ? <span style={{ fontSize: 14 }}>{medals[idx]}</span> : <span style={{ fontSize: 12, fontWeight: 900, color: tk.textMuted }}>#{idx + 1}</span>}</div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>{item.avatar}</div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: tk.text }}>{item.name}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>${item.earnings.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ReferScreen({ user, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const showToastMsg = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const referralLink = `https://bigtenx.com/register?ref=${user?.username || 'USER'}`
  const copyLink = () => { navigator.clipboard.writeText(referralLink); showToastMsg('Link copied! 🎉') }
  const handleShare = () => { if (navigator.share) { navigator.share({ title: 'Join BigTenX', text: 'Join me on BigTenX and start earning!', url: referralLink }).catch(() => {}) } else { copyLink() } }

  const referrals = [
    { name: 'Femi', initials: 'F', plan: 2 },
    { name: 'Seyi', initials: 'S', plan: 4, color: '#7C3AED' },
    { name: 'Ayo', initials: 'A', plan: 5, color: '#059669' },
    { name: 'Kola', initials: 'K', plan: 1, color: '#E5A100' },
    { name: 'Tunde', initials: 'T', plan: 3, color: '#DC2626' },
  ]

  const TierDots = ({ planIndex }) => {
    const tiers = ['B', 'S', 'G', 'D', 'V']
    return (<div style={{ display: 'flex', gap: 3 }}>{tiers.map((tier, idx) => (<div key={tier} style={{ width: 10, height: 10, borderRadius: '50%', background: idx <= planIndex ? C.orange : 'transparent', border: `1.5px solid ${idx <= planIndex ? C.orange : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,31,84,0.18)')}` }} />))}</div>)
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 16px', background: tk.bg }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: tk.iconShadow }}><ArrowLeft size={18} color={tk.text} /></button>
        <span style={{ fontSize: 22, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Refer</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: tk.iconShadow }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Hero Banner - FIXED: Navy blue gradient */}
        <div onClick={() => setShowLeaderboard(true)} style={{
          background: `linear-gradient(130deg, #001F54 0%, #002266 100%)`,
          borderRadius: 24, padding: '22px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,31,84,0.28)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}><span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-.02em' }}>Top Earners</span></div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginBottom: 12 }}>See who's crushing it this week 🏆</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF6F00', color: '#fff', borderRadius: 50, padding: '7px 16px', fontSize: 12, fontWeight: 800, boxShadow: `0 4px 14px rgba(255,107,0,0.45)` }}>
              <svg style={{ width: 13, height: 13, fill: '#fff' }} viewBox="0 0 24 24"><path d="M3 3h18v2l-7 7v9l-4-2V12L3 5V3z"/></svg> View Leaderboard
            </div>
          </div>
          <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF6F00"><path d="M12 2l1.5 4.5H18l-3.75 2.75L15.75 14 12 11.25 8.25 14l1.5-4.75L6 6.5h4.5L12 2z"/><rect x="3" y="18" width="18" height="3" rx="1.5"/><rect x="7" y="14" width="2" height="4" rx="1"/><rect x="15" y="14" width="2" height="4" rx="1"/><rect x="11" y="12" width="2" height="6" rx="1"/></svg>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: tk.card, borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', boxShadow: tk.iconShadow, border: `1.5px solid ${tk.cardBorder}` }}><div style={{ fontSize: 9, fontWeight: 800, color: tk.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Total Invites</div><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>0</div></div>
          <div style={{ background: tk.card, borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', boxShadow: tk.iconShadow, border: `1.5px solid ${tk.cardBorder}` }}><div style={{ fontSize: 9, fontWeight: 800, color: tk.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Active Invites</div><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>0</div></div>
          <div style={{ background: tk.card, borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', boxShadow: tk.iconShadow, border: `1.5px solid ${tk.cardBorder}` }}><div style={{ fontSize: 9, fontWeight: 800, color: tk.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Active VIP</div><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>0</div></div>
          <div style={{ background: tk.card, borderRadius: 16, padding: '14px 8px 12px', textAlign: 'center', boxShadow: tk.iconShadow, border: `1.5px solid ${tk.cardBorder}` }}><div style={{ fontSize: 9, fontWeight: 800, color: tk.textMuted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Total Earned</div><div style={{ fontSize: 17, fontWeight: 900, color: C.orange }}>$0.00</div></div>
        </div>

        {/* Commission Tiers */}
        <div style={{ background: tk.card, borderRadius: 18, padding: 18, marginBottom: 18, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>Commission Tiers</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {TIERS.map(tier => (<div key={tier.letter} style={{ flex: 1, minWidth: 62, borderRadius: 14, padding: '14px 6px 12px', textAlign: 'center', background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', border: tier.letter === 'B' ? `2px solid ${C.orange}` : '2px solid transparent' }}><span style={{ fontSize: 24, fontWeight: 900, display: 'block', marginBottom: 6, color: tier.color }}>{tier.letter}</span><span style={{ fontSize: 13, fontWeight: 800, color: tk.text }}>{tier.percent}</span></div>))}
          </div>
          <div style={{ fontSize: 12, color: tk.textMuted, fontStyle: 'italic', lineHeight: 1.5, background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', padding: '10px 12px', borderRadius: 12 }}>Your plan is Bronze — your referral commission is 20%</div>
        </div>

        {/* Referral Link */}
        <div style={{ background: tk.card, borderRadius: 18, padding: '4px 4px 4px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
          <span style={{ flex: 1, fontSize: 12, color: tk.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referralLink}</span>
          <button onClick={copyLink} style={{ background: C.orange, color: '#fff', borderRadius: 14, padding: '11px 22px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 14px rgba(255,107,0,0.35)`, cursor: 'pointer', border: 'none' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>
        </div>

        {/* Share Button */}
        <button onClick={handleShare} style={{ width: '100%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, borderRadius: 18, padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 800, color: tk.text, cursor: 'pointer', boxShadow: tk.iconShadow }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share invite link
        </button>

        {/* My Referrals */}
        <div style={{ background: tk.card, borderRadius: 18, padding: 18, marginBottom: 20, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase' }}>My Referrals</div><span style={{ fontSize: 12, fontWeight: 700, color: C.orange, background: darkMode ? 'rgba(255,111,0,0.15)' : '#FFF5EC', borderRadius: 50, padding: '4px 14px' }}>5 people</span></div>
          {referrals.map((ref, idx) => (<div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: idx < referrals.length - 1 ? `1px solid ${tk.cardBorder}` : 'none' }}><div style={{ width: 40, height: 40, borderRadius: '50%', background: ref.color || `linear-gradient(135deg, ${C.navy}, ${C.navy2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>{ref.initials}</div><span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: tk.text }}>{ref.name}</span><TierDots planIndex={ref.plan} /></div>))}
        </div>
      </div>

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} darkMode={darkMode} />}
      {toast && <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, zIndex: 999 }}>{toast}</div>}
    </div>
  )
}