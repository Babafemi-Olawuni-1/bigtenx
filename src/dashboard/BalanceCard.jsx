import { TrendingUp } from 'lucide-react'
import { C, t } from './tokens'
import { isLevelActive } from './levels'

export default function BalanceCard({ user, darkMode, onUpgrade, onFund }) {
  const tk = t(darkMode)
  const active = isLevelActive(user)

  // Support both snake_case (from API) and camelCase (legacy)
  const usdBalance       = parseFloat(user?.usd_balance         ?? user?.usdBalance        ?? 0)
  const todayXP          = parseInt(  user?.today_earnings       ?? user?.todayEarnings     ?? 0, 10)
  const todayCash        = parseFloat(user?.today_earnings_cash  ?? 0)
  const coins            = parseInt(  user?.coins                ?? 0, 10)

  // Build today's earnings label: show only what was actually earned
  let todayLabel = ''
  if (todayXP > 0 && todayCash > 0) {
    todayLabel = `+${todayXP} XP, +$${todayCash.toFixed(2)}`
  } else if (todayXP > 0) {
    todayLabel = `+${todayXP} XP`
  } else if (todayCash > 0) {
    todayLabel = `+$${todayCash.toFixed(2)}`
  } else {
    todayLabel = '—'
  }

  return (
    <div style={{
      margin: '0 16px 13px', borderRadius: 24, background: tk.balCard,
      padding: '22px 20px 18px', position: 'relative', overflow: 'hidden',
      border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none',
      boxShadow: darkMode
        ? `0 0 38px rgba(255,111,0,0.1),inset 0 1px 0 rgba(255,111,0,0.12)`
        : 'none',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: darkMode ? 'radial-gradient(circle,rgba(255,111,0,0.14) 0%,transparent 70%)' : 'rgba(255,111,0,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -50, left: 5, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      {/* Balances row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 13, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.52)', fontWeight: 500, marginBottom: 5 }}>XP Balance</div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: C.orange, letterSpacing: -0.4,
            textShadow: darkMode ? `0 0 24px rgba(255,111,0,0.55)` : 'none',
          }}>
            {coins.toLocaleString()} XP
          </div>
        </div>

        <div style={{ width: 1, height: 50, background: darkMode ? 'rgba(255,111,0,0.2)' : 'rgba(255,255,255,0.18)', margin: '0 18px' }} />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.52)', fontWeight: 500, marginBottom: 5 }}>Cash Balance</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>
            ${usdBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Today's earnings */}
      <div style={{
        background: darkMode ? 'rgba(255,111,0,0.07)' : 'rgba(255,255,255,0.09)',
        border: darkMode ? '1px solid rgba(255,111,0,0.18)' : 'none',
        borderRadius: 13, padding: '10px 13px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 15, position: 'relative', zIndex: 1, backdropFilter: 'blur(6px)',
      }}>
        <div>
          <div style={{ fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.48)', fontWeight: 500 }}>
            Today's Earnings
          </div>
          <div style={{
            fontSize: 14, fontWeight: 800, color: C.orange, marginTop: 2,
            textShadow: darkMode ? `0 0 14px rgba(255,111,0,0.6)` : 'none',
          }}>
            {todayLabel}
          </div>
        </div>
        <TrendingUp size={28} color={darkMode ? 'rgba(255,111,0,0.8)' : 'rgba(255,255,255,0.65)'} />
      </div>

      {/* Buttons - FIXED: Show "Fund" when active, "Upgrade" when not active */}
      <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
        <button
          onClick={active ? onFund : onUpgrade}
          style={{
            flex: 1, height: 44, borderRadius: 13, background: C.orange,
            border: 'none', color: '#fff', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            boxShadow: darkMode ? `0 0 30px rgba(255,111,0,0.58)` : `0 6px 22px rgba(255,111,0,0.52)`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="3"/>
            <path d="M2 10h20"/>
            <circle cx="16" cy="15" r="1" fill="currentColor"/>
          </svg>
          {active ? 'Fund' : 'Upgrade'}
        </button>
        <button
          onClick={() => {
            if (active) {
              // Navigate to withdraw
              alert('Withdraw page coming soon')
            } else {
              onUpgrade()
            }
          }}
          style={{
            flex: 1, height: 44, borderRadius: 13, background: 'transparent',
            border: `1.5px solid ${darkMode ? 'rgba(255,111,0,0.38)' : 'rgba(255,255,255,0.32)'}`,
            color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M7 8l5-5 5 5"/>
            <path d="M20 21H4"/>
          </svg>
          Withdraw
        </button>
      </div>
    </div>
  )
}