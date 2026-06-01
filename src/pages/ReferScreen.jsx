import { useState, useEffect } from 'react'
import { Sun, Moon, ArrowLeft, Copy, Users, Share2, Trophy, X } from 'lucide-react'
import { t, C } from '../dashboard/tokens'
import { LEVELS } from '../dashboard/levels'

// ── Plan data pulled directly from LEVELS + VIP tier ─────────────────────────
const RANKS = [
  ...LEVELS.map(l => ({
    letter: l.name[0],           // B, S, G, D
    name:   l.name,
    price:  `$${l.price}`,
    pct:    `${l.commission}%`,
    color:  l.color,
    levelId: l.id,
  })),
  // VIP is a separate tier not in LEVELS
  { letter: 'V', name: 'VIP', price: '$100', pct: '60%', color: '#a78bfa', levelId: 5 },
]

// ── Mock referral data ────────────────────────────────────────────────────────
// tier array: index 0=Bronze,1=Silver,2=Gold,3=Diamond,4=VIP
// true = filled (user is on this plan), false = empty
const MOCK_REFERRALS = [
  { name: 'Ayomide A',  initials: 'AA', planIndex: 2, earned: 4.00,  status: 'Active'   },
  { name: 'Fem test D', initials: 'FD', planIndex: 1, earned: 3.00,  status: 'Active'   },
  { name: 'Serah T',    initials: 'ST', planIndex: 3, earned: 20.00, status: 'Active'   },
  { name: 'John Doe',   initials: 'JD', planIndex: 0, earned: 0.20,  status: 'Pending'  },
]

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { pos: 1,  name: 'ChiefEarner',  referrals: 142, earned: 2840 },
  { pos: 2,  name: 'TopReferrer',  referrals: 118, earned: 2360 },
  { pos: 3,  name: 'GoldKing',     referrals:  97, earned: 1940 },
  { pos: 4,  name: 'DiamondAce',   referrals:  84, earned: 1680 },
  { pos: 5,  name: 'SilverFox',    referrals:  71, earned: 1420 },
  { pos: 6,  name: 'BronzeBoss',   referrals:  63, earned: 1260 },
  { pos: 7,  name: 'VIPHunter',    referrals:  55, earned: 1100 },
  { pos: 8,  name: 'EarnKing',     referrals:  48, earned:  960 },
  { pos: 9,  name: 'RefMaster',    referrals:  41, earned:  820 },
  { pos: 10, name: 'TaskLord',     referrals:  36, earned:  720 },
]

// Avatar background colours cycling
const AVATAR_COLORS = ['#FF6F00', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 2600); return () => clearTimeout(id) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: C.orange, color: '#fff', padding: '10px 22px',
      borderRadius: 30, fontSize: 13, fontWeight: 700, zIndex: 600,
      boxShadow: `0 4px 20px ${C.orange}55`, whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  )
}

// ── Tier Dots ─────────────────────────────────────────────────────────────────
// planIndex: 0=Bronze,1=Silver,2=Gold,3=Diamond,4=VIP
// Dots up to and including planIndex are filled orange; rest are empty
function TierDots({ planIndex, darkMode }) {
  const tk = t(darkMode)
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {RANKS.map((rank, i) => (
        <div
          key={rank.letter}
          title={rank.name}
          style={{
            width: 9, height: 9, borderRadius: '50%',
            background: i <= planIndex ? C.orange : 'transparent',
            border: `1.5px solid ${i <= planIndex ? C.orange : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,31,84,0.18)')}`,
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, darkMode }) {
  const tk = t(darkMode)
  return (
    <div style={{
      flex: 1, background: tk.card,
      border: `1px solid ${tk.cardBorder}`,
      borderRadius: 14, padding: '12px 8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, color: tk.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.orange, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

// ── Leaderboard Modal ─────────────────────────────────────────────────────────
function LeaderboardModal({ onClose, darkMode }) {
  const tk = t(darkMode)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: darkMode ? '#111827' : '#fff',
          borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 500,
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: darkMode ? '#374151' : '#e5e7eb', margin: '12px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={20} color={C.orange} />
            <span style={{ fontWeight: 800, fontSize: 17, color: darkMode ? '#fff' : C.navy }}>
              Top Referrers
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,31,84,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,31,84,0.5)'} />
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '0 16px 28px', flex: 1 }}>
          {MOCK_LEADERBOARD.map((entry, idx) => (
            <div
              key={entry.pos}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', marginBottom: 8, borderRadius: 14,
                background: idx < 3
                  ? (darkMode ? 'rgba(255,111,0,0.08)' : `${C.orange}08`)
                  : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,31,84,0.03)'),
                border: `1px solid ${idx < 3 ? `${C.orange}25` : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.05)')}`,
              }}
            >
              {/* Position */}
              <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                {idx < 3
                  ? <span style={{ fontSize: 18 }}>{medals[idx]}</span>
                  : <span style={{ fontSize: 13, fontWeight: 800, color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,31,84,0.3)' }}>#{entry.pos}</span>
                }
              </div>

              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
              }}>
                {entry.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Name + referrals */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#fff' : C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.name}
                </div>
                <div style={{ fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.38)' : '#8899AA', marginTop: 1 }}>
                  {entry.referrals} referrals
                </div>
              </div>

              {/* Earnings */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>
                  ${entry.earned.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.3)' : '#8899AA' }}>earned</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReferScreen({ user, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [toast,           setToast]           = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const username     = user?.username || user?.referralCode || 'BIGTENX'
  const referralLink = `https://bigtenx.com/register?ref=${username}`

  // Determine user's current plan index (0-based) for commission display
  const userLevel      = user?.level || 0
  const userPlanIndex  = userLevel > 0 ? userLevel - 1 : -1   // -1 = no plan
  const userCommission = userPlanIndex >= 0 ? RANKS[userPlanIndex]?.pct : null

  const showToast = (msg) => {
    setToast(msg)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => showToast('Referral link copied! 🎉'))
      .catch(() => showToast('Copy failed — try manually'))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join BigTenX',
        text: `Join me on BigTenX and start earning! Use my referral link:`,
        url: referralLink,
      }).catch(() => {})
    } else {
      copyLink()
    }
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '18px 16px 10px', background: tk.bg,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: tk.card, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: darkMode ? '0 0 0 1px rgba(255,111,0,0.15)' : '0 1px 6px rgba(0,31,84,0.1)',
          }}
        >
          <ArrowLeft size={17} color={tk.text} />
        </button>

        <span style={{ flex: 1, fontSize: 20, fontWeight: 800, color: tk.text }}>Refer</span>

        {/* Username badge — replaces "BigTenX" */}
        <div style={{
          background: C.orange, color: '#fff',
          padding: '5px 12px', borderRadius: 20,
          fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
          maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {username}
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none',
            background: tk.card, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Hero Band (clickable → leaderboard) ── */}
        <div
          onClick={() => setShowLeaderboard(true)}
          style={{
            background: darkMode
              ? 'linear-gradient(120deg,#0d1828,#121f36)'
              : `linear-gradient(120deg,${C.navy},#0a2c70)`,
            padding: '16px 18px', borderRadius: 18, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', border: `1px solid rgba(255,111,0,0.2)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 3 }}>
              Earn with every invite
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              Tap to see top referrers 🏆
            </div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: `${C.orange}20`, border: `1px solid ${C.orange}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={22} color={C.orange} />
          </div>
        </div>

        {/* ── Rank Strip ── */}
        <div style={{
          background: tk.card, border: `1px solid ${tk.cardBorder}`,
          borderRadius: 16, padding: '14px 8px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, paddingLeft: 4 }}>
            Commission Tiers
          </div>
          <div style={{ display: 'flex' }}>
            {RANKS.map((rank, idx) => {
              const isActive = idx === userPlanIndex
              return (
                <div
                  key={rank.letter}
                  style={{
                    flex: 1, textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: 10,
                    background: isActive ? `${C.orange}15` : 'transparent',
                    border: isActive ? `1.5px solid ${C.orange}40` : '1.5px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Rank letter */}
                  <div style={{
                    fontSize: 18, fontWeight: 900,
                    color: isActive ? C.orange : rank.color,
                    marginBottom: 4,
                  }}>
                    {rank.letter}
                  </div>
                  {/* Price */}
                  <div style={{
                    fontSize: 10, fontWeight: 800,
                    color: isActive ? C.orange : tk.text,
                    marginBottom: 2,
                  }}>
                    {rank.price}
                  </div>
                  {/* Commission % */}
                  <div style={{
                    fontSize: 9, fontWeight: 700,
                    color: isActive ? C.orange : tk.textMuted,
                  }}>
                    {rank.pct}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Commission note */}
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: `1px solid ${tk.cardBorder}`,
            fontSize: 10, color: tk.textMuted, fontStyle: 'italic', paddingLeft: 4,
          }}>
            {userCommission
              ? `Your plan: ${RANKS[userPlanIndex]?.name} — you earn ${userCommission} on each referral's upgrade`
              : 'Upgrade your plan to start earning referral commissions'}
          </div>
        </div>

        {/* ── Referral Link ── */}
        <div style={{
          background: tk.card, border: `1px solid ${tk.cardBorder}`,
          borderRadius: 14, overflow: 'hidden', marginBottom: 10,
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            flex: 1, padding: '12px 14px',
            fontSize: 11, fontFamily: 'monospace',
            color: tk.textMuted, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {referralLink}
          </span>
          <button
            onClick={copyLink}
            style={{
              padding: '12px 16px', background: C.orange, color: '#fff',
              fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}
          >
            <Copy size={12} /> Copy
          </button>
        </div>

        {/* ── Share Button ── */}
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '11px', borderRadius: 12, marginBottom: 18,
            background: 'transparent', border: `1.5px solid ${tk.cardBorder}`,
            color: tk.text, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit',
          }}
        >
          <Share2 size={15} /> Share invite link
        </button>

        {/* ── Stats Cards ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <StatCard label="Total Invites"  value="70"    darkMode={darkMode} />
          <StatCard label="Active Invites" value="30"    darkMode={darkMode} />
          <StatCard label="Active VIP"     value="12"    darkMode={darkMode} />
          <StatCard label="Total Earned"   value="$400"  darkMode={darkMode} />
        </div>

        {/* ── My Referrals ── */}
        <div style={{
          fontSize: 11, fontWeight: 800, color: tk.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${tk.cardBorder}`,
        }}>
          My Referrals
        </div>

        {MOCK_REFERRALS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: tk.textMuted }}>
            <Users size={32} color={tk.textMuted} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>No referrals yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Share your link to get started!</div>
          </div>
        ) : (
          MOCK_REFERRALS.map((ref, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', marginBottom: 8, borderRadius: 14,
                background: tk.card, border: `1px solid ${tk.cardBorder}`,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
              }}>
                {ref.initials}
              </div>

              {/* Name + tier dots */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ref.name}
                </div>
                <TierDots planIndex={ref.planIndex} darkMode={darkMode} />
              </div>

              {/* Earned + status */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.orange, marginBottom: 4 }}>
                  +${ref.earned.toFixed(2)}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: ref.status === 'Active'
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(245,158,11,0.12)',
                  color: ref.status === 'Active' ? '#10b981' : '#f59e0b',
                  border: `1px solid ${ref.status === 'Active' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                }}>
                  {ref.status}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Commission explanation */}
        <div style={{
          marginTop: 8, padding: '12px 14px', borderRadius: 12,
          background: darkMode ? 'rgba(255,111,0,0.05)' : `${C.orange}08`,
          border: `1px dashed ${C.orange}30`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginBottom: 4 }}>
            💡 How commissions work
          </div>
          <div style={{ fontSize: 11, color: tk.textMuted, lineHeight: 1.6 }}>
            You earn a % of every upgrade your referrals make — based on <strong style={{ color: tk.text }}>your own plan</strong>.
            Upgrade to a higher plan to unlock higher commission rates.
          </div>
        </div>

      </div>

      {/* ── Leaderboard Modal ── */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          darkMode={darkMode}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
