// ProfilePage.jsx - COMPLETE DATABASE-SYNCED PROFILE (EMOJI-FREE)
import { useState } from 'react'
import { Sun, Moon, User, Lock, Bell, Gift, Users, Award, TrendingUp, LogOut, ChevronRight, ArrowLeft } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function ProfilePage({ user, darkMode, setDarkMode, onLogout, onUpgrade, onBack }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ─── LEVEL & BADGE FROM DATABASE ────────────────────────────────
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0);
  const coins = parseInt(user?.coins ?? 0);

  // Map level integer → plan name
  const LEVEL_NAMES = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Diamond' }
  const levelInt    = parseInt(user?.level ?? 1)
  const planName    = LEVEL_NAMES[levelInt] || 'Bronze'

  // Badge color per level/badge name
  const BADGE_COLORS = {
    bronze:  '#CD7F32',
    silver:  '#94A3B8',
    gold:    '#EAB308',
    diamond: '#2563EB',
    vip:     '#7C3AED',
  }
  const badgeName  = user?.current_badge || null
  const badgeColor = BADGE_COLORS[(badgeName || '').toLowerCase()] || C.orange
  const isVip      = Boolean(user?.is_vip) || Boolean(user?.vip_active)
  const multiplier = user?.current_multiplier
    ? `${parseFloat(user.current_multiplier).toFixed(1)}x`
    : '1.0x'

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 40 }}>

      {/* Top Bar with Back Button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 16px', background: tk.bg,
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: tk.iconShadow,
        }}>
          <ArrowLeft size={18} color={tk.text} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Profile</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: tk.iconShadow,
        }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      {/* Profile Hero Section */}
      <div style={{
        background: `linear-gradient(160deg, #001F54 0%, #002266 100%)`,
        padding: '36px 20px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,107,0,.08)' }} />

        {/* Avatar */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, rgba(255,107,0,.7), rgba(255,140,0,.5))`,
            border: '3px solid rgba(255,255,255,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 28, height: 28, borderRadius: '50%',
            background: badgeColor, border: `2.5px solid #001F54`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, color: '#fff',
          }}>
            {levelInt}
          </div>
        </div>

        {/* Username */}
        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', marginBottom: 6 }}>
          {user?.username || 'user'}
        </span>

        {/* Plan badge */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: badgeColor + '33', borderRadius: 50, padding: '3px 12px',
            fontSize: 11, fontWeight: 800, color: '#fff',
            border: `1px solid ${badgeColor}55`,
          }}>
            {badgeName ? `${badgeName} Badge` : planName}
          </span>
          {isVip && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(124,58,237,0.35)', borderRadius: 50, padding: '3px 12px',
              fontSize: 11, fontWeight: 800, color: '#fff',
              border: '1px solid rgba(124,58,237,0.5)',
            }}>
              VIP
            </span>
          )}
        </div>

        {/* Country Tag */}
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(255,255,255,.12)', borderRadius: 50, padding: '4px 12px',
          fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.8)',
          marginBottom: 20,
        }}>
          {user?.country || 'Nigeria'}
        </span>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{user?.streak ?? 0} Days</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>STREAK</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.15)', alignSelf: 'center' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{coins.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>XP COINS</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.15)', alignSelf: 'center' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>${usdBalance.toFixed(2)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>BALANCE</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ padding: '20px 16px 32px' }}>

        {/* ACCOUNT INFO Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Account Information</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${tk.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyHook: 'space-between', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Username</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.textMuted }}>{user?.username || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Email Address</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.textMuted }}>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Country</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.textMuted }}>{user?.country || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* REFERRALS Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Referral Stats</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${tk.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Referral Code</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.orange }}>{user?.referral_code ?? user?.referralCode ?? 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Total Referrals</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{parseInt(user?.total_referrals ?? 0)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Referral Earnings</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>${parseFloat(user?.referral_earnings ?? 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Membership Level</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{planName}</span>
            </div>
          </div>
        </div>

        {/* BADGES & VIP STATUS Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Badges & VIP</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${tk.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Current Badge</span>
              <span style={{ fontSize: 13, fontWeight: 750, color: badgeColor }}>{badgeName || 'None'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>Earning Multiplier</span>
              <span style={{ fontSize: 13, fontWeight: 750, color: C.orange }}>{multiplier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>VIP Status</span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20,
                background: isVip ? 'rgba(16,185,129,0.1)' : (darkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                color: isVip ? '#10B981' : tk.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                {isVip ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div 
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            cursor: 'pointer',
            background: 'rgba(239,68,68,0.04)',
            borderRadius: 18,
            border: '1.5px solid rgba(239,68,68,0.15)',
            marginTop: 20,
            justifyContent: 'center',
          }}
        >
          <LogOut size={16} stroke="#EF4444" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#EF4444' }}>Log Out</span>
        </div>

      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}
    </div>
  )
}