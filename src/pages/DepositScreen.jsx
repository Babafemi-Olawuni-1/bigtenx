import { useState } from 'react'
import { Sun, Moon, ArrowLeft, Wallet as WalletIcon, ChevronRight, CircleDollarSign, Landmark, Bitcoin } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function DepositScreen({ user, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [activePill, setActivePill] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const pills = [
    { id: 'all', label: 'All' },
    { id: 'bank', label: 'Bank transfers and ATM' },
    { id: 'crypto', label: 'Cryptocurrencies' }
  ]

  const handleMethodSelect = (method) => {
    showToast(`${method} coming soon! 🚀`)
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 8px', background: tk.bg }}>
        <button 
          onClick={onBack} 
          style={{ 
            width: 34, height: 34, borderRadius: '50%', 
            background: tk.card, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ArrowLeft size={18} color={tk.text} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, color: tk.text, flex: 1 }}>New deposit</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 34, height: 34, borderRadius: '50%', background: tk.card, border: 'none', cursor: 'pointer' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      {/* Wallet Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 18px', background: tk.cardBg, borderBottom: `1px solid ${tk.cardBorder}`,
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: darkMode ? `${C.orange}15` : `${C.navy}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <WalletIcon size={14} color={darkMode ? C.orange : C.navy} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: tk.textMuted }}>Wallet</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: 12, color: tk.text }}>${(user?.usdBalance || 0).toFixed(2)} ⋮</span>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Payment Methods Title */}
        <div style={{ padding: '14px 0 6px', fontSize: 16, fontWeight: 900, color: tk.text }}>
          Payment methods
        </div>

        {/* Pills Row */}
        <div style={{ display: 'flex', gap: 7, padding: '0 0 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {pills.map(pill => (
            <button
              key={pill.id}
              onClick={() => setActivePill(pill.id)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                whiteSpace: 'nowrap', cursor: 'pointer',
                border: `1.5px solid ${activePill === pill.id ? C.orange : tk.cardBorder}`,
                background: activePill === pill.id ? C.orange : 'transparent',
                color: activePill === pill.id ? '#fff' : tk.textSecondary || tk.textMuted,
                fontFamily: 'inherit'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Bank transfers and ATM Section */}
        {(activePill === 'all' || activePill === 'bank') && (
          <>
            <div style={{ padding: '10px 0 6px', fontSize: 10.5, fontWeight: 800, color: tk.textMuted, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Bank transfers and ATM
            </div>
            
            <button 
              onClick={() => handleMethodSelect('Instant bank transfers')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', width: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${tk.cardBorder}`
              }}
              onMouseEnter={e => e.currentTarget.style.background = tk.cardBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: tk.cardBg, border: `1.5px solid ${tk.cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Landmark size={16} color={C.orange} />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                Instant bank transfers
              </span>
              <ChevronRight size={14} color={tk.textMuted} />
            </button>
          </>
        )}

        {/* Cryptocurrencies Section */}
        {(activePill === 'all' || activePill === 'crypto') && (
          <>
            <div style={{ padding: '16px 0 6px', fontSize: 10.5, fontWeight: 800, color: tk.textMuted, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Cryptocurrencies
            </div>
            
            {/* Tether TRC20 */}
            <button 
              onClick={() => handleMethodSelect('Tether (TRC20)')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', width: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${tk.cardBorder}`
              }}
              onMouseEnter={e => e.currentTarget.style.background = tk.cardBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#26a17b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 13
              }}>
                ₮
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                Tether (TRC20)
              </span>
              <ChevronRight size={14} color={tk.textMuted} />
            </button>

            {/* Tether ERC20 */}
            <button 
              onClick={() => handleMethodSelect('Tether (ERC20)')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', width: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${tk.cardBorder}`
              }}
              onMouseEnter={e => e.currentTarget.style.background = tk.cardBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#26a17b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 13
              }}>
                ₮
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                Tether (ERC20)
              </span>
              <ChevronRight size={14} color={tk.textMuted} />
            </button>

            {/* Dogecoin */}
            <button 
              onClick={() => handleMethodSelect('Dogecoin')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', width: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${tk.cardBorder}`
              }}
              onMouseEnter={e => e.currentTarget.style.background = tk.cardBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#c3a634', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 14
              }}>
                Ð
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                Dogecoin
              </span>
              <ChevronRight size={14} color={tk.textMuted} />
            </button>

            {/* Litecoin */}
            <button 
              onClick={() => handleMethodSelect('Litecoin')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', width: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = tk.cardBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#345d9d', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 14
              }}>
                Ł
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tk.text, textAlign: 'left' }}>
                Litecoin
              </span>
              <ChevronRight size={14} color={tk.textMuted} />
            </button>
          </>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 500 }}>
          {toast}
        </div>
      )}
    </div>
  )
}