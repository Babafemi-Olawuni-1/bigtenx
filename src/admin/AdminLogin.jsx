import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react'

const O = '#ff6f00'
const B = '#001F54'
const isLocal = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
const API = isLocal ? `http://${window.location.hostname}/bigtenx/bigtenx/api` : `${window.location.origin}/api`

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/admin/login.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) })
      const data = await res.json()
      if (data.success) onLogin(data.token)
      else setError(data.message)
    } catch { setError('Cannot reach server.') }
    finally { setLoading(false) }
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 12px 11px 38px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Sora',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');*{box-sizing:border-box;}`}</style>
      <div style={{ width: '100%', maxWidth: 380, background: '#111827', borderRadius: 24, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ background: `linear-gradient(135deg,${B},#0a3080)`, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: O, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, color: 'white', margin: 0 }}><span style={{ color: "#ff6f00" }}>IG</span><span style={{ color: "white" }}>TENX</span> Admin</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>Restricted access</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}><p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p></div>}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bigtenx.com" required style={inp} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={13} color="rgba(255,255,255,0.22)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Admin password" required style={{ ...inp, paddingRight: 38 }} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {show ? <EyeOff size={13} color="rgba(255,255,255,0.3)" /> : <Eye size={13} color="rgba(255,255,255,0.3)" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? `${O}60` : O, color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', boxShadow: `0 4px 18px ${O}40` }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In to Admin'}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </form>
      </div>
    </div>
  )
}
