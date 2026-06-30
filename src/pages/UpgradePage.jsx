// UpgradePage.jsx — real medal icons, VIP card with auto-renew, active subscription banner
import { useState, useEffect } from 'react'
import { t, C } from '../dashboard/tokens'
import { Sun, Moon, ArrowLeft, Check, Crown, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { API } from '../auth/api'

// ── SVG medal icons (no emojis) ───────────────────────────────────────────
function MedalIcon({ color, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      {/* Ribbon left */}
      <path d="M15 4 L20 16 L12 16 Z" fill={color} opacity="0.85" />
      {/* Ribbon right */}
      <path d="M29 4 L24 16 L32 16 Z" fill={color} opacity="0.85" />
      {/* Blue ribbon band */}
      <rect x="13" y="3" width="18" height="5" rx="2" fill="#3B82F6" />
      {/* Medal circle */}
      <circle cx="22" cy="28" r="13" fill={color} />
      <circle cx="22" cy="28" r="10" fill={color} opacity="0.7" />
      {/* Star in medal */}
      <path d="M22 21 L23.5 25.5 H28.5 L24.5 28.5 L26 33 L22 30 L18 33 L19.5 28.5 L15.5 25.5 H20.5 Z" fill="#fff" opacity="0.9" />
    </svg>
  )
}

function DiamondIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <polygon points="22,6 38,18 22,38 6,18" fill="#60A5FA" />
      <polygon points="22,6 38,18 22,38 6,18" fill="url(#dgrad)" />
      <polygon points="22,6 30,18 22,30 14,18" fill="#93C5FD" opacity="0.6" />
      <polygon points="22,6 38,18 30,18" fill="#BFDBFE" opacity="0.5" />
      <defs>
        <linearGradient id="dgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const BADGE_COLORS = {
  bronze:  '#CD7F32',
  silver:  '#94A3B8',
  gold:    '#EAB308',
  diamond: '#3B82F6',
}

function getBadgeColor(name) {
  return BADGE_COLORS[(name || '').toLowerCase()] || C.orange
}

function BadgeIcon({ name, size = 44 }) {
  const n = (name || '').toLowerCase()
  if (n === 'diamond') return <DiamondIcon size={size} />
  return <MedalIcon color={getBadgeColor(n)} size={size} />
}

export default function UpgradePage({ user, darkMode, setDarkMode, onClose, onUpgrade, updateUser }) {
  const tk = t(darkMode)
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0)

  const [toast, setToast]           = useState(null)
  const [badges, setBadges]         = useState([])
  const [vipBadge, setVipBadge]     = useState(null)        // the VIP badge object
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAnim, setConfirmAnim] = useState(false)

  // VIP-specific state
  const [vipOwned, setVipOwned]         = useState(Boolean(user?.vip_active))
  const [vipExpiresAt, setVipExpiresAt] = useState(user?.vip_expires_at || null)
  const [autoRenew, setAutoRenew]       = useState(Boolean(user?.vip_auto_renew))
  const [autoRenewLoading, setAutoRenewLoading] = useState(false)

  // Which badge card is active (for benefits)
  const [activeBadge, setActiveBadge] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBadges = async () => {
    try {
      const res  = await fetch(`${API}/badges/list.php?user_id=${user?.id}`)
      const data = await res.json()
      if (data?.success && Array.isArray(data?.badges)) {
        const regular = data.badges.filter(b => b.name?.toLowerCase() !== 'vip')
        const vip     = data.badges.find(b => b.name?.toLowerCase() === 'vip')
        setBadges(regular)
        setVipBadge(vip || null)
        if (vip) setVipOwned(!!vip.owned)
      }
    } catch { showToast('Failed to load levels', 'error') }
    finally { setFetching(false) }
  }

  // Load VIP expiry from wallet index
  useEffect(() => {
    if (!user?.id) return
    fetch(`${API}/wallet/index.php?user_id=${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d?.vip_expires_at) setVipExpiresAt(d.vip_expires_at)
        if (d?.vip_active) setVipOwned(true)
        if (d?.vip_auto_renew !== undefined) setAutoRenew(Boolean(d.vip_auto_renew))
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => { fetchBadges() }, [])

  useEffect(() => {
    if (badges.length > 0 && !activeBadge) {
      const first = badges.find(b => !b.owned) || badges[0]
      setActiveBadge(first)
    }
  }, [badges])

  // Sort: unowned first
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
    setTimeout(() => setShowConfirm(false), 280)
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

  const handleAutoRenewToggle = async () => {
    const newVal = !autoRenew
    setAutoRenewLoading(true)
    try {
      const res  = await fetch(`${API}/badges/vip_autorenew.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, auto_renew: newVal ? 1 : 0 })
      })
      const data = await res.json()
      if (data.success) {
        setAutoRenew(newVal)
        showToast(newVal ? 'Auto renew enabled' : 'Auto renew disabled')
      } else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setAutoRenewLoading(false) }
  }

  const displayBadge = activeBadge || sortedBadges[0]

  const getBenefits = (badge) => {
    if (!badge) return []
    const name = badge.name?.toLowerCase()
    if (name === 'vip') return [
      '20% XP speed boost',
      'VIP badge status',
      '$1 sponsor VIP reward',
    ]
    if (Array.isArray(badge.benefits) && badge.benefits.length > 0) return badge.benefits
    return [
      `${badge.name} badge`,
      `${badge.xp_multiplier || 1}x Multiplier on tasks`,
      `${badge.referral_percent || 20}% commission on referrals`,
      `${badge.vault_units || 1} Vault Unit`,
      'Access to Hot Offers',
    ]
  }

  const nextRenewalDate = vipExpiresAt
    ? new Date(vipExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  if (fetching) return (
    <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: tk.textMuted }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 13 }}>Loading levels...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: tk.bg, borderBottom: `1px solid ${tk.cardBorder}` }}>
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
            const color   = getBadgeColor(badge.name)
            const isOwned = badge.owned
            const isActive = activeBadge?.id === badge.id
            return (
              <button key={badge.id} onClick={() => setActiveBadge(badge)}
                style={{
                  background: tk.card, borderRadius: 18, padding: '20px 16px',
                  border: isActive ? `2.5px solid ${color}` : isOwned ? `1.5px solid ${color}60` : `1.5px solid ${tk.cardBorder}`,
                  cursor: 'pointer', textAlign: 'center', position: 'relative',
                  boxShadow: isActive ? `0 4px 20px ${color}30` : 'none',
                  opacity: isOwned ? 0.85 : 1, transition: 'all 0.15s',
                }}
              >
                {isOwned && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#10b98120', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#10b981' }}>OWNED</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <BadgeIcon name={badge.name} size={44} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: isOwned ? color : tk.text, marginBottom: 4 }}>{badge.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isOwned ? color : tk.textMuted }}>${parseFloat(badge.price).toFixed(0)}</div>
              </button>
            )
          })}
        </div>

        {/* VIP Card */}
        {vipBadge && (
          <div style={{
            borderRadius: 18, overflow: 'hidden', marginBottom: 20,
            border: vipOwned ? '2px solid #7C3AED' : `1.5px solid ${tk.cardBorder}`,
            boxShadow: vipOwned ? '0 4px 24px rgba(124,58,237,0.2)' : 'none',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: tk.card,
            }}>
              {/* Left: VIP icon + price */}
              <div style={{
                padding: '20px 18px', textAlign: 'center', minWidth: 120,
                borderRight: `1px solid ${tk.cardBorder}`,
                position: 'relative',
              }}>
                {vipOwned && (
                  <div style={{
                    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', borderRadius: 20, padding: '2px 10px',
                    fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.05em',
                  }}>ACTIVE</div>
                )}
                <div style={{ marginTop: vipOwned ? 20 : 0, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  <Crown size={40} color="#7C3AED" fill="#7C3AED22" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7C3AED' }}>VIP</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', opacity: 0.8 }}>
                  ${parseFloat(vipBadge.price || 10).toFixed(0)} / m
                </div>
              </div>

              {/* Right: auto renew + next renewal */}
              <div style={{ flex: 1, padding: '20px 18px' }}>
                {vipOwned ? (
                  <>
                    {/* Auto renew row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: tk.text }}>Auto renew</span>
                      <button
                        onClick={handleAutoRenewToggle}
                        disabled={autoRenewLoading}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: autoRenewLoading ? 0.5 : 1 }}
                      >
                        {autoRenew
                          ? <ToggleRight size={36} color="#7C3AED" />
                          : <ToggleLeft size={36} color={tk.textMuted || '#8899AA'} />
                        }
                      </button>
                    </div>
                    {/* Next renewal */}
                    {nextRenewalDate && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: darkMode ? 'rgba(124,58,237,0.1)' : '#F5F3FF',
                        borderRadius: 12, padding: '10px 12px',
                      }}>
                        <Clock size={18} color="#7C3AED" />
                        <div>
                          <div style={{ fontSize: 11, color: tk.textMuted, fontWeight: 500 }}>Next renewal</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED' }}>{nextRenewalDate}</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, color: tk.textMuted, marginBottom: 12 }}>
                      VIP boosts your badge multiplier by +20%
                    </div>
                    <button onClick={() => openConfirm(vipBadge)} style={{
                      width: '100%', padding: '11px', borderRadius: 12,
                      background: '#7C3AED', border: 'none', color: '#fff',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>
                      Get VIP — ${parseFloat(vipBadge.price || 10).toFixed(0)}/mo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIP Benefits */}
        {vipBadge && (
          <div style={{ background: tk.card, borderRadius: 18, padding: '18px 20px', border: `1px solid ${tk.cardBorder}`, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>VIP BENEFITS</div>
            {getBenefits(vipBadge).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: tk.text, marginBottom: 8 }}>
                <Check size={15} color="#10b981" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Active VIP subscription banner */}
        {vipOwned && (
          <div style={{
            background: darkMode ? 'rgba(16,185,129,0.12)' : '#F0FDF4',
            border: '1px solid #10b98130',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20,
          }}>
            <Check size={18} color="#10b981" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>
              You have an active VIP subscription
            </span>
          </div>
        )}

        {/* Badge benefits + upgrade button */}
        {displayBadge && displayBadge.name?.toLowerCase() !== 'vip' && (
          <>
            <div style={{ background: tk.card, borderRadius: 18, padding: '18px 20px', border: `1px solid ${tk.cardBorder}`, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {displayBadge.name.toUpperCase()} BENEFITS
              </div>
              {getBenefits(displayBadge).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: tk.text, marginBottom: 8 }}>
                  <Check size={15} color="#10b981" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {!displayBadge.owned ? (
              <button onClick={() => openConfirm(displayBadge)} style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: C.orange, border: 'none', color: '#fff',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,111,0,0.35)',
              }}>
                Upgrade to {displayBadge.name} — ${parseFloat(displayBadge.price).toFixed(0)}
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: 14, borderRadius: 14, background: '#10b98112', border: '1px solid #10b98130', color: '#10b981', fontWeight: 700, fontSize: 14 }}>
                ✓ You own the {displayBadge.name} badge
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && selectedBadge && (
        <div onClick={closeConfirm} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
          opacity: confirmAnim ? 1 : 0, transition: 'opacity 0.25s', paddingTop: 60, boxSizing: 'border-box',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 30, width: '90%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            transform: confirmAnim ? 'translateY(0)' : 'translateY(-60px)',
            opacity: confirmAnim ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={closeConfirm} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Back</button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54', margin: 0 }}>Confirm Upgrade</h3>
              <div style={{ width: 40 }} />
            </div>
            <div style={{ background: '#F1F5F9', borderRadius: 18, padding: 24, margin: '20px 24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPGRADE PRICE</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#001F54', margin: '8px 0' }}>
                ${parseFloat(selectedBadge.price).toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Deducted from your wallet balance</div>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 18, padding: '18px 20px', margin: '0 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>PLAN DETAILS</div>
              {[['Selected Plan', selectedBadge.name], ['USD Price', `$${parseFloat(selectedBadge.price).toFixed(2)}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>{k}</span>
                  <strong style={{ color: '#001F54' }}>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>BENEFITS UNLOCKED</div>
                {getBenefits(selectedBadge).map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                    <Check size={12} color={selectedBadge.name?.toLowerCase() === 'vip' ? '#7C3AED' : getBadgeColor(selectedBadge.name)} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={closeConfirm} style={{ flex: 1, height: 48, borderRadius: 14, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePurchase} disabled={loading} style={{ flex: 2, height: 48, borderRadius: 14, background: selectedBadge.name?.toLowerCase() === 'vip' ? '#7C3AED' : C.orange, color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
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
