import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { C } from '../dashboard/tokens'

export default function DailyCountdown({ darkMode, onReset }) {
  const [timeLeft, setTimeLeft] = useState('23:59:59')

  useEffect(() => {
    const interval = setInterval(() => {
      // Get current time in Nigerian timezone (UTC+1)
      const now = new Date()
      const nigeriaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }))
      
      // Calculate milliseconds until midnight Nigerian time
      const midnight = new Date(nigeriaTime)
      midnight.setHours(24, 0, 0, 0)
      
      const diff = midnight - nigeriaTime
      
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        onReset?.() // Trigger reset of daily tasks
      } else {
        const hours = String(Math.floor(diff / 3600000)).padStart(2, '0')
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
        setTimeLeft(`${hours}:${minutes}:${seconds}`)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [onReset])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: darkMode ? 'rgba(255,111,0,0.08)' : '#fff2e6',
      padding: '10px 18px', borderRadius: 40,
      border: `1px solid ${C.orange}25`,
      width: 'fit-content',
      margin: '0 16px 16px'
    }}>
      <Clock size={16} color={C.orange} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>
        Daily tasks reset in: {timeLeft}
      </span>
    </div>
  )
}