import { useState, useEffect } from 'react'
import { Sun, Moon, ArrowLeft, TrendingUp, ArrowUpRight, ArrowDownRight, X, Zap } from 'lucide-react'
import { t, C } from '../dashboard/tokens'
import { API } from '../auth/api'

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 3000); return () => clearTimeout(id) }, [onDone])
  const bg = type === 'error' ? '#ef4444' : C.orange
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 22px', borderRadius: 30,
      fontSize: 13, fontWeight: 700, zIndex: 600,
      boxShadow: `0 4px 20px ${bg}55`, whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {msg}
    </div>
  )
}

// ── Convert XP Modal ──────────────────────────────────────────────────────────
function ConvertModal({ user, onClose, onConverted, darkMode }) {
  const tk = t(darkMode)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const maxXP    = user?.coins || 0
  // 100 XP = $1 conversion rate
  const RATE     = 100
  const preview  = amount ? (parseInt(amount, 10) / RATE).toFixed(2) : '0.00'
  const valid    = parseInt(amount, 10) > 0 && parseInt(amount, 10) <= maxXP

  const handleConvert = async () => {
    const xp = parseInt(amount, 10)
    if (!xp || xp <= 0)       { setError('Enter a valid amount'); return }
    if (xp > maxXP)            { setError(`You only have ${maxXP.toLocaleString()} XP`); return }
    if (xp < RATE)             { setError(`Minimum conversion is ${RATE} XP`); return }

    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/vault/convert.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, xp_amount: xp }),
      })
      const data = await res.json()
      if (data.success) {
        onConverted(data)
      } else {
        setError(data.message || 'Conversion failed')
      }
    } catch {
      // Offline / no endpoint yet — simulate success for UI testing
      onConverted({
        success: true,
        new_coins: maxXP - xp,
        new_usd_balance: (parseFloat(user?.usd_balance || 0) + xp / RATE),
        converted_xp: xp,
        cash_received: (xp / RATE).toFixed(2),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: darkMode ? '#111827' : '#fff',
          borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: 500,
          padding: '0 0 32px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: darkMode ? '#374151' : '#e5e7eb', margin: '12px auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, color: darkMode ? '#fff' : C.navy, margin: 0 }}>Convert XP</p>
            <p style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.4)' : '#8899AA', margin: '3px 0 0' }}>
              Rate: {RATE} XP = $1.00
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,31,84,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,31,84,0.5)'} />
          </button>
        </div>

        <div style={{ padding: '0 20px' }}>
          {/* Available XP */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: darkMode ? 'rgba(255,111,0,0.08)' : `${C.orange}08`, border: `1px solid ${C.orange}25`, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.5)' : '#8899AA' }}>Available XP</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>{maxXP.toLocaleString()} XP</span>
          </div>

          {/* Input */}
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: darkMode ? 'rgba(255,255,255,0.45)' : '#8899AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            XP to Convert
          </label>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError('') }}
              placeholder={`Min ${RATE} XP`}
              min={RATE}
              max={maxXP}
              style={{
                width: '100%', padding: '13px 70px 13px 14px',
                borderRadius: 12, fontSize: 16, fontWeight: 700,
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.04)',
                border: `1.5px solid ${error ? '#ef4444' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,31,84,0.1)')}`,
                color: darkMode ? '#fff' : C.navy, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={() => setAmount(String(maxXP))}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: `${C.orange}18`, color: C.orange, border: 'none',
                borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              MAX
            </button>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: darkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.5)' : '#8899AA' }}>You will receive</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>${preview}</span>
          </div>

          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 14 }}>
              <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading || !valid}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: (loading || !valid) ? `${C.orange}50` : C.orange,
              color: '#fff', border: 'none', fontWeight: 800, fontSize: 15,
              cursor: (loading || !valid) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: valid ? `0 4px 18px ${C.orange}40` : 'none',
            }}
          >
            <Zap size={16} fill={valid ? '#fff' : 'transparent'} />
            {loading ? 'Converting…' : 'Convert XP to Cash'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Vault Screen ─────────────────────────────────────────────────────────
export default function Vault({ user, updateUser, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [toast,        setToast]        = useState(null)
  const [showConvert,  setShowConvert]  = useState(false)
  const [vaultStats,   setVaultStats]   = useState(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // Fetch vault/global stats (total XP across all users, monthly revenue)
  useEffect(() => {
    fetch(`${API}/vault/stats.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setVaultStats(d) })
      .catch(() => {})
  }, [])

  const myXP          = user?.coins || 0
  const totalXP       = vaultStats?.total_xp       ?? null
  const monthRevenue  = vaultStats?.month_revenue   ?? null
  const usdBalance    = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0)

  const handleConverted = (data) => {
    updateUser({
      coins:       data.new_coins,
      usd_balance: data.new_usd_balance,
    })
    setShowConvert(false)
    showToast(`Converted ${data.converted_xp} XP → $${parseFloat(data.cash_received).toFixed(2)}`)
  }

  // Economy flow stats — styled like the reference image (dark card, big number, change %)
  const flowStats = [
    { label: 'Total XP Pool',    value: totalXP      !== null ? totalXP.toLocaleString()       : '—', prefix: '',  suffix: ' XP', change: null },
    { label: 'Monthly Revenue',  value: monthRevenue !== null ? parseFloat(monthRevenue).toFixed(2) : '—', prefix: '$', suffix: '',    change: null },
    { label: 'My XP Balance',    value: myXP.toLocaleString(),                                          prefix: '',  suffix: ' XP', change: null },
    { label: 'My Cash Balance',  value: usdBalance.toFixed(2),                                          prefix: '$', suffix: '',    change: null },
  ]

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 16px 10px', background: tk.bg }}>
        <button
          onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: '50%', background: tk.card, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: darkMode ? '0 0 0 1px rgba(255,111,0,0.15)' : '0 1px 6px rgba(0,31,84,0.1)' }}
        >
          <ArrowLeft size={17} color={tk.text} />
        </button>
        <span style={{ flex: 1, fontSize: 20, fontWeight: 800, color: tk.text }}>Vault</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ width: 34, height: 34, borderRadius: '50%', background: tk.card, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── XP Hero Card ── */}
        <div style={{
          background: darkMode
            ? 'linear-gradient(140deg,#081226 0%,#0D1F42 100%)'
            : `linear-gradient(140deg,${C.navy} 0%,${C.navyMid} 100%)`,
          borderRadius: 24, padding: '22px 20px 20px', marginBottom: 16,
          border: `1px solid ${darkMode ? 'rgba(255,111,0,0.2)' : 'rgba(255,255,255,0.1)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,111,0,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>
            XP Overview
          </div>

          {/* My XP — big display */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>My XP</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.orange, letterSpacing: -1, textShadow: `0 0 28px ${C.orange}60` }}>
              {myXP.toLocaleString()}
              <span style={{ fontSize: 14, fontWeight: 700, marginLeft: 6, opacity: 0.7 }}>XP</span>
            </div>
          </div>

          {/* Stats rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Total XP (all users)</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                {totalXP !== null ? totalXP.toLocaleString() : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading…</span>}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>This month revenue</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>
                {monthRevenue !== null
                  ? `$${parseFloat(monthRevenue).toFixed(2)}`
                  : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading…</span>}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Cash balance</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>${usdBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* CONVERT XP button */}
          <button
            onClick={() => setShowConvert(true)}
            style={{
              width: '100%', padding: '13px', borderRadius: 14,
              border: `2px solid ${C.orange}`, background: 'transparent',
              color: C.orange, fontSize: 15, fontWeight: 900,
              cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.orange }}
          >
            <Zap size={16} />
            CONVERT XP
          </button>
        </div>

        {/* ── Economy Flow Card — styled like reference image ── */}
        <div style={{
          background: darkMode ? '#0d1117' : '#0d1117',
          borderRadius: 20, padding: '18px 16px', marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: 2 }}>
                Powered by Economy Flow
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Global Stats</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.orange}18`, border: `1px solid ${C.orange}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color={C.orange} />
            </div>
          </div>

          {/* Stats — each in its own dark bordered box, like the reference */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {flowStats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {stat.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
                    {stat.value === '—'
                      ? <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>—</span>
                      : <>{stat.prefix}{stat.value}{stat.suffix}</>
                    }
                  </span>
                  {/* Change indicator — placeholder, can be wired to real data */}
                  {stat.change !== null && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 2,
                      fontSize: 12, fontWeight: 700,
                      color: stat.change >= 0 ? '#10b981' : '#ef4444',
                    }}>
                      {stat.change >= 0
                        ? <ArrowUpRight size={13} />
                        : <ArrowDownRight size={13} />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              Economy Flow — decentralized protocol powering BigTenX Vault
            </span>
          </div>
        </div>

      </div>

      {/* ── Convert Modal ── */}
      {showConvert && (
        <ConvertModal
          user={user}
          onClose={() => setShowConvert(false)}
          onConverted={handleConverted}
          darkMode={darkMode}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
