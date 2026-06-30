// XPLevels.jsx — Admin XP & Level Config per spec
import { useState, useEffect } from 'react'
import { O, API } from './adminUtils'
import { Save, Coins, Award, Crown, Plus, X } from 'lucide-react'

const BADGE_TABS = ['bronze', 'silver', 'gold', 'diamond']

const DEFAULT_BADGES = {
  bronze:  { price: 1,  referral: 20, multiplier: 1.0, benefits: ['Bronze badge', '1.0x Multiplier on tasks', '20% commission on referrals', '1 Vault Unit', 'Access to Hot Offers'] },
  silver:  { price: 5,  referral: 30, multiplier: 1.2, benefits: ['Silver badge', '1.2x Multiplier on tasks', '30% commission on referrals', '2 Vault Units', 'Access to Hot Offers'] },
  gold:    { price: 10, referral: 40, multiplier: 1.5, benefits: ['Gold badge',   '1.5x Multiplier on tasks', '40% commission on referrals', '3 Vault Units', 'Access to Hot Offers'] },
  diamond: { price: 20, referral: 50, multiplier: 2.0, benefits: ['Diamond badge','2.0x Multiplier on tasks', '50% commission on referrals', '4 Vault Units', 'Access to Hot Offers'] },
}

const DEFAULT_VIP = {
  price: 10, boost: 20, referralBonus: 1,
  duration: 30,
  benefits: ['VIP boost effect (+20% on active badge)', 'VIP badge status', '$1 sponsor VIP reward'],
}

const DEFAULT_REWARDS = { signupXP: 5, weeklyDailyXP: 3, weeklyBonusXP: 4 }

function card(extra = {}) {
  return { background: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, border: '1px solid #E9EDF2', ...extra }
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {icon}
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#001F54', margin: 0 }}>{title}</h3>
    </div>
  )
}

function Field({ label, sub, value, onChange, type = 'number', suffix }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#001F54', display: 'block' }}>{label}</label>
      {sub && <div style={{ fontSize: 10, color: '#8899AA', marginBottom: 4 }}>{sub}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type={type} value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC', fontFamily: 'inherit' }}
        />
        {suffix && <span style={{ fontSize: 12, color: '#8899AA', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </div>
  )
}

function SaveBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width: '100%', background: O, color: '#fff', border: 'none', padding: '12px', borderRadius: 30, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

function BenefitsList({ benefits, onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onChange([...benefits, draft.trim()])
    setDraft('')
  }
  const remove = (i) => onChange(benefits.filter((_, idx) => idx !== i))
  const edit   = (i, val) => onChange(benefits.map((b, idx) => idx === i ? val : b))

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#001F54', marginBottom: 8 }}>Benefits (shown to user)</div>
      {benefits.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <input value={b} onChange={e => edit(i, e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12, fontFamily: 'inherit' }} />
          <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0 4px' }}><X size={14} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="Add a benefit..."
          style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1px solid #E9EDF2', fontSize: 12, fontFamily: 'inherit' }}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button onClick={add} style={{ background: O, border: 'none', borderRadius: 10, padding: '0 14px', color: '#fff', cursor: 'pointer' }}><Plus size={14} /></button>
      </div>
    </div>
  )
}

export default function XPLevels({ token }) {
  const [rewards, setRewards]     = useState(DEFAULT_REWARDS)
  const [badges, setBadges]       = useState(DEFAULT_BADGES)
  const [vip, setVip]             = useState(DEFAULT_VIP)
  const [activeTab, setActiveTab] = useState('bronze')
  const [saving, setSaving]       = useState(false)

  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token || '' }

  // Load settings from admin_settings table
  useEffect(() => {
    fetch(`${API}/admin/xp_settings.php`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.rewards)  setRewards(d.rewards)
        if (d.badges)   setBadges(d.badges)
        if (d.vip)      setVip(d.vip)
      })
      .catch(() => {})
  }, [])

  const save = async (section, data) => {
    setSaving(true)
    try {
      const res  = await fetch(`${API}/admin/xp_settings.php`, {
        method: 'POST', headers,
        body: JSON.stringify({ section, data })
      })
      const resp = await res.json()
      alert(resp.message || 'Saved!')
    } catch { alert('Save failed') }
    finally { setSaving(false) }
  }

  const setBadgeField = (name, field, val) =>
    setBadges(prev => ({ ...prev, [name]: { ...prev[name], [field]: val } }))

  const b = badges[activeTab] || DEFAULT_BADGES[activeTab]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54' }}>XP & Levels</h1>
        <p style={{ fontSize: 12, color: '#8899AA' }}>Configure rewards, badge multipliers, VIP settings and benefits</p>
      </div>

      {/* REWARDS */}
      <div style={card()}>
        <SectionTitle icon={<Coins size={16} color={O} />} title="Reward Configuration" />
        <Field label="Sign Up Bonus XP" sub="Awarded once on registration (no multiplier)" value={rewards.signupXP} onChange={v => setRewards(p => ({ ...p, signupXP: v }))} suffix="XP" />
        <Field label="Weekly Daily Login XP" sub="Per day claimed (no multiplier)" value={rewards.weeklyDailyXP} onChange={v => setRewards(p => ({ ...p, weeklyDailyXP: v }))} suffix="XP/day" />
        <Field label="Weekly Completion Bonus" sub="Awarded when all 7 days claimed in a week" value={rewards.weeklyBonusXP} onChange={v => setRewards(p => ({ ...p, weeklyBonusXP: v }))} suffix="XP" />
        <SaveBtn onClick={() => save('rewards', rewards)} loading={saving} />
      </div>

      {/* BADGE SETTINGS */}
      <div style={card()}>
        <SectionTitle icon={<Award size={16} color={O} />} title="Badge Configuration" />

        {/* Tab selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {BADGE_TABS.map(key => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
              background: activeTab === key ? O : '#F7F8FC',
              color: activeTab === key ? '#fff' : '#001F54',
            }}>{key.charAt(0).toUpperCase() + key.slice(1)}</button>
          ))}
        </div>

        <Field label="Price (USD)" value={b.price} onChange={v => setBadgeField(activeTab, 'price', v)} suffix="$" />
        <Field label="Referral Commission" sub="Percentage (%)" value={b.referral} onChange={v => setBadgeField(activeTab, 'referral', v)} suffix="%" />
        <Field label="XP Multiplier" sub={`Current: ${b.multiplier}x — Bronze=1.0x, Silver=1.2x, Gold=1.5x, Diamond=2.0x`} value={b.multiplier} onChange={v => setBadgeField(activeTab, 'multiplier', v)} suffix="x" />

        <BenefitsList benefits={b.benefits || []} onChange={bens => setBadgeField(activeTab, 'benefits', bens)} />

        <div style={{ marginTop: 16 }}>
          <SaveBtn onClick={() => save('badge', { name: activeTab, ...b })} loading={saving} />
        </div>
      </div>

      {/* VIP SETTINGS */}
      <div style={card()}>
        <SectionTitle icon={<Crown size={16} color={O} />} title="VIP Configuration" />
        <Field label="VIP Price" sub="Monthly price in USD" value={vip.price} onChange={v => setVip(p => ({ ...p, price: v }))} suffix="$/mo" />
        <Field label="Boost (Percentage %)" sub="Added on top of badge multiplier: badge × (1 + boost/100)" value={vip.boost} onChange={v => setVip(p => ({ ...p, boost: v }))} suffix="%" />
        <Field label="Referral Bonus (Value $)" sub="Dollar amount credited when a VIP user's referral upgrades" value={vip.referralBonus} onChange={v => setVip(p => ({ ...p, referralBonus: v }))} suffix="$" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#001F54', display: 'block' }}>Duration</label>
          <div style={{ fontSize: 10, color: '#8899AA', marginBottom: 4 }}>How long VIP lasts after purchase (for testing use 1 day)</div>
          <div style={{ position: 'relative' }}>
            <select value={vip.duration} onChange={e => setVip(p => ({ ...p, duration: parseInt(e.target.value) }))}
              style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, fontFamily: 'inherit', background: '#F7F8FC' }}>
              <option value={1}>1 day (testing)</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days (1 month)</option>
            </select>
          </div>
        </div>
        <BenefitsList benefits={vip.benefits || []} onChange={bens => setVip(p => ({ ...p, benefits: bens }))} />
        <div style={{ marginTop: 16 }}>
          <SaveBtn onClick={() => save('vip', vip)} loading={saving} />
        </div>
      </div>
    </div>
  )
}
