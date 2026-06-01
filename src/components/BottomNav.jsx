import { Home, Wallet, Cpu, Target, Users } from 'lucide-react'

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
  { id: 'mining', icon: Cpu, label: 'Mining' },
  { id: 'quest', icon: Target, label: 'Quest' },
  { id: 'friend', icon: Users, label: 'Friend' },
]

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white dark:bg-[#1e2937] border-t-2 border-[#001F54] flex items-center justify-around px-2 py-2 z-40">
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex flex-col items-center gap-1 flex-1 py-1"
          >
            <Icon
              size={22}
              color={isActive ? '#ff6f00' : '#001F54'}
              className={isActive ? '' : 'dark:!text-[#3b82f6]'}
              style={{ color: isActive ? '#ff6f00' : undefined }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: isActive ? '#ff6f00' : '#001F54' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
