// Academy.jsx (same pattern for Exchange.jsx, Squad.jsx)
import { GraduationCap, Clock } from 'lucide-react'

const O = '#FF6F00'

export default function Academy() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <div style={{ 
        width: 80, height: 80, borderRadius: 24, 
        background: `${O}12`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 24
      }}>
        <GraduationCap size={40} color={O} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#001F54', marginBottom: 12 }}>
        Academy
      </h2>
      <p style={{ fontSize: 14, color: '#8899AA', marginBottom: 16, maxWidth: 320 }}>
        Educational content, tutorials, and learning resources for your community.
      </p>
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 8,
        background: '#F7F8FC',
        padding: '8px 16px',
        borderRadius: 40,
        marginTop: 8
      }}>
        <Clock size={14} color={O} />
        <span style={{ fontSize: 12, color: '#001F54', fontWeight: 500 }}>Coming Soon</span>
      </div>
    </div>
  )
}