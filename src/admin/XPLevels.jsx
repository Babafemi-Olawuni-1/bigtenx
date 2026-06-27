import { useState } from 'react'
import { O } from './adminUtils'
import { Save, Coins, Award, Crown, Calendar, Settings } from 'lucide-react'

export default function XPLevels() {
  const [xpConfig, setXpConfig] = useState({
    signupXP: 5,
    dailyLoginXP: 5,
    streakEnabled: true,
    monthlyReset: true
  })

  const [poolConfig, setPoolConfig] = useState({
    openDay: 1,
    closeDay: 25,
    waitingStart: 26,
    waitingEnd: 27,
    distributionDay: 28,
    revenuePool: 1000,
    autoDistribute: false
  })

  const [activeTab, setActiveTab] = useState('bronze')

  const [badges, setBadges] = useState({
    bronze: {
      price: 1,
      referral: 20,
      multiplier: 1.0
    },
    silver: {
      price: 5,
      referral: 30,
      multiplier: 1.2
    },
    gold: {
      price: 10,
      referral: 40,
      multiplier: 1.5
    },
    diamond: {
      price: 20,
      referral: 50,
      multiplier: 2.0,
      vipDays: 30
    },
    vip: {
      price: 10,
      xpBoost: 20,
      referralBonus: 1
    }
  })

  const [xpSources, setXpSources] = useState({
    signup: true,
    dailyLogin: true,
    tasks: true,
    marketplace: true,
    contests: true
  })

  const toggleSource = (key) => {
    setXpSources(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const saveSection = (name) => {
    alert(`${name} saved successfully`)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54' }}>
          XP & Levels
        </h1>
        <p style={{ fontSize: 12, color: '#8899AA' }}>
          Configure XP system, badges, contribution pool and VIP settings
        </p>
      </div>

      {/* XP CONFIG */}
      <div style={card}>
        <SectionTitle icon={<Coins size={16} color={O} />} title="XP Configuration" />
        <Field label="Signup Bonus XP" value={xpConfig.signupXP}
          onChange={(v) => setXpConfig({ ...xpConfig, signupXP: v })} />
        <Field label="Daily Login XP" value={xpConfig.dailyLoginXP}
          onChange={(v) => setXpConfig({ ...xpConfig, dailyLoginXP: v })} />
        <Toggle label="Enable Streak System"
          checked={xpConfig.streakEnabled}
          onClick={() => setXpConfig({ ...xpConfig, streakEnabled: !xpConfig.streakEnabled })} />
        <Toggle label="Monthly Reset"
          checked={xpConfig.monthlyReset}
          onClick={() => setXpConfig({ ...xpConfig, monthlyReset: !xpConfig.monthlyReset })} />
        <SaveButton onClick={() => saveSection('XP Configuration')} />
      </div>

      {/* CONTRIBUTION POOL */}
      <div style={card}>
        <SectionTitle icon={<Calendar size={16} color={O} />} title="Contribution Pool" />
        <Field label="Open Pool Day" value={poolConfig.openDay}
          onChange={(v) => setPoolConfig({ ...poolConfig, openDay: v })} />
        <Field label="Close Pool Day" value={poolConfig.closeDay}
          onChange={(v) => setPoolConfig({ ...poolConfig, closeDay: v })} />
        <Field label="Distribution Day" value={poolConfig.distributionDay}
          onChange={(v) => setPoolConfig({ ...poolConfig, distributionDay: v })} />
        <Field label="Revenue Pool ($)" value={poolConfig.revenuePool}
          onChange={(v) => setPoolConfig({ ...poolConfig, revenuePool: v })} />
        <Toggle label="Auto Distribution"
          checked={poolConfig.autoDistribute}
          onClick={() => setPoolConfig({ ...poolConfig, autoDistribute: !poolConfig.autoDistribute })} />
        <SaveButton onClick={() => saveSection('Contribution Pool')} />
      </div>

      {/* BADGES */}
      <div style={card}>
        <SectionTitle icon={<Award size={16} color={O} />} title="Badge Settings" />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Object.keys(badges).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === key ? O : '#F7F8FC',
                color: activeTab === key ? '#fff' : '#001F54',
                fontWeight: 600
              }}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        {Object.entries(badges[activeTab]).map(([key, value]) => (
          <Field
            key={key}
            label={key}
            value={value}
            onChange={(v) =>
              setBadges(prev => ({
                ...prev,
                [activeTab]: {
                  ...prev[activeTab],
                  [key]: v
                }
              }))
            }
          />
        ))}

        <SaveButton onClick={() => saveSection(`${activeTab} Badge`)} />
      </div>

      {/* XP SOURCES */}
      <div style={card}>
        <SectionTitle icon={<Settings size={16} color={O} />} title="XP Sources" />
        {Object.entries(xpSources).map(([key, value]) => (
          <Toggle
            key={key}
            label={key}
            checked={value}
            onClick={() => toggleSource(key)}
          />
        ))}
        <SaveButton onClick={() => saveSection('XP Sources')} />
      </div>

      {/* VIP */}
      <div style={card}>
        <SectionTitle icon={<Crown size={16} color={O} />} title="VIP Settings" />
        <Field
          label="VIP Price ($)"
          value={badges.vip.price}
          onChange={(v) =>
            setBadges(prev => ({
              ...prev,
              vip: { ...prev.vip, price: v }
            }))
          }
        />
        <Field
          label="XP Boost (%)"
          value={badges.vip.xpBoost}
          onChange={(v) =>
            setBadges(prev => ({
              ...prev,
              vip: { ...prev.vip, xpBoost: v }
            }))
          }
        />
        <Field
          label="Referral Bonus ($)"
          value={badges.vip.referralBonus}
          onChange={(v) =>
            setBadges(prev => ({
              ...prev,
              vip: { ...prev.vip, referralBonus: v }
            }))
          }
        />
        <SaveButton onClick={() => saveSection('VIP Settings')} />
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16
    }}>
      {icon}
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#001F54' }}>{title}</h3>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54' }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: 12,
          border: '1px solid #E9EDF2',
          marginTop: 6
        }}
      />
    </div>
  )
}

function Toggle({ label, checked, onClick }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 12
    }}>
      <span>{label}</span>
      <button
        onClick={onClick}
        style={{
          width: 45,
          height: 24,
          borderRadius: 20,
          border: 'none',
          background: checked ? '#10B981' : '#E5E7EB',
          cursor: 'pointer'
        }}
      />
    </div>
  )
}

function SaveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: O,
        color: '#fff',
        border: 'none',
        padding: '12px',
        borderRadius: 30,
        fontWeight: 700,
        cursor: 'pointer'
      }}
    >
      Save Changes
    </button>
  )
}

const card = {
  background: '#fff',
  borderRadius: 20,
  padding: 16,
  marginBottom: 16,
  border: '1px solid #E9EDF2'
}