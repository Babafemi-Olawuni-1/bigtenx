import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { API } from './api'

const O = '#ff6f00'

export default function ResetForm({ token, onSuccess }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 38px 10px 36px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/reset_password.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const data = await res.json()
      if (data.success) onSuccess()
      else setError(data.message)
    } catch { setError('Network error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}><p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p></div>}

      {[{ label: 'New Password', val: password, set: setPassword }, { label: 'Confirm Password', val: confirm, set: setConfirm }].map(({ label, val, set }, i) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><Lock size={13} color="rgba(255,255,255,0.25)" /></div>
            <input type={showPass ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder={i === 0 ? 'Min 8 chars, 1 uppercase, 1 number' : 'Repeat password'} required
              style={inputStyle} onFocus={e => e.target.style.borderColor = O} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            {i === 0 && <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              {showPass ? <EyeOff size={13} color="rgba(255,255,255,0.3)" /> : <Eye size={13} color="rgba(255,255,255,0.3)" />}
            </button>}
          </div>
        </div>
      ))}

      <button type="submit" disabled={loading}
        style={{ width: '100%', background: loading ? `${O}70` : O, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, boxShadow: `0 4px 16px ${O}40` }}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : 'Reset Password'}
      </button>
    </form>
  )
}
