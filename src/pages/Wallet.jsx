import { useState } from 'react'
import { Sun, Moon, ArrowUp, ArrowDown, History, DollarSign, Award, Wallet as WalletIcon, Copy, CheckCircle, TrendingUp, Gift } from 'lucide-react'
import { t, C } from '../dashboard/tokens'

export default function Wallet({ user, updateUser, darkMode, setDarkMode, onUpgrade, onDeposit, onVirtualAccount }) {
  const tk = t(darkMode)
  const [activeTab, setActiveTab] = useState('balance')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountName: '', accountNumber: '' })
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const mockTransactions = [
    { id: 1, type: 'task', title: 'Liked Facebook Page', amount: 50, currency: 'xp', status: 'completed', date: new Date().toLocaleDateString() },
    { id: 2, type: 'task', title: 'Followed Instagram', amount: 100, currency: 'xp', status: 'completed', date: new Date().toLocaleDateString() },
    { id: 3, type: 'referral', title: 'Referral Bonus - John D', amount: 200, currency: 'xp', status: 'completed', date: new Date().toLocaleDateString() },
  ]

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    const usdBalance = user?.usdBalance || 0
    
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }
    if (amount < 3) {
      showToast('Minimum withdrawal is $3', 'error')
      return
    }
    if (amount > usdBalance) {
      showToast('Insufficient balance', 'error')
      return
    }
    if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
      showToast('Please fill in all bank details', 'error')
      return
    }
    
    updateUser({ usdBalance: usdBalance - amount })
    showToast(`Withdrawal request of $${amount} submitted!`, 'success')
    setWithdrawAmount('')
    setBankDetails({ bankName: '', accountName: '', accountNumber: '' })
    setActiveTab('balance')
  }

  const handleFund = () => {
    const amount = parseFloat(fundAmount)
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }
    // Navigate to deposit screen or show modal
    if (onDeposit) {
      onDeposit()
    } else {
      showToast(`Redirecting to payment gateway for $${amount}...`, 'success')
      setFundAmount('')
      setActiveTab('balance')
    }
  }

  const copyReferralLink = () => {
    const link = `https://bigtenx.com/register?ref=${user?.referralCode || user?.username}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    showToast('Referral link copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const tabStyle = (tab) => ({
    flex: 1,
    textAlign: 'center',
    padding: '12px 0',
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 12,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    background: activeTab === tab ? C.orange : 'transparent',
    color: activeTab === tab ? '#fff' : tk.textMuted,
  })

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1px solid ${tk.cardBorder}`,
    background: tk.cardBg,
    color: tk.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  }

  const quickActionStyle = (isActive = false) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    cursor: 'pointer',
    padding: '8px 4px',
    borderRadius: 12,
    background: isActive ? C.orange : 'transparent',
    transition: 'all 0.2s'
  })

  return (
    <div style={{ background: tk.bg, minHeight: '100%', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 8px', background: tk.bg }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: tk.text }}>Wallet</span>
        <button onClick={() => setDarkMode(!darkMode)} style={{ width: 34, height: 34, borderRadius: '50%', background: tk.card, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ 
            background: darkMode ? `${C.navy}20` : C.navy, 
            borderRadius: 20, padding: '16px', 
            border: `1.5px solid ${darkMode ? C.orange : 'rgba(255,255,255,0.1)'}` 
          }}>
            <Award size={28} color={C.orange} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: darkMode ? tk.textMuted : 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Points Balance</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.orange }}>{(user?.coins || 0).toLocaleString()} XP</div>
          </div>
          <div style={{ 
            background: darkMode ? `${C.navy}20` : C.navy, 
            borderRadius: 20, padding: '16px',
            border: `1.5px solid ${darkMode ? C.orange : 'rgba(255,255,255,0.1)'}`
          }}>
            <DollarSign size={28} color={C.orange} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: darkMode ? tk.textMuted : 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Cash Balance</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.orange }}>${(user?.usdBalance || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button 
            onClick={() => setActiveTab('balance')}
            style={quickActionStyle(activeTab === 'balance')}
          >
            <WalletIcon size={18} color={activeTab === 'balance' ? '#fff' : tk.textMuted} />
            <span style={{ fontSize: 11, fontWeight: 700, color: activeTab === 'balance' ? '#fff' : tk.textMuted }}>Balance</span>
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            style={quickActionStyle(activeTab === 'withdraw')}
          >
            <ArrowUp size={18} color={activeTab === 'withdraw' ? '#fff' : tk.textMuted} />
            <span style={{ fontSize: 11, fontWeight: 700, color: activeTab === 'withdraw' ? '#fff' : tk.textMuted }}>Withdraw</span>
          </button>
          <button 
            onClick={() => setActiveTab('fund')}
            style={quickActionStyle(activeTab === 'fund')}
          >
            <ArrowDown size={18} color={activeTab === 'fund' ? '#fff' : tk.textMuted} />
            <span style={{ fontSize: 11, fontWeight: 700, color: activeTab === 'fund' ? '#fff' : tk.textMuted }}>Fund</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={quickActionStyle(activeTab === 'history')}
          >
            <History size={18} color={activeTab === 'history' ? '#fff' : tk.textMuted} />
            <span style={{ fontSize: 11, fontWeight: 700, color: activeTab === 'history' ? '#fff' : tk.textMuted }}>History</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'balance' && (
          <div>
            {/* Referral Program Card */}
            <div style={{ background: tk.card, borderRadius: 20, padding: 20, marginBottom: 16, border: `1px solid ${tk.cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={20} color={C.orange} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tk.text }}>Referral Program</div>
                  <div style={{ fontSize: 11, color: tk.textMuted }}>Invite friends and earn rewards</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: tk.cardBg, padding: '10px 14px', borderRadius: 12 }}>
                <span style={{ fontSize: 11, color: tk.textMuted, fontFamily: 'monospace' }}>
                  bigtenx.com/register?ref={user?.referralCode || user?.username}
                </span>
                <button onClick={copyReferralLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.orange }}>
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Virtual Account Card */}
            {onVirtualAccount && (
              <button 
                onClick={onVirtualAccount}
                style={{
                  width: '100%', background: tk.card, borderRadius: 20, padding: 16,
                  border: `1px solid ${tk.cardBorder}`, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color={C.orange} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tk.text }}>Virtual Account</div>
                  <div style={{ fontSize: 11, color: tk.textMuted }}>Get your unique account number</div>
                </div>
                <span style={{ color: C.orange, fontSize: 20 }}>→</span>
              </button>
            )}
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div style={{ background: tk.card, borderRadius: 20, padding: 20, border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, marginBottom: 6, display: 'block' }}>Withdrawal Amount (Min $3)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tk.textMuted }}>$</span>
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 28 }} />
              </div>
              <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 4 }}>Available: ${(user?.usdBalance || 0).toFixed(2)}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, marginBottom: 6, display: 'block' }}>Bank Name</label>
              <input type="text" value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })} placeholder="e.g. First Bank, GTBank" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, marginBottom: 6, display: 'block' }}>Account Name</label>
              <input type="text" value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} placeholder="Your full name" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, marginBottom: 6, display: 'block' }}>Account Number</label>
              <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="10-digit account number" style={inputStyle} />
            </div>
            <button onClick={handleWithdraw} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.orange, border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Request Withdrawal
            </button>
          </div>
        )}

        {activeTab === 'fund' && (
          <div style={{ background: tk.card, borderRadius: 20, padding: 20, border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textMuted, marginBottom: 6, display: 'block' }}>Amount to Fund ($)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tk.textMuted }}>$</span>
                <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 28 }} />
              </div>
            </div>
            <button onClick={handleFund} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.orange, border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Continue to Payment
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ background: tk.card, borderRadius: 20, overflow: 'hidden', border: `1px solid ${tk.cardBorder}` }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tk.cardBorder}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>Transaction History</span>
            </div>
            {mockTransactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${tk.cardBorder}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>{tx.title}</div>
                  <div style={{ fontSize: 10, color: tk.textMuted }}>{tx.date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>+{tx.amount} {tx.currency === 'xp' ? 'XP' : 'pts'}</div>
              </div>
            ))}
            {mockTransactions.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: tk.textMuted }}>
                No transactions yet
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 500 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}