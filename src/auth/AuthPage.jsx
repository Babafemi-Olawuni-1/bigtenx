import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import ForgotForm from './ForgotForm'
import ResetForm from './ResetForm'
import { ArrowLeft, Shield, Coins, TrendingUp } from 'lucide-react'

const O = '#ff6f00'

const PERKS = [
  { icon: Coins,      text: '5 free points on signup — no deposit' },
  { icon: TrendingUp, text: 'Earn daily through tasks & referrals' },
  { icon: Shield,     text: 'Stake points and withdraw real cash' },
]

export default function AuthPage({ onLogin, initialView = 'login' }) {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(initialView)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const verified = searchParams.get('verified')
    const msg = searchParams.get('msg')
    const reset = searchParams.get('reset_token')
    const action = searchParams.get('action')
    
    if (verified === 'success') showToast(msg, 'success')
    if (verified === 'error') showToast(msg, 'error')
    if (verified === 'already') showToast(msg, 'info')
    if (reset) setView('reset')
    if (action === 'register') setView('register')
  }, [searchParams])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  const resetToken = searchParams.get('reset_token') || ''

  const handleLoginSuccess = (userData) => {
    if (onLogin) {
      onLogin(userData)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0f1e',
      display: 'flex',
      fontFamily: "'Sora',sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input,select{color-scheme:dark;}
        select option{background:#1e2937;color:white;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .auth-fade{animation:fadeIn 0.25s ease forwards;}
        .auth-right::-webkit-scrollbar{width:0;}
        @media(min-width:900px){.auth-left-panel{display:flex!important}.mobile-logo{display:none!important}}
        @media(max-width:899px){.auth-left-panel{display:none!important}.mobile-logo{display:flex!important}}
      `}</style>

      {/* Left panel */}
      <div className="auth-left-panel" style={{
        display: 'none', flexShrink: 0, width: 400,
        background: 'linear-gradient(160deg,#001F54 0%,#0a3080 55%,#001F54 100%)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '36px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: `${O}14`, top: -70, right: -70, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: `${O}08`, bottom: 60, left: -50, filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5px', position: 'relative' }}>
          <img src="/logo.png" alt="BIGTENX" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10 }} />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 24, color: 'white', letterSpacing: '-0.5px' }}>
            <span style={{ color: O }}>BIG</span>TENX
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 26, color: 'white', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Turn your time<br /><span style={{ color: O }}>into real money</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7, margin: '0 0 28px' }}>
            Complete tasks, invite friends, stake points and withdraw real cash. No investment needed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${O}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={O} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, position: 'relative' }}>© 2025 BIGTENX</p>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflowY: 'auto', background: '#0a0f1e',
      }}>
        {/* Topbar */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = O}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
            <ArrowLeft size={13} /> Back to website
          </Link>
          <div className="mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '0.5px' }}>
            <img src="/logo.png" alt="BIGTENX" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>
              <span style={{ color: O }}>BIG</span><span style={{ color: 'white' }}>TENX</span>
            </span>
          </div>
          <div style={{ width: 90 }} />
        </div>

        {/* Scrollable form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 20px 24px' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            {toast && (
              <div className="auth-fade" style={{ marginBottom: 14, padding: '9px 13px', borderRadius: 9, background: toast.type === 'success' ? `${O}18` : toast.type === 'error' ? 'rgba(239,68,68,0.14)' : 'rgba(59,130,246,0.14)', border: `1px solid ${toast.type === 'success' ? `${O}35` : toast.type === 'error' ? 'rgba(239,68,68,0.28)' : 'rgba(59,130,246,0.28)'}` }}>
                <p style={{ color: toast.type === 'success' ? O : toast.type === 'error' ? '#f87171' : '#60a5fa', fontSize: 12, margin: 0, fontWeight: 500 }}>{toast.msg}</p>
              </div>
            )}

            <div className="auth-fade" key={view}>
              {view === 'register' && <RegisterForm onSuccess={() => { showToast('Account created! Check your email to verify.', 'success'); setView('login') }} onLogin={() => setView('login')} />}
              {view === 'login' && <LoginForm onSuccess={handleLoginSuccess} onRegister={() => setView('register')} onForgot={() => setView('forgot')} showToast={showToast} />}
              {view === 'forgot' && <ForgotForm onBack={() => setView('login')} showToast={showToast} />}
              {view === 'reset' && <ResetForm token={resetToken} onSuccess={() => { showToast('Password reset! You can now log in.', 'success'); setView('login') }} />}
            </div>
          </div>
        </div>

        <p style={{ flexShrink: 0, textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: 11, padding: '10px 0 14px', background: '#0a0f1e' }}>© 2025 BIGTENX. All rights reserved.</p>
      </div>
    </div>
  )
}