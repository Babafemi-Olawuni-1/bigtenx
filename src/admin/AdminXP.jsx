// AdminXP.jsx — Phase 4: single-page XP pool admin control
import { useState, useEffect, useCallback } from 'react'
import { API, O } from './adminUtils'
import { Search, Plus, Minus, Save, RefreshCw, Users, Zap, Calendar, Lock } from 'lucide-react'

const inp = { width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 13, fontFamily: 'inherit', background: '#F7F8FC', outline: 'none', boxSizing: 'border-box' }

export default function AdminXP({ token }) {
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const [summary, setSummary]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [poolAmount, setPoolAmount]   = useState('')
  const [adminPass, setAdminPass]     = useState('')
  const [poolLoading, setPoolLoading] = useState(false)

  const [search, setSearch]           = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching]     = useState(false)

  const [xpAction, setXpAction]       = useState('add') // 'add' | 'remove'
  const [xpAmount, setXpAmount]       = useState('')
  const [xpReason, setXpReason]       = useState('')
  const [xpPass, setXpPass]           = useState('')
  const [xpLoading, setXpLoading]     = useState(false)

  const [settings, setSettings]       = useState({ min_xp: 250, open_day: 1, close_day: 25, dist_day: 28 })
  const [savingSettings, setSavingSettings] = useState(false)

  const [toast, setToast]             = useState(null)
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/admin/xp_pool.php`, { headers })
      const data = await res.json()
      if (data.success) { setSummary(data); setSettings(data.settings || settings) }
    } catch {}
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadSummary() }, [loadSummary])

  const handleAddPool = async () => {
    if (!poolAmount || parseFloat(poolAmount) <= 0) { showToast('Enter a valid amount', 'error'); return }
    if (!adminPass) { showToast('Admin password required', 'error'); return }
    setPoolLoading(true)
    try {
      const res  = await fetch(`${API}/admin/xp_pool.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'add_pool', amount: parseFloat(poolAmount), admin_password: adminPass })
      })
      const data = await res.json()
      if (data.success) { showToast('Distribution pool updated'); setPoolAmount(''); setAdminPass(''); loadSummary() }
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setPoolLoading(false) }
  }

  const handleSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    setSearchResult(null)
    try {
      const res  = await fetch(`${API}/admin/xp_pool.php?search=${encodeURIComponent(search)}`, { headers })
      const data = await res.json()
      if (data.success) setSearchResult(data.user)
      else showToast(data.message || 'User not found', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setSearching(false) }
  }

  const handleXpAction = async () => {
    if (!searchResult) { showToast('Search for a user first', 'error'); return }
    if (!xpAmount || parseInt(xpAmount) <= 0) { showToast('Enter a valid XP amount', 'error'); return }
    if (!xpReason.trim()) { showToast('Reason is required', 'error'); return }
    if (!xpPass) { showToast('Admin password required', 'error'); return }
    setXpLoading(true)
    try {
      const res  = await fetch(`${API}/admin/xp_pool.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ action: xpAction + '_xp', user_id: searchResult.id, amount: parseInt(xpAmount), reason: xpReason, admin_password: xpPass })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`XP ${xpAction === 'add' ? 'added' : 'removed'} successfully`)
        setXpAmount(''); setXpReason(''); setXpPass('')
        setSearchResult(prev => ({ ...prev, coins: data.new_coins }))
      } else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setXpLoading(false) }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res  = await fetch(`${API}/admin/xp_pool.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'save_settings', ...settings })
      })
      const data = await res.json()
      if (data.success) showToast('Settings saved')
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setSavingSettings(false) }
  }

  const s = summary || {}

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#EF4444' : '#10b981', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 700, zIndex: 2000, whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>XP Pool</h1>
          <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Manage XP contributions, distribution pool and settings</p>
        </div>
        <button onClick={loadSummary} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><RefreshCw size={16} color="#8899AA" /></button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>Loading...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Contributions', value: `${(s.total_contributions ?? 0).toLocaleString()} XP`, color: O, Icon: Zap },
              { label: 'Distribution Pool',   value: `$${parseFloat(s.distribution_pool ?? 0).toLocaleString()}`, color: '#10b981', Icon: Calendar },
              { label: 'Eligible Users',      value: (s.eligible_users ?? 0).toLocaleString(), color: '#3B82F6', Icon: Users },
              { label: 'Window Status',       value: s.window_open ? 'Open' : 'Closed', color: s.window_open ? '#10b981' : '#EF4444', Icon: RefreshCw },
              { label: 'Time Remaining',      value: s.time_remaining ?? '—', color: '#8B5CF6', Icon: Calendar },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid #E9EDF2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: 10, color: '#8899AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#001F54' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Add Distribution Pool */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #E9EDF2', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#001F54', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} color={O} /> Add Distribution Pool
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 6 }}>Pool Amount ($)</label>
              <input type="number" value={poolAmount} onChange={e => setPoolAmount(e.target.value)} placeholder="0.00" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 6 }}>Admin Password</label>
              <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="••••••••" style={inp} />
            </div>
            <button onClick={handleAddPool} disabled={poolLoading} style={{ width: '100%', padding: '12px', borderRadius: 12, background: O, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: poolLoading ? 0.7 : 1 }}>
              {poolLoading ? 'Adding...' : 'Add Distribution Pool'}
            </button>
          </div>

          {/* User XP Search + Edit */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #E9EDF2', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#001F54', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} color={O} /> User Contribution Search
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Username or email..." style={{ ...inp, flex: 1 }} />
              <button onClick={handleSearch} disabled={searching} style={{ padding: '0 18px', borderRadius: 12, background: O, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {searchResult && (
              <div>
                <div style={{ background: '#F7F8FC', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>{searchResult.username}</div>
                    <div style={{ fontSize: 11, color: '#8899AA' }}>{searchResult.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: O }}>{(searchResult.contribution ?? 0).toLocaleString()} XP contributed</div>
                    <div style={{ fontSize: 11, color: '#8899AA' }}>{(searchResult.coins ?? 0).toLocaleString()} XP balance</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {['add', 'remove'].map(a => (
                    <button key={a} onClick={() => setXpAction(a)} style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1.5px solid ${xpAction === a ? O : '#E9EDF2'}`, background: xpAction === a ? `${O}12` : '#F7F8FC', color: xpAction === a ? O : '#5A6E8A', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      {a === 'add' ? <Plus size={13} /> : <Minus size={13} />} {a.charAt(0).toUpperCase() + a.slice(1)} XP
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 5 }}>XP Amount</label>
                  <input type="number" value={xpAmount} onChange={e => setXpAmount(e.target.value)} placeholder="Amount" style={inp} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 5 }}>Reason</label>
                  <input type="text" value={xpReason} onChange={e => setXpReason(e.target.value)} placeholder="Reason for adjustment" style={inp} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 5 }}>Admin Password</label>
                  <input type="password" value={xpPass} onChange={e => setXpPass(e.target.value)} placeholder="••••••••" style={inp} />
                </div>
                <button onClick={handleXpAction} disabled={xpLoading} style={{ width: '100%', padding: '12px', borderRadius: 12, background: xpAction === 'remove' ? '#EF4444' : O, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: xpLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {xpAction === 'add' ? <Plus size={15} /> : <Minus size={15} />}
                  {xpLoading ? 'Processing...' : `${xpAction === 'add' ? 'Add' : 'Remove'} XP`}
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #E9EDF2' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#001F54', marginBottom: 16 }}>Pool Settings</div>
            {[
              { label: 'Minimum Contribution (XP)', key: 'min_xp',   placeholder: '250' },
              { label: 'Open Day (of month)',        key: 'open_day', placeholder: '1'   },
              { label: 'Close Day (of month)',       key: 'close_day',placeholder: '25'  },
              { label: 'Distribution Day',           key: 'dist_day', placeholder: '28'  },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', display: 'block', marginBottom: 5 }}>{label}</label>
                <input type="number" value={settings[key] ?? ''} onChange={e => setSettings(s => ({ ...s, [key]: parseInt(e.target.value) || 0 }))} placeholder={placeholder} style={inp} />
              </div>
            ))}
            <button onClick={handleSaveSettings} disabled={savingSettings} style={{ width: '100%', padding: '12px', borderRadius: 12, background: O, border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: savingSettings ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
              <Save size={15} /> {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
