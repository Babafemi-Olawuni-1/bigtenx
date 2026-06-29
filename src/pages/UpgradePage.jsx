// UpgradePage.jsx — 2x2 grid UI matching screenshot
import { useState, useEffect } from 'react'
import { t, C } from '../dashboard/tokens'
import { Sun, Moon, ArrowLeft, Check } from 'lucide-react'
import { API } from '../auth/api'

const BADGE_META = {
  bronze:  { emoji: '🥉', color: '#CD7F32', bg: '#CD7F3215' },
  silver:  { emoji: '🥈', color: '#94A3B8', bg: '#94A3B815' },
  gold:    { emoji: '🥇', color: '#EAB308', bg: '#EAB30815' },
  diamond: { emoji: '💎', color: '#2563EB', bg: '#2563EB15' },
  vip:     { emoji: '👑', color: '#7C3AED', bg: '#7C3AED15' },
}

function getBadgeMeta(name) {
  return BADGE_META[(name || '').toLowerCase()] || { emoji: '⭐', color: C.orange, bg: C.orange + '15' }
}

export default function UpgradePage({ user, darkMode, setDarkMode, onClose, onUpgrade }) {
  const tk = t(darkMode)
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0)

  const [toast, setToast]               = useState(null)
  const [badges, setBadges]             = useState([])
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [fetching, setFetching]         = useState(true)
  const [liveRate, setLiveRate]         = useState(1550)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [confirmAnim, setConfirmAnim]   = useState(false)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d?.rates?.NGN) setLiveRate(parseFloat(d.rates.NGN)) })
      .catch(() => {})
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBadges = async () => {
    try {
      const res  = await fetch(`${API}/badges/list.php?user_id=${user?.id}`)
      const data = await res.json()
      if (data?.success && Array.isArray(data?.badges)) setBadges(data.badges)
    } catch { showToast('Failed to load levels', 'error') }
    finally { setFetching(false) }
  }

  useEffect(() => { fetchBadges() }, [])

  // Sort: unowned first, then owned — within each group keep original order
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.owned === b.owned) return 0
    return a.owned ? 1 : -1
  })

  const openConfirm = (badge) => {
    setSelectedBadge(badge)
    setShowConfirm(true)
    setTimeout(() => setConfirmAnim(true), 10)
  }
  const closeConfirm = () => {
    setConfirmAnim(false)
    setTimeout(() => { setShowConfirm(false) }, 280)
  }

  const handlePurchase = async () => {
    if (!selectedBadge || selectedBadge.owned) return
    setLoading(true)
    try {
      const res  = await fetch(`${API}/badges/purchase.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, badge_id: selectedBadge?.id })
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message, 'success')
        closeConfirm()
        await fetchBadges()
        if (onUpgrade) onUpgrade()
      } else {
        showToast(data.message, 'error')
        closeConfirm()
      }
    } catch { showToast('Network error', 'error'); closeConfirm() }
    finally { setLoading(false) }
  }

  // Which badge is selected in the grid (for benefits display)
  const [activeBadge, setActiveBadge] = useState(null)
  useEffect(() => {
    if (badges.length > 0 && !activeBadge) {
      setActiveBadge(sortedBadges.find(b => !b.owned) || sortedBadges[0])
    }
  }, [badges])

  const displayBadge = activeBadge || sortedBadges[0]

  const getBenefits = (badge) => badge?.name?.toLowerCase() === 'vip'
    ? ['20% XP speed boost', 'VIP badge status', '$1 sponsor VIP reward']
    : [
        `${badge?.name} badge`,
        `${badge?.referral_percent || 20}% commission`,
        `${badge?.xp_multiplier || 1}x Multiplier`,
        `${badge?.vault_units || 1} Vault Unit`,
        'Access to Hot Offers',
      ]

  if (fetching) return (
    <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: tk.textMuted }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading levels...
      </div>
    </div>
  )

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: tk.bg,
        borderBottom: `1px solid ${tk.cardBorder}`,
      }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color={tk.text} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: tk.text }}>Upgrade Level</div>
          <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 1 }}>Unlock daily tasks &amp; earnings</div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {darkMode ? <Sun size={16} color={tk.text} /> : <Moon size={16} color={tk.text} />}
        </button>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* 2x2 Badge Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {sortedBadges.map(badge => {
            const meta     = getBadgeMeta(badge.name)
            const isOwned  = badge.owned
            const isActive = activeBadge?.id === badge.id
            return (
              <button key={badge.id} onClick={() => setActiveBadge(badge)}
                style={{
                  background: tk.card,
                  borderRadius: 18,
                  padding: '20px 16px',
                  border: isActive
                    ? `2.5px solid ${meta.color}`
                    : isOwned
                      ? `1.5px solid ${meta.color}60`
                      : `1.5px solid ${tk.cardBorder}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: isActive ? `0 4px 20px ${meta.color}25` : 'none',
                  opacity: isOwned ? 0.8 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {isOwned && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: '#10b98120', borderRadius: 20, padding: '2px 8px',
                    fontSize: 9, fontWeight: 800, color: '#10b981',
                  }}>OWNED</div>
                )}
                <div style={{ fontSize: 36, marginBottom: 6 }}>{meta.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: isOwned ? meta.color : tk.text, marginBottom: 4 }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isOwned ? meta.color : tk.textMuted }}>
                  ${parseFloat(badge.price).toFixed(0)}
                </div>
              </button>
            )
          })}
        </div>

        {/* Benefits Card */}
        {displayBadge && (
          <div style={{
            background: tk.card, borderRadius: 20, padding: '20px',
            border: `1px solid ${tk.cardBorder}`, marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              {displayBadge.name.toUpperCase()} BENEFITS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getBenefits(displayBadge).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: tk.text }}>
                  <Check size={16} color='#10b981' />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        {displayBadge && !displayBadge.owned && (
          <button onClick={() => openConfirm(displayBadge)} style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: C.orange, border: 'none', color: '#fff',
            fontWeight: 800, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,111,0,0.35)',
          }}>
            Upgrade to {displayBadge.name} — ${parseFloat(displayBadge.price).toFixed(0)}
          </button>
        )}
        {displayBadge?.owned && (
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 16, background: '#10b98112', border: '1px solid #10b98130', color: '#10b981', fontWeight: 700, fontSize: 14 }}>
            ✓ You own the {displayBadge.name} badge
          </div>
        )}
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && selectedBadge && (
        <div onClick={closeConfirm} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', zIndex: 1000,
          opacity: confirmAnim ? 1 : 0, transition: 'opacity 0.25s',
          paddingTop: 60, boxSizing: 'border-box',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#ffffff', borderRadius: 30, width: '90%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            transform: confirmAnim ? 'translateY(0)' : 'translateY(-60px)',
            opacity: confirmAnim ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={closeConfirm} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Back</button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54', margin: 0 }}>Confirm Upgrade</h3>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Theme</button>
            </div>

            {/* Price card */}
            <div style={{ background: '#F1F5F9', borderRadius: 18, padding: 24, margin: '20px 24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPGRADE PRICE</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#001F54', margin: '8px 0', letterSpacing: '-0.02em' }}>
                ₦{(parseFloat(selectedBadge.price) * liveRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                System Rate: 1 USD = ₦{liveRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Plan details */}
            <div style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 18, padding: '18px 20px', margin: '0 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>PLAN DETAILS</div>
              {[
                ['Selected Plan', selectedBadge.name],
                ['USD Price', `$${parseFloat(selectedBadge.price).toFixed(2)}`],
                ['NGN Price', `₦${(parseFloat(selectedBadge.price) * liveRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>{k}</span>
                  <strong style={{ color: '#001F54' }}>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>BENEFITS UNLOCKED</div>
                {getBenefits(selectedBadge).map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                    <Check size={12} color={getBadgeMeta(selectedBadge.name).color} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={closeConfirm} style={{ flex: 1, height: 48, borderRadius: 14, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePurchase} disabled={loading} style={{ flex: 2, height: 48, borderRadius: 14, background: C.orange, color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Upgrading...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#EF4444' : '#10B981', color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
