import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, Gift, Globe, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { API } from './api'

const O = '#ff6f00'

const COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','Tanzania','Uganda','Ethiopia','Cameroon',
  'Senegal','Ivory Coast','Rwanda','Zambia','Zimbabwe','Mozambique','Angola',
  'United Kingdom','United States','Canada','Australia','India','Germany','France',
  'Netherlands','UAE','Saudi Arabia','Other',
]

const inputBase = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '10px 12px 10px 36px', color: 'white', fontSize: 13,
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, right, children }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
          <Icon size={13} color="rgba(255,255,255,0.22)" />
        </div>
        {children || (
          <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={{ ...inputBase, paddingRight: right ? 38 : 12 }}
            onFocus={e => e.target.style.borderColor = O}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        )}
        {right && <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>{right}</div>}
      </div>
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ]
  if (!password) return null
  const score = checks.filter(c => c.ok).length
  const barColor = score === 1 ? '#ef4444' : score === 2 ? '#f59e0b' : O
  return (
    <div style={{ marginTop: -4, marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? barColor : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />)}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {c.ok ? <CheckCircle2 size={9} color={O} /> : <XCircle size={9} color="rgba(255,255,255,0.18)" />}
            <span style={{ fontSize: 10, color: c.ok ? O : 'rgba(255,255,255,0.28)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterForm({ onSuccess, onLogin }) {
  const [form, setForm]        = useState({ username: '', email: '', country: '', password: '', referral: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = `${API}/auth/register.php`
    console.log('📡 Calling:', url)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          country: form.country,
          password: form.password,
          referral_code: form.referral,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('HTTP Error:', res.status, text)
        setError(`Server error ${res.status}. Check console.`)
        return
      }

      const data = await res.json()
      console.log('✅ Response:', data)

      if (data.success) {
        onSuccess()
      } else {
        setError(data.message || 'Registration failed.')
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
      setError(`Cannot reach server. Open console (F12) for details. URL: ${url}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ paddingBottom: 4 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 21, color: 'white', margin: '0 0 3px', letterSpacing: '-0.02em' }}>Create account</h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, margin: 0 }}>Start with 5 free XP. No deposit needed.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      <Field icon={User} label="Username" value={form.username} onChange={set('username')} placeholder="e.g. trader99" />
      <Field icon={Mail} label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />

      <Field icon={Globe} label="Country">
        <select value={form.country} onChange={set('country')} required
          style={{ ...inputBase, paddingRight: 12, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = O}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
          <option value="" disabled>Select your country</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field icon={Lock} label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 number"
        right={
          <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            {showPass ? <EyeOff size={13} color="rgba(255,255,255,0.28)" /> : <Eye size={13} color="rgba(255,255,255,0.28)" />}
          </button>
        } />
      <PasswordStrength password={form.password} />

      <Field icon={Gift} label="Referral code (optional)" value={form.referral} onChange={set('referral')} placeholder="Enter referral code" />

      <button type="submit" disabled={loading} style={{
        width: '100%', background: loading ? `${O}60` : O, color: 'white', border: 'none',
        borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 7, marginTop: 14,
        boxShadow: loading ? 'none' : `0 4px 18px ${O}40`, transition: 'all 0.2s', fontFamily: 'inherit',
      }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e06200' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = O }}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : 'Create Free Account'}
      </button>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.32)', fontSize: 12, marginTop: 14, marginBottom: 0 }}>
        Already have an account?{' '}
        <button type="button" onClick={onLogin} style={{ background: 'none', border: 'none', color: O, fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0 }}>Log in</button>
      </p>
    </form>
  )
}