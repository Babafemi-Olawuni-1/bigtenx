// ProfilePage.jsx — matches screenshot design
import { useState } from 'react'
import { Sun, Moon, ArrowLeft, LogOut, ChevronRight, Copy, Eye, EyeOff, MessageSquare, Lock, MapPin } from 'lucide-react'
import { t, C } from '../dashboard/tokens'
import { API } from '../auth/api'

const BADGE_COLORS = { bronze: '#CD7F32', silver: '#94A3B8', gold: '#EAB308', diamond: '#2563EB', vip: '#7C3AED' }
const LEVEL_NAMES  = { 0: 'Free', 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Diamond' }

function Row({ icon: Icon, iconColor = C.orange, label, value, onPress, valueColor, action }) {
  return (
    <div onClick={onPress} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', cursor: onPress ? 'pointer' : 'default',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={iconColor} />
      </div>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'inherit' }}>{label}</span>
      {action || (
        <span style={{ fontSize: 13, fontWeight: 700, color: valueColor || '#8899AA' }}>{value}</span>
      )}
      {onPress && !action && <ChevronRight size={14} color="#CCDDEE" />}
    </div>
  )
}

function Section({ title, children, tk }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {title && <div style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>{title}</div>}
      <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${tk.cardBorder}`, color: tk.text }}>
        {children}
      </div>
    </div>
  )
}

function Divider({ tk }) {
  return <div style={{ height: 1, background: tk.cardBorder, marginLeft: 66 }} />
}

export default function ProfilePage({ user, updateUser, darkMode, setDarkMode, onLogout, onBack }) {
  const tk = t(darkMode)
  const [toast, setToast] = useState(null)

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showReferrerModal, setShowReferrerModal] = useState(false)
  const [showTicketModal, setShowTicketModal]   = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Password change state
  const [currentPass, setCurrentPass]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirmPass]   = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [pwLoading, setPwLoading]       = useState(false)

  // Referrer state
  const [refCode, setRefCode]           = useState('')
  const [refLoading, setRefLoading]     = useState(false)

  // Ticket state
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketLoading, setTicketLoading] = useState(false)

  // Address state
  const [address, setAddress]           = useState(user?.address || '')
  const [addressLoading, setAddressLoading] = useState(false)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const levelInt   = parseInt(user?.level ?? 0)
  const planName   = LEVEL_NAMES[levelInt] || 'Bronze'
  const badgeName  = user?.current_badge || null
  const badgeColor = BADGE_COLORS[(badgeName || planName).toLowerCase()] || C.orange
  const isVip      = Boolean(user?.is_vip) || Boolean(user?.vip_active)
  const vaultUnits = user?.vault_units || (badgeName ? 4 : 1)
  const sponsor    = user?.sponsor || null
  const dayOfMonth = new Date().getDate()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referral_code || '')
    showToast('Referral code copied!')
  }

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { showToast('Fill all fields', 'error'); return }
    if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return }
    if (newPass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    setPwLoading(true)
    try {
      const res = await fetch(`${API}/auth/change_password.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, current_password: currentPass, new_password: newPass })
      })
      const data = await res.json()
      if (data.success) { showToast('Password changed!'); setShowPasswordModal(false); setCurrentPass(''); setNewPass(''); setConfirmPass('') }
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setPwLoading(false) }
  }

  const handleAddReferrer = async () => {
    if (!refCode.trim()) { showToast('Enter a referral code', 'error'); return }
    setRefLoading(true)
    try {
      const res = await fetch(`${API}/referral/add_referrer.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, referral_code: refCode.trim() })
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        setShowReferrerModal(false)
        setRefCode('')
        if (updateUser) updateUser({ sponsor: data.referrer_username, referred_by: true })
      } else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setRefLoading(false) }
  }

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) { showToast('Fill subject and message', 'error'); return }
    setTicketLoading(true)
    try {
      const res = await fetch(`${API}/tickets/submit.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, subject: ticketSubject, message: ticketMessage })
      })
      const data = await res.json()
      if (data.success) { showToast('Ticket submitted!'); setShowTicketModal(false); setTicketSubject(''); setTicketMessage('') }
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setTicketLoading(false) }
  }

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${tk.cardBorder}`,
    background: darkMode ? 'rgba(255,255,255,0.06)' : '#F7F8FC',
    color: tk.text, fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  }

  function Modal({ title, onClose, onSubmit, submitLabel, loading: isLoading, children }) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: darkMode ? '#081226' : '#fff', borderRadius: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${tk.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: tk.text }}>{title}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tk.textMuted, fontSize: 18 }}>✕</button>
          </div>
          <div style={{ padding: 20 }}>
            {children}
            <button onClick={onSubmit} disabled={isLoading} style={{ width: '100%', padding: 14, borderRadius: 12, background: C.orange, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 16, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Please wait...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 40 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color={tk.text} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 900, color: tk.text }}>Profile</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 38, height: 38, borderRadius: '50%', background: tk.card, border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #001F54 0%, #002266 100%)', padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,107,0,.08)' }} />

        {/* Avatar — colored by badge, no level number */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}99)`,
            border: '3px solid rgba(255,255,255,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 900, color: '#fff',
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {/* Notification dot if has unread notifications */}
          {Array.isArray(user?.notifications) && user.notifications.filter(n => !n.read).length > 0 && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: '#EAB308', border: '2.5px solid #001F54', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#001F54' }}>
              {user.notifications.filter(n => !n.read).length}
            </div>
          )}
        </div>

        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
          {user?.username || 'user'}
        </span>

        {/* Country pill */}
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 50, padding: '3px 12px', fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          🌍 {user?.country || 'Nigeria'}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, width: '100%', maxWidth: 320, background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 0' }}>
          {[
            { label: 'STREAK', value: `🔥 ${user?.streak ?? 0}` },
            { label: 'OF MONTH', value: `Day ${dayOfMonth}` },
            { label: 'LEVELS', value: badgeName || planName },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '.06em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px 32px' }}>
        {/* ACCOUNT INFO */}
        <Section title="Account" tk={tk}>
          <Row icon={Copy} label="Referral Code" value={user?.referral_code || 'N/A'} valueColor={C.orange} onPress={handleCopyCode} tk={tk} />
          <Divider tk={tk} />
          <Row icon={MessageSquare} iconColor="#6366f1" label="Referred by" value={sponsor || (user?.referred_by ? 'Set' : 'Not set')} valueColor={sponsor ? '#10b981' : '#8899AA'}
            onPress={!user?.referred_by ? () => setShowReferrerModal(true) : undefined} />
          <Divider tk={tk} />
          <Row icon={Lock} iconColor="#10b981" label="Levels" value={badgeName || planName} valueColor={badgeColor} />
        </Section>

        {/* BADGES & VIP */}
        <Section title="Badges & VIP" tk={tk}>
          <Row icon={Lock} iconColor={C.orange} label="VIP Status"
            action={<span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: isVip ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)', color: isVip ? '#10b981' : '#8899AA' }}>{isVip ? 'active' : 'inactive'}</span>}
          />
          <Divider tk={tk} />
          <Row icon={Lock} iconColor="#14B8A6" label="Vault Max Units" value={`× ${vaultUnits}`} valueColor="#14B8A6" />
        </Section>

        {/* SECURITY */}
        <Section title="Security" tk={tk}>
          <Row icon={Lock} iconColor="#EF4444" label="Change Password" onPress={() => setShowPasswordModal(true)} value="→" />
          <Divider tk={tk} />
          <Row icon={MapPin} iconColor="#8B5CF6" label="Save Address" value={address ? '→ Set' : '→ Add'} onPress={() => setShowAddressModal(true)} />
        </Section>

        {/* SUPPORT */}
        <Section title="Support" tk={tk}>
          <Row icon={MessageSquare} iconColor="#3B82F6" label="Customer Support" onPress={() => setShowTicketModal(true)} value="" action={<ChevronRight size={14} color="#CCDDEE" />} />
        </Section>

        {/* LOGOUT */}
        <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: 'rgba(239,68,68,0.04)', borderRadius: 18, border: '1.5px solid rgba(239,68,68,0.15)', justifyContent: 'center', marginTop: 4 }}>
          <LogOut size={16} color="#EF4444" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#EF4444' }}>Log Out</span>
        </div>
      </div>

      {/* ── PASSWORD MODAL ── */}
      {showPasswordModal && (
        <Modal title="Change Password" onClose={() => setShowPasswordModal(false)} onSubmit={handleChangePassword} submitLabel="Change Password" loading={pwLoading}>
          {[
            { label: 'Current Password', val: currentPass, set: setCurrentPass },
            { label: 'New Password', val: newPass, set: setNewPass },
            { label: 'Confirm New Password', val: confirmPass, set: setConfirmPass },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, display: 'block', marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder="••••••••" style={inp} />
                <button onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={15} color={tk.textMuted} /> : <Eye size={15} color={tk.textMuted} />}
                </button>
              </div>
            </div>
          ))}
        </Modal>
      )}

      {/* ── ADD REFERRER MODAL ── */}
      {showReferrerModal && (
        <Modal title="Add Referrer" onClose={() => setShowReferrerModal(false)} onSubmit={handleAddReferrer} submitLabel="Set Referrer" loading={refLoading}>
          <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 14 }}>Enter the referral code of the person who invited you. This can only be set once.</p>
          <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, display: 'block', marginBottom: 6 }}>Referral Code</label>
          <input type="text" value={refCode} onChange={e => setRefCode(e.target.value)} placeholder="e.g. mrmillion" style={inp} />
        </Modal>
      )}

      {/* ── TICKET MODAL ── */}
      {showTicketModal && (
        <Modal title="Customer Support" onClose={() => setShowTicketModal(false)} onSubmit={handleSubmitTicket} submitLabel="Send Ticket" loading={ticketLoading}>
          <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 14 }}>Describe your issue. Our team will reply shortly.</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, display: 'block', marginBottom: 6 }}>Subject</label>
            <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="e.g. Withdrawal issue" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, display: 'block', marginBottom: 6 }}>Message</label>
            <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
        </Modal>
      )}

      {/* ── ADDRESS MODAL ── */}
      {showAddressModal && (
        <Modal title="Save Address" onClose={() => setShowAddressModal(false)}
          onSubmit={async () => {
            setAddressLoading(true)
            // Address is stored locally for now (can be extended to an API)
            if (updateUser) updateUser({ address })
            showToast('Address saved!')
            setShowAddressModal(false)
            setAddressLoading(false)
          }}
          submitLabel="Save Address" loading={addressLoading}>
          <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, display: 'block', marginBottom: 6 }}>Your Address</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full address..." rows={3} style={{ ...inp, resize: 'vertical' }} />
        </Modal>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#EF4444' : '#10b981', color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
