import { useState } from 'react'
import { Flame, Lock } from 'lucide-react'
import { C } from './tokens'
import { API } from '../auth/api'
import { isLevelActive } from './levels'

// FIXED: Streak formula - Day 1 = 3 XP, Day 2 = 4 XP, Day 3 = 5 XP...
function getStreakCoins(streakDay) {
  // Formula: 2 + streak (Day 1 = 3, Day 2 = 4, Day 3 = 5)
  return 2 + streakDay;
}

function alreadyClaimedToday(lastClaim) {
  if (!lastClaim) return false
  return lastClaim === new Date().toISOString().split('T')[0]
}

export default function StreakBar({ user, updateUser, onUpgrade }) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState(null)
  const active    = isLevelActive(user)
  const streakDay = user.streakMonth || 0
  const nextCoins = getStreakCoins(streakDay + 1)
  const claimed   = alreadyClaimedToday(user.streakLastClaim)

  const handleClaim = async () => {
    if (!active) { onUpgrade?.(); return }
    if (claimed || loading || !user.id) return
    setLoading(true)
    try {
      const res  = await fetch(`${API}/streak/claim.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ 
          coins: data.new_coins, 
          streak: data.streak_total, 
          streakMonth: data.streak_day, 
          streakLastClaim: new Date().toISOString().split('T')[0] 
        })
        setToast(`🔥 Day ${data.streak_day}! +${data.coins_earned} XP`)
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast(data.message)
        setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast('Network error.')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ 
        margin: '0 16px 13px', 
        borderRadius: 16, 
        background: active ? `linear-gradient(90deg,${C.orange},#FF9500)` : 'rgba(0,31,84,0.15)', 
        padding: '12px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        boxShadow: active ? `0 6px 22px rgba(255,111,0,0.45)` : 'none', 
        cursor: active ? 'default' : 'pointer' 
      }} 
      onClick={!active ? onUpgrade : undefined}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
          {active ? <Flame size={16} color="#fff" /> : <Lock size={14} color="rgba(255,255,255,0.5)" />}
          {active ? (
            <>
              <span>Day {streakDay} streak</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'inline-block' }} />
              <span>{claimed ? 'Claimed today ✓' : `Claim ${nextCoins} XP`}</span>
            </>
          ) : (
            <span style={{ color: C.orange }}>Upgrade to unlock daily check-in</span>
          )}
        </div>
        
        {active && (
          <button 
            onClick={handleClaim} 
            disabled={claimed || loading}
            style={{ 
              background: claimed ? 'rgba(255,255,255,0.5)' : '#fff', 
              color: C.orange, 
              border: 'none', 
              borderRadius: 9, 
              fontFamily: 'inherit', 
              fontSize: 12, 
              fontWeight: 800, 
              padding: '7px 14px', 
              cursor: claimed ? 'default' : 'pointer', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.14)', 
              flexShrink: 0 
            }}>
            {loading ? '...' : claimed ? 'Done' : 'Claim'}
          </button>
        )}
        
        {!active && (
          <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, background: `${C.orange}18`, padding: '5px 10px', borderRadius: 8 }}>Upgrade →</span>
        )}
      </div>
      
      {toast && (
        <div style={{ 
          position: 'fixed', 
          bottom: 90, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: C.orange, 
          color: '#fff', 
          padding: '9px 18px', 
          borderRadius: 30, 
          fontSize: 12, 
          fontWeight: 700, 
          zIndex: 500, 
          whiteSpace: 'nowrap', 
          pointerEvents: 'none' 
        }}>
          {toast}
        </div>
      )}
    </>
  )
}