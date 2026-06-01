import { useState } from 'react'
import PageLayout from './PageLayout'
import { Mail, MessageCircle, Clock, ChevronDown } from 'lucide-react'

const O = '#ff6f00'

const FAQS = [
  { q: 'How do I withdraw my earnings?', a: 'Go to Wallet → Withdraw. Minimum withdrawal is $3. Ensure your account is verified and you have reached the minimum balance.' },
  { q: 'How long does withdrawal take?', a: 'Withdrawals are processed within 24 hours for standard accounts and instantly for Diamond VIP members.' },
  { q: 'My referral link is not working', a: 'Make sure the person you invited used your exact referral code during registration. Referrals only count for new accounts.' },
  { q: 'I did not receive my verification email', a: 'Check your spam/junk folder. If still not found, contact support with your registered email and we will resend it.' },
  { q: 'Can I change my username?', a: 'Username changes are not currently supported. Contact support if you have a special circumstance.' },
  { q: 'My account was suspended', a: 'Suspensions occur due to policy violations. Contact support at support@bigtenx.com with your account details for review.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{q}</span>
        <ChevronDown size={16} color={O} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, paddingBottom: 16, margin: 0 }}>{a}</p>
      </div>
    </div>
  )
}

export default function Support() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' }

  return (
    <PageLayout title="Support" subtitle="We're here to help. Reach out anytime.">
      {/* Contact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { icon: Mail, label: 'Email Support', value: 'support@bigtenx.com', sub: 'Response within 24h' },
          { icon: MessageCircle, label: 'Live Chat', value: 'Coming Soon', sub: 'Available for VIP members' },
          { icon: Clock, label: 'Support Hours', value: 'Mon – Sat', sub: '9am – 6pm WAT' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${O}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={18} color={O} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
            <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{value}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 20 }}>Common Questions</h2>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '0 20px' }}>
          {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 20 }}>Send a Message</h2>
        {sent ? (
          <div style={{ background: `${O}15`, border: `1px solid ${O}30`, borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <p style={{ color: O, fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Message sent!</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
              <input value={form.name} onChange={set('name')} placeholder="Your name" required style={inputStyle} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <input type="email" value={form.email} onChange={set('email')} placeholder="Your email" required style={inputStyle} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <input value={form.subject} onChange={set('subject')} placeholder="Subject" required style={inputStyle} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            <textarea value={form.message} onChange={set('message')} placeholder="Describe your issue in detail..." required rows={5} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            <button type="submit" style={{ background: O, color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 16px ${O}40` }}>Send Message</button>
          </form>
        )}
      </div>
    </PageLayout>
  )
}
