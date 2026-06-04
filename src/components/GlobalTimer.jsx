import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { C } from '../dashboard/tokens'

export default function GlobalTimer({ darkMode }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      // Get midnight tonight (12:00:00 AM next day)
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0) // 12:00 AM tomorrow
      
      const diff = midnight - now
      
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }
      
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }
    
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: darkMode ? 'rgba(255,111,0,0.15)' : 'rgba(0,31,84,0.08)',
      padding: '6px 12px',
      borderRadius: 30,
      border: `1px solid ${darkMode ? 'rgba(255,111,0,0.3)' : 'rgba(0,31,84,0.15)'}`,
    }}>
      <Clock size={14} color={C.orange} />
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'monospace',
        letterSpacing: 1,
        color: C.orange,
      }}>
        {timeLeft}
      </span>
    </div>
  )
}