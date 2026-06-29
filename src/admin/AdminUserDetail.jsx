// AdminUserDetail.jsx - Full user detail page with all tabs
import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Mail, Edit2, UserX, Trash2,
  CheckCircle, XCircle, DollarSign, TrendingUp,
  Users, Gift, Shield, RefreshCw, X, Check
} from 'lucide-react'
import { API, O, getTheme } from './adminUtils'

const TABS = ['Account', 'Basic Info', 'Earnings', 'Tickets', 'Referral', 'Vault']
const LEVEL_NAMES = ['Free', 'Bronze', 'Silver', 'Gold', 'Diamond']

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? O : '#CBD5E0',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 23 : 3,
        width: 18, height: 18,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #E9EDF2',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#001F54' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#8899AA" />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])
  const bg = type === 'success' ? '#10b981' : type === 'error' ? '#EF4444' : '#001F54'
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', borderRadius: 12,
      padding: '12px 20px', fontSize: 13, fontWeight: 600,
      zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {type === 'success' ? <Check size={14} /> : <X size={14} />}
      {msg}
    </div>
  )
}

function TicketsTab({ userId, token }) {
  const [tickets, setTickets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [replyText, setReplyText] = useState({})
  const [sending, setSending]     = useState(null)
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  useEffect(() => {
    fetch(`${API}/admin/tickets.php?user_id=${userId}`, { headers })
      .then(r => r.json())
      .then(d => { if (d.success) setTickets(d.tickets || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const sendReply = async (ticketId) => {
    const reply = replyText[ticketId] || ''
    if (!reply.trim()) return
    setSending(ticketId)
    try {
      const res  = await fetch(`${API}/admin/tickets.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ ticket_id: ticketId, reply, status: 'replied' })
      })
      const data = await res.json()
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, admin_reply: reply, status: 'replied' } : t))
        setReplyText(prev => ({ ...prev, [ticketId]: '' }))
      }
    } catch {} finally { setSending(null) }
  }

  const statusColor = (s) => s === 'open' ? '#F59E0B' : s === 'replied' ? '#10b981' : '#8899AA'

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>Loading tickets...</div>

  if (tickets.length === 0) return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #E9EDF2', textAlign: 'center', color: '#8899AA' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>No tickets yet</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {tickets.map(ticket => (
        <div key={ticket.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9EDF2', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>{ticket.subject}</div>
              <div style={{ fontSize: 11, color: '#8899AA', marginTop: 2 }}>{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: statusColor(ticket.status) + '15', color: statusColor(ticket.status) }}>
              {ticket.status?.toUpperCase()}
            </span>
          </div>
          <div style={{ padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F0F2F5' }}>
            {ticket.message}
          </div>
          {ticket.admin_reply && (
            <div style={{ padding: '10px 16px', background: '#F0FDF4', fontSize: 12, color: '#166534', borderBottom: '1px solid #F0F2F5' }}>
              <strong>Admin Reply:</strong> {ticket.admin_reply}
            </div>
          )}
          <div style={{ padding: 12, display: 'flex', gap: 8 }}>
            <input type="text" value={replyText[ticket.id] || ''} onChange={e => setReplyText(p => ({ ...p, [ticket.id]: e.target.value }))}
              placeholder="Type your reply..." style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E9EDF2', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
            />
            <button onClick={() => sendReply(ticket.id)} disabled={sending === ticket.id} style={{ padding: '8px 16px', borderRadius: 10, background: '#FF6F00', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: sending === ticket.id ? 0.7 : 1 }}>
              {sending === ticket.id ? '...' : 'Reply'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminUserDetail({ userId, token, onBack }) {  const [userData, setUserData] = useState(null)
  const [referrals, setReferrals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Account')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  // Account tab state
  const [accountStatus, setAccountStatus] = useState(1)
  const [depositStatus, setDepositStatus] = useState(1)
  const [withdrawStatus, setWithdrawStatus] = useState(1)
  const [isVerified, setIsVerified] = useState(1)

  // Modals
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showDebitModal, setShowDebitModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [debitAmount, setDebitAmount] = useState('')
  const [debitReason, setDebitReason] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)

  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const loadUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/user-details.php?user_id=${userId}`, { headers })
      const data = await res.json()
      if (data.success) {
        setUserData(data.user)
        setReferrals(data.referrals)
        setAccountStatus(data.user.account_status ?? 1)
        setDepositStatus(data.user.deposit_status ?? 1)
        setWithdrawStatus(data.user.withdraw_status ?? 1)
        setIsVerified(data.user.is_verified ?? 1)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [userId, token])

  useEffect(() => { loadUser() }, [loadUser])

  const saveAccountSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/admin/user-details.php`, {
        method: 'POST', headers,
        body: JSON.stringify({
          user_id: userId, action: 'update_settings',
          account_status: accountStatus, deposit_status: depositStatus,
          withdraw_status: withdrawStatus, is_verified: isVerified,
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('Settings saved successfully', 'success')
        loadUser()
      } else showToast(data.message || 'Save failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setSaving(false) }
  }

  const handleWalletAction = async (action, amount, reason) => {
    setWalletLoading(true)
    try {
      const res = await fetch(`${API}/admin/wallet.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ action, user_id: userId, amount: parseFloat(amount), reason })
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message, 'success')
        setShowCreditModal(false); setShowDebitModal(false)
        setCreditAmount(''); setCreditReason(''); setDebitAmount(''); setDebitReason('')
        loadUser()
      } else showToast(data.message || 'Action failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setWalletLoading(false) }
  }

  const handleFreezeToggle = async () => {
    const action = (depositStatus === 0 && withdrawStatus === 0) ? 'unfreeze' : 'freeze'
    setWalletLoading(true)
    try {
      const res = await fetch(`${API}/admin/wallet.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ action, user_id: userId })
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message, 'success')
        loadUser()
      } else showToast(data.message || 'Action failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setWalletLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E9EDF2', fontSize: 13, fontFamily: 'inherit',
    background: '#F7F8FC', boxSizing: 'border-box', outline: 'none',
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12 }}>Loading user details...</div>
      </div>
    )
  }

  if (!userData) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>User not found.</div>
  }

  const u = userData
  const isFrozen = depositStatus === 0 && withdrawStatus === 0
  const avatarLetter = u.username?.charAt(0).toUpperCase() || 'U'
  const avatarColors = ['linear-gradient(135deg,#FF6F00,#FF9A00)', 'linear-gradient(135deg,#14B8A6,#06B6D4)', 'linear-gradient(135deg,#8B5CF6,#A78BFA)', 'linear-gradient(135deg,#EF4444,#F97316)']
  const avatarBg = avatarColors[(u.username?.length || 0) % avatarColors.length]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back button */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'none',
        border: 'none', cursor: 'pointer', color: '#5A6E8A', fontSize: 13,
        fontWeight: 600, marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #001F54 0%, #003B8E 100%)',
        borderRadius: 20, padding: '20px', marginBottom: 16,
        boxShadow: '0 8px 24px rgba(0,31,84,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.3)',
          }}>{avatarLetter}</div>

          {/* Center info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{u.username}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>@{u.username}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Joined {new Date(u.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Action icons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { icon: Mail, title: 'Email', action: () => window.open(`mailto:${u.email}`) },
              { icon: Edit2, title: 'Edit', action: () => showToast('Edit coming soon', 'info') },
              { icon: UserX, title: 'Suspend', action: () => { setAccountStatus(a => a === 1 ? 0 : 1); showToast('Toggle Account Status in Account tab', 'info') } },
            ].map(({ icon: Icon, title, action }) => (
              <button key={title} onClick={action} title={title} style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Icon size={15} color="#fff" />
              </button>
            ))}
          </div>
        </div>

        {/* Wallet summary */}
        <div style={{
          marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              ${parseFloat(u.usd_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'rgba(255,111,0,0.15)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,111,0,0.25)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FF9A00', marginTop: 4 }}>
              {parseInt(u.coins).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap',
            background: activeTab === tab ? O : '#fff',
            border: `1.5px solid ${activeTab === tab ? O : '#E9EDF2'}`,
            color: activeTab === tab ? '#fff' : '#5A6E8A',
            fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.15s',
          }}>{tab}</button>
        ))}
      </div>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === 'Account' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9EDF2' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#001F54', marginBottom: 16 }}>Account Controls</div>

          {[
            { label: 'Account Status', desc: 'Active / Disabled', val: accountStatus, set: setAccountStatus, onLabel: 'Active', offLabel: 'Disabled' },
            { label: 'Deposit Status', desc: 'Enable / Disable deposits', val: depositStatus, set: setDepositStatus, onLabel: 'Enabled', offLabel: 'Disabled' },
            { label: 'Withdrawal Status', desc: 'Enable / Disable withdrawals', val: withdrawStatus, set: setWithdrawStatus, onLabel: 'Enabled', offLabel: 'Disabled' },
            { label: 'Verification Status', desc: 'Verified / Unverified', val: isVerified, set: setIsVerified, onLabel: 'Verified', offLabel: 'Unverified' },
          ].map(({ label, desc, val, set, onLabel, offLabel }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: '1px solid #F0F2F5',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#001F54' }}>{label}</div>
                <div style={{ fontSize: 11, color: '#8899AA', marginTop: 2 }}>{val === 1 ? onLabel : offLabel}</div>
              </div>
              <Toggle on={val === 1} onToggle={() => set(v => v === 1 ? 0 : 1)} />
            </div>
          ))}

          {/* Freeze / Unfreeze quick action */}
          <div style={{ marginTop: 16, padding: '12px', background: '#F7F8FC', borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: '#8899AA', marginBottom: 8, fontWeight: 600 }}>Quick Wallet Actions</div>
            <button onClick={handleFreezeToggle} disabled={walletLoading} style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: isFrozen ? '#10b981' : '#EF4444', color: '#fff',
              fontWeight: 700, fontSize: 12,
            }}>
              {walletLoading ? 'Processing...' : isFrozen ? '🔓 Unfreeze Wallet' : '🔒 Freeze Wallet'}
            </button>
          </div>

          <button onClick={saveAccountSettings} disabled={saving} style={{
            width: '100%', padding: '14px', marginTop: 16,
            borderRadius: 12, background: O, border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* ── BASIC INFO TAB ── */}
      {activeTab === 'Basic Info' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9EDF2' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#001F54', marginBottom: 16 }}>Basic Information</div>
          {[
            ['Username', u.username],
            ['Email', u.email],
            ['Country', u.country || '—'],
            ['Referral Code', u.referral_code || '—'],
            ['Sponsor', u.sponsor || '—'],
            ['Level', LEVEL_NAMES[u.level] || `Level ${u.level}`],
            ['VIP Status', u.is_vip ? '⭐ VIP Active' : 'Not VIP'],
            ['Current Badge', u.current_badge || 'None'],
            ['XP Multiplier', `${u.current_multiplier || 1}x`],
            ['Streak', `${u.streak || 0} days`],
            ['Join Date', new Date(u.created_at).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F0F2F5',
            }}>
              <span style={{ fontSize: 12, color: '#8899AA', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, color: '#001F54', fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── EARNINGS TAB ── */}
      {activeTab === 'Earnings' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9EDF2', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#001F54', marginBottom: 16 }}>Earnings Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Wallet Balance', val: `$${parseFloat(u.usd_balance).toFixed(2)}`, color: '#10b981' },
                { label: 'XP Balance', val: `${parseInt(u.coins).toLocaleString()} XP`, color: O },
                { label: "Today's Earnings", val: `${u.today_earnings || 0} XP`, color: '#3B82F6' },
                { label: 'Today Cash', val: `$${parseFloat(u.today_earnings_cash || 0).toFixed(2)}`, color: '#8B5CF6' },
                { label: 'Referral Earnings', val: `$${parseFloat(u.referral_earnings || 0).toFixed(2)}`, color: '#EC4899' },
                { label: 'Total Deposits', val: `$${parseFloat(u.total_deposits || 0).toFixed(2)}`, color: '#14B8A6' },
                { label: 'Total Withdrawals', val: `$${parseFloat(u.total_withdrawals || 0).toFixed(2)}`, color: '#F59E0B' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: '#F7F8FC', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, color: '#8899AA', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 4 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Credit / Debit Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setShowCreditModal(true)} style={{
                padding: '12px', borderRadius: 12, background: '#10b981', border: 'none',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <DollarSign size={14} /> Credit User
              </button>
              <button onClick={() => setShowDebitModal(true)} style={{
                padding: '12px', borderRadius: 12, background: '#EF4444', border: 'none',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <DollarSign size={14} /> Debit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REFERRAL TAB ── */}
      {activeTab === 'Referral' && referrals && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9EDF2' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#001F54', marginBottom: 16 }}>Referral Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Sponsor', val: u.sponsor || '—' },
              { label: 'Total Referrals', val: referrals.referral_count },
              { label: 'Active Referrals', val: referrals.active_referrals },
              { label: 'VIP Referrals', val: referrals.vip_referrals },
              { label: 'Total Commissions', val: `$${parseFloat(referrals.total_commissions || 0).toFixed(2)}` },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: '#F7F8FC', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 10, color: '#8899AA', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#001F54', marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Referral history list */}
          <div style={{ fontWeight: 600, fontSize: 12, color: '#8899AA', marginBottom: 10 }}>
            Referral History ({referrals.referral_list?.length || 0})
          </div>
          {(referrals.referral_list || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#8899AA', fontSize: 12 }}>No referrals yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(referrals.referral_list || []).map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: '#F7F8FC', borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#FF6F00,#FF9A00)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{r.username?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#001F54' }}>{r.username}</div>
                      <div style={{ fontSize: 10, color: '#8899AA' }}>
                        Level {r.level} {r.is_vip ? '• ⭐ VIP' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: r.level_paid ? '#10b98115' : '#F0F2F5',
                      color: r.level_paid ? '#10b981' : '#8899AA',
                    }}>{r.level_paid ? 'Active' : 'Pending'}</div>
                    <div style={{ fontSize: 10, color: '#8899AA', marginTop: 2 }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TICKETS TAB ── */}
      {activeTab === 'Tickets' && (
        <TicketsTab userId={userId} token={token} />
      )}

      {/* ── VAULT TAB ── */}
      {activeTab === 'Vault' && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #E9EDF2',
          textAlign: 'center', color: '#8899AA',
        }}>
          <Gift size={40} color="#E9EDF2" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#001F54' }}>Vault Details</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Vault view coming soon</div>
        </div>
      )}

      {/* ── CREDIT MODAL ── */}
      {showCreditModal && (
        <Modal title="Credit User" onClose={() => setShowCreditModal(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>
              Amount (USD)
            </label>
            <input
              type="number" min="0" step="0.01"
              value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
              placeholder="e.g. 10.00" style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>
              Reason (optional)
            </label>
            <input
              type="text" value={creditReason} onChange={e => setCreditReason(e.target.value)}
              placeholder="e.g. Bonus reward" style={inputStyle}
            />
          </div>
          <button
            onClick={() => handleWalletAction('credit', creditAmount, creditReason)}
            disabled={walletLoading || !creditAmount}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              background: creditAmount ? '#10b981' : '#E9EDF2',
              border: 'none', color: '#fff', fontWeight: 700,
              fontSize: 14, cursor: creditAmount ? 'pointer' : 'not-allowed',
            }}
          >
            {walletLoading ? 'Processing...' : `Credit $${parseFloat(creditAmount || 0).toFixed(2)}`}
          </button>
        </Modal>
      )}

      {/* ── DEBIT MODAL ── */}
      {showDebitModal && (
        <Modal title="Debit User" onClose={() => setShowDebitModal(false)}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#8899AA', marginBottom: 12 }}>
              Current balance: <strong style={{ color: '#001F54' }}>${parseFloat(u.usd_balance).toFixed(2)}</strong>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>
              Amount (USD)
            </label>
            <input
              type="number" min="0" step="0.01"
              value={debitAmount} onChange={e => setDebitAmount(e.target.value)}
              placeholder="e.g. 5.00" style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>
              Reason (optional)
            </label>
            <input
              type="text" value={debitReason} onChange={e => setDebitReason(e.target.value)}
              placeholder="e.g. Chargeback" style={inputStyle}
            />
          </div>
          <button
            onClick={() => handleWalletAction('debit', debitAmount, debitReason)}
            disabled={walletLoading || !debitAmount}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              background: debitAmount ? '#EF4444' : '#E9EDF2',
              border: 'none', color: '#fff', fontWeight: 700,
              fontSize: 14, cursor: debitAmount ? 'pointer' : 'not-allowed',
            }}
          >
            {walletLoading ? 'Processing...' : `Debit $${parseFloat(debitAmount || 0).toFixed(2)}`}
          </button>
        </Modal>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
