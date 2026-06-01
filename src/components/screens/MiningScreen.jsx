import { Cpu, Zap } from 'lucide-react'
import { useState } from 'react'

export default function MiningScreen({ user, updateUser }) {
  const [mining, setMining] = useState(false)
  const [progress, setProgress] = useState(0)

  const startMining = () => {
    if (mining) return
    setMining(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setMining(false)
          updateUser({ coins: user.coins + 10 })
          return 100
        }
        return p + 5
      })
    }, 150)
  }

  return (
    <div className="px-4 pt-4 pb-28 flex flex-col items-center">
      <h2 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-xl mb-6 self-start">Mining</h2>

      {/* Mining Card */}
      <div className="w-full bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-6 flex flex-col items-center gap-5">
        <div className="w-24 h-24 rounded-full bg-[#ff6f00]/10 border-4 border-[#ff6f00] flex items-center justify-center">
          <Cpu size={40} color="#ff6f00" className={mining ? 'animate-pulse' : ''} />
        </div>

        <div className="text-center">
          <p className="text-[#001F54] dark:text-[#3b82f6] font-bold text-lg">Coin Miner</p>
          <p className="text-gray-400 text-sm">Mine 10 coins per session</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-[#0f1724] rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-[#ff6f00] rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#ff6f00] font-bold text-sm">{progress}%</p>

        <button
          onClick={startMining}
          disabled={mining}
          className="w-full bg-[#ff6f00] hover:bg-[#e06200] disabled:opacity-50 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Zap size={18} />
          {mining ? 'Mining...' : progress === 100 ? 'Mine Again' : 'Start Mining'}
        </button>
      </div>

      <div className="w-full mt-4 bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 flex items-center justify-between">
        <span className="text-[#001F54] dark:text-[#3b82f6] font-semibold text-sm">Your Coins</span>
        <span className="text-[#ff6f00] font-extrabold text-xl">{user.coins}</span>
      </div>
    </div>
  )
}
