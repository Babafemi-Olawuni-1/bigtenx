import { Target, CheckCircle, Circle } from 'lucide-react'

const QUESTS = [
  { id: 1, title: 'Complete your profile', reward: 20, done: true },
  { id: 2, title: 'Invite your first friend', reward: 50, done: false },
  { id: 3, title: 'Complete daily task', reward: 10, done: false },
  { id: 4, title: 'Reach Level 1', reward: 100, done: false },
  { id: 5, title: 'Make first withdrawal', reward: 30, done: false },
]

export default function QuestScreen({ user, updateUser }) {
  const handleClaim = (quest) => {
    if (!quest.done) {
      updateUser({ coins: user.coins + quest.reward })
    }
  }

  return (
    <div className="px-4 pt-4 pb-28">
      <div className="flex items-center gap-2 mb-6">
        <Target size={22} color="#ff6f00" />
        <h2 className="text-[#001F54] dark:text-[#3b82f6] font-bold text-xl">Quests</h2>
      </div>

      <div className="flex flex-col gap-3">
        {QUESTS.map((quest) => (
          <div
            key={quest.id}
            className="bg-white dark:bg-[#1e2937] border-2 border-[#001F54] rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {quest.done
                ? <CheckCircle size={20} color="#ff6f00" />
                : <Circle size={20} color="#001F54" className="dark:!text-[#3b82f6]" />}
              <div>
                <p className="text-[#001F54] dark:text-[#3b82f6] font-semibold text-sm">{quest.title}</p>
                <p className="text-[#ff6f00] text-xs font-bold">+{quest.reward} coins</p>
              </div>
            </div>
            <button
              onClick={() => handleClaim(quest)}
              disabled={quest.done}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                quest.done
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ff6f00] hover:bg-[#e06200] text-white'
              }`}
            >
              {quest.done ? 'Done' : 'Claim'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
