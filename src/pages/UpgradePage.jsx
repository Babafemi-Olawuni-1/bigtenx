// UpgradePage.jsx - PROFESSIONAL SAAS REDESIGN (EMOJI-FREE)
import { useState, useEffect } from 'react'
import { t, C } from '../dashboard/tokens'
import { Sun, Moon, ArrowLeft, Check, Shield, Zap, Coins, Award } from 'lucide-react'
import { API } from '../auth/api'

export default function UpgradePage({ user, darkMode, setDarkMode, onClose, onUpgrade }) {
  const tk = t(darkMode)

  // ─── STANDARD BALANCES ──────────────────────────────────────────
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0);
  const coinsCount = parseInt(user?.coins ?? 0);

  const [toast, setToast] = useState(null)
  const [badges, setBadges] = useState([])
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [liveRate, setLiveRate] = useState(1587.00)

  // Pre-payment confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAnimate, setConfirmAnimate] = useState(false)

  // Fetch live USD/NGN rate
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d?.rates?.NGN) setLiveRate(parseFloat(d.rates.NGN)) })
      .catch(() => setLiveRate(1587))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBadges = async () => {
    try {
      const url = `${API}/badges/list.php?user_id=${user?.id}`
      const res = await fetch(url)
      const data = await res.json()

      if (data?.success && Array.isArray(data?.badges)) {
        setBadges(data.badges)
      }
    } catch (error) {
      console.log(error)
      showToast('Failed to load levels', 'error')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  // Find highest owned badge
  const highestBadge = badges.length > 0 && badges.filter(b => b.owned).length > 0
    ? badges.filter(b => b.owned).reduce((a, b) => parseFloat(a.xp_multiplier) > parseFloat(b.xp_multiplier) ? a : b)
    : null

  const getBadgeColor = (name) => {
    switch (name.toLowerCase()) {
      case 'bronze': return '#CD7F32'
      case 'silver': return '#94A3B8'
      case 'gold': return '#EAB308'
      case 'diamond': return '#2563EB'
      case 'vip': return '#7C3AED'
      default: return C.orange
    }
  }

  const handleOpenConfirm = (badge) => {
    setSelectedBadge(badge)
    setShowConfirmModal(true)
    setTimeout(() => {
      setConfirmAnimate(true)
    }, 10)
  }

  const handleCloseConfirm = () => {
    setConfirmAnimate(false)
    setTimeout(() => {
      setShowConfirmModal(false)
    }, 300)
  }

  const handlePurchase = async () => {
    if (!selectedBadge || selectedBadge.owned) return
    setLoading(true)

    try {
      const res = await fetch(`${API}/badges/purchase.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          badge_id: selectedBadge?.id
        })
      })

      const data = await res.json()

      if (data.success) {
        showToast(data.message, 'success')
        handleCloseConfirm()
        await fetchBadges()
        if (onUpgrade) onUpgrade()
      } else {
        showToast(data.message, 'error')
        handleCloseConfirm()
      }
    } catch (error) {
      showToast('Network error occurred', 'error')
      handleCloseConfirm()
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{
        background: tk.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tk.textMuted
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, fontWeight: 600 }}>Loading packages...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ─── STYLING OBJECTS ─────────────────────────────────────────────
  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    opacity: confirmAnimate ? 1 : 0,
    transition: 'opacity 0.25s ease-out',
    paddingTop: '60px',
    boxSizing: 'border-box',
  };

  const modalStyle = {
    background: '#ffffff',
    borderRadius: 30,
    width: '90%',
    maxWidth: 400,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transform: confirmAnimate ? 'translateY(0)' : 'translateY(-100px)',
    opacity: confirmAnimate ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: tk.bg,
        borderBottom: `1px solid ${tk.cardBorder}`
      }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <ArrowLeft size={18} color={tk.text} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: tk.text, letterSpacing: '-0.3px' }}>
            Account Upgrades
          </div>
          <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 2, fontWeight: 500 }}>
            Boost your task rewards and vault capacity
          </div>
        </div>

        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          {darkMode ? <Sun size={18} color={tk.text} /> : <Moon size={18} color={tk.text} />}
        </button>
      </div>

      {/* Active Plan Card */}
      <div style={{ padding: '20px 16px 10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #001F54 0%, #00327A 100%)',
          borderRadius: 20,
          padding: '18px 20px',
          boxShadow: '0 8px 20px rgba(0,31,84,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Earning Multiplier</span>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '4px 0 0' }}>
                {highestBadge ? `${highestBadge.xp_multiplier}x` : '1.0x'}
              </h2>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: 30,
            }}>
              <span style={{ fontSize: 11, color: '#FF8F00', fontWeight: 800 }}>
                {highestBadge ? `${highestBadge.name} Earning` : 'Basic Earning'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SaaS Card Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px'
      }}>
        {Array.isArray(badges) && badges.map((badge) => {
          const isVip = badge.name.toLowerCase() === 'vip'
          const isOwned = badge.owned
          const badgeColor = getBadgeColor(badge.name)

          // Determine if this is the highest owned badge (= CURRENT PLAN)
          const ownedBadges = Array.isArray(badges) ? badges.filter(b => b.owned) : []
          const highestOwnedId = ownedBadges.length > 0
            ? ownedBadges.reduce((a, b) =>
                parseFloat(a.xp_multiplier) >= parseFloat(b.xp_multiplier) ? a : b
              ).id
            : null
          const isCurrentPlan = isOwned && badge.id === highestOwnedId
          const isPreviouslyOwned = isOwned && badge.id !== highestOwnedId

          // Custom benefits listing
          const benefits = isVip 
            ? [
                '20% XP speed',
                'VIP badge',
                '$1 sponsor bonus'
              ]
            : [
                `${badge.name} Badge`,
                `${badge.xp_multiplier}x Earning Multiplier`,
                `${badge.referral_percent}% Referral Commission`,
                `${badge.vault_units || 1} Vault Capacity Unit${(badge.vault_units || 1) > 1 ? 's' : ''}`
              ];

          return (
            <div
              key={badge.id}
              style={{
                background: tk.card,
                borderRadius: 24,
                padding: '24px',
                border: isOwned
                  ? `2px solid ${badgeColor}`
                  : `1.5px solid ${tk.cardBorder}`,
                boxShadow: isOwned ? `0 10px 30px -10px ${badgeColor}25` : '0 4px 20px rgba(0,0,0,0.01)',
                position: 'relative',
              }}
            >
              {/* Top Tag */}
              {isCurrentPlan && (
                <div style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#10B981',
                  background: 'rgba(16,185,129,0.1)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  letterSpacing: '0.04em'
                }}>
                  CURRENT PLAN
                </div>
              )}
              {isPreviouslyOwned && (
                <div style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#64748B',
                  background: 'rgba(100,116,139,0.1)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  letterSpacing: '0.04em'
                }}>
                  OWNED
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: badgeColor }}>
                  {badge.name}
                </span>
                {isVip && <Shield size={16} color={badgeColor} />}
              </div>

              {/* Pricing section */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: tk.text }}>
                  ${parseFloat(badge.price).toFixed(2)}
                </span>
              </div>

              {/* Benefits list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                borderTop: `1.5px solid ${tk.cardBorder}`,
                paddingTop: 16,
                marginBottom: 20
              }}>
                {benefits.map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: tk.text, fontWeight: 555 }}>
                    <Check size={14} color={badgeColor} style={{ flexShrink: 0 }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                disabled={isOwned || loading}
                onClick={() => handleOpenConfirm(badge)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  border: 'none',
                  background: isOwned ? (darkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9') : badgeColor,
                  color: isOwned ? tk.textMuted : '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: isOwned ? 'not-allowed' : 'pointer',
                  opacity: isOwned ? 0.7 : 1,
                  transition: 'all 0.15s',
                  boxShadow: !isOwned ? `0 4px 14px ${badgeColor}33` : 'none',
                  fontFamily: 'inherit'
                }}
              >
                {isCurrentPlan ? 'Current Plan' : isPreviouslyOwned ? 'Owned' : `Upgrade to ${badge.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && selectedBadge && (
        <div className="wallet-modal-overlay" style={backdropStyle} onClick={handleCloseConfirm}>
          <div className="wallet-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div className="wallet-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <button onClick={handleCloseConfirm} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54', margin: 0 }}>Confirm Upgrade</h3>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Theme</button>
            </div>

            <div className="wallet-summary-card" style={{ background: '#F1F5F9', borderRadius: 22, padding: 24, margin: '20px 24px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Upgrade Price</span>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#001F54', margin: '8px 0', letterSpacing: '-0.02em' }}>
                ₦{(parseFloat(selectedBadge.price) * liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h1>
              <small style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, display: 'block' }}>System Rate: 1 USD = ₦1,373.60</small>
            </div>

            <div className="wallet-details-card" style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '20px 20px 8px', margin: '0 24px 24px' }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: '#FF6F00', letterSpacing: '0.08em', margin: '0 0 16px', textTransform: 'uppercase' }}>PLAN DETAILS</h4>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Selected Plan</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>{selectedBadge.name}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>USD Price</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>${parseFloat(selectedBadge.price).toFixed(2)}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>NGN Price</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>₦{(parseFloat(selectedBadge.price) * liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#FF6F00', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>BENEFITS UNLOCKED</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {(selectedBadge.name.toLowerCase() === 'vip' 
                    ? ['20% XP speed boost', 'VIP identification badge', '$1 sponsor VIP reward']
                    : [
                        `${selectedBadge.xp_multiplier}x multiplier on tasks`,
                        `${selectedBadge.referral_percent}% commission on level purchases`,
                        `${selectedBadge.vault_units || 1} vault capacity upgrade units`
                      ]
                  ).map((benefit, bidx) => (
                    <div key={bidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', fontWeight: 550 }}>
                      <Check size={11} color={getBadgeColor(selectedBadge.name)} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={handleCloseConfirm} style={{
                flex: 1, height: 48, borderRadius: 14, border: '1.5px solid #E2E8F0', background: '#fff',
                color: '#64748B', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                Cancel
              </button>
              <button onClick={handlePurchase} disabled={loading} style={{
                flex: 2, height: 48, borderRadius: 14, background: '#FF6F00', color: '#fff', border: 'none',
                fontWeight: 800, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(255,111,0,0.2)', fontFamily: 'inherit'
              }}>
                {loading ? 'Upgrading...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#fff',
          padding: '10px 22px',
          borderRadius: 50,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: `0 4px 16px ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          zIndex: 9999
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

