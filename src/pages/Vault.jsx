import { useState, useEffect } from 'react'
import { Sun, Moon, ArrowLeft, TrendingUp, DollarSign, Award, Clock } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function VaultPage({ user, updateUser, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [timeLeft, setTimeLeft] = useState({ days: 19, hours: 1, minutes: 10, seconds: 7 })
  const [totalSeconds, setTotalSeconds] = useState((19 * 24 * 3600) + (1 * 3600) + (10 * 60) + 7)

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    setTimeLeft({ days, hours, minutes, seconds: secs })
  }, [totalSeconds])

  const formatTimeLeft = () => {
    if (totalSeconds <= 0) return 'Expired'
    return `${timeLeft.days}d ${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`
  }

  const handleConvertXP = () => {
    // TODO: Open convert XP modal
    alert('Convert XP feature coming soon!')
  }

  const handleBuy = () => {
    alert('Buy Units feature coming soon!')
  }

  const handleSell = () => {
    alert('Sell Units feature coming soon!')
  }

  return (
    <div style={{ 
      background: tk.bg, 
      minHeight: '100%', 
      paddingBottom: 20,
      fontFamily: "'Sora', sans-serif"
    }}>
      {/* Header - matches TasksScreen design */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 16px 12px',
        background: tk.bg,
        borderBottom: `1px solid ${tk.cardBorder}`,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: tk.card,
                border: `1px solid ${tk.cardBorder}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowLeft size={18} color={tk.text} />
            </button>
          )}
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', color: tk.text }}>Vault</h1>
        </div>
        <button
          onClick={() => setDarkMode?.(!darkMode)}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: tk.card,
            border: `1px solid ${tk.cardBorder}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0 16px 100px', 
        scrollbarWidth: 'none' 
      }}>

        {/* XP Overview Section */}
        <div style={{
          background: tk.card,
          border: `1px solid ${tk.cardBorder}`,
          borderRadius: 20,
          padding: 18,
          marginTop: 14,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            color: tk.textMuted, textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Award size={14} color={C.orange} />
            XP Overview
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
            <span style={{ fontSize: 13, color: tk.textSecondary || tk.textMuted }}>My XP</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{user?.coins || 400} XP</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
            <span style={{ fontSize: 13, color: tk.textSecondary || tk.textMuted }}>Total XP Pool</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>90,000 XP</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
            <span style={{ fontSize: 13, color: tk.textSecondary || tk.textMuted }}>Revenue</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>—</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0' }}>
            <span style={{ fontSize: 13, color: tk.textSecondary || tk.textMuted }}>Time Left</span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: tk.textSecondary || tk.textMuted,
              background: darkMode ? '#1C2A3A' : '#E2E8F0',
              padding: '3px 9px', borderRadius: 20,
              border: `1px solid ${tk.cardBorder}`,
            }}>
              <Clock size={11} style={{ display: 'inline', marginRight: 4, color: C.orange }} />
              {formatTimeLeft()}
            </span>
          </div>
          
          <button
            onClick={handleConvertXP}
            style={{
              width: '100%', marginTop: 14, padding: 14, borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${C.orange}, #ea6e00)`,
              color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 6px 24px ${C.orange}35`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Convert XP
          </button>
        </div>

        {/* Vault Units Section */}
        <div style={{
          background: tk.card,
          border: `1px solid ${tk.cardBorder}`,
          borderRadius: 20,
          padding: 18,
          marginTop: 14,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            color: tk.textMuted, textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <TrendingUp size={14} color={C.orange} />
            Vault Units
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{
              background: darkMode ? '#1C2A3A' : '#F1F5F9',
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 14, padding: 14,
            }}>
              <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>My Units</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>2</div>
            </div>
            <div style={{
              background: darkMode ? '#1C2A3A' : '#F1F5F9',
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 14, padding: 14,
            }}>
              <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Total Units</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>400</div>
            </div>
            <div style={{
              background: darkMode ? '#1C2A3A' : '#F1F5F9',
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 14, padding: 14,
            }}>
              <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Unit Price</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>$15</div>
            </div>
            <div style={{
              background: darkMode ? '#1C2A3A' : '#F1F5F9',
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 14, padding: 14,
            }}>
              <div style={{ fontSize: 10, color: tk.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Max Units</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>4</div>
            </div>
          </div>

          {/* Buy/Sell Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <button
              onClick={handleBuy}
              style={{
                padding: 13, borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg, ${C.orange}, #ea6e00)`,
                color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                boxShadow: `0 4px 16px ${C.orange}30`,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Buy
            </button>
            <button
              onClick={handleSell}
              style={{
                padding: 13, borderRadius: 14, border: `1px solid ${tk.cardBorder}`,
                background: darkMode ? '#1C2A3A' : '#E2E8F0',
                color: tk.textSecondary || tk.textMuted,
                fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Sell
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: tk.textMuted, marginTop: 10, fontWeight: 500 }}>
            2% fee applies on all transactions
          </div>
        </div>

        {/* Total Vault Value Card */}
        <div style={{
          background: darkMode ? 'linear-gradient(135deg, #162032, #0f1e30)' : 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: `1px solid ${C.orange}40`,
          borderRadius: 18, padding: 18, marginTop: 14,
        }}>
          <div style={{ fontSize: 11, color: '#4B6080', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
            Total Vault Value
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9' }}>$6,000</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(34,197,94,0.12)', color: '#22C55E',
              padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              +3.4%
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}