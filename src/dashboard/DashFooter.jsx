import { C } from './tokens'

export default function DashFooter({ darkMode }) {
  return (
    <div style={{ textAlign: 'center', padding: '14px 20px', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.06)'}`, background: darkMode ? '#081226' : '#fff' }}>
      <p style={{ fontSize: 11, color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,31,84,0.3)', margin: 0 }}>
        © 2025 <span style={{ color: C.orange, fontWeight: 700 }}>BigTenX</span>. All rights reserved.
      </p>
    </div>
  )
}
