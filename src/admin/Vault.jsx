// Vault.jsx - COMPLETE UPDATED VERSION with Transaction History tab
import { useState, useEffect } from 'react'
import { API, O } from './adminUtils'
import { Coins, DollarSign, Calendar, Plus, Minus, Save, History, Calculator, Gavel, TrendingUp, Users, Zap, Wallet, Copy, Eye } from 'lucide-react'

export default function Vault({ token }) {
  const [activeTab, setActiveTab] = useState('vault')
  const [vaultValue, setVaultValue] = useState(150000)
  const [vaultUnits, setVaultUnits] = useState(10000)
  const [totalXp, setTotalXp] = useState(10000000)
  const [participants] = useState(100000)
  const [monthlyRevenue, setMonthlyRevenue] = useState(100000)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustType, setAdjustType] = useState('add')
  const [xpAdjustAmount, setXpAdjustAmount] = useState('')
  const [xpAdjustType, setXpAdjustType] = useState('add')
  const [revenueSources, setRevenueSources] = useState([
    { name: "VIP", amount: 10000 },
    { name: "Marler Place", amount: 200 },
    { name: "Upgrades", amount: 4000 },
    { name: "Fees", amount: 20000 },
    { name: "Other", amount: 0 }
  ])
  const [newRevenueName, setNewRevenueName] = useState('')
  const [newRevenueAmount, setNewRevenueAmount] = useState('')
  const [grossRevenue, setGrossRevenue] = useState(16500)
  const [referralCost, setReferralCost] = useState(300)
  const [operatingCost, setOperatingCost] = useState(1000)
  const [vaultSplit, setVaultSplit] = useState(40)
  const [showSplitEditor, setShowSplitEditor] = useState(false)
  const [contributeActive, setContributeActive] = useState(true)
  const [minXpRequired, setMinXpRequired] = useState(500)
  const [selectedTiers, setSelectedTiers] = useState(['bronze', 'silver', 'gold', 'diamond', 'vip'])
  const [minDays, setMinDays] = useState(30)
  const [contributionEndDate, setContributionEndDate] = useState('2026-07-30')
  const [distributionDate, setDistributionDate] = useState('2026-08-05')
  
  // ─── TRANSACTION HISTORY STATE ────────────────────────────────────
  const [transactions, setTransactions] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // ─── WITHDRAWALS STATE ────────────────────────────────────────────
  const [withdrawals, setWithdrawals] = useState([])
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false)

  // ─── DEPOSITS STATE ───────────────────────────────────────────────
  const [deposits, setDeposits] = useState([])
  const [loadingDeposits, setLoadingDeposits] = useState(false)

  const unitPrice = vaultUnits > 0 ? vaultValue / vaultUnits : 0
  const xpRate = 0.01
  const netProfit = grossRevenue - referralCost - operatingCost
  const totalRevenue = revenueSources.reduce((sum, s) => sum + s.amount, 0)

  // ─── LOAD WITHDRAWALS ─────────────────────────────────────────────
  const loadWithdrawals = async () => {
    setLoadingWithdrawals(true)
    try {
      const res = await fetch(`${API}/admin/withdrawals/index.php`, {
        headers: { 'X-Admin-Token': token }
      })
      const data = await res.json()
      if (data.success) {
        setWithdrawals(data.withdrawals)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  // ─── LOAD DEPOSITS ─────────────────────────────────────────────────
  const loadDeposits = async () => {
    setLoadingDeposits(true)
    try {
      const res = await fetch(`${API}/admin/deposits/index.php`, {
        headers: { 'X-Admin-Token': token }
      })
      const data = await res.json()
      if (data.success) {
        setDeposits(data.deposits)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingDeposits(false)
    }
  }

  // ─── LOAD TRANSACTION HISTORY ─────────────────────────────────────
  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`${API}/admin/history/index.php`, {
        headers: { 'X-Admin-Token': token }
      })
      const data = await res.json()
      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // ─── LOAD DATA WHEN TABS OPEN ─────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      loadWithdrawals()
    }
    if (activeTab === 'deposits') {
      loadDeposits()
    }
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab])

  const tabs = [
    { id: 'vault', label: 'Vault', icon: Coins },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'profit', label: 'Profit', icon: Calculator },
    { id: 'rules', label: 'Rules', icon: Gavel },
    { id: 'history', label: 'History', icon: History },
    { id: 'deposits', label: 'Deposits', icon: DollarSign },
    { id: 'withdrawals', label: 'Withdrawals', icon: Wallet }
  ]

  const handleVaultAdjust = () => {
    const amount = parseFloat(adjustAmount)
    if (isNaN(amount) || amount <= 0) return
    if (adjustType === 'add') setVaultValue(v => v + amount)
    else if (amount <= vaultValue) setVaultValue(v => v - amount)
    setAdjustAmount('')
  }

  const handleXpAdjust = () => {
    const usdAmount = parseFloat(xpAdjustAmount)
    if (isNaN(usdAmount) || usdAmount <= 0) return
    const xpEq = usdAmount / xpRate
    if (xpAdjustType === 'add') {
      setTotalXp(v => v + xpEq)
      setMonthlyRevenue(v => v + usdAmount)
    } else {
      if (xpEq > totalXp) return
      setTotalXp(v => v - xpEq)
      setMonthlyRevenue(v => Math.max(0, v - usdAmount))
    }
    setXpAdjustAmount('')
  }

  const handleAddRevenueSource = () => {
    if (!newRevenueName.trim() || !newRevenueAmount) return
    setRevenueSources([...revenueSources, { name: newRevenueName, amount: parseFloat(newRevenueAmount) }])
    setNewRevenueName('')
    setNewRevenueAmount('')
  }

  const handleDistribute = () => {
    if (totalXp <= 0) return
    const totalPayout = monthlyRevenue
    setMonthlyRevenue(0)
    alert(`✅ Distributed $${totalPayout.toLocaleString()} to ${participants.toLocaleString()} participants`)
  }

  const toggleTier = (tier) => {
    if (selectedTiers.includes(tier)) setSelectedTiers(selectedTiers.filter(t => t !== tier))
    else setSelectedTiers([...selectedTiers, tier])
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>Vault Management</h1>
        <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Manage vault pool, revenue, and distributions</p>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E9EDF2', marginBottom: 20, overflowX: 'auto', paddingBottom: 1 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 14px', background: 'none', border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab.id ? O : '#8899AA',
              borderBottom: activeTab === tab.id ? `2px solid ${O}` : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* VAULT TAB */}
      {activeTab === 'vault' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid #E9EDF2' }}>
              <div style={{ fontSize: 10, color: '#8899AA', marginBottom: 6 }}>Total Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: O }}>${vaultValue.toLocaleString()}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid #E9EDF2' }}>
              <div style={{ fontSize: 10, color: '#8899AA', marginBottom: 6 }}>Vault Units</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#001F54' }}>{vaultUnits.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#8899AA', marginTop: 2 }}>Unit: ${unitPrice.toFixed(2)}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid #E9EDF2' }}>
              <div style={{ fontSize: 10, color: '#8899AA', marginBottom: 6 }}>XP Staked</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#001F54' }}>{totalXp.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#8899AA', marginTop: 2 }}>{participants.toLocaleString()} users</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Adjust Vault Pool</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <button onClick={() => setAdjustType('add')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${adjustType === 'add' ? O : '#E9EDF2'}`, background: adjustType === 'add' ? `${O}10` : '#F7F8FC', color: adjustType === 'add' ? O : '#5A6E8A', fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add</button>
              <button onClick={() => setAdjustType('subtract')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${adjustType === 'subtract' ? O : '#E9EDF2'}`, background: adjustType === 'subtract' ? `${O}10` : '#F7F8FC', color: adjustType === 'subtract' ? O : '#5A6E8A', fontWeight: 600, cursor: 'pointer' }}><Minus size={14} /> Subtract</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="USD Amount" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} />
              <button onClick={handleVaultAdjust} style={{ background: O, border: 'none', borderRadius: 10, padding: '0 20px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}><Save size={14} /> Apply</button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Adjust XP Pool</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <button onClick={() => setXpAdjustType('add')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${xpAdjustType === 'add' ? O : '#E9EDF2'}`, background: xpAdjustType === 'add' ? `${O}10` : '#F7F8FC', color: xpAdjustType === 'add' ? O : '#5A6E8A', fontWeight: 600, cursor: 'pointer' }}><Plus size={14} /> Add</button>
              <button onClick={() => setXpAdjustType('subtract')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${xpAdjustType === 'subtract' ? O : '#E9EDF2'}`, background: xpAdjustType === 'subtract' ? `${O}10` : '#F7F8FC', color: xpAdjustType === 'subtract' ? O : '#5A6E8A', fontWeight: 600, cursor: 'pointer' }}><Minus size={14} /> Subtract</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="USD Amount" value={xpAdjustAmount} onChange={e => setXpAdjustAmount(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} />
              <button onClick={handleXpAdjust} style={{ background: O, border: 'none', borderRadius: 10, padding: '0 20px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}><Save size={14} /> Apply</button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Monthly Distribution</div>
            <div style={{ background: '#F7F8FC', borderRadius: 14, padding: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div><span style={{ fontSize: 10, color: '#8899AA' }}>XP Rate</span><p style={{ fontSize: 16, fontWeight: 800, margin: '2px 0 0' }}>1 XP = ${xpRate.toFixed(4)}</p></div>
              <div style={{ textAlign: 'right' }}><span style={{ fontSize: 10, color: '#8899AA' }}>To Distribute</span><p style={{ fontSize: 16, fontWeight: 800, color: O, margin: '2px 0 0' }}>${monthlyRevenue.toLocaleString()}</p></div>
            </div>
            <button onClick={handleDistribute} disabled={monthlyRevenue <= 0} style={{ width: '100%', background: monthlyRevenue > 0 ? O : '#E9EDF2', border: 'none', borderRadius: 14, padding: '12px', color: monthlyRevenue > 0 ? '#fff' : '#8899AA', fontWeight: 600, cursor: monthlyRevenue > 0 ? 'pointer' : 'not-allowed' }}><Calendar size={14} /> Distribute Now</button>
          </div>
        </>
      )}

      {/* REVENUE SOURCES TAB */}
      {activeTab === 'revenue' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          {revenueSources.map((source, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EDF2F7' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{source.name}</span>
              <span style={{ fontWeight: 700, color: O }}>${source.amount.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #EDF2F7' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Source name" value={newRevenueName} onChange={e => setNewRevenueName(e.target.value)} style={{ flex: 2, minWidth: 120, padding: '8px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 11 }} />
              <input type="number" placeholder="$ amount" value={newRevenueAmount} onChange={e => setNewRevenueAmount(e.target.value)} style={{ flex: 1, minWidth: 80, padding: '8px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 11 }} />
              <button onClick={handleAddRevenueSource} style={{ background: O, border: 'none', borderRadius: 10, padding: '0 14px', color: '#fff', cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #EDF2F7', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Total Revenue:</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: O }}>${totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* PROFIT CALCULATOR TAB */}
      {activeTab === 'profit' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}><span>Gross Revenue</span><span style={{ fontWeight: 700 }}>${grossRevenue.toLocaleString()}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, color: '#EF4444' }}><span>Referral commission</span><span style={{ fontWeight: 700 }}>-${referralCost.toLocaleString()}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, color: '#EF4444' }}><span>Operating cost</span><span style={{ fontWeight: 700 }}>-${operatingCost.toLocaleString()}</span></div>
          <div style={{ background: '#F7F8FC', borderRadius: 14, padding: 12, margin: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Net Profit</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: O }}>${netProfit.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', background: '#F7F8FC', borderRadius: 10, padding: 8 }}><span style={{ fontSize: 10, color: '#8899AA' }}>Vault</span><div style={{ fontWeight: 800, fontSize: 18 }}>{vaultSplit}%</div></div>
            <div style={{ flex: 1, textAlign: 'center', background: '#F7F8FC', borderRadius: 10, padding: 8 }}><span style={{ fontSize: 10, color: '#8899AA' }}>XP Revenue</span><div style={{ fontWeight: 800, fontSize: 18 }}>{100 - vaultSplit}%</div></div>
          </div>
          <button onClick={() => setShowSplitEditor(!showSplitEditor)} style={{ background: '#001F54', color: '#fff', border: 'none', borderRadius: 10, padding: '8px', width: '100%', marginBottom: 10, cursor: 'pointer', fontSize: 12 }}>Edit Split</button>
          {showSplitEditor && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={vaultSplit} onChange={e => setVaultSplit(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12 }} />
              <button onClick={() => setShowSplitEditor(false)} style={{ background: O, border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer' }}>Apply</button>
            </div>
          )}
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Contribute XP</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setContributeActive(true)} style={{ flex: 1, padding: '8px', borderRadius: 10, background: contributeActive ? O : '#F7F8FC', color: contributeActive ? '#fff' : '#5A6E8A', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>Active</button>
              <button onClick={() => setContributeActive(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, background: !contributeActive ? O : '#F7F8FC', color: !contributeActive ? '#fff' : '#5A6E8A', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>Disabled</button>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>Min XP Required</div>
            <input type="number" value={minXpRequired} onChange={e => setMinXpRequired(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>Eligible Tiers</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['bronze', 'silver', 'gold', 'diamond', 'vip'].map(tier => (
                <button key={tier} onClick={() => toggleTier(tier)} style={{ padding: '6px 14px', borderRadius: 30, background: selectedTiers.includes(tier) ? O : '#F7F8FC', color: selectedTiers.includes(tier) ? '#fff' : '#001F54', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>Contribution End Date</div>
            <input type="date" value={contributionEndDate} onChange={e => setContributionEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12 }} />
          </div>
        </div>
      )}

      {/* ─── HISTORY TAB ───────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
              No transactions found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Reference</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #E9EDF2' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#001F54' }}>
                        {tx.username || 'N/A'}
                      </td>

                      <td style={{
                        padding: '10px',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        color: tx.type === 'withdrawal' ? '#EF4444' : '#10B981'
                      }}>
                        {tx.type}
                      </td>

                      <td style={{ padding: '10px', fontWeight: 700, color: O }}>
                        ${parseFloat(tx.amount).toFixed(2)}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background:
                            tx.status === 'pending'
                              ? 'rgba(245,158,11,0.12)'
                              : tx.status === 'completed'
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(239,68,68,0.12)',
                          color:
                            tx.status === 'pending'
                              ? '#F59E0B'
                              : tx.status === 'completed'
                              ? '#10B981'
                              : '#EF4444'
                        }}>
                          {tx.status}
                        </span>
                      </td>

                      <td style={{ padding: '10px', fontSize: 11, color: '#5A6E8A' }}>
                        {tx.reference || '—'}
                      </td>

                      <td style={{ padding: '10px', color: '#8899AA' }}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DEPOSITS TAB */}
      {activeTab === 'deposits' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>Deposit Requests</span>
            <span style={{ fontSize: 11, color: '#8899AA' }}>
              {loadingDeposits ? 'Loading...' : `${deposits.length} requests`}
            </span>
          </div>

          {loadingDeposits ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
              Loading deposits...
            </div>
          ) : deposits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
              <p>No deposit requests found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Receipt</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #E9EDF2' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#001F54' }}>
                        {d.username || 'N/A'}
                      </td>

                      <td style={{ padding: '10px', color: O, fontWeight: 700 }}>
                        ${parseFloat(d.amount || 0).toFixed(2)}
                      </td>

                      <td style={{ padding: '10px' }}>
                        {d.receipt ? (
                          <a
                            href={`${API}/uploads/receipts/${d.receipt}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: O, fontWeight: 600, textDecoration: 'none' }}
                          >
                            <Eye size={14} style={{ display: 'inline', marginRight: 4 }} /> View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: d.status === 'pending' ? 'rgba(245,158,11,0.12)' :
                                      d.status === 'approved' ? 'rgba(16,185,129,0.12)' :
                                      'rgba(239,68,68,0.12)',
                          color: d.status === 'pending' ? '#F59E0B' :
                                 d.status === 'approved' ? '#10B981' :
                                 '#EF4444'
                        }}>
                          {d.status || 'pending'}
                        </span>
                      </td>

                      <td style={{ padding: '10px', color: '#8899AA' }}>
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                      </td>

                      <td style={{ padding: '10px' }}>
                        {d.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/admin/deposits/approve.php`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'X-Admin-Token': token 
                                    },
                                    body: JSON.stringify({ transaction_id: d.id })
                                  })
                                  const data = await res.json()
                                  alert(data.message || 'Approved!')
                                  loadDeposits()
                                } catch (err) {
                                  alert('Error approving deposit')
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#10B981',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600
                              }}
                            >
                              Approve
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/admin/deposits/reject.php`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'X-Admin-Token': token 
                                    },
                                    body: JSON.stringify({ transaction_id: d.id })
                                  })
                                  const data = await res.json()
                                  alert(data.message || 'Rejected!')
                                  loadDeposits()
                                } catch (err) {
                                  alert('Error rejecting deposit')
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#EF4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>Withdrawal Requests</span>
            <span style={{ fontSize: 11, color: '#8899AA' }}>
              {loadingWithdrawals ? 'Loading...' : `${withdrawals.length} requests`}
            </span>
          </div>

          {loadingWithdrawals ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>Loading withdrawals...</div>
          ) : withdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
              <Wallet size={32} color="#8899AA" style={{ marginBottom: 8 }} />
              <p>No withdrawal requests found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Bank</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Account Name</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Account Number</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #E9EDF2' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#001F54' }}>{w.username || 'N/A'}</td>
                      <td style={{ padding: '10px', color: O, fontWeight: 700 }}>${parseFloat(w.amount || 0).toFixed(2)}</td>
                      <td style={{ padding: '10px', color: '#5A6E8A' }}>{w.bank_name || '—'}</td>
                      <td style={{ padding: '10px', color: '#001F54', fontWeight: 600 }}>{w.account_name || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700 }}>{w.account_number || '—'}</span>
                          {w.account_number && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(w.account_number)
                                alert('Account number copied')
                              }}
                              style={{
                                border: 'none',
                                background: '#F7F8FC',
                                padding: '4px 8px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <Copy size={12} /> Copy
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: w.status === 'approved' ? 'rgba(16,185,129,0.12)' :
                                      w.status === 'pending' ? 'rgba(245,158,11,0.12)' :
                                      w.status === 'rejected' ? 'rgba(239,68,68,0.12)' :
                                      w.status === 'completed' ? 'rgba(99,102,241,0.12)' :
                                      'rgba(239,68,68,0.12)',
                          color: w.status === 'approved' ? '#10B981' :
                                 w.status === 'pending' ? '#F59E0B' :
                                 w.status === 'rejected' ? '#EF4444' :
                                 w.status === 'completed' ? '#6366F1' :
                                 '#EF4444'
                        }}>
                          {w.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#8899AA' }}>
                        {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {w.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/admin/withdrawals/approve.php`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'X-Admin-Token': token 
                                    },
                                    body: JSON.stringify({ transaction_id: w.id })
                                  })
                                  const data = await res.json()
                                  alert(data.message || 'Approved!')
                                  loadWithdrawals()
                                } catch (err) {
                                  alert('Error approving withdrawal')
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#10B981',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/admin/withdrawals/reject.php`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'X-Admin-Token': token 
                                    },
                                    body: JSON.stringify({ transaction_id: w.id })
                                  })
                                  const data = await res.json()
                                  alert(data.message || 'Rejected!')
                                  loadWithdrawals()
                                } catch (err) {
                                  alert('Error rejecting withdrawal')
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#EF4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}