// Vault.jsx — COMPLETE FIXED VERSION
// All issues addressed:
// 1. ✅ Min XP from admin settings (not hardcoded)
// 2. ✅ Auto-update price after buy/sell/contribute
// 3. ✅ Live transaction history refresh
// 4. ✅ Fixed 24h change calculation
// 5. ✅ Proper data refresh after all transactions
// 6. ✅ Fixed countdown to show actual days remaining
// 7. ✅ Fixed window logic to use countdown, not just day-of-month
// 8. ✅ Added my_earned from API
// 9. ✅ Display dist_day in UI
// 10. ✅ Fixed Distribution Pool overflow with formatCurrency()
// 11. ✅ Fixed Total Vault Value overflow with responsive font sizing
// 12. ✅ Transaction history now shows correctly

import { useState, useEffect } from 'react'
import {
  Sun, Moon, ArrowLeft, TrendingUp, Award, Clock,
  Plus, Minus, X, AlertCircle, Zap
} from 'lucide-react'
import { t, C } from '../dashboard/tokens'
import { API } from '../auth/api'

// ── Format currency with abbreviation ──────────────────────────────────
function formatCurrency(value) {
    if (!value || value === 0) return '$0.00';
    
    const absValue = Math.abs(value);
    if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    
    return `$${value.toFixed(2)}`;
}

// ── helpers ───────────────────────────────────────────────────────────────
function StatRow({ label, value, accent, tk }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
      <span style={{ fontSize: 13, color: tk.textMuted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: accent || tk.text }}>{value}</span>
    </div>
  )
}

function StatTile({ label, value, color, tk, darkMode }) {
  return (
    <div style={{ background: darkMode ? '#1C2A3A' : '#F1F5F9', border: `1px solid ${tk.cardBorder}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color || tk.text }}>{value}</div>
    </div>
  )
}

// ── VAULT TRANSACTION HISTORY ─────────────────────────────────────────────
function VaultTxHistory({ history, loading, darkMode, tk }) {
  if (loading) return (
    <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 24, marginTop: 14, textAlign: 'center', color: tk.textMuted, fontSize: 13 }}>
      Loading history...
    </div>
  )
  
  if (!history || history.length === 0) {
    return (
      <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 24, marginTop: 14, textAlign: 'center', color: tk.textMuted, fontSize: 13 }}>
        No vault transactions yet
      </div>
    )
  }
  
  return (
    <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 20, marginTop: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: tk.text, marginBottom: 16 }}>Transaction History</div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${tk.cardBorder}` }}>
              {['Type','Units','Price','Fee','Amount','Date'].map(h => (
                <th key={h} style={{ padding: '0 6px 10px', textAlign: h === 'Type' ? 'left' : 'right', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: tk.textMuted, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((tx, i) => {
              const isBuy   = tx.type === 'vault_buy'
              const isSell  = tx.type === 'vault_sell'
              const n       = tx.notes_parsed || {}
              const units   = n.quantity  ?? n.units ?? '—'
              const price   = n.unit_price ? `$${parseFloat(n.unit_price).toFixed(2)}`  : '—'
              const fee     = n.fee        ? `$${parseFloat(n.fee).toFixed(2)}`          : '—'
              const amount  = parseFloat(tx.amount || 0)
              const dateStr = tx.created_at
                ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) + ' ' +
                  new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                : '—'
              const typeColor = isBuy ? '#f7931e' : '#16a34a'
              const typeBg    = isBuy ? 'rgba(247,147,30,0.12)' : 'rgba(22,163,74,0.12)'
              
              // For sell transactions, the amount in wallet_transactions is the net payout
              const displayAmount = isSell ? amount : amount
              
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${tk.cardBorder}` }}>
                  <td style={{ padding: '13px 6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: typeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isBuy
                          ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={typeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={typeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>
                        }
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 12, color: typeColor }}>{isBuy ? 'BUY' : 'SELL'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 6px', textAlign: 'right', color: tk.text, fontVariantNumeric: 'tabular-nums' }}>{units}</td>
                  <td style={{ padding: '13px 6px', textAlign: 'right', color: tk.text, fontVariantNumeric: 'tabular-nums' }}>{price}</td>
                  <td style={{ padding: '13px 6px', textAlign: 'right', color: tk.textMuted, fontVariantNumeric: 'tabular-nums' }}>{fee}</td>
                  <td style={{ padding: '13px 6px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isBuy ? '#f7931e' : '#16a34a' }}>
                    {isBuy ? '-' : '+'}${displayAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '13px 6px', textAlign: 'right', color: tk.textMuted, fontSize: 11, whiteSpace: 'nowrap' }}>{dateStr}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── TOP-LEVEL MODAL ──────────────────────────────────────────────────────
function VaultModal({ title, onClose, children, tk }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: tk.card, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, padding: '0 0 32px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: tk.cardBorder, margin: '14px auto 0' }} />
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tk.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: tk.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color={tk.textMuted} /></button>
        </div>
        <div style={{ padding: '20px 20px 0' }}>{children}</div>
      </div>
    </div>
  )
}

export default function VaultPage({ user, updateUser, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const coins = parseInt(user?.coins ?? 0)

  // ── pool data from API ─────────────────────────────────────────────────
  const [poolData, setPoolData]       = useState(null)
  const [loadingPool, setLoadingPool] = useState(true)

  // ── contribution state ────────────────────────────────────────────────
  const [showContribModal, setShowContribModal] = useState(false)
  const [contribAmount, setContribAmount]       = useState('')
  const [contribLoading, setContribLoading]     = useState(false)
  const [myContribution, setMyContribution]     = useState(0)

  // ── vault unit state ──────────────────────────────────────────────────
  const [myUnits, setMyUnits]         = useState(0)
  const [basicLimit, setBasicLimit]   = useState(2)
  const [txFee, setTxFee]             = useState(2)
  const [showBuyModal, setShowBuyModal]   = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [buyQty, setBuyQty]   = useState(1)
  const [sellQty, setSellQty] = useState(1)
  const [unitLoading, setUnitLoading] = useState(false)

  // ── vault transaction history ─────────────────────────────────────────
  const [vaultHistory, setVaultHistory]       = useState([])
  const [loadingHistory, setLoadingHistory]   = useState(false)
  const [prevVaultValue, setPrevVaultValue]   = useState(null)

  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── countdown ──────────────────────────────────────────────────────────
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [timeLeft, setTimeLeft]         = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const t = setInterval(() => setTotalSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setTimeLeft({
      days:    Math.floor(totalSeconds / 86400),
      hours:   Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    })
  }, [totalSeconds])

  const formatCountdown = () => {
    if (totalSeconds <= 0) return 'Closed'
    const { days, hours, minutes, seconds } = timeLeft
    return `${days}d ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
  }

  const isWindowOpen = totalSeconds > 0

  // ── Update countdown properly ──────────────────────────────────────────
  const updateCountdown = (closeDay) => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), closeDay, 23, 59, 59)
    const diff = Math.max(0, Math.floor((end - now) / 1000))
    setTotalSeconds(diff)
  }

  // ── REFRESH USER-SPECIFIC DATA ────────────────────────────────────────
  const refreshUserData = async () => {
    // Refresh user stats
    if (user?.id) {
      try {
        const res = await fetch(`${API}/vault/user_stats.php?user_id=${user.id}`)
        const data = await res.json()
        if (data.success) {
          setMyContribution(parseFloat(data.my_contribution ?? 0))
          setMyUnits(parseInt(data.my_units ?? 0))
          setBasicLimit(parseInt(data.basic_limit ?? 2))
          setTxFee(parseFloat(data.tx_fee ?? 2))
        }
      } catch (e) { console.error('Refresh user stats error:', e) }
    }

    // Refresh transaction history
    if (user?.id) {
      setLoadingHistory(true)
      try {
        const res = await fetch(`${API}/vault/vault_history.php?user_id=${user.id}`)
        const data = await res.json()
        if (data.success) {
          setVaultHistory(data.transactions || [])
        } else {
          // If no transactions table yet, just set empty array
          setVaultHistory([])
        }
      } catch (e) { 
        console.error('Refresh history error:', e)
        setVaultHistory([])
      }
      finally { setLoadingHistory(false) }
    }

    // Refresh 24h change
    try {
      const res = await fetch(`${API}/vault/stats.php?prev=1&user_id=${user?.id || 0}`)
      const data = await res.json()
      if (data.success && data.prev_total_value != null) {
        setPrevVaultValue(data.prev_total_value)
      }
    } catch (e) { console.error('Refresh prev value error:', e) }
  }

  // ── REFRESH ALL DATA ──────────────────────────────────────────────────
  const refreshAllData = async () => {
    // Refresh pool stats with user_id for my_earned
    try {
      const res = await fetch(`${API}/vault/stats.php?user_id=${user?.id || 0}`)
      const data = await res.json()
      if (data.success) {
        setPoolData(data)
        updateCountdown(data.settings?.close_day || 25)
      }
    } catch (e) { console.error('Refresh pool stats error:', e) }

    // Refresh user-specific data
    await refreshUserData()
  }

  // ── load initial data ─────────────────────────────────────────────────
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingPool(true)
      try {
        // Load pool stats with user_id for my_earned
        const poolRes = await fetch(`${API}/vault/stats.php?user_id=${user?.id || 0}`)
        const poolData = await poolRes.json()
        if (poolData.success) {
          setPoolData(poolData)
          updateCountdown(poolData.settings?.close_day || 25)
        }
      } catch (e) { console.error('Load pool error:', e) }

      // Load user stats
      if (user?.id) {
        try {
          const userRes = await fetch(`${API}/vault/user_stats.php?user_id=${user.id}`)
          const userData = await userRes.json()
          if (userData.success) {
            setMyContribution(parseFloat(userData.my_contribution ?? 0))
            setMyUnits(parseInt(userData.my_units ?? 0))
            setBasicLimit(parseInt(userData.basic_limit ?? 2))
            setTxFee(parseFloat(userData.tx_fee ?? 2))
          }
        } catch (e) { console.error('Load user stats error:', e) }

        // Load history
        setLoadingHistory(true)
        try {
          const histRes = await fetch(`${API}/vault/vault_history.php?user_id=${user.id}`)
          const histData = await histRes.json()
          if (histData.success) {
            setVaultHistory(histData.transactions || [])
          } else {
            setVaultHistory([])
          }
        } catch (e) { 
          console.error('Load history error:', e)
          setVaultHistory([])
        }
        finally { setLoadingHistory(false) }

        // Load 24h change
        try {
          const prevRes = await fetch(`${API}/vault/stats.php?prev=1&user_id=${user.id}`)
          const prevData = await prevRes.json()
          if (prevData.success && prevData.prev_total_value != null) {
            setPrevVaultValue(prevData.prev_total_value)
          }
        } catch (e) { console.error('Load prev value error:', e) }
      }
      setLoadingPool(false)
    }

    loadInitialData()
  }, [user?.id])

  // ── Derived data ──────────────────────────────────────────────────────
  const totalXP      = poolData?.total_xp      ?? 0
  const distPool     = poolData?.month_revenue  ?? 0
  const unitPrice    = poolData?.unit_price     ?? 15
  const totalUnits   = poolData?.total_units    ?? 0
  const minContribution = poolData?.settings?.min_xp ?? 250
  const distDay      = poolData?.settings?.dist_day ?? 28
  const myEarned     = poolData?.my_earned ?? 0

  // ── contribute XP ─────────────────────────────────────────────────────
  const handleContribute = async () => {
    const amt = parseInt(contribAmount)
    if (!amt || amt < minContribution) { 
      showToast(`Minimum contribution is ${minContribution} XP`, 'error'); 
      return 
    }
    if (amt > coins) { showToast('Insufficient XP balance', 'error'); return }
    setContribLoading(true)
    try {
      const res = await fetch(`${API}/vault/contribute.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount: amt }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ coins: data.new_coins || coins - amt })
        setMyContribution(data.my_contribution || (c => c + amt))
        showToast(`Contributed ${amt} XP successfully`)
        setShowContribModal(false)
        setContribAmount('')
        
        // Use returned updated_pool data
        if (data.updated_pool) {
          setPoolData({
            ...poolData,
            ...data.updated_pool
          })
        }
        
        // Refresh user-specific data
        await refreshUserData()
      } else {
        showToast(data.message || 'Contribution failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setContribLoading(false)
    }
  }

  // ── buy units ─────────────────────────────────────────────────────────
  const handleBuyUnits = async () => {
    const qty  = parseInt(buyQty) || 1
    const cost = qty * unitPrice * (1 + (txFee / 100))
    const bal  = parseFloat(user?.usd_balance ?? 0)
    if (cost > bal) { showToast('Insufficient wallet balance', 'error'); return }
    setUnitLoading(true)
    try {
      const res = await fetch(`${API}/vault/buy_unit.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, quantity: qty }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ usd_balance: parseFloat(data.new_balance), usdBalance: parseFloat(data.new_balance) })
        showToast(`Bought ${qty} unit${qty > 1 ? 's' : ''}`)
        setShowBuyModal(false)
        setBuyQty(1)
        await refreshAllData()
      } else {
        showToast(data.message || 'Purchase failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setUnitLoading(false)
    }
  }

  // ── sell units ────────────────────────────────────────────────────────
  const handleSellUnits = async () => {
    const qty = parseInt(sellQty) || 1
    if (qty > myUnits) { showToast('You do not have that many units', 'error'); return }
    setUnitLoading(true)
    try {
      const res = await fetch(`${API}/vault/sell_unit.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, quantity: qty }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ usd_balance: parseFloat(data.new_balance), usdBalance: parseFloat(data.new_balance) })
        showToast(`Sold ${qty} unit${qty > 1 ? 's' : ''}`)
        setShowSellModal(false)
        setSellQty(1)
        await refreshAllData()
      } else {
        showToast(data.message || 'Sale failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setUnitLoading(false)
    }
  }

  // ── badge check ──────────────────────────────────────────────────────
  const ownedBadges    = user?.owned_badges ?? []
  const badgeName      = user?.current_badge || null
  const hasBadge       = Boolean(badgeName) || ownedBadges.length > 0
  const vipActive      = user?.vip_active === 1 || user?.vip_active === true || user?.vip_active === '1'
  const REQUIRED_ALL   = ['bronze','silver','gold','diamond']
  const hasAllBadges   = REQUIRED_ALL.every(b => ownedBadges.map(x => x.toLowerCase()).includes(b)) && vipActive
  const maxUnits       = hasAllBadges ? 999 : hasBadge ? basicLimit : 0
  const canBuyMore     = myUnits < maxUnits
  const canBuyQty      = Math.max(0, maxUnits - myUnits)
  const vaultStatus    = hasAllBadges ? 'Unlimited' : hasBadge ? `Basic (max ${basicLimit})` : 'No badge'

  // ── fee/cost helpers ──────────────────────────────────────────────────
  const feeRate     = txFee / 100
  const buyCost     = (qty) => parseFloat((qty * unitPrice * (1 + feeRate)).toFixed(2))
  const buyFee      = (qty) => parseFloat((qty * unitPrice * feeRate).toFixed(2))
  const sellNet     = (qty) => parseFloat((qty * unitPrice * (1 - feeRate)).toFixed(2))
  const sellFeeAmt  = (qty) => parseFloat((qty * unitPrice * feeRate).toFixed(2))

  // ── 24h change ────────────────────────────────────────────────────────
  const currentVaultValue = totalUnits * unitPrice
  const vaultChange24h    = prevVaultValue != null ? currentVaultValue - prevVaultValue : null
  const vaultChangePct    = (prevVaultValue != null && prevVaultValue > 0)
    ? ((vaultChange24h / prevVaultValue) * 100).toFixed(2)
    : null
  const changePositive    = vaultChange24h != null && vaultChange24h >= 0

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#EF4444' : '#10b981', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 700, zIndex: 2000, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 12px', background: tk.bg, borderBottom: `1px solid ${tk.cardBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1px solid ${tk.cardBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={18} color={tk.text} />
            </button>
          )}
          <h1 style={{ fontSize: 20, fontWeight: 700, color: tk.text }}>Vault</h1>
        </div>
        <button onClick={() => setDarkMode?.(!darkMode)} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1px solid ${tk.cardBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px 20px' }}>

        {/* ── Your Contribution section ── */}
        <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 18, marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: tk.textMuted, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={14} color={C.orange} />
            XP Overview
          </div>

          <StatRow label="Your Contribution" value={`${myContribution.toLocaleString()} XP`} accent={C.orange} tk={tk} />
          <StatRow label="Total Contributions" value={`${totalXP.toLocaleString()} XP`} tk={tk} />
          <StatRow 
            label="Distribution Pool" 
            value={distPool > 0 ? formatCurrency(distPool) : '—'} 
            tk={tk} 
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: tk.textMuted }}>Contribution Ends In</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, background: darkMode ? '#1C2A3A' : '#E2E8F0', padding: '3px 9px', borderRadius: 20, border: `1px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} color={C.orange} />
              {formatCountdown()}
            </span>
          </div>

          {isWindowOpen ? (
            <button
              onClick={() => setShowContribModal(true)}
              style={{ width: '100%', marginTop: 14, padding: 14, borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${C.orange}, #E65C00)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 24px ${C.orange}35` }}>
              <Zap size={16} />
              Contribute XP
            </button>
          ) : (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: myEarned > 0 ? 'rgba(16,185,129,0.1)' : (darkMode ? '#1C2A3A' : '#F1F5F9'), border: `1px solid ${myEarned > 0 ? '#10b98130' : tk.cardBorder}`, textAlign: 'center' }}>
              {myEarned > 0 ? (
                <div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>You earned this cycle</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>${parseFloat(myEarned).toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 4 }}>
                    Opens again on the 1st • Distributions on the {distDay}th
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tk.textMuted }}>Contribution window closed</div>
                  <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 3 }}>
                    Opens again on the 1st of next month • Distributions on the {distDay}th
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Vault Units section ── */}
        <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 18, marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: tk.textMuted, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color={C.orange} />
            Vault Units
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <StatTile label="My Units"      value={myUnits}              color={C.orange} tk={tk} darkMode={darkMode} />
            <StatTile label="Ecosystem Units" value={totalUnits.toLocaleString()} tk={tk} darkMode={darkMode} />
            <StatTile label="Unit Price"    value={`$${unitPrice.toFixed(2)}`}      color={C.orange} tk={tk} darkMode={darkMode} />
            <StatTile label="Vault Status"  value={vaultStatus}          tk={tk} darkMode={darkMode} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            <button onClick={() => { if (!canBuyMore) { showToast(hasBadge ? `Limit reached (${basicLimit} max). Upgrade to unlimited.` : 'Buy a badge first', 'error'); return } setShowBuyModal(true) }} style={{ padding: 13, borderRadius: 14, border: 'none', background: !canBuyMore ? (darkMode ? '#1C2A3A' : '#E2E8F0') : `linear-gradient(135deg, ${C.orange}, #E65C00)`, color: !canBuyMore ? tk.textMuted : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Plus size={15} /> Buy
            </button>
            <button onClick={() => setShowSellModal(true)} disabled={myUnits === 0} style={{ padding: 13, borderRadius: 14, border: `1px solid ${tk.cardBorder}`, background: darkMode ? '#1C2A3A' : '#E2E8F0', color: myUnits === 0 ? tk.textMuted : tk.text, fontSize: 13, fontWeight: 700, cursor: myUnits === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Minus size={15} /> Sell
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: tk.textMuted, fontWeight: 500 }}>2% fee applies on all transactions</div>
        </div>

        {/* ── Total Vault Value card ── */}
        <div style={{ 
          background: darkMode ? 'linear-gradient(135deg,#162032,#0f1e30)' : 'linear-gradient(135deg,#1e293b,#0f172a)', 
          border: `1px solid ${C.orange}40`, 
          borderRadius: 18, 
          padding: 18, 
          marginTop: 14 
        }}>
          <div style={{ fontSize: 11, color: '#4B6080', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
            Total Vault Value
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ 
              fontSize: currentVaultValue >= 1000000 ? 22 : currentVaultValue >= 1000 ? 26 : 36, 
              fontWeight: 800, 
              color: '#F1F5F9', 
              letterSpacing: '-0.01em',
              wordBreak: 'break-all',
              maxWidth: '100%'
            }}>
              ${currentVaultValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {vaultChange24h != null && (
              <div style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 5,
                background: changePositive ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)',
                color: changePositive ? '#22c55e' : '#ef4444',
                fontWeight: 700, 
                fontSize: 13, 
                padding: '7px 13px', 
                borderRadius: 999,
                whiteSpace: 'nowrap', 
                border: `1px solid ${changePositive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                flexShrink: 0
              }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                  {changePositive
                    ? <polygon points="12,4 20,18 4,18" />
                    : <polygon points="12,20 20,6 4,6" />
                  }
                </svg>
                {changePositive ? '' : '-'}
                {Math.abs(vaultChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {' '}({Math.abs(parseFloat(vaultChangePct)).toFixed(2)}%) 24h
              </div>
            )}
          </div>
        </div>

        {/* ── Vault Transaction History ── */}
        <VaultTxHistory history={vaultHistory} loading={loadingHistory} darkMode={darkMode} tk={tk} />

      </div>

      {/* ── CONTRIBUTE XP MODAL ── */}
      {showContribModal && (
        <VaultModal title="Contribute XP" onClose={() => { setShowContribModal(false); setContribAmount('') }} tk={tk}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: tk.textMuted, fontWeight: 600 }}>Your XP Balance</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>{coins.toLocaleString()} XP</span>
                <button onClick={() => setContribAmount(String(coins))} style={{ padding: '3px 10px', borderRadius: 8, background: `${C.orange}15`, border: `1px solid ${C.orange}30`, color: C.orange, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>MAX</button>
              </div>
            </div>
            <input
              type="number"
              value={contribAmount}
              onChange={e => setContribAmount(e.target.value)}
              placeholder={`Enter XP amount (min. ${minContribution})`}
              style={{
                width: '100%', padding: '13px 15px', borderRadius: 13,
                border: `1.5px solid ${contribAmount && parseInt(contribAmount) < minContribution ? '#EF4444' : tk.cardBorder}`,
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#F7F8FC',
                color: tk.text, fontSize: 15, fontFamily: 'Sora, system-ui, sans-serif',
                outline: 'none', boxSizing: 'border-box',
                WebkitTextFillColor: tk.text, colorScheme: darkMode ? 'dark' : 'light',
              }}
            />
            {contribAmount && parseInt(contribAmount) < minContribution && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: '#EF4444' }}>
                <AlertCircle size={12} /> Minimum contribution is {minContribution} XP
              </div>
            )}
            {contribAmount && parseInt(contribAmount) > coins && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: '#EF4444' }}>
                <AlertCircle size={12} /> Exceeds your XP balance
              </div>
            )}
            <div style={{ marginTop: 10, padding: '10px 12px', background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC', borderRadius: 10, fontSize: 11, color: tk.textMuted, lineHeight: 1.6 }}>
              XP is non-withdrawable and burned after distribution.
            </div>
          </div>
          <button
            onClick={handleContribute}
            disabled={contribLoading || !contribAmount || parseInt(contribAmount) < minContribution || parseInt(contribAmount) > coins}
            style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: (!contribAmount || parseInt(contribAmount) < minContribution || parseInt(contribAmount) > coins)
                ? (darkMode ? '#1C2A3A' : '#E2E8F0')
                : C.orange,
              color: (!contribAmount || parseInt(contribAmount) < minContribution || parseInt(contribAmount) > coins)
                ? tk.textMuted : '#fff',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              opacity: contribLoading ? 0.7 : 1, fontFamily: 'inherit',
            }}>
            {contribLoading ? 'Contributing...' : `Contribute ${parseInt(contribAmount) > 0 ? parseInt(contribAmount).toLocaleString() : ''} XP`}
          </button>
        </VaultModal>
      )}

      {/* ── BUY UNITS MODAL ── */}
      {showBuyModal && (
        <VaultModal title="Buy Vault Units" onClose={() => { setShowBuyModal(false); setBuyQty(1) }} tk={tk}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: tk.textMuted }}>Unit price</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tk.text }}>${unitPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: tk.textMuted }}>Fee ({txFee}%)</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>+${buyFee(buyQty).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${tk.cardBorder}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>Total cost</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.orange }}>${buyCost(buyQty).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setBuyQty(q => Math.max(1, q - 1))}
                style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${tk.cardBorder}`, background: tk.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={16} color={tk.text} />
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 900, color: tk.text }}>{buyQty}</div>
              <button
                onClick={() => setBuyQty(q => Math.min(canBuyQty, q + 1))}
                disabled={buyQty >= canBuyQty}
                style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${tk.cardBorder}`, background: tk.card, cursor: buyQty >= canBuyQty ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: buyQty >= canBuyQty ? 0.4 : 1 }}>
                <Plus size={16} color={tk.text} />
              </button>
              {canBuyQty > 1 && (
                <button
                  onClick={() => setBuyQty(canBuyQty)}
                  style={{ padding: '6px 12px', borderRadius: 8, background: `${C.orange}15`, border: `1px solid ${C.orange}30`, color: C.orange, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  MAX
                </button>
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: tk.textMuted }}>
              You can buy up to {canBuyQty} more unit{canBuyQty !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={handleBuyUnits}
            disabled={unitLoading || buyCost(buyQty) > parseFloat(user?.usd_balance ?? 0)}
            style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: buyCost(buyQty) > parseFloat(user?.usd_balance ?? 0) ? (darkMode ? '#1C2A3A' : '#E2E8F0') : C.orange, color: buyCost(buyQty) > parseFloat(user?.usd_balance ?? 0) ? tk.textMuted : '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: unitLoading ? 0.7 : 1, fontFamily: 'inherit' }}>
            {unitLoading ? 'Buying...' : buyCost(buyQty) > parseFloat(user?.usd_balance ?? 0) ? 'Insufficient balance' : `Buy ${buyQty} Unit${buyQty > 1 ? 's' : ''}`}
          </button>
        </VaultModal>
      )}

      {/* ── SELL UNITS MODAL ── */}
      {showSellModal && (
        <VaultModal title="Sell Vault Units" onClose={() => { setShowSellModal(false); setSellQty(1) }} tk={tk}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: tk.textMuted }}>Gross value</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tk.text }}>${(sellQty * unitPrice).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: tk.textMuted }}>Fee ({txFee}% deducted)</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>-${sellFeeAmt(sellQty).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${tk.cardBorder}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>You receive</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981' }}>${sellNet(sellQty).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: 8, fontSize: 12, color: tk.textMuted }}>
              You own <strong style={{ color: tk.text }}>{myUnits}</strong> unit{myUnits !== 1 ? 's' : ''}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSellQty(q => Math.max(1, q - 1))}
                style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${tk.cardBorder}`, background: tk.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={16} color={tk.text} />
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 900, color: tk.text }}>{sellQty}</div>
              <button
                onClick={() => setSellQty(q => Math.min(myUnits, q + 1))}
                disabled={sellQty >= myUnits}
                style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${tk.cardBorder}`, background: tk.card, cursor: sellQty >= myUnits ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sellQty >= myUnits ? 0.4 : 1 }}>
                <Plus size={16} color={tk.text} />
              </button>
              {myUnits > 1 && (
                <button
                  onClick={() => setSellQty(myUnits)}
                  style={{ padding: '6px 12px', borderRadius: 8, background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                  ALL
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleSellUnits}
            disabled={unitLoading}
            style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: unitLoading ? 0.7 : 1, fontFamily: 'inherit' }}>
            {unitLoading ? 'Selling...' : `Sell ${sellQty} Unit${sellQty > 1 ? 's' : ''}`}
          </button>
        </VaultModal>
      )}
    </div>
  )
}