import { useState } from 'react'
import { X, Check, Zap, Lock } from 'lucide-react'
import { LEVELS } from './levels'
import { C, t } from './tokens'
import { API } from '../auth/api'

function TrophyIcon({ color, size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M16 8H10C10 8 8 18 16 22V8Z" fill={color}/>
      <path d="M32 8H38C38 8 40 18 32 22V8Z" fill={color}/>
      <rect x="20" y="30" width="8" height="6" rx="1" fill={color}/>
      <rect x="16" y="36" width="16" height="3" rx="1.5" fill={color}/>
      <path d="M16 8H32C32 28 24 30 24 30C24 30 16 28 16 8Z" fill={color}/>
      <ellipse cx="24" cy="17" rx="6" ry="3.5" fill="white" opacity="0.25"/>
    </svg>
  )
}

export default function UpgradeModal({ user, updateUser, darkMode, onClose }) {
  const tk = t(darkMode)
  const [selected, setSelected] = useState(user.level || 1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const pkg = LEVELS.find(l => l.id === selected)

  const handleUpgrade = async () => {
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/levels/upgrade.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, level_id: selected }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ level: data.level, levelPaid: true, levelExpires: data.level_expires })
        setSuccess(data.message)
        setTimeout(onClose, 2500)
      } else {
        setError(data.message)
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'relative', background: darkMode ? '#111827' : '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: darkMode ? '#374151' : '#e5e7eb', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, color: darkMode ? '#fff' : C.navy, margin: 0 }}>Upgrade Level</p>
            <p style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,31,84,0.5)', margin: '2px 0 0' }}>Unlock daily tasks & earnings</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,31,84,0.5)' }}><X size={20} /></button>
        </div>

        {/* Info banner */}
        <div style={{ margin: '0 16px 16px', background: `${C.orange}15`, border: `1px solid ${C.orange}30`, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Lock size={14} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.7)' : C.navy, margin: 0, lineHeight: 1.5 }}>
            You received <strong style={{ color: C.orange }}>100 free coins</strong> on signup. Upgrade to a level to unlock daily tasks, check-ins, and withdrawals.
          </p>
        </div>

        {/* Level cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
          {LEVELS.map(lvl => (
            <button key={lvl.id} onClick={() => setSelected(lvl.id)}
              style={{ background: selected === lvl.id ? `linear-gradient(135deg,#001F54,#0a3080)` : (darkMode ? '#1e2937' : '#f8fafc'), border: `2px solid ${selected === lvl.id ? lvl.color : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,31,84,0.08)')}`, borderRadius: 16, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selected === lvl.id ? `0 0 20px ${lvl.glow}` : 'none', fontFamily: 'inherit' }}>
              <TrophyIcon color={lvl.color} size={32} />
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: selected === lvl.id ? '#fff' : (darkMode ? '#fff' : C.navy), margin: '6px 0 2px' }}>{lvl.name}</p>
              <p style={{ fontWeight: 800, fontSize: 20, color: lvl.color, margin: 0 }}>${lvl.price}</p>
              <p style={{ fontSize: 10, color: selected === lvl.id ? 'rgba(255,255,255,0.5)' : (darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,31,84,0.4)'), margin: '2px 0 0' }}>{lvl.dailyCoins} coins/day</p>
            </button>
          ))}
        </div>

        {/* Selected perks */}
        {pkg && (
          <div style={{ margin: '0 16px 16px', background: darkMode ? '#1e2937' : '#f8fafc', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>{pkg.name} Benefits</p>
            {pkg.perks.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${pkg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={9} color={pkg.color} />
                </div>
                <span style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,31,84,0.7)' }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error / Success */}
        {error && <div style={{ margin: '0 16px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 12px' }}><p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p></div>}
        {success && <div style={{ margin: '0 16px 12px', background: `${C.orange}15`, border: `1px solid ${C.orange}30`, borderRadius: 10, padding: '8px 12px' }}><p style={{ color: C.orange, fontSize: 12, margin: 0, fontWeight: 600 }}>{success}</p></div>}

        {/* CTA */}
        <div style={{ padding: '0 16px' }}>
          <button onClick={handleUpgrade} disabled={loading}
            style={{ width: '100%', background: loading ? `${C.orange}60` : C.orange, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 18px ${C.orange}40` }}>
            <Zap size={16} fill="white" />
            {loading ? 'Processing...' : `Upgrade to ${pkg?.name} — $${pkg?.price}`}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,31,84,0.35)', marginTop: 10 }}>
            Active for 1 month{pkg?.vipMonths ? ' + 1 month VIP free' : ''}. Renew anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
