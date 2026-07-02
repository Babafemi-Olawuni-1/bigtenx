// AdminVault.jsx — Phase 3: single-page admin vault control
import { useState, useEffect, useCallback } from 'react'
import { API, O } from './adminUtils'
import {
  DollarSign, Layers, Users, TrendingUp, ToggleLeft, ToggleRight,
  Plus, Minus, RefreshCw, Save
} from 'lucide-react'

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div style={{ 
      background: '#fff', borderRadius: 16, padding: 16, 
      border: '1px solid #E9EDF2', 
      display: 'flex', alignItems: 'flex-start', gap: 12, 
      minWidth: 0 
    }}>
      <div style={{ 
        width: 38, height: 38, borderRadius: 10, 
        background: `${color || O}12`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        flexShrink: 0 
      }}>
        <Icon size={16} color={color || O} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ 
          fontSize: 10, color: '#8899AA', fontWeight: 600, 
          textTransform: 'uppercase', letterSpacing: '0.04em', 
          marginBottom: 3 
        }}>
          {label}
        </div>
        <div style={{ 
          fontSize: 15, fontWeight: 900, color: '#001F54', 
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
        }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      {on ? <ToggleRight size={34} color={O} /> : <ToggleLeft size={34} color="#CBD5E0" />}
    </button>
  )
}

export default function AdminVault({ token }) {
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const [stats, setStats]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [fundAction, setFundAction]   = useState('add')
  const [fundAmount, setFundAmount]   = useState('')
  const [fundReason, setFundReason]   = useState('')
  const [fundLoading, setFundLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [toast, setToast]             = useState(null)

  const [basicLimit,  setBasicLimit]  = useState(2)
  const [txFee,       setTxFee]       = useState(2)
  const [unitPrice,   setUnitPrice]   = useState(15)
  const [buyEnabled,  setBuyEnabled]  = useState(true)
  const [sellEnabled, setSellEnabled] = useState(true)

  const showToast = (msg, type = 'success') => { 
    setToast({ msg, type }); 
    setTimeout(() => setToast(null), 3500) 
  }

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/admin/vault_stats.php`, { headers })
      const data = await res.json()
      if (data.success) {
        setStats(data)
        setBasicLimit(data.settings?.basic_limit ?? 2)
        setTxFee(data.settings?.tx_fee ?? 2)
        setUnitPrice(parseFloat(data.unit_price ?? 15))
        setBuyEnabled(data.settings?.buy_enabled !== false && data.settings?.buy_enabled !== 0)
        setSellEnabled(data.settings?.sell_enabled !== false && data.settings?.sell_enabled !== 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadStats() }, [loadStats])

  const handleFunds = async () => {
    const amt = parseFloat(fundAmount)
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return }
    if (!fundReason.trim()) { showToast('Enter a reason', 'error'); return }
    setFundLoading(true)
    try {
      const res  = await fetch(`${API}/admin/vault_stats.php`, {
        method: 'POST', 
        headers,
        body: JSON.stringify({ 
          action: fundAction === 'add' ? 'add_funds' : 'deduct_funds', 
          amount: amt, 
          reason: fundReason 
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast(fundAction === 'add' ? 'Funds added to vault' : 'Funds deducted from vault')
        setFundAmount(''); setFundReason(''); loadStats()
      } else {
        showToast(data.message || 'Failed', 'error')
      }
    } catch (err) {
      showToast('Network error', 'error')
    } finally {
      setFundLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaveLoading(true)
    try {
      const res  = await fetch(`${API}/admin/vault_stats.php`, {
        method: 'POST', 
        headers,
        body: JSON.stringify({ 
          action: 'save_settings', 
          basic_limit: basicLimit, 
          tx_fee: txFee, 
          unit_price: unitPrice, 
          buy_enabled: buyEnabled ? 1 : 0, 
          sell_enabled: sellEnabled ? 1 : 0 
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast('Settings saved')
      } else {
        showToast(data.message || 'Failed', 'error')
      }
    } catch (err) {
      showToast('Network error', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const s          = stats || {}
  const up         = parseFloat(s.unit_price ?? unitPrice)
  const totalUnits = parseInt(s.total_units ?? 0)
  const totalValue = up * totalUnits
  const holders    = parseInt(s.unit_holders ?? 0)
  const distPool   = parseFloat(s.distribution_pool ?? 0)

  const fmt    = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inp    = { 
    width: '100%', padding: '11px 14px', borderRadius: 12, 
    border: '1px solid #E9EDF2', fontSize: 13, 
    fontFamily: 'inherit', background: '#F7F8FC', 
    outline: 'none', boxSizing: 'border-box' 
  }

  return (
    <div>
      {toast && (
        <div style={{ 
          position: 'fixed', bottom: 80, left: '50%', 
          transform: 'translateX(-50%)', 
          background: toast.type === 'error' ? '#EF4444' : '#10b981', 
          color: '#fff', padding: '10px 20px', borderRadius: 30, 
          fontSize: 13, fontWeight: 700, zIndex: 2000, 
          whiteSpace: 'nowrap' 
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ 
        marginBottom: 20, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>
            Vault Management
          </h1>
          <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>
            Monitor vault pool, manage funds, configure settings
          </p>
        </div>
        <button onClick={loadStats} style={{ 
          background: 'none', border: 'none', cursor: 'pointer', padding: 8 
        }}>
          <RefreshCw size={16} color="#8899AA" />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>
          Loading vault data...
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: 10, 
            marginBottom: 20 
          }}>
            <StatCard label="Unit Price" value={fmt(up)} color={O} icon={DollarSign} />
            <StatCard label="Total Value" value={fmt(totalValue)} color="#10b981" icon={TrendingUp} />
            <StatCard label="Total Units" value={totalUnits.toLocaleString()} color="#3B82F6" icon={Layers} />
            <StatCard label="Unit Holders" value={holders.toLocaleString()} color="#8B5CF6" icon={Users} />
            <StatCard label="Distribution Pool" value={fmt(distPool)} color="#F59E0B" icon={DollarSign} />
            <StatCard 
              label="Buying / Selling" 
              value={`${buyEnabled ? 'On' : 'Off'} / ${sellEnabled ? 'On' : 'Off'}`} 
              color={buyEnabled ? '#10b981' : '#EF4444'} 
              icon={ToggleRight} 
            />
          </div>

          {/* Add / Deduct Funds */}
          <div style={{ 
            background: '#fff', borderRadius: 20, padding: 20, 
            border: '1px solid #E9EDF2', marginBottom: 16 
          }}>
            <div style={{ 
              fontWeight: 800, fontSize: 14, color: '#001F54', 
              marginBottom: 14 
            }}>
              Vault Funds
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['add', 'deduct'].map(a => (
                <button 
                  key={a} 
                  onClick={() => setFundAction(a)} 
                  style={{ 
                    flex: 1, padding: '9px', borderRadius: 10, 
                    border: `1.5px solid ${fundAction === a ? O : '#E9EDF2'}`, 
                    background: fundAction === a ? `${O}10` : '#F7F8FC', 
                    color: fundAction === a ? O : '#5A6E8A', 
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 
                  }}
                >
                  {a === 'add' ? <Plus size={13} /> : <Minus size={13} />}
                  {a === 'add' ? 'Add Funds' : 'Deduct Funds'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ 
                fontSize: 11, fontWeight: 700, color: '#8899AA', 
                display: 'block', marginBottom: 6 
              }}>
                Amount ($)
              </label>
              <input 
                type="number" 
                value={fundAmount} 
                onChange={e => setFundAmount(e.target.value)} 
                placeholder="0.00" 
                style={inp} 
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                fontSize: 11, fontWeight: 700, color: '#8899AA', 
                display: 'block', marginBottom: 6 
              }}>
                Reason
              </label>
              <input 
                type="text" 
                value={fundReason} 
                onChange={e => setFundReason(e.target.value)} 
                placeholder="e.g. Monthly Revenue Allocation" 
                style={inp} 
              />
            </div>

            <button 
              onClick={handleFunds} 
              disabled={fundLoading} 
              style={{ 
                width: '100%', padding: '12px', borderRadius: 12, 
                background: fundAction === 'deduct' ? '#EF4444' : O, 
                border: 'none', color: '#fff', fontWeight: 800, 
                fontSize: 14, cursor: 'pointer', 
                opacity: fundLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 
              }}
            >
              {fundAction === 'add' ? <Plus size={15} /> : <Minus size={15} />}
              {fundLoading ? 'Processing...' : fundAction === 'add' ? 'Add Funds to Vault' : 'Deduct Funds from Vault'}
            </button>
          </div>

          {/* Vault Settings */}
          <div style={{ 
            background: '#fff', borderRadius: 20, padding: 20, 
            border: '1px solid #E9EDF2' 
          }}>
            <div style={{ 
              fontWeight: 800, fontSize: 14, color: '#001F54', 
              marginBottom: 16 
            }}>
              Vault Settings
            </div>

            {[
              { label: 'Unit Price ($)', val: unitPrice, set: v => setUnitPrice(parseFloat(v)||15), type: 'number' },
              { label: 'Basic Vault Limit', val: basicLimit, set: v => setBasicLimit(parseInt(v)||2), type: 'number' },
              { label: 'Transaction Fee (%)', val: txFee, set: v => setTxFee(parseFloat(v)||2), type: 'number' },
            ].map(({ label, val, set, type }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ 
                  fontSize: 11, fontWeight: 700, color: '#8899AA', 
                  display: 'block', marginBottom: 6 
                }}>
                  {label}
                </label>
                <input 
                  type={type} 
                  value={val} 
                  onChange={e => set(e.target.value)} 
                  style={inp} 
                />
              </div>
            ))}

            {[
              { label: 'Buying Enabled',  val: buyEnabled,  set: setBuyEnabled },
              { label: 'Selling Enabled', val: sellEnabled, set: setSellEnabled },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ 
                display: 'flex', alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingBottom: 14, marginBottom: 14, 
                borderBottom: '1px solid #F0F2F5' 
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#001F54' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: '#8899AA' }}>
                    {val ? 'Currently enabled' : 'Currently disabled'}
                  </div>
                </div>
                <Toggle on={val} onToggle={() => set(v => !v)} />
              </div>
            ))}

            <button 
              onClick={handleSaveSettings} 
              disabled={saveLoading} 
              style={{ 
                width: '100%', padding: '12px', borderRadius: 12, 
                background: O, border: 'none', color: '#fff', 
                fontWeight: 800, fontSize: 14, cursor: 'pointer', 
                opacity: saveLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 
              }}
            >
              <Save size={15} /> {saveLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}