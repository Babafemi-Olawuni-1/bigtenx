import { useState } from 'react'
import { t, C } from '../dashboard/tokens'

export default function UpgradePage({ user, darkMode, setDarkMode, onClose, onUpgrade }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('bronze')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const benefitsData = {
    bronze: {
      title: "BRONZE BENEFITS",
      benefits: [
        "Bronze badge",
        "20% commission",
        "1x Multiplier",
        "1 Vault Unit",
        "Access to Hot Offers"
      ],
      price: "$1",
      name: "Bronze",
      icon: "🥉",
    },
    silver: {
      title: "SILVER BENEFITS",
      benefits: [
        "Silver badge",
        "30% commission",
        "1.2x Multiplier",
        "1 Vault Unit",
        "Access to Hot Offers"
      ],
      price: "$5",
      name: "Silver",
      icon: "🥈",
    },
    gold: {
      title: "GOLD BENEFITS",
      benefits: [
        "Gold badge",
        "40% commission",
        "1.5x Multiplier",
        "1 Vault Unit",
        "Access to Hot Offers"
      ],
      price: "$10",
      name: "Gold",
      icon: "🥇",
    },
    diamond: {
      title: "DIAMOND BENEFITS",
      benefits: [
        "Diamond badge",
        "50% commission",
        "2x Multiplier",
        "1 Vault Unit",
        "Access to Hot Offers",
        "Free one month VIP"
      ],
      price: "$20",
      name: "Diamond",
      icon: "💎",
    }
  }

  const handleUpgrade = () => {
    const data = benefitsData[selectedPlan]
    showToast(`Upgrading to ${data.name} for ${data.price}...`, 'success')
    if (onUpgrade) {
      setTimeout(() => {
        onUpgrade(selectedPlan)
      }, 2000)
    }
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>

      {/* Top Bar - No extra space */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 16px', background: tk.bg,
      }}>
        {onClose && (
          <button onClick={onClose} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: tk.iconShadow,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
        <span style={{ fontSize: 22, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Upgrade</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: tk.iconShadow,
        }}>
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.text} strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Scroll Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', padding: '16px 20px 0' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: tk.text }}>Upgrade Level</h1>
          <p style={{ fontSize: 13, color: tk.textMuted, marginTop: 4 }}>Unlock daily tasks & earnings</p>
        </div>

        {/* Plans Grid - 2x2 Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '20px 16px',
        }}>
          {/* Bronze */}
          <div 
            onClick={() => setSelectedPlan('bronze')}
            style={{
              background: tk.card,
              borderRadius: 16,
              padding: '20px 12px',
              textAlign: 'center',
              border: selectedPlan === 'bronze' ? `2px solid ${C.orange}` : `2px solid ${tk.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedPlan === 'bronze' ? `0 4px 15px rgba(255,107,0,0.12)` : 'none',
              background: selectedPlan === 'bronze' ? 'linear-gradient(135deg, #fff, #fffaf5)' : tk.card,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 10, display: 'block' }}>🥉</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.orange, display: 'block', marginBottom: 6 }}>Bronze</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tk.text, display: 'block' }}>$1</span>
          </div>

          {/* Silver */}
          <div 
            onClick={() => setSelectedPlan('silver')}
            style={{
              background: tk.card,
              borderRadius: 16,
              padding: '20px 12px',
              textAlign: 'center',
              border: selectedPlan === 'silver' ? `2px solid ${C.orange}` : `2px solid ${tk.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedPlan === 'silver' ? `0 4px 15px rgba(255,107,0,0.12)` : 'none',
              background: selectedPlan === 'silver' ? 'linear-gradient(135deg, #fff, #fffaf5)' : tk.card,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 10, display: 'block' }}>🥈</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.orange, display: 'block', marginBottom: 6 }}>Silver</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tk.text, display: 'block' }}>$5</span>
          </div>

          {/* Gold */}
          <div 
            onClick={() => setSelectedPlan('gold')}
            style={{
              background: tk.card,
              borderRadius: 16,
              padding: '20px 12px',
              textAlign: 'center',
              border: selectedPlan === 'gold' ? `2px solid ${C.orange}` : `2px solid ${tk.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedPlan === 'gold' ? `0 4px 15px rgba(255,107,0,0.12)` : 'none',
              background: selectedPlan === 'gold' ? 'linear-gradient(135deg, #fff, #fffaf5)' : tk.card,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 10, display: 'block' }}>🥇</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.orange, display: 'block', marginBottom: 6 }}>Gold</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tk.text, display: 'block' }}>$10</span>
          </div>

          {/* Diamond */}
          <div 
            onClick={() => setSelectedPlan('diamond')}
            style={{
              background: tk.card,
              borderRadius: 16,
              padding: '20px 12px',
              textAlign: 'center',
              border: selectedPlan === 'diamond' ? `2px solid ${C.orange}` : `2px solid ${tk.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedPlan === 'diamond' ? `0 4px 15px rgba(255,107,0,0.12)` : 'none',
              background: selectedPlan === 'diamond' ? 'linear-gradient(135deg, #fff, #fffaf5)' : tk.card,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 10, display: 'block' }}>💎</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.orange, display: 'block', marginBottom: 6 }}>Diamond</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tk.text, display: 'block' }}>$20</span>
          </div>
        </div>

        {/* Benefits Card */}
        <div style={{
          margin: '0 16px 20px',
          background: tk.card,
          borderRadius: 18,
          padding: 20,
          boxShadow: tk.iconShadow,
          border: `1px solid ${tk.cardBorder}`,
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: tk.text,
            marginBottom: 16,
            letterSpacing: '-0.3px',
          }}>
            {benefitsData[selectedPlan].title}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {benefitsData[selectedPlan].benefits.map((benefit, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: tk.text }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {benefit}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              background: C.orange,
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'transform 0.1s',
              marginTop: 16,
              border: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Upgrade to {benefitsData[selectedPlan].name} — {benefitsData[selectedPlan].price}
          </button>
        </div>

      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : C.orange,
          color: '#fff', padding: '10px 22px', borderRadius: 50,
          fontSize: 13, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}