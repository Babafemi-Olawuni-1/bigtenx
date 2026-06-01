import { Share2, Copy, Send } from 'lucide-react'
import { useState } from 'react'

export default function ShareEarn({ user }) {
  const [copied, setCopied] = useState(false)
  const referralLink = `bigtenx.com/register?ref=${user.referralCode.toLowerCase()}`

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Join BIGTENX and earn real cash! Use my referral link: https://${referralLink}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className="mx-4 mt-4 bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#ff6f00]/10 flex items-center justify-center">
          <Share2 size={20} color="#ff6f00" />
        </div>
        <div>
          <p className="text-[#ff6f00] font-bold text-base">Share &amp; Earn</p>
          <p className="text-[#001F54] dark:text-[#3b82f6] text-xs">Invite friends and get paid instantly</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-[#f8fafc] dark:bg-[#0f1724] border border-[#001F54]/30 rounded-xl px-3 py-2.5 overflow-hidden">
          <p className="text-[#001F54] dark:text-[#3b82f6] text-xs truncate">{referralLink}</p>
        </div>
        <button
          onClick={handleCopy}
          className="bg-[#ff6f00] hover:bg-[#e06200] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#001F54] dark:border-[#3b82f6] hover:bg-[#001F54]/10 transition-colors"
      >
        <Send size={16} color="#001F54" className="dark:hidden" />
        <Send size={16} color="#3b82f6" className="hidden dark:block" />
        <span className="text-[#001F54] dark:text-[#3b82f6] font-semibold text-sm">Share to WhatsApp</span>
      </button>
    </div>
  )
}
