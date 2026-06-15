// UserProfile.jsx
import { useState, useEffect } from 'react'
import { API, O } from './adminUtils'
import { Mail, Edit, Shield, Trash2, ArrowLeft, MoreVertical } from 'lucide-react'

export default function UserProfile({ token, userId, onBack }) {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(true)
  const [accountStatus, setAccountStatus] = useState('active')
  const [depositStatus, setDepositStatus] = useState('active')
  const [withdrawalStatus, setWithdrawalStatus] = useState('disabled')
  const [verificationStatus, setVerificationStatus] = useState('active')
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${API}/admin/users.php?id=${userId}`, { headers })
        const data = await res.json()
        if (data.success) setUser(data.user)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    if (userId) loadUser()
  }, [userId, token])

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'basic', label: 'Basic Info' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'referral', label: 'Referral' },
    { id: 'vault', label: 'Vault' }
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>Loading profile...</div>
  }

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>User not found</div>
  }

  const initial = user.username?.charAt(0).toUpperCase() || 'U'
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#fff', border: '1px solid #E9EDF2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} color="#001F54" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#001F54', margin: 0 }}>User Profile</h1>
          <p style={{ fontSize: 13, color: '#8899AA', marginTop: 4 }}>Manage user account and settings</p>
        </div>
      </div>

      {/* Profile Header Card - Gradient */}
      <div style={{
        background: 'linear-gradient(140deg, #001F54 0%, #003B8E 100%)',
        borderRadius: 20, padding: '16px 18px 18px',
        marginBottom: 14, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,111,0,0.12)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(135deg, ${O}, #FF9A00)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: '#fff'
          }}>{initial}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{user.username}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>@{user.username?.toLowerCase()}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>Joined {joinDate}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', border: 'none', cursor: 'pointer' }}>
              <Mail size={13} color="#fff" />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', border: 'none', cursor: 'pointer' }}>
              <Edit size={13} color="#fff" />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', border: 'none', cursor: 'pointer' }}>
              <Shield size={13} color="#fff" />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(239,68,68,0.3)', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={13} color="#fff" />
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
          background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 0',
          position: 'relative', zIndex: 1
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.48)', fontWeight: 500 }}>Balance</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: O }}>${parseFloat(user.usd_balance || 0).toFixed(2)}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.16)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.48)', fontWeight: 500 }}>XP</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{(user.coins || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 13px', borderRadius: 20, fontSize: 10.5, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap', border: '1.5px solid #E9EDF2',
              background: activeTab === tab.id ? O : '#fff',
              color: activeTab === tab.id ? '#fff' : '#8899AA'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Account */}
      {activeTab === 'account' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>Account Settings</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8899AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Account Status</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAccountStatus('active')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: accountStatus === 'active' ? '#10B960' : '#F7F8FC', color: accountStatus === 'active' ? '#fff' : '#8899AA' }}>Active</button>
              <button onClick={() => setAccountStatus('disabled')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: accountStatus === 'disabled' ? '#EF4444' : '#F7F8FC', color: accountStatus === 'disabled' ? '#fff' : '#8899AA' }}>Disable</button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8899AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Deposit</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDepositStatus('active')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: depositStatus === 'active' ? '#10B960' : '#F7F8FC', color: depositStatus === 'active' ? '#fff' : '#8899AA' }}>Active</button>
              <button onClick={() => setDepositStatus('disabled')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: depositStatus === 'disabled' ? '#EF4444' : '#F7F8FC', color: depositStatus === 'disabled' ? '#fff' : '#8899AA' }}>Disable</button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8899AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Withdrawal</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setWithdrawalStatus('active')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: withdrawalStatus === 'active' ? '#10B960' : '#F7F8FC', color: withdrawalStatus === 'active' ? '#fff' : '#8899AA' }}>Active</button>
              <button onClick={() => setWithdrawalStatus('disabled')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: withdrawalStatus === 'disabled' ? '#EF4444' : '#F7F8FC', color: withdrawalStatus === 'disabled' ? '#fff' : '#8899AA' }}>Disable</button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8899AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Verification</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setVerificationStatus('active')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: verificationStatus === 'active' ? '#10B960' : '#F7F8FC', color: verificationStatus === 'active' ? '#fff' : '#8899AA' }}>Active</button>
              <button onClick={() => setVerificationStatus('disabled')} style={{ flex: 1, height: 34, borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: verificationStatus === 'disabled' ? '#EF4444' : '#F7F8FC', color: verificationStatus === 'disabled' ? '#fff' : '#8899AA' }}>Disable</button>
            </div>
          </div>

          <button style={{ width: '100%', height: 40, borderRadius: 12, border: 'none', background: O, color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${O}55` }}>
            Save Changes
          </button>
        </div>
      )}

      {/* TAB: Earnings */}
      {activeTab === 'earnings' && (
        <div>
          {/* Balance Card */}
          <div style={{
            background: 'linear-gradient(140deg, #001F54 0%, #003B8E 100%)',
            borderRadius: 24, padding: '18px 18px 14px',
            marginBottom: 14, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4 }}>Total XP</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: O }}>{(user.coins || 0).toLocaleString()} XP</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.18)', margin: '0 14px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4 }}>Balance</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#fff' }}>${parseFloat(user.usd_balance || 0).toFixed(2)}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 12, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', backdropFilter: 'blur(6px)' }}>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.48)' }}>Available XP</div><div style={{ fontSize: 13, fontWeight: 800, color: O }}>{(user.coins || 0)} XP</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.48)' }}>Cash Value</div><div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>${parseFloat(user.usd_balance || 0).toFixed(2)}</div></div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, border: '1px solid #E9EDF2' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>⏳ Pending</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#F7F8FC', borderRadius: 14, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-arrow-down" style={{ fontSize: 14, color: '#10B960' }}></i></div>
                <div><div style={{ fontSize: 9, color: '#8899AA' }}>Deposit</div><div style={{ fontSize: 15, fontWeight: 800, color: '#10B960' }}>$0</div></div>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 14, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-arrow-up" style={{ fontSize: 14, color: '#EF4444' }}></i></div>
                <div><div style={{ fontSize: 9, color: '#8899AA' }}>Withdrawal</div><div style={{ fontSize: 15, fontWeight: 800, color: '#EF4444' }}>$10</div></div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, border: '1px solid #E9EDF2' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>🏅 Badges</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { letter: 'B', color: '#CD7F32', bg: 'rgba(205,127,50,0.18)' },
                { letter: 'S', color: '#909090', bg: 'rgba(160,160,160,0.18)' },
                { letter: 'G', color: '#D4A000', bg: 'rgba(255,215,0,0.18)' },
                { letter: 'D', color: '#38B6FF', bg: 'rgba(56,182,255,0.18)' },
                { letter: 'V', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' }
              ].map(badge => (
                <div key={badge.letter} style={{
                  width: 44, height: 44, borderRadius: '50%', background: badge.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: badge.color
                }}>{badge.letter}</div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>🔐 Vault %</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#F7F8FC', borderRadius: 14, padding: 11 }}>
                <div style={{ fontSize: 9, color: '#8899AA' }}>Unit</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#001F54', marginTop: 3 }}>50</div>
              </div>
              <div style={{ background: '#F7F8FC', borderRadius: 14, padding: 11 }}>
                <div style={{ fontSize: 9, color: '#8899AA' }}>Value</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#001F54', marginTop: 3 }}>$750</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab === 'basic' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div><label style={{ fontSize: 9.5, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 4 }}>Name</label><input type="text" defaultValue={user.username} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11 }} /></div>
            <div><label style={{ fontSize: 9.5, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 4 }}>Date of Birth</label><input type="date" style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 11 }} /></div>
          </div>
          <button style={{ width: '100%', height: 40, borderRadius: 12, background: O, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save Changes</button>
        </div>
      )}

      {(activeTab === 'tickets' || activeTab === 'referral' || activeTab === 'vault') && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', textAlign: 'center', color: '#8899AA' }}>
          {activeTab === 'tickets' && 'No open tickets'}
          {activeTab === 'referral' && '0 referrals this month'}
          {activeTab === 'vault' && 'Vault data loading...'}
        </div>
      )}
    </div>
  )
}