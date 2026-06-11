import { useState } from 'react'
import { Sun, Moon, User, Lock, Bell, Gift, Users, Award, TrendingUp, LogOut, ChevronRight } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function ProfilePage({ user, darkMode, setDarkMode, onLogout, onUpgrade }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Get user level name
  const getUserLevel = () => {
    const level = user?.level || 1
    const levels = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Diamond' }
    return levels[level] || 'Bronze'
  }

  // Get streak count
  const getStreak = () => {
    return user?.streakMonth || 12
  }

  // Get day of month
  const getDayOfMonth = () => {
    return user?.streakDay || 8
  }

  // Get ranking (can be from API later)
  const getRanking = () => {
    return user?.ranking || 407
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>

      {/* Profile Hero Section */}
      <div style={{
        background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navy2} 100%)`,
        padding: '52px 20px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Background decorative circles */}
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
            background: C.orange, border: `2.5px solid ${C.navy}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, color: '#fff',
          }}>
            {user?.level || 1}
          </div>
        </div>

        {/* Username */}
        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', marginBottom: 6 }}>
          {user?.username || 'mrmillionx'}
        </span>

        {/* Country Tag */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,.12)', borderRadius: 50, padding: '4px 12px',
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)',
          marginBottom: 16,
        }}>
          🇳🇬 {user?.country || 'Nigeria'}
        </span>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>🔥 {getStreak()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>STREAK</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Day {getDayOfMonth()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>OF MONTH</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>#{getRanking()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>RANKING</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px' }}>

        {/* ACCOUNT Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: tk.textMuted,
            letterSpacing: '.12em', textTransform: 'uppercase',
            marginBottom: 10, paddingLeft: 4,
          }}>Account</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', boxShadow: tk.iconShadow }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}`,
              cursor: 'pointer',
            }} onClick={() => showToast('Account settings coming soon')}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} stroke="#4F46E5" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Account</span>
              <ChevronRight size={14} color={tk.textMuted} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}`,
              cursor: 'pointer',
            }} onClick={() => showToast('Change password coming soon')}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#FFF5EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} stroke={C.orange} />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Change Password</span>
              <ChevronRight size={14} color={tk.textMuted} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', cursor: 'pointer',
            }} onClick={() => showToast('Notifications coming soon')}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} stroke="#16A34A" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Notifications</span>
              <ChevronRight size={14} color={tk.textMuted} />
            </div>
          </div>
        </div>

        {/* REFERRAL INFO Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: tk.textMuted,
            letterSpacing: '.12em', textTransform: 'uppercase',
            marginBottom: 10, paddingLeft: 4,
          }}>Referral Info</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', boxShadow: tk.iconShadow }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#FFF5EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={18} stroke={C.orange} />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Referral Code</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{user?.referralCode || user?.username || 'N/A'}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} stroke="#4F46E5" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Referred by</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tk.textMuted }}>{user?.referredBy || 'Femi'}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} stroke="#16A34A" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Levels</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{getUserLevel()}</span>
            </div>
          </div>
        </div>

        {/* BADGES & VIP Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: tk.textMuted,
            letterSpacing: '.12em', textTransform: 'uppercase',
            marginBottom: 10, paddingLeft: 4,
          }}>Badges & VIP</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', boxShadow: tk.iconShadow }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderBottom: `1px solid ${tk.cardBorder}`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#FFF5EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} stroke={C.orange} />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>VIP Status</span>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 20,
                  background: user?.is_vip ? '#E8F5E9' : '#F5F5F5',
                  color: user?.is_vip ? '#2E7D32' : '#9E9E9E',
                }}>
                  {user?.is_vip ? 'active' : 'inactive'}
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} stroke="#16A34A" />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Vault Max Units</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>× 4</span>
            </div>
          </div>
        </div>

        {/* SUPPORT Section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: tk.textMuted,
            letterSpacing: '.12em', textTransform: 'uppercase',
            marginBottom: 10, paddingLeft: 4,
          }}>Support</p>
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', boxShadow: tk.iconShadow }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', cursor: 'pointer',
            }} onClick={() => window.location.href = '/support'}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.text }}>Customer Support</span>
              <ChevronRight size={14} color={tk.textMuted} />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', cursor: 'pointer',
          background: 'rgba(220,38,38,.04)', borderRadius: 18,
          border: '1.5px solid rgba(220,38,38,.1)',
          marginTop: 8,
        }} onClick={onLogout}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(220,38,38,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} stroke="#dc2626" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>Log Out</span>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: C.orange, color: '#fff', padding: '10px 22px', borderRadius: 50,
          fontSize: 13, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </div>
  )
}