// AdminDashboard.jsx - COMPLETE REWRITE with clickable More tab menu items
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, O } from './adminUtils'
import { Users, Zap, TrendingUp, CheckSquare, DollarSign, Coins, RefreshCw, Eye, 
         Wallet, Store, Crown, Share2, PiggyBank, Star, Bell, Photo, 
         BarChart3, Settings, ChevronRight, LayoutDashboard, Gift, Clock,
         Trophy, ClipboardList, UsersRound, List } from 'lucide-react'

function Badge({ children, color }) {
  return (
    <span style={{
      background: `${color}15`, color, borderRadius: 30,
      padding: '2px 8px', fontSize: 8.5, fontWeight: 800
    }}>{children}</span>
  )
}

function StatItem({ icon: Icon, label, value, color = O }) {
  return (
    <div style={{ 
      background: '#F7F8FC', borderRadius: 14, padding: '11px 12px',
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 9, color: '#8899AA', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#001F54' }}>{value}</div>
      </div>
    </div>
  )
}

function MenuItem({ icon: Icon, label, description, badge, badgeColor, iconBg, path, onClick }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (path) {
      navigate(path)
    } else if (onClick) {
      onClick()
    }
  }
  
  return (
    <div 
      onClick={handleClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
        borderBottom: '1px solid #F0F2F8', cursor: 'pointer',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#FFF8F3'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ 
        width: 36, height: 36, borderRadius: 11, background: iconBg || `${O}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={15} color={iconBg === `${O}12` ? O : '#001F54'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#001F54' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#8899AA', marginTop: 1 }}>{description}</div>
      </div>
      {badge && <Badge color={badgeColor}>{badge}</Badge>}
      <ChevronRight size={14} color="#CCDDEE" />
    </div>
  )
}

export default function AdminDashboard({ token }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats.php`, { headers })
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadStats() }, [loadStats])

  // Menu items with their corresponding routes - ALL CLICKABLE
  const menuSections = {
    operations: [
      { icon: Users, label: 'Users', description: 'Manage all accounts', path: '/admin/users', iconBg: `${O}12` },
      { icon: Wallet, label: 'Wallet', description: 'Deposits & withdrawals', badge: 'LIVE', badgeColor: '#EF4444', path: '/admin/vault', iconBg: `${O}12` },
      { icon: ClipboardList, label: 'Tasks', description: 'Create & track tasks', path: '/admin/tasks', iconBg: `${O}12` },
      { icon: Trophy, label: 'Contests', description: 'Competitions & events', badge: 'NEW', badgeColor: '#10b981', path: '/admin/contests', iconBg: `${O}12` },
    ],
    economy: [
      { icon: TrendingUp, label: 'XP & Levels', description: 'Point system & tiers', path: '/admin/xp-levels', iconBg: '#001F5408' },
      { icon: Share2, label: 'Referrals', description: 'Referral links & rewards', path: '/admin/referral', iconBg: '#001F5408' },
      { icon: Crown, label: 'Badges & VIP', description: 'Tiers, perks & status', path: '/admin/xp-levels', iconBg: '#001F5408' },
      { icon: PiggyBank, label: 'Vault', description: 'Savings & interest', path: '/admin/vault', iconBg: '#001F5408' },
    ],
    commerce: [
      { icon: Store, label: 'Marketplace', description: 'Products & listings', badge: 'NEW', badgeColor: '#10b981', path: '/admin/marketplace', iconBg: '#8B5CF612' },
    ],
    community: [
      { icon: UsersRound, label: 'Squads', description: 'Groups & team rooms', path: '/admin/squad', iconBg: '#06B6D412' },
      { icon: List, label: 'Leaderboard', description: 'Rankings & top users', badge: 'HOT', badgeColor: O, path: '/admin/contests', iconBg: '#06B6D412' },
    ],
    communication: [
      { icon: Bell, label: 'Notifications', description: 'Push & in-app alerts', path: '/admin/notifications', iconBg: `${O}12` },
      { icon: Photo, label: 'Carousel', description: 'Posts, banners & media', path: '/admin/carousel', iconBg: `${O}12` },
    ],
    analytics: [
      { icon: BarChart3, label: 'Analytics', description: 'Data exports & insights', path: '/admin/analytics', iconBg: '#14B8A612' },
    ],
    settings: [
      { icon: Settings, label: 'System Settings', description: 'Platform config & controls', path: '/admin/settings', iconBg: '#EF444410' },
    ],
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>Loading dashboard...</div>
  }

  return (
    <div>
      {/* Top Tabs */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #E9EDF2', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none', border: 'none', padding: '8px 0',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'overview' ? O : '#8899AA',
            borderBottom: activeTab === 'overview' ? `2px solid ${O}` : 'none',
            marginBottom: -1
          }}
        >
          <LayoutDashboard size={14} style={{ display: 'inline', marginRight: 6 }} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('more')}
          style={{
            background: 'none', border: 'none', padding: '8px 0',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            color: activeTab === 'more' ? O : '#8899AA',
            borderBottom: activeTab === 'more' ? `2px solid ${O}` : 'none',
            marginBottom: -1
          }}
        >
          <Gift size={14} style={{ display: 'inline', marginRight: 6 }} /> More
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Balance Card - Gradient */}
          <div style={{
            background: 'linear-gradient(140deg, #001F54 0%, #003B8E 100%)',
            borderRadius: 24, padding: '18px 18px 16px',
            marginBottom: 16, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -70, right: -70, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,111,0,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4 }}>Platform Revenue</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: O }}>$100,000</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.18)', margin: '0 14px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4 }}>Total Users</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{stats?.total_users?.toLocaleString() || '0'}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 12, padding: '9px 13px', display: 'flex', justifyContent: 'space-between', marginBottom: 12, backdropFilter: 'blur(6px)' }}>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Active VIP</div><div style={{ fontSize: 13, fontWeight: 800, color: O }}>30,000</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Vault Value</div><div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>$60K</div></div>
              <div style={{ background: 'rgba(255,111,0,0.22)', borderRadius: 20, padding: '4px 10px', fontSize: 9, fontWeight: 800, color: O, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: O }} /> LIVE
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/admin/analytics')} style={{ flex: 1, height: 40, borderRadius: 12, background: O, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <BarChart3 size={14} /> Analytics
              </button>
              <button onClick={loadStats} style={{ flex: 1, height: 40, borderRadius: 12, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.32)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Platform Stats Grid */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, border: '1px solid #E9EDF2' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#001F54', marginBottom: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Platform Overview</span>
              <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(255,111,0,0.12)', color: O, padding: '3px 9px', borderRadius: 20 }}>NOW</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatItem icon={Users} label="Total Users" value={stats?.total_users?.toLocaleString() || '0'} />
              <StatItem icon={Zap} label="Paid Members" value={stats?.paid_users?.toLocaleString() || '0'} color="#6366f1" />
              <StatItem icon={TrendingUp} label="Total XP" value={stats?.total_xp?.toLocaleString() || '0'} color="#10b981" />
              <StatItem icon={Crown} label="Active VIP" value="30,000" color="#f59e0b" />
              <StatItem icon={PiggyBank} label="Vault Value" value="$60K" color="#10b981" />
              <StatItem icon={DollarSign} label="Revenue" value="$100K" color="#14B8A6" />
            </div>
          </div>

          {/* Recent Users Table */}
          {stats?.recent_users?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E9EDF2', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E9EDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>Recent Signups</span>
                <Eye size={16} color="#8899AA" />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                      {['Username', 'Email', 'Country', 'Level', 'XP', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8899AA', fontWeight: 600, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_users.slice(0, 5).map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #E9EDF2' }}>
                        <td style={{ padding: '11px 16px', color: '#001F54', fontWeight: 600 }}>{u.username}</td>
                        <td style={{ padding: '11px 16px', color: '#5A6E8A' }}>{u.email || '—'}</td>
                        <td style={{ padding: '11px 16px', color: '#5A6E8A' }}>{u.country || '—'}</td>
                        <td style={{ padding: '11px 16px' }}><Badge color={O}>Level {u.level || 0}</Badge></td>
                        <td style={{ padding: '11px 16px', color: O, fontWeight: 700 }}>{(u.coins || 0).toLocaleString()}</td>
                        <td style={{ padding: '11px 16px', color: '#8899AA' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MORE TAB - All menu items CLICKABLE */}
      {activeTab === 'more' && (
        <div>
          {/* Operations */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Operations</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.operations.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Economy */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Economy</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.economy.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Commerce */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Commerce</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.commerce.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Community */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Community</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.community.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Communication */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Communication</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.communication.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Analytics</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.analytics.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '10px 4px 6px' }}>Settings</div>
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,31,84,0.06)' }}>
              {menuSections.settings.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}