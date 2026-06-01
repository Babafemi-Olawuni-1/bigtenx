import { useState } from 'react'
import {
  Trophy, Globe, BookOpen, ShoppingBag,
  DollarSign, Phone, Wifi, Tv, MoreHorizontal
} from 'lucide-react'

const SERVICES = [
  { icon: Trophy, label: 'Contest' },
  { icon: Globe, label: 'Digital Skill' },
  { icon: BookOpen, label: 'Course' },
  { icon: ShoppingBag, label: 'Marketplace' },
  { icon: DollarSign, label: 'Monetization' },
  { icon: Phone, label: 'Buy Airtime' },
  { icon: Wifi, label: 'Buy Data' },
  { icon: Tv, label: 'Cable' },
  { icon: MoreHorizontal, label: 'More' },
]

export default function ServicesGrid() {
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState('')

  const handleClick = (label) => {
    setSelectedService(label)
    setShowModal(true)
  }

  return (
    <div className="mx-4 mt-4 mb-4">
      <h2 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-base mb-4">Our Services</h2>
      <div className="grid grid-cols-4 gap-4">
        {SERVICES.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleClick(label)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1e2937] border-2 border-[#001F54] flex items-center justify-center group-hover:bg-[#ff6f00]/10 transition-colors">
              <Icon size={24} color="#ff6f00" />
            </div>
            <span className="text-[#001F54] dark:text-[#3b82f6] text-xs font-medium text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-8 text-center max-w-[320px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-xl mb-2">{selectedService}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This feature is coming soon. Stay tuned!</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#ff6f00] hover:bg-[#e06200] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
