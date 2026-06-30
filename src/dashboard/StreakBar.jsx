// StreakBar.jsx — compact, all info visible, orange gradient, no scroll
import { useState } from 'react'
import { C } from './tokens'
import { API } from '../auth/api'

const DAY_LABELS = ['SUN','MON','TUE','WED','THU','FRI','SAT']
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
        })
        const bonus = data.week_complete ? ` +${BONUS_XP} bonus!` : ''
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
        borderRadius: 20,
        background: `linear-gradient(135deg, ${C.orange} 0%, #E65C00 100%)`,
        padding: '14px 16px',
        boxShadow: `0 6px 20px ${C.orange}44`,
      }}>

        {/* ── Row 1: Title + Claim button ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Weekly Login Reward
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
                {claimedDays.length}/7 days claimed
              </div>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={alreadyClaimed || allClaimed || loading}
            style={{
              background:   alreadyClaimed || allClaimed ? 'rgba(255,255,255,0.25)' : '#fff',
              color:        alreadyClaimed || allClaimed ? 'rgba(255,255,255,0.75)' : C.orange,
              border:       'none', borderRadius: 12,
              padding:      '8px 14px',
              fontSize:     12, fontWeight: 800,
              cursor:       alreadyClaimed || allClaimed || loading ? 'default' : 'pointer',
              fontFamily:   'inherit',
              whiteSpace:   'nowrap',
              boxShadow:    alreadyClaimed || allClaimed ? 'none' : '0 2px 10px rgba(0,0,0,0.18)',
              flexShrink:   0,
            }}
          >
            {loading ? '…' : allClaimed ? '🎉 All Done!' : alreadyClaimed ? '✓ Claimed' : `Claim ${xpThisClaim} XP`}
          </button>
        </div>

        {/* ── Row 2: Day dots + bonus — no scroll, all fit ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
          {DAY_LABELS.map((label, i) => {
            const claimed = claimedDays.includes(i)
            const isToday = i === today && !claimed
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Circle */}
                <div style={{
                  width:      28, height: 28, borderRadius: '50%',
                  background: claimed ? '#fff' : 'rgba(255,255,255,0.18)',
                  border:     isToday
                    ? '2px solid #fff'
                    : '1.5px solid rgba(255,255,255,0.45)',
                  display:    'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize:   13, fontWeight: 900,
                  color:      claimed ? C.orange : 'rgba(255,255,255,0.55)',
                  boxShadow:  isToday ? '0 0 0 3px rgba(255,255,255,0.25)' : 'none',
                }}>
                  {claimed ? '✓' : ''}
                </div>
                {/* Day label */}
                <span style={{
                  fontSize: 8, fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '0.03em',
                }}>
                  {label}
                </span>
                {/* XP label */}
                <span style={{
                  fontSize: 8, fontWeight: 600,
                  color: claimed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                }}>
                  {DAILY_XP}XP
                </span>
              </div>
            )
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)', margin: '0 6px', alignSelf: 'center' }} />

          {/* Weekly bonus column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 36 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: allClaimed ? '#fff' : 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}>
              🎁
            </div>
            <span style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.3 }}>
              BONUS
            </span>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              +{BONUS_XP}XP
            </span>
          </div>
        </div>

        {/* ── Row 3: footer note ── */}
        <div style={{
          marginTop: 10, paddingTop: 9,
          borderTop: '1px solid rgba(255,255,255,0.2)',
          fontSize: 10, color: 'rgba(255,255,255,0.75)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span>ⓘ</span>
          <span>Miss a day and it's gone — claim before midnight each day</span>
        </div>
      </div>

      {/* Toast */}
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
