import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, User, Mail, Lock,
  Gift, Globe, Loader2
} from 'lucide-react'
import { API } from './api'

const O = '#ff6f00'

const COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','Tanzania','Uganda','Ethiopia','Cameroon',
  'Senegal','Ivory Coast','Rwanda','Zambia','Zimbabwe','Mozambique','Angola',
  'United Kingdom','United States','Canada','Australia','India','Germany','France',
  'Netherlands','UAE','Saudi Arabia','Other',
]

const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '10px 12px 10px 36px',
  color: 'white',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

function Field({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  right,
  children
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 10,
        fontWeight: 650,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Icon size={14} color="rgba(255,255,255,0.3)" />
        </div>

        {children || (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
              ...inputBase,
              paddingRight: right ? 38 : 12
            }}
            onFocus={e => e.target.style.borderColor = O}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        )}

        {right && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {right}
          </div>
        )}
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
  const barColor =
    score === 1 ? '#ef4444'
    : score === 2 ? '#f59e0b'
    : O

  return (
    <div style={{ marginTop: -8, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= score ? barColor : 'rgba(255,255,255,0.08)',
              transition: 'background-color 0.2s'
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
        {checks.map(c => (
          <span key={c.label} style={{ color: c.ok ? '#10B981' : 'inherit', fontWeight: c.ok ? 600 : 400 }}>
            {c.ok ? '✓ ' : '• '}{c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterForm({ onSuccess, onLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    country: '',
    password: '',
    referral: ''
  })

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refUsername, setRefUsername] = useState('')
  const [lockedReferral, setLockedReferral] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')

    if (ref) {
      setRefUsername(ref)
      setForm(f => ({ ...f, referral: ref }))
      setLockedReferral(true)
    }
  }, [])

  const set = k => e =>
    setForm(f => ({
      ...f,
      [k]: e.target.value
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/auth/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          country: form.country,
          password: form.password,
          referral_code: lockedReferral ? '' : form.referral,
          ref_username: lockedReferral ? refUsername : ''
        })
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ paddingBottom: 4 }}>
      {/* Title Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 21, color: 'white', letterSpacing: '-0.02em' }}>BIG</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 21, color: O, letterSpacing: '-0.02em' }}>TENX</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, margin: 0 }}>You get a welcome bonus of 5XP</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      <Field
        icon={User}
        label="Username"
        value={form.username}
        onChange={set('username')}
        placeholder="e.g. trader99"
      />

      <Field
        icon={Mail}
        label="Email address"
        type="email"
        value={form.email}
        onChange={set('email')}
        placeholder="you@example.com"
      />

      <Field icon={Globe} label="Country">
        <select
          value={form.country}
          onChange={set('country')}
          required
          style={{
            ...inputBase,
            paddingRight: 12,
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer'
          }}
          onFocus={e => e.target.style.borderColor = O}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <option value="" disabled>Select your country</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 10
        }}>▼</div>
      </Field>

      <Field
        icon={Lock}
        label="Password"
        type={showPass ? 'text' : 'password'}
        value={form.password}
        onChange={set('password')}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        right={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.3)' }}
          >
            {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        }
      />

      <PasswordStrength password={form.password} />

      <Field
        icon={Gift}
        label={lockedReferral ? 'Referral Link Applied' : 'Referral Code (optional)'}
        value={form.referral}
        onChange={lockedReferral ? undefined : set('referral')}
        placeholder="Enter referral code"
      >
        <input
          value={form.referral}
          onChange={lockedReferral ? undefined : set('referral')}
          disabled={lockedReferral}
          placeholder="Enter referral code"
          style={{
            ...inputBase,
            opacity: lockedReferral ? 0.7 : 1
          }}
          onFocus={e => e.target.style.borderColor = O}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? `${O}60` : O,
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '12px',
          fontWeight: 700,
          fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          marginTop: 14,
          boxShadow: loading ? 'none' : `0 4px 18px ${O}40`,
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e06200' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = O }}
      >
        {loading ? (
          <>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Creating account...
          </>
        ) : (
          'Create Free Account'
        )}
      </button>

      {/* Switch Auth Page Trigger */}
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.32)', fontSize: 12, marginTop: 16, marginBottom: 0 }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLogin}
          style={{
            background: 'none',
            border: 'none',
            color: O,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            padding: 0
          }}
        >
          Log in
        </button>
      </p>
    </form>
  )
}