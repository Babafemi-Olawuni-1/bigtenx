import { useState, useEffect, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDashboard } from '../dashboard/useDashboard'
import { t, C } from '../dashboard/tokens'
import DashHeader from '../dashboard/DashHeader'
import BalanceCard from '../dashboard/BalanceCard'
import StreakBar from '../dashboard/StreakBar'
import ServicesGrid from '../dashboard/ServicesGrid'
import PromoCarousel from '../dashboard/PromoCarousel'
import BottomNav from '../dashboard/BottomNav'
import DashFooter from '../dashboard/DashFooter'
import TasksScreen from '../dashboard/TasksScreen'
import UpgradeModal from '../dashboard/UpgradeModal'
import Wallet from './Wallet'
import Vault from './Vault'
import DepositScreen from './DepositScreen'
import VirtualAccountScreen from './VirtualAccountScreen'
import ReferScreen from './ReferScreen'
import ContestPage from './ContestPage'
import MarketplacePage from './MarketplacePage'
import ExchangePage from './ExchangePage'
import AcademyPage from './AcademyPage'
import SquadPage from './SquadPage'
import { getFlagEmoji } from '../dashboard/countryFlags'
import { isLevelActive, LEVEL_MAP } from '../dashboard/levels'
import { API } from '../auth/api'

function cleanConfetti() {
  document.querySelectorAll('.confetti-piece').forEach(el => el.remove())
}

function ComingSoonModal({ service, onClose, darkMode }) {
  const tk = t(darkMode)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }} onClick={onClose}>
      <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 24, padding: '36px 28px', textAlign: 'center', maxWidth: 300, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: tk.text, fontSize: 18, marginBottom: 8 }}>{service}</h3>
        <p style={{ color: tk.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>This feature is coming soon. Stay tuned!</p>
        <button onClick={onClose} style={{ width: '100%', background: C.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Got it!</button>
      </div>
    </div>
  )
}

function HomeScreen({ user, updateUser, darkMode, setDarkMode, setActiveTab, onUpgrade }) {
  const [modal, setModal] = useState(null)
  const tk = t(darkMode)
  const active = isLevelActive(user)
  const levelInfo = LEVEL_MAP[user?.level]

  const handleServiceClick = (serviceLabel, screenName) => {
    // Handle navigation for different services
    if (serviceLabel === 'Tasks') { 
      setActiveTab('tasks')
      return 
    }
    if (serviceLabel === 'Levels') { 
      onUpgrade()
      return 
    }
    if (serviceLabel === 'Vault') {
      setActiveTab('vault')
      return
    }
    if (serviceLabel === 'Referral') {
      setActiveTab('refer')
      return
    }
    if (serviceLabel === 'Contest') {
      setActiveTab('contest')
      return
    }
    if (serviceLabel === 'Exchange') {
      setActiveTab('exchange')
      return
    }
    if (serviceLabel === 'Academy') {
      setActiveTab('academy')
      return
    }
    if (serviceLabel === 'Marketplace') {
      setActiveTab('marketplace')
      return
    }
    // For other services, show coming soon modal
    setModal(serviceLabel)
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      <DashHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {!active && (
        <div onClick={onUpgrade} style={{ margin: '0 16px 13px', background: `linear-gradient(135deg,#001F54,#0a3080)`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid rgba(255,111,0,0.25)` }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 2px' }}>🔒 Account not activated</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>Upgrade from $1 to unlock all features</p>
          </div>
          <span style={{ background: C.orange, color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Upgrade</span>
        </div>
      )}
      {active && levelInfo && (
        <div style={{ margin: '0 16px 13px', background: darkMode ? 'rgba(255,111,0,0.08)' : `${C.orange}10`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${C.orange}25` }}>
          <span style={{ fontSize: 12, color: darkMode ? 'rgba(255,255,255,0.6)' : C.navy, fontWeight: 500 }}>
            🏆 {levelInfo.name} · {levelInfo.dailyCoins} points/day · {levelInfo.commission}% commission
          </span>
          <span style={{ fontSize: 11, color: C.orange, fontWeight: 600 }}>
            Exp: {user.levelExpires ? new Date(user.levelExpires).toLocaleDateString() : '—'}
          </span>
        </div>
      )}

      <BalanceCard user={user} darkMode={darkMode} onUpgrade={onUpgrade} />
      <StreakBar user={user} updateUser={updateUser} onUpgrade={onUpgrade} />
      <ServicesGrid darkMode={darkMode} onServiceClick={handleServiceClick} />
      <PromoCarousel darkMode={darkMode} />
      <DashFooter darkMode={darkMode} />
      {modal && <ComingSoonModal service={modal} onClose={() => setModal(null)} darkMode={darkMode} />}
    </div>
  )
}

function ProfileScreen({ user, darkMode, setDarkMode, onLogout, onUpgrade }) {
  const tk = t(darkMode)
  const active = isLevelActive(user)
  const levelInfo = LEVEL_MAP[user?.level]
  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 10px', background: tk.bg }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: tk.text, fontSize: 20 }}>Profile</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 34, height: 34, borderRadius: '50%', background: tk.iconBg, border: darkMode ? `1px solid rgba(255,111,0,0.22)` : 'none', cursor: 'pointer' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>
      <div style={{ padding: '8px 16px' }}>
        <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 24, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${C.orange},#FF9A00)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="64" height="64" viewBox="0 0 42 42"><circle cx="21" cy="21" r="21" fill="rgba(255,255,255,0.18)"/><circle cx="21" cy="16" r="7" fill="rgba(255,255,255,0.85)"/><ellipse cx="21" cy="38" rx="13" ry="9" fill="rgba(255,255,255,0.85)"/></svg>
          </div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: tk.text, fontSize: 18, marginBottom: 4 }}>{user?.username}</p>
          <p style={{ color: tk.textMuted, fontSize: 13, marginBottom: 4 }}>{user?.email || ''}</p>
          <p style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>{getFlagEmoji(user?.country)} {user?.country || 'Nigeria'}</p>
          {active && levelInfo && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.orange}15`, border: `1px solid ${C.orange}30`, borderRadius: 999, padding: '4px 12px', marginTop: 8 }}><span style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>🏆 {levelInfo.name} Member</span></div>}
        </div>
        <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
          {[
            ['Referral Code', user?.referralCode || 'N/A'],
            ['Points', (user?.coins || 0).toLocaleString()],
            ['Level', active ? `${levelInfo?.name || 'Active'}` : 'Not activated'],
            ['Streak', `Day ${user?.streakMonth || 0} this month`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ color: tk.textMuted, fontSize: 13 }}>{k}</span>
              <span style={{ color: tk.text, fontWeight: 700, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        {!active && <button onClick={onUpgrade} style={{ width: '100%', background: C.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 12 }}>Upgrade Your Account</button>}
        <button onClick={onLogout} style={{ width: '100%', background: 'transparent', border: `1.5px solid rgba(239,68,68,0.4)`, borderRadius: 12, padding: '12px', color: '#f87171', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Log Out</button>
      </div>
      <DashFooter darkMode={darkMode} />
    </div>
  )
}

export default function Dashboard({ user: initialUser, onLogout }) {
  const { user, updateUser, darkMode, setDarkMode, activeTab, setActiveTab } = useDashboard()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showVirtualAccount, setShowVirtualAccount] = useState(false)

  // Only merge initialUser into store once on mount — never again.
  const initialUserMerged = useRef(false)
  useEffect(() => {
    if (initialUser && !initialUserMerged.current) {
      initialUserMerged.current = true
      updateUser(initialUser)
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch notifications once per user id — NOT on every updateUser reference change.
  const notifFetched = useRef(null)
  useEffect(() => {
    const uid = user?.id
    if (!uid || notifFetched.current === uid) return
    notifFetched.current = uid
    fetch(`${API}/notifications/index.php?user_id=${uid}`)
      .then(r => r.json())
      .then(data => { if (data.success) updateUser({ notifications: data.notifications }) })
      .catch(() => {})
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const tk = t(darkMode)
  const openUpgrade = () => setShowUpgrade(true)

  const handleDeposit = () => {
    setShowDeposit(true)
  }

  const handleVirtualAccount = () => {
    setShowVirtualAccount(true)
  }

  const handleBackFromDeposit = () => {
    setShowDeposit(false)
  }

  const handleBackFromVirtual = () => {
    setShowVirtualAccount(false)
  }

  const handleBackFromScreen = () => {
    setActiveTab('wallet')
  }

  if (loading) {
    return <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.text }}>Loading...</div>
  }

  if (!user) {
    return <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.text }}>Please login again</div>
  }

  // Handle nested screens (deposit, virtual account)
  if (showDeposit) {
    return (
      <div style={{ background: tk.bg, fontFamily: "'Sora',sans-serif", minHeight: '100vh' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
          <DepositScreen 
            user={user} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            onBack={handleBackFromDeposit} 
          />
        </div>
      </div>
    )
  }

  if (showVirtualAccount) {
    return (
      <div style={{ background: tk.bg, fontFamily: "'Sora',sans-serif", minHeight: '100vh' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
          <VirtualAccountScreen 
            user={user} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            onBack={handleBackFromVirtual} 
          />
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'wallet':
        return <Wallet 
          user={user} 
          updateUser={updateUser} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onUpgrade={openUpgrade}
          onDeposit={handleDeposit}
          onVirtualAccount={handleVirtualAccount}
        />
      case 'tasks':
        return <TasksScreen user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'profile':
        return <ProfileScreen user={user} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={onLogout} onUpgrade={openUpgrade} />
      case 'vault':
        return <Vault user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'refer':
        return <ReferScreen user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'contest':
        return <ContestPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'marketplace':
        return <MarketplacePage user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'exchange':
        return <ExchangePage user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'academy':
        return <AcademyPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'squad':
        return <SquadPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      default:
        return <HomeScreen user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} setActiveTab={setActiveTab} onUpgrade={openUpgrade} />
    }
  }

  return (
    <div style={{ background: tk.bg, fontFamily: "'Sora',sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, paddingBottom: 70 }}>
          {renderScreen()}
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
      </div>
      {showUpgrade && <UpgradeModal user={user} updateUser={updateUser} darkMode={darkMode} onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}