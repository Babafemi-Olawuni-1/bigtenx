import { useState } from 'react'
import { Sun, Moon, ArrowLeft, Copy, CheckCircle, FileText, Share2, Building2, User, CreditCard } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function VirtualAccountScreen({ user, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [copiedField, setCopiedField] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Mock virtual account data - replace with real API data
  const virtualAccount = {
    accountHolder: user?.username?.toUpperCase() || 'VICTOR KALU SOLOMON',
    bankName: 'paga',
    accountNumber: '3326743679',
    duration: 'Instant',
    fundingLimit: 'No limit'
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    showToast(`${field} copied!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleCopyAll = () => {
    const allDetails = `Account Holder: ${virtualAccount.accountHolder}\nBank Name: ${virtualAccount.bankName}\nAccount Number: ${virtualAccount.accountNumber}`
    navigator.clipboard.writeText(allDetails)
    showToast('All account details copied!')
  }

  const handleSharePDF = () => {
    showToast('Share PDF feature coming soon! 📄')
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 8px', background: tk.bg }}>
        <button 
          onClick={onBack} 
          style={{ 
            width: 34, height: 34, borderRadius: '50%', 
            background: tk.card, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ArrowLeft size={18} color={tk.text} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, color: tk.text, flex: 1 }}>Virtual Account</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 34, height: 34, borderRadius: '50%', background: tk.card, border: 'none', cursor: 'pointer' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Hero Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 0 10px', gap: 7 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 15,
            background: darkMode ? `${C.orange}15` : `${C.navy}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22
          }}>
            🏦
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: tk.text, textAlign: 'center' }}>
            Virtual Account Number
          </div>
          <div style={{ fontSize: 10.5, color: tk.textMuted, textAlign: 'center', lineHeight: 1.5, padding: '0 14px' }}>
            Send a Naira transfer to the account below, and it will instantly reflect in your BigTenX Naira wallet
          </div>
        </div>

        {/* Meta Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
          <span style={{ fontSize: 12, color: tk.textMuted }}>Duration</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.orange }}>{virtualAccount.duration}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
          <span style={{ fontSize: 12, color: tk.textMuted }}>Funding limit</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: tk.textMuted }}>{virtualAccount.fundingLimit}</span>
        </div>

        {/* Account Details Card */}
        <div style={{
          margin: '12px 0',
          background: tk.cardBg,
          borderRadius: 16,
          border: `1.5px solid ${tk.cardBorder}`,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {/* Account Holder */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9.5, color: tk.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Account Holder
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: tk.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} color={C.orange} />
                {virtualAccount.accountHolder}
              </div>
            </div>
            <button 
              onClick={() => handleCopy(virtualAccount.accountHolder, 'Account holder')}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${C.orange}15`, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.orange
              }}
            >
              {copiedField === 'Account holder' ? <CheckCircle size={13} /> : <Copy size={13} />}
            </button>
          </div>

          {/* Bank Name */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9.5, color: tk.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Bank Name
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: tk.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={12} color={C.orange} />
                {virtualAccount.bankName}
              </div>
            </div>
            <button 
              onClick={() => handleCopy(virtualAccount.bankName, 'Bank name')}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${C.orange}15`, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.orange
              }}
            >
              {copiedField === 'Bank name' ? <CheckCircle size={13} /> : <Copy size={13} />}
            </button>
          </div>

          {/* Account Number */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9.5, color: tk.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Account Number
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: tk.text, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', letterSpacing: 1 }}>
                <CreditCard size={12} color={C.orange} />
                {virtualAccount.accountNumber}
              </div>
            </div>
            <button 
              onClick={() => handleCopy(virtualAccount.accountNumber, 'Account number')}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${C.orange}15`, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.orange
              }}
            >
              {copiedField === 'Account number' ? <CheckCircle size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          onClick={handleCopyAll}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: C.navy, color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            marginBottom: 8
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
        >
          <Copy size={14} /> Copy account details
        </button>

        <button 
          onClick={handleSharePDF}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: 'transparent', color: tk.text, border: `1.5px solid ${tk.cardBorder}`,
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            marginBottom: 16
          }}
        >
          <FileText size={14} /> Share PDF
        </button>

        {/* Disclaimer */}
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ width: 5, height: 5, background: C.orange, borderRadius: '50%', marginTop: 3.5 }} />
            <span style={{ fontSize: 9.5, color: tk.textMuted, lineHeight: 1.45 }}>
              NGN is held in custody of Pagatech Limited, a licensed Fintech
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ width: 5, height: 5, background: C.orange, borderRadius: '50%', marginTop: 3.5 }} />
            <span style={{ fontSize: 9.5, color: tk.textMuted, lineHeight: 1.45 }}>
              Currency conversion is handled by Yellow Card, a VASP provider
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ width: 5, height: 5, background: C.orange, borderRadius: '50%', marginTop: 3.5 }} />
            <span style={{ fontSize: 9.5, color: tk.textMuted, lineHeight: 1.45 }}>
              BigTenX does not accept deposits nor lend to the public
            </span>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 500 }}>
          {toast}
        </div>
      )}
    </div>
  )
}