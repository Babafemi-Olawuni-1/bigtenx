import { Users, Copy, Send, Gift } from 'lucide-react'
import { useState } from 'react'

export default function FriendScreen({ user }) {
  const [copied, setCopied] = useState(false)
  const referralLink = `https://bigtenx.com/register?ref=${user.referralCode.toLowerCase()}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 pt-4 pb-28">
      <div className="flex items-center gap-2 mb-6">
        <Users size={22} color="#ff6f00" />
        <h2 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-xl">Friends</h2>
      </div>

      {/* Referral Banner */}
      <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-5 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff6f00]/10 flex items-center justify-center mx-auto mb-3">
          <Gift size={32} color="#ff6f00" />
        </div>
        <p className="text-[#001F54] dark:text-[#3b82f6] font-bold text-lg mb-1">Invite &amp; Earn</p>
        <p className="text-gray-400 text-sm mb-4">Get paid instantly for every friend you invite</p>

        <div className="bg-[#f8fafc] dark:bg-[#0f1724] border border-[#001F54]/30 rounded-xl px-3 py-2.5 mb-3 text-left">
          <p className="text-[#001F54] dark:text-[#3b82f6] text-xs truncate">{referralLink}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[#ff6f00] hover:bg-[#e06200] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join BIGTENX! ${referralLink}`)}`, '_blank')}
            className="flex-1 border-2 border-[#001F54] dark:border-[#3b82f6] text-[#001F54] dark:text-[#3b82f6] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#001F54]/10 transition-colors"
          >
            <Send size={16} />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 text-center">
          <p className="text-[#ff6f00] font-extrabold text-3xl">0</p>
          <p className="text-[#001F54] dark:text-[#3b82f6] text-xs font-semibold mt-1">Total Referrals</p>
        </div>
        <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 text-center">
          <p className="text-[#ff6f00] font-extrabold text-3xl">₮0</p>
          <p className="text-[#001F54] dark:text-[#3b82f6] text-xs font-semibold mt-1">Referral Earnings</p>
        </div>
      </div>
    </div>
  )
}
