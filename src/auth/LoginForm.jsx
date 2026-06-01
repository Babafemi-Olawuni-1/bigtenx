import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { API } from './api'

const O = '#ff6f00'

const inputBase = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '10px 12px 10px 36px', color: 'white', fontSize: 13,
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, right }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon size={13} color="rgba(255,255,255,0.22)" />
        </div>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...inputBase, paddingRight: right ? 38 : 12 }}
          onFocus={e => e.target.style.borderColor = O}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        {right && <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
      </div>
    </div>
  )
}

export default function LoginForm({ onSuccess, onRegister, onForgot, showToast }) {
  const [form, setForm]        = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = `${API}/auth/login.php`
    console.log('📡 Login calling:', url)

    try {
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        setError(`Server error ${res.status}`)
        return
      }

      const data = await res.json()
      if (data.success) {
        localStorage.setItem('bigtenx_token', data.token)
        localStorage.setItem('bigtenx_user', JSON.stringify(data.user))
        localStorage.setItem('bigtenx_loggedin', 'true')
        onSuccess(data.user)
      } else {
        setError(data.message)
        if (data.unverified) showToast('Check your inbox and verify your email first.', 'info')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(`Cannot reach server. URL: ${url}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ paddingBottom: 4 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 21, color: 'white', margin: '0 0 3px', letterSpacing: '-0.02em' }}>Welcome back</h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, margin: 0 }}>Log in to continue earning on BigTenX.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      <Field icon={Mail} label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
      <Field icon={Lock} label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Your password"
        right={
          <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {showPass ? <EyeOff size={13} color="rgba(255,255,255,0.28)" /> : <Eye size={13} color="rgba(255,255,255,0.28)" />}
          </button>
        } />

      <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 16 }}>
        <button type="button" onClick={onForgot}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)', fontSize: 11, cursor: 'pointer', padding: 0, transition: 'color 0.2s', fontFamily: 'inherit' }}
          onMouseEnter={e => e.target.style.color = O}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.32)'}>
          Forgot password?
        </button>
      </div>

      <button type="submit" disabled={loading} style={{
        width: '100%', background: loading ? `${O}60` : O, color: 'white', border: 'none',
        borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 7, boxShadow: loading ? 'none' : `0 4px 18px ${O}40`,
        transition: 'all 0.2s', fontFamily: 'inherit',
      }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e06200' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = O }}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Logging in...</> : 'Log In'}
      </button>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.32)', fontSize: 12, marginTop: 14, marginBottom: 0 }}>
        Don't have an account?{' '}
        <button type="button" onClick={onRegister} style={{ background: 'none', border: 'none', color: O, fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0 }}>Sign up free</button>
      </p>
    </form>
  )
}
