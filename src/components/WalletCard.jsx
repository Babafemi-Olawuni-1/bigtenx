import { Wallet, ArrowUpRight, Users, TrendingUp, PlusCircle } from 'lucide-react'

export default function WalletCard({ user }) {
  return (
    <div className="mx-4 mt-4 bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-5">
      {/* Title + Balance */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={20} color="#ff6f00" />
          <span className="text-[#001F54] dark:text-[#3b82f6] font-semibold text-base">Wallet Balance</span>
        </div>
        <span className="text-[#ff6f00] font-extrabold text-2xl">
          ₮ {user.usdBalance.toFixed(2)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around mb-5">
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full border-2 border-[#001F54] dark:border-[#3b82f6] flex items-center justify-center group-hover:bg-[#001F54]/10 transition-colors">
            <ArrowUpRight size={20} color="#001F54" className="dark:hidden" />
            <ArrowUpRight size={20} color="#3b82f6" className="hidden dark:block" />
          </div>
          <span className="text-[#001F54] dark:text-[#3b82f6] text-xs font-medium">Withdraw</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full border-2 border-[#001F54] dark:border-[#3b82f6] flex items-center justify-center group-hover:bg-[#001F54]/10 transition-colors">
            <Users size={20} color="#001F54" className="dark:hidden" />
            <Users size={20} color="#3b82f6" className="hidden dark:block" />
          </div>
          <span className="text-[#001F54] dark:text-[#3b82f6] text-xs font-medium">Referrals</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-[#ff6f00] flex items-center justify-center group-hover:bg-[#e06200] transition-colors">
            <TrendingUp size={20} color="white" />
          </div>
          <span className="text-[#ff6f00] text-xs font-medium">Upgrade</span>
        </button>
      </div>

      {/* Recharge */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#ff6f00] hover:bg-[#ff6f00]/10 transition-colors">
        <PlusCircle size={18} color="#ff6f00" />
        <span className="text-[#ff6f00] font-semibold text-sm">Recharge Wallet</span>
      </button>
    </div>
  )
}
