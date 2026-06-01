import { Edit, Trash2, ToggleLeft, ToggleRight, Copy, Plus, RefreshCw, Zap, ArrowUpRight } from 'lucide-react'
import { O, LEVEL_NAMES, LEVEL_COLORS, getTheme } from './adminUtils'
import { Badge, StatCard, Toggle } from './AdminShared'
import { Users, CheckSquare, TrendingUp, DollarSign, List } from 'lucide-react'

// ── Overview Tab ──────────────────────────────────────────────────────────────
export function OverviewTab({ stats, savedRevenue, darkMode, onRefresh }) {
  const tk = getTheme(darkMode)
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:tk.text }}>Platform Overview</h2>
        <button onClick={onRefresh} style={{ display:'flex', alignItems:'center', gap:6, background:`${O}15`, border:`1px solid ${O}30`, borderRadius:10, padding:'8px 14px', color:O, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon={Users}       label="Total Users"   value={stats?.total_users}      color={O}/>
        <StatCard icon={Zap}         label="Paid Members"  value={stats?.paid_users}        color="#6366f1"/>
        <StatCard icon={TrendingUp}  label="Total XP"      value={stats?.total_xp}          color="#10b981"/>
        <StatCard icon={CheckSquare} label="Active Tasks"  value={stats?.active_tasks}      color="#f59e0b"/>
        <StatCard icon={List}        label="Completions"   value={stats?.task_completions}  color="#3b82f6"/>
        <StatCard icon={DollarSign}  label="Month Revenue" value={savedRevenue !== null ? `$${parseFloat(savedRevenue).toFixed(2)}` : '—'} color="#10b981"/>
      </div>

      {stats?.recent_users?.length > 0 && (
        <div style={{ background:tk.card, border:`1px solid ${tk.border}`, borderRadius:20, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${tk.border}` }}>
            <p style={{ fontWeight:700, fontSize:14, margin:0, color:tk.text }}>Recent Signups</p>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${tk.border}` }}>
                  {['Username','Email','Country','Level','XP','Joined'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:tk.muted, fontWeight:700, fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_users.map(u => (
                  <tr key={u.id} style={{ borderBottom:`1px solid ${tk.border}` }}>
                    <td style={{ padding:'11px 16px', color:tk.text, fontWeight:600 }}>{u.username}</td>
                    <td style={{ padding:'11px 16px', color:tk.muted }}>{u.email}</td>
                    <td style={{ padding:'11px 16px', color:tk.muted }}>{u.country}</td>
                    <td style={{ padding:'11px 16px' }}><Badge color={LEVEL_COLORS[u.level]||O}>{LEVEL_NAMES[u.level]||'Free'}</Badge></td>
                    <td style={{ padding:'11px 16px', color:O, fontWeight:700 }}>{(u.coins||0).toLocaleString()}</td>
                    <td style={{ padding:'11px 16px', color:tk.muted }}>{new Date(u.created_at).toLocaleDateString()}</td>
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

// ── Tasks Tab ─────────────────────────────────────────────────────────────────
export function TasksTab({ tasks, darkMode, onNew, onEdit, onToggle, onDelete, onCopy }) {
  const tk = getTheme(darkMode)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:tk.text }}>Manage Tasks</h2>
        <button onClick={onNew} style={{ display:'flex', alignItems:'center', gap:8, background:O, color:'#fff', border:'none', borderRadius:14, padding:'11px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          <Plus size={16}/> New Task
        </button>
      </div>

      {tasks.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:tk.muted }}>No tasks yet. Create one!</div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {tasks.map(task => (
          <div key={task.id} style={{ background:tk.card, border:`1px solid ${task.active ? `${O}30` : tk.border}`, borderRadius:18, padding:'14px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:6 }}>
                  <span style={{ fontWeight:800, fontSize:14, color:tk.text }}>{task.title}</span>
                  <Badge color={task.active ? O : tk.muted} bg={task.active ? `${O}18` : `rgba(128,128,128,0.1)`}>
                    {task.active ? 'ACTIVE' : 'PAUSED'}
                  </Badge>
                  <Badge color={task.type === 'hot' ? '#a78bfa' : '#34d399'} bg={task.type === 'hot' ? '#a78bfa18' : '#34d39918'}>
                    {task.type === 'hot' ? '🔥 Hot' : '📋 Daily'}
                  </Badge>
                </div>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:tk.muted }}>{task.platform}</span>
                  <span style={{ fontSize:12, color:O, fontWeight:700 }}>
                    {task.reward_type === 'cash' ? `$${task.reward_xp}` : `${task.reward_xp} XP`}
                  </span>
                  {task.verify_code && (
                    <button onClick={() => onCopy(task.verify_code)} style={{ display:'flex', alignItems:'center', gap:4, background:`${O}12`, border:'none', borderRadius:8, padding:'2px 10px', color:O, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      <Copy size={11}/> {task.verify_code}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={() => onToggle(task.id)} title={task.active ? 'Pause' : 'Activate'} style={{ width:34, height:34, borderRadius:10, background: task.active ? `${O}15` : 'rgba(255,255,255,0.05)', border:`1px solid ${task.active ? `${O}30` : tk.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {task.active ? <ToggleRight size={16} color={O}/> : <ToggleLeft size={16} color={tk.muted}/>}
                </button>
                <button onClick={() => onEdit(task)} title="Edit" style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Edit size={15} color="#6366f1"/>
                </button>
                <button onClick={() => onDelete(task.id)} title="Delete" style={{ width:34, height:34, borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={15} color="#f87171"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
export function UsersTab({ users, darkMode, selectedUser, setSelectedUser, targetLevel, setTargetLevel, targetVip, setTargetVip, onUpgrade, loading }) {
  const tk = getTheme(darkMode)
  const inp = { width:'100%', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.04)', border:`1.5px solid ${tk.border}`, borderRadius:12, padding:'12px 16px', color:tk.text, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20, color:tk.text }}>User Management</h2>

      {/* Upgrade panel */}
      <div style={{ background:tk.card, border:`1px solid ${tk.border}`, borderRadius:20, padding:20, marginBottom:20 }}>
        <p style={{ fontWeight:800, fontSize:14, color:tk.text, margin:'0 0 16px' }}>Upgrade / Test User Level</p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:2, minWidth:180 }}>
            <label style={{ display:'block', color:tk.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Select User</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={inp}>
              <option value="">— Select User —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username} ({LEVEL_NAMES[u.level]||'Free'})</option>)}
            </select>
          </div>
          <div style={{ width:140 }}>
            <label style={{ display:'block', color:tk.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Target Level</label>
            <select value={targetLevel} onChange={e => setTargetLevel(parseInt(e.target.value))} style={inp}>
              {LEVEL_NAMES.map((l,i) => <option key={i} value={i}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', color:tk.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>VIP Bonus</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, height:44 }}>
              <Toggle on={targetVip} onToggle={() => setTargetVip(v => !v)}/>
              <span style={{ fontSize:12, color: targetVip ? O : tk.muted }}>{targetVip ? '+20% VIP' : 'Off'}</span>
            </div>
          </div>
          <button onClick={onUpgrade} disabled={!selectedUser || loading} style={{ background: selectedUser ? O : 'rgba(255,255,255,0.06)', color: selectedUser ? '#fff' : tk.muted, border:'none', borderRadius:12, padding:'12px 22px', fontWeight:700, cursor: selectedUser ? 'pointer' : 'not-allowed', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, height:46 }}>
            <Zap size={15}/> Apply
          </button>
        </div>
      </div>

      {/* Users table */}
      <div style={{ background:tk.card, border:`1px solid ${tk.border}`, borderRadius:20, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${tk.border}` }}>
          <p style={{ fontWeight:700, fontSize:14, margin:0, color:tk.text }}>All Users ({users.length})</p>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${tk.border}` }}>
                {['ID','Username','Email','Level','VIP','XP','Cash','Joined'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:tk.muted, fontWeight:700, fontSize:11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom:`1px solid ${tk.border}` }}>
                  <td style={{ padding:'11px 16px', color:tk.muted }}>{u.id}</td>
                  <td style={{ padding:'11px 16px', color:tk.text, fontWeight:600 }}>{u.username}</td>
                  <td style={{ padding:'11px 16px', color:tk.muted }}>{u.email}</td>
                  <td style={{ padding:'11px 16px' }}><Badge color={LEVEL_COLORS[u.level]||O}>{LEVEL_NAMES[u.level]||'Free'}</Badge></td>
                  <td style={{ padding:'11px 16px', color: u.is_vip ? '#10b981' : tk.muted }}>{u.is_vip ? '✓ VIP' : '—'}</td>
                  <td style={{ padding:'11px 16px', color:O, fontWeight:700 }}>{(u.coins||0).toLocaleString()}</td>
                  <td style={{ padding:'11px 16px', color:'#10b981', fontWeight:700 }}>${parseFloat(u.usd_balance||0).toFixed(2)}</td>
                  <td style={{ padding:'11px 16px', color:tk.muted }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Revenue Tab ───────────────────────────────────────────────────────────────
export function RevenueTab({ savedRevenue, monthRevenue, setMonthRevenue, onSave, darkMode }) {
  const tk = getTheme(darkMode)
  const inp = { width:'100%', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,31,84,0.04)', border:`1.5px solid ${tk.border}`, borderRadius:12, padding:'12px 16px', color:tk.text, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20, color:tk.text }}>Monthly Revenue</h2>

      {/* Current display */}
      <div style={{ background:'linear-gradient(140deg,#081226,#0D1F42)', borderRadius:24, padding:'24px 20px', marginBottom:20, border:'1px solid rgba(255,111,0,0.2)' }}>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>This Month Revenue</div>
        <div style={{ fontSize:40, fontWeight:900, color:'#10b981', letterSpacing:-1 }}>
          {savedRevenue !== null ? `$${parseFloat(savedRevenue).toFixed(2)}` : '—'}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6 }}>Displayed on user Vault page</div>
      </div>

      {/* Update form */}
      <div style={{ background:tk.card, border:`1px solid ${tk.border}`, borderRadius:20, padding:20 }}>
        <p style={{ fontWeight:800, fontSize:14, color:tk.text, margin:'0 0 16px' }}>Update Monthly Revenue</p>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
          <div style={{ flex:1 }}>
            <label style={{ display:'block', color:tk.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Revenue Amount ($)</label>
            <input type="number" step="0.01" min="0" placeholder="e.g. 1250.00" value={monthRevenue} onChange={e => setMonthRevenue(e.target.value)} style={inp}/>
          </div>
          <button onClick={onSave} style={{ background:O, color:'#fff', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, height:46, flexShrink:0 }}>
            <ArrowUpRight size={15}/> Save
          </button>
        </div>
        <p style={{ fontSize:11, color:tk.muted, marginTop:10 }}>This value appears as "This month revenue" on the Vault page for all users.</p>
      </div>
    </div>
  )
}
