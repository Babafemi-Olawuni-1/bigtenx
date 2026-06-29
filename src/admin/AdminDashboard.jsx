// AdminDashboard.jsx — Overview matching sketch: platform stats + deposits + withdrawals
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, O } from './adminUtils'
import {
  Users, Zap, TrendingUp, CheckSquare, DollarSign, RefreshCw, Eye,
  Wallet, Store, Crown, Share2, PiggyBank, Bell, Image,
  BarChart3, Settings, ChevronRight, LayoutDashboard, Gift,
  Trophy, ClipboardList, UsersRound, List, ArrowDownToLine,
  ArrowUpFromLine, Clock, XCircle, Percent
} from 'lucide-react'

function Badge({ children, color }) {
  return (
    <span style={{
      background: `${color}15`, color, borderRadius: 30,
      padding: '2px 8px', fontSize: 9, fontWeight: 800
    }}>{children}</span>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '14px 14px',
      border: '1px solid #E9EDF2',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#8899AA', fontWeight: 600, lineHeight: 1 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#001F54', marginTop: 3, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#8899AA', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid #E9EDF2',
      overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid #E9EDF2',
        fontWeight: 800, fontSize: 13, color: '#001F54',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>{title}</div>
      <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
  )
}

function MenuItem({ icon: Icon, label, description, badge, badgeColor, path }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => path && navigate(path)}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px',
        borderBottom: '1px solid #F0F2F8', cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#FFF8F3'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 11, background: `${O}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} color={O} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#001F54' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#8899AA', marginTop: 1 }}>{description}</div>
      </div>
      {badge && <Badge color={badgeColor || O}>{badge}</Badge>}
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
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/stats.php`, { headers })
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadStats() }, [loadStats])

  const fmt = (n) => Number(n || 0).toLocaleString()
  const fmtUsd = (n) => '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const menuSections = [
    { title: 'Operations', items: [
      { icon: Users, label: 'Users', description: 'Manage all accounts', path: '/admin/users' },
      { icon: Wallet, label: 'Wallet / Vault', description: 'Deposits & withdrawals', badge: 'LIVE', badgeColor: '#EF4444', path: '/admin/vault' },
      { icon: ClipboardList, label: 'Tasks', description: 'Create & track tasks', path: '/admin/tasks' },
      { icon: Trophy, label: 'Contests', description: 'Competitions & events', badge: 'NEW', badgeColor: '#10b981', path: '/admin/contests' },
    ]},
    { title: 'Economy', items: [
      { icon: TrendingUp, label: 'XP & Levels', description: 'Point system & tiers', path: '/admin/xp-levels' },
      { icon: Share2, label: 'Referrals', description: 'Referral links & rewards', path: '/admin/referral' },
      { icon: Crown, label: 'Badges & VIP', description: 'Tiers, perks & status', path: '/admin/xp-levels' },
      { icon: PiggyBank, label: 'Vault', description: 'Savings & interest', path: '/admin/vault' },
    ]},
    { title: 'Commerce', items: [
      { icon: Store, label: 'Marketplace', description: 'Products & listings', badge: 'NEW', badgeColor: '#10b981', path: '/admin/marketplace' },
    ]},
    { title: 'Communication', items: [
      { icon: Bell, label: 'Notifications', description: 'Push & in-app alerts', path: '/admin/notifications' },
      { icon: Image, label: 'Carousel', description: 'Banners & media', path: '/admin/carousel' },
    ]},
    { title: 'Analytics & Settings', items: [
      { icon: BarChart3, label: 'Analytics', description: 'Data & insights', path: '/admin/analytics' },
      { icon: Settings, label: 'System Settings', description: 'Platform config', path: '/admin/settings' },
    ]},
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>
        <RefreshCw size={22} color={O} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 10, fontSize: 13 }}>Loading dashboard...</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const s = stats || {}

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E9EDF2' }}>
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'more', label: 'More', icon: Gift },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: 'none', border: 'none', padding: '10px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: activeTab === tab.id ? O : '#8899AA',
            borderBottom: activeTab === tab.id ? `2px solid ${O}` : '2px solid transparent',
            marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={loadStats} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '10px 12px',
          color: '#8899AA', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div>
          {/* Hero card */}
          <div style={{
            background: 'linear-gradient(135deg, #001F54 0%, #003B8E 100%)',
            borderRadius: 24, padding: '20px', marginBottom: 20,
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,31,84,0.25)',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,111,0,0.1)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BigTenX Admin</span>
                <div style={{ background: 'rgba(255,111,0,0.25)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: O }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: O }}>LIVE</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Platform Overview</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Users</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>{fmt(s.total_users)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Paid Members</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>{fmt(s.paid_users)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total XP</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FF9A00', marginTop: 2 }}>{fmt(s.total_xp)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active VIP</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FF9A00', marginTop: 2 }}>{fmt(s.vip_users)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => navigate('/admin/analytics')} style={{
                  flex: 1, height: 40, borderRadius: 12, background: O, border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <BarChart3 size={14} /> Analytics
                </button>
                <button onClick={() => navigate('/admin/users')} style={{
                  flex: 1, height: 40, borderRadius: 12, background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Users size={14} /> Users
                </button>
              </div>
            </div>
          </div>

          {/* Deposits Section */}
          <SectionCard title="💰 Deposits">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard icon={ArrowDownToLine} label="Total Deposited" value={fmtUsd(s.total_deposited)} color="#10b981" />
              <StatCard icon={Clock} label="Pending Deposits" value={fmt(s.pending_deposits)} color="#F59E0B" />
              <StatCard icon={XCircle} label="Rejected Deposits" value={fmt(s.rejected_deposits)} color="#EF4444" />
              <StatCard icon={Percent} label="Deposit Fees" value={fmtUsd(s.deposit_fees)} color="#6366f1" />
            </div>
            <button onClick={() => navigate('/admin/vault')} style={{
              marginTop: 12, width: '100%', padding: '10px', borderRadius: 12,
              background: `${O}10`, border: `1px solid ${O}20`,
              color: O, fontWeight: 700, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Eye size={13} /> View All Deposits
            </button>
          </SectionCard>

          {/* Withdrawals Section */}
          <SectionCard title="💸 Withdrawals">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard icon={ArrowUpFromLine} label="Total Withdrawn" value={fmtUsd(s.total_withdrawn)} color="#3B82F6" />
              <StatCard icon={Clock} label="Pending Withdrawals" value={fmt(s.pending_withdrawals)} color="#F59E0B" />
              <StatCard icon={XCircle} label="Rejected Withdrawals" value={fmt(s.rejected_withdrawals)} color="#EF4444" />
              <StatCard icon={Percent} label="Withdrawal Fees" value={fmtUsd(s.withdrawal_fees)} color="#8B5CF6" />
            </div>
            <button onClick={() => navigate('/admin/vault')} style={{
              marginTop: 12, width: '100%', padding: '10px', borderRadius: 12,
              background: '#3B82F610', border: '1px solid #3B82F620',
              color: '#3B82F6', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Eye size={13} /> View All Withdrawals
            </button>
          </SectionCard>

          {/* Recent Signups */}
          {(s.recent_users?.length > 0) && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E9EDF2', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E9EDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#001F54' }}>Recent Signups</span>
                <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: O, fontSize: 11, fontWeight: 700 }}>View All →</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                      {['User', 'Country', 'Level', 'XP', 'Balance', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#8899AA', fontWeight: 600, fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.recent_users.slice(0, 6).map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F0F2F5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: `linear-gradient(135deg,${O},#FF9A00)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                            }}>{u.username?.charAt(0).toUpperCase()}</div>
                            <span style={{ fontWeight: 600, color: '#001F54' }}>{u.username}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#5A6E8A' }}>{u.country || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <Badge color={O}>L{u.level}</Badge>
                        </td>
                        <td style={{ padding: '10px 14px', color: O, fontWeight: 700 }}>{fmt(u.coins)}</td>
                        <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 700 }}>${parseFloat(u.usd_balance || 0).toFixed(2)}</td>
                        <td style={{ padding: '10px 14px', color: '#8899AA' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MORE TAB ── */}
      {activeTab === 'more' && (
        <div>
          {menuSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#AABBCC', padding: '8px 4px 6px' }}>
                {section.title}
              </div>
              <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,31,84,0.05)' }}>
                {section.items.map((item, ii) => (
                  <MenuItem key={ii} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
