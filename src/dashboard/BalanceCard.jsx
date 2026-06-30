// BalanceCard.jsx — correct multiplier logic: badge base × 1.2 VIP boost
import { TrendingUp, Crown, Award } from 'lucide-react'
import { C } from './tokens'

// Canonical badge multipliers
const BADGE_MULTIPLIERS = { bronze: 1.0, silver: 1.2, gold: 1.5, diamond: 2.0 }

function computeMultiplier(badgeName, vipActive) {
  const base = BADGE_MULTIPLIERS[(badgeName || '').toLowerCase()] ?? 1.0
  return vipActive ? parseFloat((base * 1.2).toFixed(2)) : base
}

export default function BalanceCard({ user, onFund, onWithdraw }) {
  const handleFund     = onFund     || (() => {})
  const handleWithdraw = onWithdraw || (() => {})

  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0)
  const coins      = parseInt(user?.coins ?? 0)
  const todayXP    = parseFloat(user?.today_earnings ?? 0)
  const todayCash  = parseFloat(user?.today_earnings_cash ?? 0)
  const badgeName  = user?.current_badge || null
  const vipActive  = user?.vip_active === 1 || user?.vip_active === true || user?.vip_active === '1'
  const multiplier = computeMultiplier(badgeName, vipActive)

  // Today's earnings: "+52 XP | +$5.00" format
  let todayLabel = ''
  if (todayXP > 0 && todayCash > 0) {
    todayLabel = `+${todayXP} XP | +$${todayCash.toFixed(2)}`
  } else if (todayXP > 0) {
    todayLabel = `+${todayXP} XP`
  } else if (todayCash > 0) {
    todayLabel = `+$${todayCash.toFixed(2)}`
  } else {
    todayLabel = '—'
  }

  // Badge chip label: "Bronze + VIP" or just "Bronze"
  const badgeChipLabel = badgeName
    ? vipActive ? `${badgeName} + VIP` : badgeName
    : vipActive ? 'VIP Active' : null

  return (
    <div style={{
      margin: '0 16px 13px', borderRadius: 24,
      background: 'linear-gradient(135deg, #001F54 0%, #003B8E 100%)',
      padding: '22px 20px 18px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,31,84,0.25)',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,111,0,0.1)' }} />
      <div style={{ position: 'absolute', bottom: -50, left: 5, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      {/* Badge + Multiplier chips */}
      {(badgeChipLabel || vipActive) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {badgeChipLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 30, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Award size={13} color={C.orange} />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{badgeChipLabel}</span>
            </div>
          )}
          <div style={{ padding: '6px 12px', borderRadius: 30, background: 'rgba(255,111,0,0.15)', border: '1px solid rgba(255,111,0,0.25)' }}>
            <span style={{ fontSize: 12, color: C.orange, fontWeight: 800 }}>{multiplier}x Multiplier</span>
          </div>
          {vipActive && !badgeName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 30, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <Crown size={13} color="#A855F7" />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>VIP Active</span>
            </div>
          )}
        </div>
      )}

      {/* XP + Cash */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 13, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.52)', fontWeight: 500, marginBottom: 5 }}>XP Balance</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.orange }}>{coins.toLocaleString()} XP</div>
        </div>
        <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.18)', margin: '0 18px' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.52)', fontWeight: 500, marginBottom: 5 }}>Cash Balance</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>${usdBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* Today's earnings */}
      <div style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 13, padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.48)', fontWeight: 500 }}>Today's Earnings</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.orange, marginTop: 2 }}>{todayLabel}</div>
        </div>
        <TrendingUp size={26} color="rgba(255,255,255,0.55)" />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleFund} style={{ flex: 1, height: 44, borderRadius: 13, background: C.orange, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Fund</button>
        <button onClick={handleWithdraw} style={{ flex: 1, height: 44, borderRadius: 13, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.32)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Withdraw</button>
      </div>
    </div>
  )
}
