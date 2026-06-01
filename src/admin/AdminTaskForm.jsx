import { X, Trash2, Zap } from 'lucide-react'
import { O, PLATFORMS, PLATFORM_ICONS } from './adminUtils'
import { Toggle, Field } from './AdminShared'

export default function AdminTaskForm({ editingTask, form, setForm, onSubmit, onClose, loading }) {
  const set        = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addStep    = () => set('steps', [...form.steps, { id: Date.now(), icon:'📌', title:'', hint:'' }])
  const updateStep = (id, k, v) => set('steps', form.steps.map(s => s.id === id ? { ...s, [k]: v } : s))
  const deleteStep = (id) => set('steps', form.steps.filter(s => s.id !== id))

  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#111827', borderRadius:24, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto', border:`1px solid ${O}30` }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#111827', zIndex:1 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#fff' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color="rgba(255,255,255,0.5)"/>
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding:24 }}>
          {/* Title + Platform */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
            <Field label="Task Title *" darkMode>
              <input placeholder="e.g. Follow our Instagram" value={form.title} onChange={e => set('title', e.target.value)} style={inp}/>
            </Field>
            <Field label="Platform" darkMode>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} style={inp}>
                {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
              </select>
            </Field>
          </div>

          {/* URL */}
          <div style={{ marginBottom:16 }}>
            <Field label="Task URL *" darkMode>
              <input placeholder="https://..." value={form.url} onChange={e => set('url', e.target.value)} style={inp}/>
            </Field>
          </div>

          {/* Type + Reward type */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <Field label="Task Type" hint="Which tab it appears in" darkMode>
              <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
                <option value="daily">📋 Daily Task</option>
                <option value="hot">🔥 Hot Offer</option>
              </select>
            </Field>
            <Field label="Reward Type" darkMode>
              <select value={form.reward_type} onChange={e => set('reward_type', e.target.value)} style={inp}>
                <option value="xp">⭐ XP Points</option>
                <option value="cash">💰 Cash ($)</option>
              </select>
            </Field>
          </div>

          {/* Reward slider */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Reward Amount</label>
              <span style={{ background:`${O}18`, color:O, fontWeight:800, fontSize:14, padding:'2px 12px', borderRadius:50 }}>
                {form.reward_type === 'cash' ? `$${form.reward}` : `${form.reward} XP`}
              </span>
            </div>
            <input type="range" min="1" max="500" value={form.reward} onChange={e => set('reward', parseInt(e.target.value))} style={{ width:'100%', accentColor:O }}/>
          </div>

          {/* Multiplier toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', marginBottom:16 }}>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#fff' }}>Apply Level Multiplier</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.35)' }}>Higher levels earn more</p>
            </div>
            <Toggle on={!!form.apply_multiplier} onToggle={() => set('apply_multiplier', form.apply_multiplier ? 0 : 1)}/>
          </div>

          {/* Hot offer fields */}
          {form.type === 'hot' && (
            <div style={{ padding:16, borderRadius:14, background:'rgba(255,107,0,0.04)', border:'1px solid rgba(255,107,0,0.15)', marginBottom:16 }}>
              <p style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, color:O }}>🔥 Hot Offer Settings</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Field label="Expires At (optional)" darkMode>
                  <input type="datetime-local" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} style={inp}/>
                </Field>
                <Field label="Max Users (optional)" darkMode>
                  <input type="number" placeholder="Unlimited" value={form.max_users} onChange={e => set('max_users', e.target.value)} style={inp}/>
                </Field>
              </div>
            </div>
          )}

          {/* Code type */}
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.07em' }}>Code Type</p>
            <div style={{ display:'flex', gap:12 }}>
              {[{ value:'universal', label:'Universal', sub:'One code for all', icon:'🔑' }, { value:'individual', label:'Individual', sub:'Unique per user', icon:'🎫' }].map(opt => (
                <button key={opt.value} type="button" onClick={() => set('code_type', opt.value)} style={{ flex:1, padding:'12px 14px', borderRadius:14, cursor:'pointer', border:`2px solid ${form.code_type === opt.value ? O : 'rgba(255,255,255,0.07)'}`, background: form.code_type === opt.value ? `${O}10` : 'transparent', textAlign:'left' }}>
                  <span style={{ fontSize:18 }}>{opt.icon}</span>
                  <p style={{ margin:'6px 0 2px', fontWeight:700, fontSize:13, color: form.code_type === opt.value ? O : '#fff' }}>{opt.label}</p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.35)' }}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:16 }}>
            <Field label="Description" darkMode>
              <textarea rows={3} placeholder="What should the user do?" value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, resize:'vertical' }}/>
            </Field>
          </div>

          {/* Steps */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.07em' }}>Steps ({form.steps.length})</p>
            {form.steps.map((step, idx) => (
              <div key={step.id} style={{ display:'flex', gap:10, marginBottom:8, padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, alignItems:'center' }}>
                <span style={{ fontSize:20 }}>{step.icon}</span>
                <input placeholder={`Step ${idx+1} title`} value={step.title} onChange={e => updateStep(step.id,'title',e.target.value)} style={{ flex:2, ...inp, padding:'8px 10px', fontSize:12 }}/>
                <input placeholder="Hint (optional)" value={step.hint} onChange={e => updateStep(step.id,'hint',e.target.value)} style={{ flex:2, ...inp, padding:'8px 10px', fontSize:12 }}/>
                <button type="button" onClick={() => deleteStep(step.id)} style={{ width:30, height:30, borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', color:'#f87171', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
            <button type="button" onClick={addStep} style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px dashed ${O}40`, background:`${O}05`, cursor:'pointer', color:O, fontFamily:'inherit', fontSize:13 }}>+ Add Step</button>
          </div>

          {/* Submit */}
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'12px 24px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding:'12px 28px', borderRadius:12, background: loading ? `${O}50` : O, color:'#fff', border:'none', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={15} fill="#fff"/>
              {loading ? 'Saving…' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
