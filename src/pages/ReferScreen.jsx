// ReferScreen.jsx - COMPLETE REDESIGN
import { useState, useEffect } from 'react'
import { Sun, Moon, X, ArrowLeft, Copy, Share2, Users, UserPlus, DollarSign, Crown, TrendingUp, Award, ChevronRight, UserCheck } from 'lucide-react'
import { t, C } from '../dashboard/tokens'
import { API } from '../auth/api'

function AddReferrerBox({ user, darkMode, tk, onSuccess }) {
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    if (!code.trim()) { setError('Enter a referral code'); return }
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`${API}/referral/add_referrer.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, referral_code: code.trim() })
      })
      const data = await res.json()
      if (data.success) { onSuccess(data.referrer_username); setCode('') }
      else setError(data.message || 'Code not found')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: tk.card, borderRadius: 14, padding: 14, border: `1px solid ${tk.cardBorder}` }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text" value={code} onChange={e => setCode(e.target.value)}
          placeholder="Enter referral code..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: `1.5px solid ${error ? '#EF4444' : tk.cardBorder}`,
            background: darkMode ? 'rgba(255,255,255,0.06)' : '#F7F8FC',
            color: tk.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={submit} disabled={loading} style={{
          padding: '10px 18px', borderRadius: 10, background: C.orange,
          border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap',
        }}>
          {loading ? '...' : 'Apply'}
        </button>
      </div>
      {error && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>{error}</div>}
    </div>
  )
}

const TIERS = [
  { letter: 'B', name: 'Bronze', percent: '20%', price: '$1', color: '#CD7F32', bg: 'rgba(205,127,50,0.15)' },
  { letter: 'S', name: 'Silver', percent: '30%', price: '$5', color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)' },
  { letter: 'G', name: 'Gold', percent: '40%', price: '$10', color: '#FFD700', bg: 'rgba(255,215,0,0.15)' },
  { letter: 'D', name: 'Diamond', percent: '50%', price: '$50', color: '#38B6FF', bg: 'rgba(56,182,255,0.15)' },
  { letter: 'V', name: 'VIP', percent: '$1', price: '$100', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' }
]

function LeaderboardModal({ onClose, darkMode }) {
  const tk = t(darkMode)
  const [leaderboard, setLeaderboard] = useState([])
  const medals = ['🥇', '🥈', '🥉']

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API}/referral/leaderboard.php?limit=10`)
        const data = await res.json()
        if (data.success) {
          setLeaderboard(data.leaderboard)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', inset: 0, zIndex: 1000, 
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', 
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{ 
        background: tk.card, 
        borderRadius: '28px 28px 0 0', 
        width: '100%', maxWidth: 500, 
        maxHeight: '80%', 
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: tk.cardBorder, margin: '12px auto 0' }} />

        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '18px 20px 14px', 
          borderBottom: `1px solid ${tk.cardBorder}`
        }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: tk.text }}>Leaderboard</span>
            <span style={{ fontSize: 12, color: tk.textMuted, marginLeft: 8 }}>Top earners</span>
          </div>
          <button onClick={onClose} style={{ 
            width: 34, height: 34, borderRadius: '50%', 
            background: tk.bg, border: `1px solid ${tk.cardBorder}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color={tk.textMuted} />
          </button>
        </div>

        <div style={{ padding: '4px 16px 32px', overflowY: 'auto' }}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: tk.textMuted }}>
              <Users size={32} color={tk.textMuted} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No referrals yet</p>
            </div>
          ) : (
            leaderboard.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                padding: '12px 14px', borderRadius: 14, 
                marginBottom: 4,
                background: idx < 3 ? `${C.orange}08` : 'transparent'
              }}>
                <div style={{ width: 28, fontWeight: 700, color: idx < 3 ? C.orange : tk.textMuted }}>
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>
                  {item.username}
                </span>
                <span style={{ fontWeight: 800, color: C.orange }}>
                  ${parseFloat(item.earned || 0).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color = C.orange, darkMode }) {
  const tk = t(darkMode)
  return (
    <div style={{
      background: tk.card,
      borderRadius: 16,
      padding: '16px 14px',
      border: `1px solid ${tk.cardBorder}`,
      textAlign: 'center',
      flex: 1
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: 11, color: tk.textMuted, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 800, color: tk.text }}>{value}</span>
    </div>
  )
}

function TierBadge({ tier, owned, darkMode, onClick }) {
  const tk = t(darkMode)
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 12,
        background: owned ? tier.bg : 'transparent',
        border: `1.5px solid ${owned ? tier.color : tk.cardBorder}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        opacity: owned ? 1 : 0.5,
        flex: 1,
        justifyContent: 'center'
      }}
      onMouseEnter={e => {
        if (owned) e.currentTarget.style.transform = 'scale(1.02)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <span style={{ fontWeight: 800, color: tier.color }}>{tier.letter}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: tk.text }}>{tier.percent}</span>
      {owned && (
        <span style={{ fontSize: 9, color: '#10B981' }}>✓</span>
      )}
    </div>
  )
}

export default function ReferScreen({ user, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [stats, setStats] = useState({
    total_invites: 0,
    active_invites: 0,
    active_vip: 0,
    total_earned: 0
  })
  const [referrals, setReferrals] = useState([])
  const [userTiers, setUserTiers] = useState({})

  const referralCode = user?.referral_code ?? user?.referralCode ?? ''
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `${window.location.origin}/register`

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    showToastMsg('Link copied!', 'success')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BigTenX',
          text: 'Join me on BigTenX and start earning!',
          url: referralLink
        })
      } catch {}
    } else {
      copyLink()
    }
  }

  useEffect(() => {
    fetchStats()
    fetchReferrals()
    fetchUserTiers()
  }, [])

  const fetchStats = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`${API}/referral/stats.php?user_id=${user.id}`)
      const data = await res.json()
      if (data?.success) {
        setStats({
          total_invites:  data.total_invites  || 0,
          active_invites: data.active_invites || 0,
          active_vip:     data.active_vip     || 0,
          total_earned:   data.total_earned   || 0,
        })
      }
    } catch (err) { console.log(err) }
  }

  const fetchReferrals = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`${API}/referral/list.php?user_id=${user.id}`)
      const data = await res.json()
      if (data?.success) {
        setReferrals(Array.isArray(data.referrals) ? data.referrals : [])
      }
    } catch (err) { console.log(err) }
  }

  const fetchUserTiers = async () => {
    try {
      const res = await fetch(`${API}/badges/user.php?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) {
        const tiers = {}
        data.badges.forEach(b => { tiers[b.name.toLowerCase()] = true })
        setUserTiers(tiers)
      }
    } catch (err) { console.log(err) }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: tk.bg,
        borderBottom: `1px solid ${tk.cardBorder}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <ArrowLeft size={18} color={tk.text} />
            </button>
          )}
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>Referral</span>
            <span style={{ fontSize: 11, color: tk.textMuted, marginLeft: 8 }}>Invite & earn</span>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          {darkMode ? <Sun size={15} color={tk.text} /> : <Moon size={15} color={tk.text} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
          <StatBox icon={UserPlus} label="Total" value={stats.total_invites} darkMode={darkMode} />
          <StatBox icon={Users} label="Active" value={stats.active_invites} color="#10B981" darkMode={darkMode} />
          <StatBox icon={Crown} label="VIP" value={stats.active_vip} color="#8B5CF6" darkMode={darkMode} />
          <StatBox icon={DollarSign} label="Earned" value={`$${parseFloat(stats.total_earned).toFixed(2)}`} color={C.orange} darkMode={darkMode} />
        </div>

        {/* Commission Tiers */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={16} color={C.orange} />
            <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>Your Commission Tiers</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {TIERS.map(tier => (
              <TierBadge 
                key={tier.letter}
                tier={tier}
                owned={userTiers[tier.name.toLowerCase()] || tier.letter === 'B'}
                darkMode={darkMode}
                onClick={() => {}}
              />
            ))}
          </div>
          <p style={{ fontSize: 10, color: tk.textMuted, marginTop: 8, textAlign: 'center' }}>
            <Crown size={12} style={{ display: 'inline', marginRight: 4 }} />
            Commission based on your highest badge
          </p>
        </div>

        {/* Referral Link */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: tk.card,
            borderRadius: 16,
            padding: '14px 16px',
            border: `1px solid ${tk.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Your Referral Link
              </div>
              <span style={{ fontSize: 12, color: tk.text, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {referralLink}
              </span>
            </div>
            <button onClick={copyLink} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 14px',
              borderRadius: 10,
              background: C.orange,
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button onClick={handleShare} style={{
          width: '100%', marginTop: 12, padding: '12px', borderRadius: 14,
          background: '#001F54', color: '#fff', border: 'none',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <Share2 size={16} /> Share Invite Link
        </button>

        {/* Add Referrer (only if user has no referrer) */}
        {!user?.referred_by && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: tk.textMuted, marginBottom: 8 }}>
              Did someone refer you? Add their code:
            </div>
            <AddReferrerBox user={user} darkMode={darkMode} tk={tk} onSuccess={(username) => showToastMsg(`Referrer set to ${username}!`, 'success')} />
          </div>
        )}

        {/* My Referrals */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color={C.orange} />
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>My Referrals</span>
            </div>
            <span style={{ fontSize: 12, color: tk.textMuted }}>{referrals.length} people</span>
          </div>

          {referrals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: tk.card,
              borderRadius: 16,
              border: `1px solid ${tk.cardBorder}`,
              color: tk.textMuted
            }}>
              <UserPlus size={32} color={tk.textMuted} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13, fontWeight: 500 }}>No referrals yet</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Share your link to start earning!</p>
            </div>
          ) : (
            referrals.map((ref, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: tk.card,
                borderRadius: 14,
                marginBottom: 6,
                border: `1px solid ${tk.cardBorder}`
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.orange}, #FF9A00)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {getInitials(ref.username)}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>{ref.username}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {['B', 'S', 'G', 'D', 'V'].map((tier, i) => (
                      <div
                        key={tier}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: i <= ref.plan_index ? C.orange : 'transparent',
                          border: `1px solid ${i <= ref.plan_index ? C.orange : tk.cardBorder}`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>
                  +{ref.earned || 0}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard Button */}
        <button 
          onClick={() => setShowLeaderboard(true)}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px',
            borderRadius: 14,
            background: 'transparent',
            border: `1.5px solid ${tk.cardBorder}`,
            color: tk.text,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} color={C.orange} /> View Leaderboard
          </span>
          <ChevronRight size={16} color={tk.textMuted} />
        </button>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          darkMode={darkMode}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#EF4444' : C.orange,
          color: '#fff',
          padding: '10px 22px',
          borderRadius: 50,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: `0 4px 16px ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,111,0,0.3)'}`
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
