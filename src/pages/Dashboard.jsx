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
import ProfilePage from './ProfilePage'
import UpgradePage from './UpgradePage'
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

  const handleServiceClick = (serviceLabel, screenName) => {
    if (serviceLabel === 'Tasks') { 
      setActiveTab('tasks')
      return 
    }
    if (serviceLabel === 'Levels') { 
      setActiveTab('upgrade')
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
    setModal(serviceLabel)
  }

  const handlePromoAction = (action) => {
    if (action === 'tasks') {
      setActiveTab('tasks')
    } else if (action === 'referral') {
      setActiveTab('refer')
    } else if (action === 'vault') {
      setActiveTab('vault')
    }
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      <DashHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      <BalanceCard 
        user={user} 
        darkMode={darkMode} 
        onUpgrade={onUpgrade} 
        onFund={() => setActiveTab('wallet')} 
      />
      
      <StreakBar user={user} updateUser={updateUser} onUpgrade={onUpgrade} />
      
      <ServicesGrid darkMode={darkMode} onServiceClick={handleServiceClick} />
      
      <PromoCarousel darkMode={darkMode} onAction={handlePromoAction} />
      
      <DashFooter darkMode={darkMode} />
      
      {modal && <ComingSoonModal service={modal} onClose={() => setModal(null)} darkMode={darkMode} />}
    </div>
  )
}

export default function Dashboard({ user: initialUser, onLogout }) {
  const { user, updateUser, darkMode, setDarkMode, activeTab, setActiveTab } = useDashboard()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showVirtualAccount, setShowVirtualAccount] = useState(false)

  const initialUserMerged = useRef(false)
  useEffect(() => {
    if (initialUser && !initialUserMerged.current) {
      initialUserMerged.current = true
      updateUser(initialUser)
    }
    setLoading(false)
  }, [])

  const notifFetched = useRef(null)
  useEffect(() => {
    const uid = user?.id
    if (!uid || notifFetched.current === uid) return
    notifFetched.current = uid
    fetch(`${API}/notifications/index.php?user_id=${uid}`)
      .then(r => r.json())
      .then(data => { if (data.success) updateUser({ notifications: data.notifications }) })
      .catch(() => {})
  }, [user?.id])

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
    setActiveTab('home')
  }

  if (loading) {
    return <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.text }}>Loading...</div>
  }

  if (!user) {
    return <div style={{ background: tk.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.text }}>Please login again</div>
  }

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
          onBack={handleBackFromScreen}
        />
      case 'tasks':
        return <TasksScreen user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} />
      case 'profile':
        return <ProfilePage 
          user={user} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onLogout={onLogout} 
          onUpgrade={openUpgrade}
          onBack={handleBackFromScreen}
        />
      case 'vault':
        return <Vault user={user} updateUser={updateUser} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'refer':
        return <ReferScreen user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'contest':
        return <ContestPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'marketplace':
        return <MarketplacePage user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'exchange':
        return <ExchangePage user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'academy':
        return <AcademyPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'squad':
        return <SquadPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBackFromScreen} />
      case 'upgrade':
        return <UpgradePage 
          user={user} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onClose={handleBackFromScreen}
          onUpgrade={(plan) => {
            updateUser({ level: plan === 'bronze' ? 1 : plan === 'silver' ? 2 : plan === 'gold' ? 3 : 4 })
            openUpgrade()
          }}
        />
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