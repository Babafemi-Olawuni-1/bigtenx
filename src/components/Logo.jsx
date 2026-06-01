// Shared Logo component — IG in orange, TENX in white, very close together
export default function Logo({ size = 18, imgSize = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
      <img src="/logo.png" alt="BIGTENX" style={{ width: imgSize, height: imgSize, objectFit: 'contain', borderRadius: 7, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: size, letterSpacing: '-0.01em', lineHeight: 1 }}>
        <span style={{ color: '#ff6f00' }}>IG</span><span style={{ color: '#ffffff', letterSpacing: '-0.5px' }}>TENX</span>
      </span>
    </div>
  )
}
