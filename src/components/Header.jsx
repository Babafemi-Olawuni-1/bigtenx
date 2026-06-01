const O = '#ff6f00'
const B = '#001F54'

export default function Header({ user, darkMode }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      background: darkMode ? '#1e2937' : 'white',
      borderBottom: `2px solid ${B}`,
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/logo.png" alt="BigTenX"
          style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }}
          onError={e => e.target.style.display = 'none'} />
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: darkMode ? 'white' : B }}>
          Big<span style={{ color: O }}>TenX</span>
        </span>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${O}15`, borderRadius: 999, padding: '5px 12px' }}>
          <span style={{ color: O, fontSize: 12, fontWeight: 700 }}>₮ {user.coins}</span>
        </div>
      )}
    </header>
  )
}
