// Vault.jsx - COMPLETE FIXED VERSION (mobile responsive)
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Coins, DollarSign, Calendar, Plus, Minus, Save, History, Calculator, Gavel, TrendingUp, Users, Zap } from 'lucide-react'

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
  const [historyRecords, setHistoryRecords] = useState([
    { date: '28 Jan', amount: 106000, participants: 75000 },
    { date: '28 Feb', amount: 300000, participants: 400000 },
    { date: '28 Mar', amount: 1000000, participants: 800000 }
  ])

  const unitPrice = vaultUnits > 0 ? vaultValue / vaultUnits : 0
  const xpRate = 0.01
  const netProfit = grossRevenue - referralCost - operatingCost
  const totalRevenue = revenueSources.reduce((sum, s) => sum + s.amount, 0)

  const tabs = [
    { id: 'vault', label: 'Vault', icon: Coins },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'profit', label: 'Profit', icon: Calculator },
    { id: 'rules', label: 'Rules', icon: Gavel },
    { id: 'history', label: 'History', icon: History }
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
    setHistoryRecords([{ date: new Date().toLocaleString('default', { month: 'short', day: 'numeric' }), amount: totalPayout, participants: participants }, ...historyRecords])
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

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px', color: '#8899AA' }}>Users</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E9EDF2' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{record.date}</td>
                    <td style={{ padding: '10px', color: O, fontWeight: 700 }}>${record.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>{record.participants.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}