import { useState } from 'react'
import { Sun, Moon, Copy, ArrowLeft, X } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function Wallet({ user, updateUser, darkMode, setDarkMode, onBack }) {
  const tk = t(darkMode)
  const [activeTab, setActiveTab] = useState('deposit')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountName: '', accountNumber: '' })
  const [toast, setToast] = useState(null)
  
  const [instantAmount, setInstantAmount] = useState('')
  const [showNairaConversion, setShowNairaConversion] = useState(false)
  const [showAccountDetails, setShowAccountDetails] = useState(false)
  const [generatedAccount, setGeneratedAccount] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [displayNaira, setDisplayNaira] = useState('')
  const [reference, setReference] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  
  const [showPaystackModal, setShowPaystackModal] = useState(false)
  const [paystackAmount, setPaystackAmount] = useState('')
  const [paystackEmail, setPaystackEmail] = useState('')
  const [paystackSuccess, setPaystackSuccess] = useState(false)

  const USD_TO_NGN = 1550

  const mockTransactions = [
    { id: 1, type: 'task', title: 'Task Reward', amount: 50, currency: 'xp', date: 'Today, 10:30 AM' },
    { id: 2, type: 'referral', title: 'Referral Bonus', amount: 200, currency: 'xp', date: 'Yesterday, 3:15 PM' },
    { id: 3, type: 'withdrawal', title: 'Withdrawal Request', amount: 10.00, currency: 'usd', date: 'Jan 15, 2024' },
  ]

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    const usdBalance = user?.usdBalance || 0
    
    if (!amount || amount <= 0) {
      showToastMsg('Please enter a valid amount', 'error')
      return
    }
    if (amount < 3) {
      showToastMsg('Minimum withdrawal is $3', 'error')
      return
    }
    if (amount > usdBalance) {
      showToastMsg('Insufficient balance', 'error')
      return
    }
    if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
      showToastMsg('Please fill in all bank details', 'error')
      return
    }
    
    updateUser({ usdBalance: usdBalance - amount })
    showToastMsg(`Withdrawal request of $${amount} submitted!`, 'success')
    setWithdrawAmount('')
    setBankDetails({ bankName: '', accountName: '', accountNumber: '' })
    setActiveTab('deposit')
  }

  const updateNairaAmount = () => {
    const usdAmount = instantAmount
    
    if (usdAmount && parseFloat(usdAmount) > 0) {
      const nairaAmount = parseFloat(usdAmount) * USD_TO_NGN
      setShowNairaConversion(true)
      generateAccountNumber(usdAmount, nairaAmount)
    } else {
      setShowNairaConversion(false)
      setShowAccountDetails(false)
    }
  }

  const generateAccountNumber = (usdAmount, nairaAmount) => {
    const accountNum = Math.floor(Math.random() * 9000000000 + 1000000000).toString()
    setGeneratedAccount(accountNum)
    setDisplayAmount(`$${parseFloat(usdAmount).toFixed(2)}`)
    setDisplayNaira(`₦${nairaAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
    setReference(`BTX-${Math.floor(Math.random() * 900000 + 100000)}`)
    setShowAccountDetails(true)
  }

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(generatedAccount)
    showToastMsg('Account number copied!', 'success')
  }

  const confirmInstantTransfer = () => {
    setPaymentSuccess(true)
    showToastMsg('Payment confirmation received! Processing...', 'success')
    setTimeout(() => {
      setInstantAmount('')
      setShowNairaConversion(false)
      setShowAccountDetails(false)
      setPaymentSuccess(false)
      setActiveTab('deposit')
    }, 3000)
  }

  const handlePaystackPayment = () => {
    if (!paystackAmount || parseFloat(paystackAmount) <= 0) {
      showToastMsg('Please enter a valid amount', 'error')
      return
    }
    if (!paystackEmail || !paystackEmail.includes('@')) {
      showToastMsg('Please enter a valid email address', 'error')
      return
    }
    setPaystackSuccess(true)
    showToastMsg(`Processing Paystack payment of $${paystackAmount}...`, 'success')
    setTimeout(() => {
      setShowPaystackModal(false)
      setPaystackAmount('')
      setPaystackEmail('')
      setPaystackSuccess(false)
      setActiveTab('deposit')
    }, 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: `1.5px solid ${tk.cardBorder}`,
    background: tk.bg,
    color: tk.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  const selectStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: `1.5px solid ${tk.cardBorder}`,
    background: tk.bg,
    color: tk.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none'
  }

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 16px', background: tk.bg,
      }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: tk.iconShadow,
          }}>
            <ArrowLeft size={18} color={tk.text} />
          </button>
        )}
        <span style={{ fontSize: 22, fontWeight: 900, color: tk.text, letterSpacing: '-.03em' }}>Wallet</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: tk.iconShadow,
        }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Balance Card - FIXED: Always navy blue gradient */}
        <div style={{
          margin: '0 0 20px', borderRadius: 24,
          background: `linear-gradient(135deg, #001F54 0%, #003B8E 100%)`,
          padding: '24px 20px',
          boxShadow: `0 8px 32px rgba(0,31,84,0.25)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Total Balance</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>${(user?.usdBalance || 0).toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>Available for withdrawal</div>
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>XP Balance</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#FF6F00' }}>{(user?.coins || 0).toLocaleString()} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setActiveTab('deposit')} style={{
            flex: 1, padding: '14px 0', borderRadius: 14,
            background: activeTab === 'deposit' ? C.orange : tk.card,
            border: `1.5px solid ${tk.cardBorder}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: activeTab === 'deposit' ? `0 6px 22px rgba(255,111,0,.52)` : tk.iconShadow,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'deposit' ? '#fff' : C.orange} strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: activeTab === 'deposit' ? '#fff' : tk.text }}>Deposit</span>
          </button>
          <button onClick={() => setActiveTab('withdraw')} style={{
            flex: 1, padding: '14px 0', borderRadius: 14,
            background: activeTab === 'withdraw' ? C.orange : tk.card,
            border: `1.5px solid ${tk.cardBorder}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: activeTab === 'withdraw' ? `0 6px 22px rgba(255,111,0,.52)` : tk.iconShadow,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'withdraw' ? '#fff' : C.orange} strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: activeTab === 'withdraw' ? '#fff' : tk.text }}>Withdrawal</span>
          </button>
          <button onClick={() => setActiveTab('history')} style={{
            flex: 1, padding: '14px 0', borderRadius: 14,
            background: activeTab === 'history' ? C.orange : tk.card,
            border: `1.5px solid ${tk.cardBorder}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: activeTab === 'history' ? `0 6px 22px rgba(255,111,0,.52)` : tk.iconShadow,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'history' ? '#fff' : C.orange} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: activeTab === 'history' ? '#fff' : tk.text }}>History</span>
          </button>
        </div>

        {/* Deposit Section */}
        {activeTab === 'deposit' && (
          <div style={{ background: tk.card, borderRadius: 18, padding: 18, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Deposit Methods</div>
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${tk.cardBorder}`, cursor: 'pointer'
            }} onClick={() => {
              setInstantAmount('')
              setShowNairaConversion(false)
              setShowAccountDetails(false)
              setPaymentSuccess(false)
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', border: `1.5px solid ${tk.cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>Instant Bank Transfer</div>
                <div style={{ fontSize: 10, color: tk.textMuted }}>Direct transfer from your bank</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.textMuted} strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Amount (USD)</label>
                <input type="number" value={instantAmount} onChange={(e) => { setInstantAmount(e.target.value); updateNairaAmount() }} placeholder="Enter amount in USD" style={inputStyle} />
              </div>

              {showNairaConversion && (
                <div style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f0f3fa', borderRadius: 12, padding: 12, marginTop: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 4 }}>You will send</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: tk.text }}>₦{(parseFloat(instantAmount) * USD_TO_NGN).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 4 }}>Exchange rate: 1 USD = ₦{USD_TO_NGN}</div>
                </div>
              )}

              {showAccountDetails && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', borderRadius: 16, padding: 16, border: `1px solid ${tk.cardBorder}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Send money to this account</div>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 2, color: tk.text, background: tk.card, padding: 12, borderRadius: 12, border: `1px solid ${tk.cardBorder}` }}>{generatedAccount}</div>
                    <button onClick={copyAccountNumber} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 10, background: C.orange, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none' }}><Copy size={14} /> Copy Account Number</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
                    <span style={{ fontSize: 12, color: tk.textMuted }}>Bank Name</span><span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>BigTenX Virtual Bank</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
                    <span style={{ fontSize: 12, color: tk.textMuted }}>Account Name</span><span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>BigTenX User</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
                    <span style={{ fontSize: 12, color: tk.textMuted }}>Amount (USD)</span><span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{displayAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${tk.cardBorder}` }}>
                    <span style={{ fontSize: 12, color: tk.textMuted }}>Amount (NGN)</span><span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{displayNaira}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: 12, color: tk.textMuted }}>Reference</span><span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{reference}</span>
                  </div>
                  {paymentSuccess && <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.1)', textAlign: 'center', color: '#10b981', fontSize: 13, fontWeight: 600 }}>✓ Payment received! Your wallet will be updated shortly.</div>}
                  <button onClick={confirmInstantTransfer} style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 14, background: C.orange, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', border: 'none' }}>I have sent the payment</button>
                </div>
              )}
            </div>

            <div onClick={() => setShowPaystackModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>Paystack</div>
                <div style={{ fontSize: 10, color: tk.textMuted }}>Secure payment gateway</div>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Section */}
        {activeTab === 'withdraw' && (
          <div style={{ background: tk.card, borderRadius: 18, padding: 18, boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: tk.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Withdrawal</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: darkMode ? 'rgba(255,255,255,0.05)' : '#f0f3fa', border: `1.5px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: tk.text }}>Bank Transfer</div>
                <div style={{ fontSize: 11, color: tk.textMuted }}>Withdraw to your bank account</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Amount (Min $3)</label>
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 2 }}>Available: ${(user?.usdBalance || 0).toFixed(2)}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Bank Name</label>
                <select value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })} style={selectStyle}>
                  <option value="">Select Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="UBA">UBA</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Moniepoint">Moniepoint</option>
                  <option value="Opay">Opay</option>
                  <option value="Palmpay">Palmpay</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Account Name</label>
                <input type="text" value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} placeholder="Your full name" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Account Number</label>
                <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="10-digit account number" maxLength="10" style={inputStyle} />
              </div>
              <button onClick={handleWithdraw} style={{ width: '100%', padding: 14, borderRadius: 14, background: C.orange, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', border: 'none' }}>Request Withdrawal</button>
            </div>
          </div>
        )}

        {/* History Section */}
        {activeTab === 'history' && (
          <div style={{ background: tk.card, borderRadius: 18, overflow: 'hidden', boxShadow: tk.iconShadow, border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tk.cardBorder}` }}><span style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>Transaction History</span></div>
            {mockTransactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${tk.cardBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', border: `1px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tx.type === 'task' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    {tx.type === 'referral' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    {tx.type === 'withdrawal' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                  </div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{tx.title}</div><div style={{ fontSize: 10, color: tk.textMuted }}>{tx.date}</div></div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: tx.currency === 'usd' ? '#ef4444' : C.orange }}>{tx.currency === 'usd' ? `-$${tx.amount.toFixed(2)}` : `+${tx.amount} XP`}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paystack Modal */}
      {showPaystackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowPaystackModal(false)}>
          <div style={{ background: tk.card, borderRadius: 28, width: 320, maxWidth: '90%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#001F54', padding: 20, textAlign: 'center', color: '#fff' }}><h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Paystack</h3><p style={{ fontSize: 12, opacity: 0.7 }}>Secure payment gateway</p></div>
            <div style={{ padding: 20 }}>
              <div style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fc', padding: 15, borderRadius: 16, textAlign: 'center', marginBottom: 16 }}><div style={{ fontSize: 11, color: tk.textMuted }}>Amount to pay</div><div style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>${paystackAmount || '0.00'}</div></div>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Email Address</label><input type="email" value={paystackEmail} onChange={e => setPaystackEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} /></div>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Amount ($)</label><input type="number" value={paystackAmount} onChange={e => setPaystackAmount(e.target.value)} placeholder="0.00" style={inputStyle} /></div>
              {paystackSuccess && <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.1)', textAlign: 'center', color: '#10b981', fontSize: 13, fontWeight: 600 }}>✓ Payment successful! Your wallet will be updated.</div>}
              <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setShowPaystackModal(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.08)' : '#f0f3fa', color: tk.text, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Cancel</button><button onClick={handlePaystackPayment} style={{ flex: 1, padding: 12, borderRadius: 12, background: C.orange, color: '#fff', fontWeight: 700, cursor: 'pointer', border: 'none' }}>Pay Now</button></div>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#ef4444' : C.orange, color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap' }}>{toast.msg}</div>}
    </div>
  )
}