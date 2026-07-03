import { useState, useEffect, useRef } from 'react'
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
import { API } from '../auth/api'

function ComingSoonModal({ service, onClose, darkMode }) {
  const tk = t(darkMode)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.cardBorder}`,
          borderRadius: 24,
          padding: '36px 28px',
          textAlign: 'center',
          maxWidth: 300,
          width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: tk.text }}>{service}</h3>
        <p style={{ color: tk.textMuted }}>Coming soon</p>
      </div>
    </div>
  )
}

function HomeScreen({
  user,
  updateUser,
  darkMode,
  setDarkMode,
  setActiveTab,
  onUpgrade
}) {
  const [modal, setModal] = useState(null)
  const tk = t(darkMode)

  const handleServiceClick = (serviceLabel) => {
    const routes = {
      Tasks: 'tasks',
      Levels: 'upgrade',
      Vault: 'vault',
      Referral: 'refer',
      Contest: 'contest',
      Exchange: 'exchange',
      Academy: 'academy',
      Marketplace: 'marketplace'
    }

    if (routes[serviceLabel]) {
      setActiveTab(routes[serviceLabel])
      return
    }

    setModal(serviceLabel)
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%' }}>
      <DashHeader user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      <BalanceCard
        user={user}
        darkMode={darkMode}
        onUpgrade={onUpgrade}
        onFund={() => setActiveTab('wallet-deposit')}
        onWithdraw={() => setActiveTab('wallet-withdraw')}
      />

      <StreakBar user={user} updateUser={updateUser} onUpgrade={onUpgrade} />
      <ServicesGrid darkMode={darkMode} onServiceClick={handleServiceClick} />
      <PromoCarousel darkMode={darkMode} />
      <DashFooter darkMode={darkMode} />

      {modal && (
        <ComingSoonModal
          service={modal}
          onClose={() => setModal(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}

export default function Dashboard({ user: initialUser, onLogout }) {
  const {
    user,
    updateUser,
    darkMode,
    setDarkMode,
    activeTab,
    setActiveTab
  } = useDashboard()

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
    // Refresh balance when tab becomes visible again (catches admin-side changes)
    const onFocus = () => { if (user?.id) refreshUser() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const refreshUser = async () => {
    try {
      if (!user?.id) return
      const res = await fetch(`${API}/wallet/index.php?user_id=${user.id}`)
      const data = await res.json()

      if (data?.success && data?.wallet) {
        updateUser({
          usd_balance: parseFloat(data.wallet.usd_balance),
          usdBalance: parseFloat(data.wallet.usd_balance),
          coins: parseInt(data.wallet.coins),
          deposit_status: parseInt(data.wallet.deposit_status ?? 1),
          withdraw_status: parseInt(data.wallet.withdraw_status ?? 1),
          account_status: parseInt(data.wallet.account_status ?? 1),
          history: data.history || [],
          notifications: data.notifications || [],
          current_badge: data.current_badge || null,
          current_multiplier: data.current_multiplier || 1.0,
          vip_active: data.vip_active || false,
          vip_expires_at: data.vip_expires_at || null,
          vip_auto_renew: data.vip_auto_renew || false,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const tk = t(darkMode)

  const renderScreen = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <Wallet
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
            initialTab="deposit"
          />
        )

      case 'wallet-deposit':
        return (
          <Wallet
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
            initialTab="deposit"
          />
        )

      case 'wallet-withdraw':
        return (
          <Wallet
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
            initialTab="withdraw"
          />
        )

      case 'tasks':
        return (
          <TasksScreen
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )

      case 'profile':
        return (
          <ProfilePage
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogout={onLogout}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'vault':
        return (
          <Vault
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'refer':
        return (
          <ReferScreen
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'contest':
        return (
          <ContestPage
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'marketplace':
        return (
          <MarketplacePage
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'exchange':
        return (
          <ExchangePage
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'academy':
        return (
          <AcademyPage
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'squad':
        return (
          <SquadPage
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setActiveTab('home')}
          />
        )

      case 'upgrade':
        return (
          <UpgradePage
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onClose={() => setActiveTab('home')}
            onUpgrade={refreshUser}
          />
        )

      default:
        return (
          <HomeScreen
            user={user}
            updateUser={updateUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setActiveTab={setActiveTab}
            onUpgrade={() => setActiveTab('upgrade')}
          />
        )
    }
  }

  if (loading) {
    return (
      <div style={{
        background: tk.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', minHeight: '100vh' }}>
        <div style={{ paddingBottom: 70 }}>
          {renderScreen()}
        </div>

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
        />
      </div>
    </div>
  )
}