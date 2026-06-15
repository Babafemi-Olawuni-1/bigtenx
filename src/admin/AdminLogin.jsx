// AdminLogin.jsx - FIXED (sends email + password)
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter both email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/admin/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        onLogin(data.token)
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F7F8FC', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 24 
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: 18, 
            background: `linear-gradient(135deg, ${O}, #FF9A00)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px rgba(255,111,0,0.25)`
          }}>
            <Shield size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#001F54', marginBottom: 6 }}>
            BigTen<span style={{ color: O }}>X</span>
          </h1>
          <p style={{ fontSize: 13, color: '#8899AA' }}>Admin Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} style={{ 
          background: '#fff', 
          borderRadius: 28, 
          padding: 32, 
          border: '1px solid #E9EDF2',
          boxShadow: '0 8px 32px rgba(0,31,84,0.06)'
        }}>
          {/* Email Field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#001F54', 
              marginBottom: 8 
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ 
                position: 'absolute', 
                left: 14, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#8899AA' 
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '13px 44px 13px 44px', 
                  borderRadius: 14, 
                  border: '1px solid #E9EDF2', 
                  fontSize: 14, 
                  fontFamily: 'inherit', 
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="admin@bigtenx.com"
                autoFocus
                onFocus={e => e.target.style.borderColor = O}
                onBlur={e => e.target.style.borderColor = '#E9EDF2'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#001F54', 
              marginBottom: 8 
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: 14, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#8899AA' 
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '13px 44px 13px 44px', 
                  borderRadius: 14, 
                  border: '1px solid #E9EDF2', 
                  fontSize: 14, 
                  fontFamily: 'inherit', 
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Enter your password"
                onFocus={e => e.target.style.borderColor = O}
                onBlur={e => e.target.style.borderColor = '#E9EDF2'}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ 
                  position: 'absolute', 
                  right: 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                {showPassword ? <EyeOff size={18} color="#8899AA" /> : <Eye size={18} color="#8899AA" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239,68,68,0.1)', 
              borderRadius: 12, 
              padding: '12px 16px',
              marginBottom: 20,
              border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <p style={{ color: '#EF4444', fontSize: 12, margin: 0 }}>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              background: O, 
              border: 'none', 
              borderRadius: 14, 
              padding: '14px', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 14, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>

          <p style={{ 
            textAlign: 'center', 
            fontSize: 11, 
            color: '#8899AA', 
            marginTop: 20 
          }}>
            Secure admin area • BigTenX Platform
          </p>
        </form>
      </div>
    </div>
  )
}