// StreakBar.jsx — compact single-row, no emojis, Lucide icons only
import { useState } from 'react'
import { Gift } from 'lucide-react'
import { C } from './tokens'
import { API } from '../auth/api'

const DAY_LABELS = ['S','M','T','W','T','F','S']
const DAILY_XP   = 3
const BONUS_XP   = 4

function todayDow() { return new Date().getDay() }

function weekStartISO() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

function parseClaimedDays(raw, storedStart, currentStart) {
  if (storedStart !== currentStart) return []
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(Number)
  return String(raw).split(',').map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 6)
}

export default function StreakBar({ user, updateUser }) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState(null)

  const today          = todayDow()
  const currentStart   = weekStartISO()
  const claimedDays    = parseClaimedDays(user?.weekly_claimed_days, user?.weekly_start, currentStart)
  const alreadyClaimed = claimedDays.includes(today)
  const allClaimed     = claimedDays.length === 7
  const isLastDay      = today === 6
  const xpThisClaim    = DAILY_XP + (isLastDay && !alreadyClaimed && claimedDays.length === 6 ? BONUS_XP : 0)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleClaim = async () => {
    if (alreadyClaimed || allClaimed || loading || !user?.id) return
    setLoading(true)
    try {
      const res  = await fetch(`${API}/streak/claim.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, week_day: today, week_start: currentStart }),
      })
      const data = await res.json()
      if (data?.success) {
        updateUser({
          coins:               data.new_coins,
          weekly_claimed_days: data.claimed_days,
          weekly_start:        currentStart,
          streak:              data.streak_count ?? (user?.streak ?? 0),
          today_earnings:      (user?.today_earnings ?? 0) + data.coins_earned,
        })
        const bonus = data.week_complete ? ` + ${BONUS_XP} bonus!` : ''
        showToast(`+${data.coins_earned} XP${bonus}`)
      } else {
        showToast(data?.message || 'Could not claim')
      }
    } catch {
      showToast('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{
        margin: '0 16px 13px',
        borderRadius: 16,
        background: `linear-gradient(135deg, ${C.orange} 0%, #E65C00 100%)`,
        padding: '10px 14px',
        boxShadow: `0 4px 14px ${C.orange}44`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <Gift size={13} color="#fff" />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>Weekly</span>
        </div>

        {/* Day circles */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {DAY_LABELS.map((label, i) => {
            const claimed = claimedDays.includes(i)
            const isToday = i === today && !claimed
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background:  claimed ? '#fff' : 'rgba(255,255,255,0.2)',
                  border:      isToday  ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.45)',
                  boxShadow:   isToday  ? '0 0 0 3px rgba(255,255,255,0.2)' : 'none',
                  flexShrink:  0,
                }} />
                <span style={{ fontSize: 7.5, fontWeight: 700, color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>
                  {label}
                </span>
              </div>
            )
          })}

          {/* Bonus icon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: allClaimed ? '#fff' : 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Gift size={10} color={allClaimed ? C.orange : 'rgba(255,255,255,0.6)'} />
            </div>
            <span style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
              +{BONUS_XP}XP
            </span>
          </div>
        </div>

        {/* Count + button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
            {claimedDays.length}/7
          </span>
          <button
            onClick={handleClaim}
            disabled={alreadyClaimed || allClaimed || loading}
            style={{
              background:  alreadyClaimed || allClaimed ? 'rgba(255,255,255,0.25)' : '#fff',
              color:       alreadyClaimed || allClaimed ? 'rgba(255,255,255,0.7)' : C.orange,
              border:      'none', borderRadius: 10,
              padding:     '6px 12px',
              fontSize:    11, fontWeight: 800,
              cursor:      alreadyClaimed || allClaimed || loading ? 'default' : 'pointer',
              fontFamily:  'inherit',
              whiteSpace:  'nowrap',
              boxShadow:   alreadyClaimed || allClaimed ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {loading ? '…' : allClaimed ? 'Done' : alreadyClaimed ? 'Claimed' : `Claim ${xpThisClaim} XP`}
          </button>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#001F54', color: '#fff',
          padding: '9px 18px', borderRadius: 30,
          fontSize: 13, fontWeight: 700, zIndex: 500,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
