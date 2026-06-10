import { Zap, Send, MessageCircle, Globe } from 'lucide-react'

const O = '#ff6f00'

const SOCIAL = [
  { label: 'Instagram',        href: 'https://www.instagram.com/bigtenx_' },
  { label: 'Telegram',         href: 'https://t.me/bigtenx' },
  { label: 'X (Twitter)',      href: 'https://x.com/bigtenx_' },
  { label: 'TikTok',           href: 'https://tiktok.com/@bigtenx_' },
  { label: 'Facebook',         href: 'https://www.facebook.com/share/1EX5sGAY3Y/' },
  { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Vb04NeU9sBI6aCii9v3r' },
]

export default function Footer() {
  const border = 'rgba(255,255,255,0.07)'
  const muted  = 'rgba(255,255,255,0.38)'

  return (
    <footer style={{ padding: '40px 20px 24px', borderTop: `1px solid ${border}`, background: '#0a0f1e' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Top row - Logo with BIG(white)TENX(orange) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5px', textDecoration: 'none', margin: 0, padding: 0 }}>
            <img 
              src="/logo.png" 
              alt="BIGTENX" 
              style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, margin: 0, padding: 0 }}
              onError={e => { e.target.src = 'https://placehold.co/48x48/ff6f00/white?text=B' }} 
            />
            <span style={{ 
              fontFamily: "'Space Grotesk',sans-serif", 
              fontWeight: 800, 
              fontSize: 24, 
              letterSpacing: '-0.5px',
              padding: 0
            }}>
              <span style={{ color: 'white' }}>BIG</span>
              <span style={{ color: '#ff6f00' }}>TENX</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[['Privacy','/privacy'], ['Terms','/terms'], ['Support','/support'], ['FAQ','/faq']].map(([l, href]) => (
              <a key={l} href={href} style={{ color: muted, fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = O}
                onMouseLeave={e => e.target.style.color = muted}>{l}</a>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 999, padding: '6px 14px', color: muted, fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${O}45`; e.currentTarget.style.background = `${O}10`; e.currentTarget.style.color = O }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = muted }}>
              {s.label}
            </a>
          ))}
        </div>

        <div style={{ paddingTop: 20, borderTop: `1px solid ${border}`, textAlign: 'center' }}>
          <p style={{ color: muted, fontSize: 12, margin: 0 }}>© 2025 BIGTENX. All rights reserved. Built for earners worldwide.</p>
        </div>
      </div>
    </footer>
  )
}