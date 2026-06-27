import { useState } from 'react'
import { Flame } from 'lucide-react'
import { C } from './tokens'
import { API } from '../auth/api'
import { isLevelActive } from './levels'

// Coins earned for claiming on a given streak day
function getStreakCoins(streakDay) {
  return 2 + streakDay
}

// Check if user already completed a task today (streak claim)
function alreadyClaimedToday(lastTaskDate) {
  if (!lastTaskDate) return false
  return lastTaskDate === new Date().toISOString().split('T')[0]
}

export default function StreakBar({ user, updateUser, onUpgrade }) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const active        = isLevelActive(user)
  // Use streak from DB — fallback to 0
  const streakDay     = parseInt(user?.streak ?? 0)
  const nextCoins     = getStreakCoins(streakDay + 1)
  // Claimed = completed a task today (last_task_date = today)
  const claimed       = alreadyClaimedToday(user?.last_task_date ?? user?.streakLastClaim)

  // Progress within current 7-day cycle (1–7)
  const progressPos   = streakDay === 0 ? 0 : ((streakDay - 1) % 7) + 1
  const DAYS          = [1, 2, 3, 4, 5, 6, 7]

  const handleClaim = async () => {
    if (!active) {
      onUpgrade?.()
      return
    }
    if (claimed || loading || !user?.id) return

    setLoading(true)
    try {
      const res = await fetch(`${API}/streak/claim.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await res.json()
      if (data?.success) {
        updateUser({
          coins:           data.new_coins,
          streak:          data.streak_total,
          last_task_date:  new Date().toISOString().split('T')[0],
          // legacy support
          streakMonth:     data.streak_day,
          streakLastClaim: new Date().toISOString().split('T')[0],
        })
        setToast(`🔥 Day ${data.streak_day ?? streakDay + 1}! +${data.coins_earned} XP`)
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast(data?.message || 'Could not claim streak')
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
        background: `linear-gradient(90deg, ${C.orange}, #FF9500)`,
        padding: '12px 16px',
        boxShadow: `0 6px 22px rgba(255,111,0,0.45)`,
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            <Flame size={16} color="#fff" />
            <span>
              {streakDay > 0
                ? `${streakDay} Day Streak`
                : 'Start your streak!'}
            </span>
            {claimed && (
              <span style={{
                fontSize: 10, fontWeight: 800,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 20, padding: '2px 8px', color: '#fff'
              }}>
                ✓ Claimed
              </span>
            )}
          </div>

          <button
            onClick={handleClaim}
            disabled={!active || claimed || loading}
            style={{
              background: claimed ? 'rgba(255,255,255,0.5)' : '#fff',
              color: C.orange,
              border: 'none',
              borderRadius: 9,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 800,
              padding: '7px 14px',
              cursor: (!active || claimed || loading) ? 'default' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
              flexShrink: 0,
            }}
          >
            {loading ? '...' : claimed ? 'Done' : `Claim ${nextCoins} XP`}
          </button>
        </div>

        {/* Progress dots — 7-day cycle */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {DAYS.map(day => {
            const filled = progressPos >= day
            return (
              <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: filled ? '#fff' : 'rgba(255,255,255,0.35)',
                  marginBottom: 3,
                  transition: 'background 0.3s',
                }} />
                <span style={{
                  fontSize: 9,
                  color: filled ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: filled ? 700 : 500,
                }}>
                  {day}
                </span>
              </div>
            )
          })}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginLeft: 4, whiteSpace: 'nowrap' }}>
            {progressPos}/7
          </span>
        </div>
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
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
