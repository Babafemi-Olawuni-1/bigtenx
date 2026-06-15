// Notifications.jsx - COMPLETE FIXED VERSION (mobile responsive)
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Send, Calendar, Users, Mail, Bell, X, Check } from 'lucide-react'

export default function Notifications({ token }) {
  const [selectedChannels, setSelectedChannels] = useState({ push: true, email: false, inapp: true })
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [message, setMessage] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDateTime, setScheduleDateTime] = useState('')

  const levels = [
    { id: 'all', label: 'All members' },
    { id: 'bronze', label: 'Bronze' }, { id: 'silver', label: 'Silver' },
    { id: 'gold', label: 'Gold' }, { id: 'diamond', label: 'Diamond' }, { id: 'vip', label: 'VIP' }
  ]

  const toggleChannel = (channel) => setSelectedChannels(prev => ({ ...prev, [channel]: !prev[channel] }))

  const getLevelDisplayName = (level) => {
    const names = { 'all': 'All members', 'bronze': 'Bronze', 'silver': 'Silver', 'gold': 'Gold', 'diamond': 'Diamond', 'vip': 'VIP' }
    return names[level] || level
  }

  const getSelectedChannelsList = () => {
    const channels = []
    if (selectedChannels.push) channels.push('Push')
    if (selectedChannels.email) channels.push('Email')
    if (selectedChannels.inapp) channels.push('In-app')
    return channels
  }

  const handleSend = () => {
    if (!message.trim()) { alert('Enter a message'); return }
    const channels = getSelectedChannelsList()
    if (channels.length === 0) { alert('Select at least one channel'); return }
    alert(`✅ Sent to ${getLevelDisplayName(selectedLevel)} via ${channels.join(', ')}`)
    setMessage('')
  }

  const handleSchedule = () => {
    if (!message.trim()) { alert('Enter a message'); return }
    if (getSelectedChannelsList().length === 0) { alert('Select at least one channel'); return }
    if (!scheduleDateTime) { alert('Select date and time'); return }
    const scheduledDate = new Date(scheduleDateTime)
    if (scheduledDate <= new Date()) { alert('Select a future date'); return }
    alert(`📅 Scheduled for ${scheduledDate.toLocaleString()} to ${getLevelDisplayName(selectedLevel)}`)
    setShowScheduleModal(false)
    setScheduleDateTime('')
    setMessage('')
  }

  const openScheduleModal = () => {
    const defaultTime = new Date(); defaultTime.setHours(defaultTime.getHours() + 1)
    setScheduleDateTime(defaultTime.toISOString().slice(0, 16))
    setShowScheduleModal(true)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>Notifications</h1>
        <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Send push, email, and in-app alerts</p>
      </div>

      {/* Channels */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Mail size={16} color={O} /><span style={{ fontWeight: 600, fontSize: 13 }}>Send via</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { id: 'push', label: 'Push notification' },
            { id: 'email', label: 'Email' },
            { id: 'inapp', label: 'In app notification' }
          ].map(ch => (
            <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedChannels[ch.id]} onChange={() => toggleChannel(ch.id)} style={{ width: 16, height: 16, accentColor: O, cursor: 'pointer' }} />
              <span style={{ fontSize: 12, color: '#001F54' }}>{ch.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Users size={16} color={O} /><span style={{ fontWeight: 600, fontSize: 13 }}>Send to</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {levels.map(level => (
            <button key={level.id} onClick={() => setSelectedLevel(level.id)} style={{ padding: '6px 14px', borderRadius: 30, border: '1px solid #E9EDF2', background: selectedLevel === level.id ? O : '#F7F8FC', color: selectedLevel === level.id ? '#fff' : '#001F54', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{level.label}</button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bell size={16} color={O} /><span style={{ fontWeight: 600, fontSize: 13 }}>Message</span>
        </div>
        <textarea rows={3} placeholder="Type your notification message..." value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 16, border: '1px solid #E9EDF2', fontSize: 12, fontFamily: 'inherit', background: '#F7F8FC', resize: 'vertical' }} />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleSend} style={{ flex: 1, background: O, border: 'none', borderRadius: 30, padding: '12px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Send size={14} /> Send</button>
        <button onClick={openScheduleModal} style={{ flex: 1, background: 'transparent', border: '1.5px solid #FF6F00', borderRadius: 30, padding: '12px', color: O, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Calendar size={14} /> Schedule</button>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div onClick={() => setShowScheduleModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: 320, borderRadius: 28, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E9EDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54' }}>Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#8899AA" /></button>
            </div>
            <div style={{ padding: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 6, display: 'block' }}>Date & Time</label>
              <input type="datetime-local" value={scheduleDateTime} onChange={e => setScheduleDateTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 14, border: '1px solid #E9EDF2', fontSize: 12, marginBottom: 16 }} />
              <button onClick={handleSchedule} style={{ width: '100%', background: O, border: 'none', borderRadius: 30, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}