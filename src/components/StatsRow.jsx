import { ArrowUpRight } from 'lucide-react'

export default function StatsRow({ user }) {
  return (
    <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
      <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 flex flex-col gap-1 relative">
        <span className="text-[#001F54] dark:text-[#3b82f6] text-xs font-semibold">Daily Task</span>
        <span className="text-[#ff6f00] font-extrabold text-xl">₮0.00</span>
        <ArrowUpRight size={16} color="#ff6f00" className="absolute top-3 right-3" />
      </div>
      <div className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 flex flex-col gap-1 relative">
        <span className="text-[#001F54] dark:text-[#3b82f6] text-xs font-semibold">Sales Commission</span>
        <span className="text-[#ff6f00] font-extrabold text-xl">₮0.00</span>
        <ArrowUpRight size={16} color="#ff6f00" className="absolute top-3 right-3" />
      </div>
    </div>
  )
}
