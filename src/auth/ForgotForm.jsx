import { useState } from 'react'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { API } from './api'

const O = '#ff6f00'

export default function ForgotForm({ onBack, showToast }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/forgot_password.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (data.dev_reset_url) console.log('🔗 Reset:', data.dev_reset_url)
      setSent(true)
    } catch { showToast('Network error. Try again.', 'error') }
    finally { setLoading(false) }
  }

  if (sent) return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${O}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <Mail size={20} color={O} />
      </div>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>Check your inbox</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6, margin: '0 0 6px' }}>
        If <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong> is registered, a reset link has been sent.
      </p>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: '0 0 20px' }}>On localhost, check the browser console for the dev URL.</p>
      <button onClick={onBack} style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 20px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <ArrowLeft size={12} /> Back to login
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={12} /> Back to login
      </button>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><Mail size={13} color="rgba(255,255,255,0.25)" /></div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px 10px 36px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        </div>
      </div>
      <button type="submit" disabled={loading}
        style={{ width: '100%', background: loading ? `${O}70` : O, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: `0 4px 16px ${O}40` }}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : 'Send Reset Link'}
      </button>
    </form>
  )
}
