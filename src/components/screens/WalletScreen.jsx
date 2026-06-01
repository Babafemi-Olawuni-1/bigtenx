import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

export default function WalletScreen({ user }) {
  return (
    <div className="px-4 pt-4 pb-28">
      <h2 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-xl mb-4">My Wallet</h2>

      {/* Balance Card */}
      <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} color="#ff6f00" />
          <span className="text-[#001F54] dark:text-[#3b82f6] text-sm font-semibold">Total Balance</span>
        </div>
        <p className="text-[#ff6f00] font-extrabold text-4xl mb-1">₮ {user.usdBalance.toFixed(2)}</p>
        <p className="text-gray-400 text-xs">{user.coins} coins available</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="bg-[#ff6f00] hover:bg-[#e06200] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
          <ArrowUpRight size={18} />
          Withdraw
        </button>
        <button className="border-2 border-[#001F54] dark:border-[#3b82f6] text-[#001F54] dark:text-[#3b82f6] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#001F54]/10 transition-colors">
          <ArrowDownLeft size={18} />
          Deposit
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} color="#ff6f00" />
          <span className="text-[#001F54] dark:text-[#3b82f6] font-semibold text-sm">Transaction History</span>
        </div>
        <div className="flex flex-col items-center py-6">
          <p className="text-gray-400 text-sm">No transactions yet</p>
          <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Complete tasks to earn coins</p>
        </div>
      </div>
    </div>
  )
}
