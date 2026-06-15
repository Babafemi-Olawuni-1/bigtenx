// SystemSettings.jsx
import { useState } from 'react'
import { Settings, Save, RefreshCw, Bell, Shield, Globe } from 'lucide-react'

const O = '#FF6F00'

function SettingCard({ title, icon: Icon, children }) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 20, 
      padding: 20, 
      border: '1px solid #E9EDF2',
      marginBottom: 20
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        marginBottom: 18,
        paddingBottom: 12,
        borderBottom: '1px solid #E9EDF2'
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${O}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={O} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#001F54', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function SystemSettings({ token }) {
  const [commission, setCommission] = useState(5)
  const [minWithdraw, setMinWithdraw] = useState(10)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save - replace with actual API call
    setTimeout(() => {
      setSaving(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#001F54', margin: 0 }}>System Settings</h1>
          <p style={{ fontSize: 13, color: '#8899AA', marginTop: 4 }}>Configure platform-wide settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8,
            background: O, border: 'none', borderRadius: 12,
            padding: '10px 20px', color: '#fff', fontWeight: 600,
            fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Commission Settings */}
      <SettingCard title="Commission Settings" icon={Shield}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54', display: 'block', marginBottom: 6 }}>
            Default Commission Rate (%)
          </label>
          <input 
            type="number" 
            value={commission} 
            onChange={e => setCommission(parseInt(e.target.value))}
            style={{ 
              width: '100%', maxWidth: 200, padding: '10px 14px', 
              borderRadius: 12, border: '1px solid #E9EDF2', 
              fontSize: 13, fontFamily: 'inherit'
            }}
          />
          <p style={{ fontSize: 11, color: '#8899AA', marginTop: 6 }}>
            Applied to all new referrals and sales
          </p>
        </div>
      </SettingCard>

      {/* Withdrawal Settings */}
      <SettingCard title="Withdrawal Settings" icon={Bell}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54', display: 'block', marginBottom: 6 }}>
            Minimum Withdrawal Amount ($)
          </label>
          <input 
            type="number" 
            value={minWithdraw} 
            onChange={e => setMinWithdraw(parseInt(e.target.value))}
            style={{ 
              width: '100%', maxWidth: 200, padding: '10px 14px', 
              borderRadius: 12, border: '1px solid #E9EDF2', 
              fontSize: 13, fontFamily: 'inherit'
            }}
          />
          <p style={{ fontSize: 11, color: '#8899AA', marginTop: 6 }}>
            Users must have at least this amount to request withdrawal
          </p>
        </div>
      </SettingCard>

      {/* Platform Info */}
      <SettingCard title="Platform Information" icon={Globe}>
        <div style={{ 
          background: '#F7F8FC', 
          borderRadius: 14, 
          padding: 16,
          marginBottom: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#8899AA' }}>Platform Version</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#001F54' }}>v2.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#8899AA' }}>Last Updated</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#001F54' }}>June 2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#8899AA' }}>Environment</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Production</span>
          </div>
        </div>
      </SettingCard>
    </div>
  )
}