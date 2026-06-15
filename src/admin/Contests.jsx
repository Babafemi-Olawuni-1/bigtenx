// Contests.jsx - COMPLETE FIXED VERSION
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Trophy, Plus, Eye, Trash2, Users, Calendar, Target, ChevronRight, List } from 'lucide-react'

export default function Contests({ token }) {
  const [activeTab, setActiveTab] = useState('contest')
  const [contests, setContests] = useState([
    { id: 1, name: "March Madness", description: "Earn as much XP as possible this March!", startDate: "2025-03-01", endDate: "2025-03-31", target: "Highest XP", participants: ["B", "S", "G", "D", "V"] },
    { id: 2, name: "Referral Rumble", description: "Invite friends to earn rewards", startDate: "2025-04-01", endDate: "2025-04-30", target: "Highest Invite", participants: ["G", "D", "V"] }
  ])
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '', target: 'Highest XP' })
  const [selectedParticipants, setSelectedParticipants] = useState(['B', 'S', 'G', 'D', 'V'])

  const participantLevels = [{ id: 'B', label: 'Bronze' }, { id: 'S', label: 'Silver' }, { id: 'G', label: 'Gold' }, { id: 'D', label: 'Diamond' }, { id: 'V', label: 'VIP' }]

  const toggleParticipant = (levelId) => {
    if (selectedParticipants.includes(levelId)) setSelectedParticipants(selectedParticipants.filter(p => p !== levelId))
    else setSelectedParticipants([...selectedParticipants, levelId])
  }

  const handleCreateContest = () => {
    if (!formData.name.trim()) { alert('Please enter contest name'); return }
    if (!formData.startDate || !formData.endDate) { alert('Please select start and end dates'); return }
    if (selectedParticipants.length === 0) { alert('Please select at least one participant level'); return }
    const newContest = { id: contests.length > 0 ? Math.max(...contests.map(c => c.id)) + 1 : 1, name: formData.name, description: formData.description, startDate: formData.startDate, endDate: formData.endDate, target: formData.target, participants: [...selectedParticipants] }
    setContests([newContest, ...contests])
    setFormData({ name: '', description: '', startDate: '', endDate: '', target: 'Highest XP' })
    setSelectedParticipants(['B', 'S', 'G', 'D', 'V'])
    alert(`Contest "${formData.name}" created successfully`)
  }

  const deleteContest = (id) => { if (confirm('Delete this contest?')) { setContests(contests.filter(c => c.id !== id)); alert('Contest deleted') } }
  const formatDate = (dateStr) => { if (!dateStr) return ''; const parts = dateStr.split('-'); return `${parts[2]}/${parts[1]}/${parts[0]}` }

  const mockLeaderboard = [{ rank: 1, name: "CryptoKing", value: "45,000 XP" }, { rank: 2, name: "Whale", value: "32,500 XP" }, { rank: 3, name: "Phoenix", value: "28,300 XP" }, { rank: 4, name: "FemTech", value: "22,100 XP" }, { rank: 5, name: "Rita", value: "18,900 XP" }]

  return (
    <div>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>Contests & Leaderboard</h1><p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Create competitions and track rankings</p></div>
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #E9EDF2', marginBottom: 20 }}>
        <button onClick={() => setActiveTab('contest')} style={{ background: 'none', border: 'none', padding: '8px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: activeTab === 'contest' ? O : '#8899AA', borderBottom: activeTab === 'contest' ? `2px solid ${O}` : 'none', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}><Trophy size={15} /> Contest</button>
        <button onClick={() => setActiveTab('leaderboard')} style={{ background: 'none', border: 'none', padding: '8px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: activeTab === 'leaderboard' ? O : '#8899AA', borderBottom: activeTab === 'leaderboard' ? `2px solid ${O}` : 'none', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 }}><List size={15} /> Leaderboard</button>
      </div>
      {activeTab === 'contest' && (<>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><Trophy size={16} color={O} /><span style={{ fontWeight: 700, fontSize: 14 }}>Create Contest</span></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Name</label><input type="text" placeholder="Contest name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Description</label><textarea rows={2} placeholder="Contest description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC', resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}><div><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12 }} /></div><div><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>End Date</label><input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12 }} /></div></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Targets</label><div style={{ display: 'flex', gap: 16 }}><label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" name="target" value="Highest XP" checked={formData.target === 'Highest XP'} onChange={e => setFormData({ ...formData, target: e.target.value })} style={{ width: 16, height: 16, accentColor: O }} /><span style={{ fontSize: 12 }}>Highest XP</span></label><label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="radio" name="target" value="Highest Invite" checked={formData.target === 'Highest Invite'} onChange={e => setFormData({ ...formData, target: e.target.value })} style={{ width: 16, height: 16, accentColor: O }} /><span style={{ fontSize: 12 }}>Highest Invite</span></label></div></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Who can participate</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{participantLevels.map(level => (<button key={level.id} type="button" onClick={() => toggleParticipant(level.id)} style={{ padding: '5px 14px', borderRadius: 30, background: selectedParticipants.includes(level.id) ? O : '#F7F8FC', color: selectedParticipants.includes(level.id) ? '#fff' : '#001F54', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>{level.label}</button>))}</div></div>
          <button onClick={handleCreateContest} style={{ width: '100%', background: O, border: 'none', borderRadius: 30, padding: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={14} /> Create Contest</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><List size={16} color={O} /><span style={{ fontWeight: 700, fontSize: 14 }}>Contest List</span></div>
          {contests.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: '#8899AA' }}>No contests yet</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{contests.map(contest => (<div key={contest.id} style={{ padding: 12, background: '#F7F8FC', borderRadius: 16 }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{contest.name}</div><div style={{ fontSize: 10, color: O, fontWeight: 600, marginBottom: 3 }}>Criteria: {contest.target}</div><div style={{ fontSize: 9, color: '#8899AA', marginBottom: 8 }}>{formatDate(contest.startDate)} - {formatDate(contest.endDate)}</div><div style={{ display: 'flex', gap: 12 }}><button style={{ background: 'none', border: 'none', color: O, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> VIEW</button><button onClick={() => deleteContest(contest.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Trash2 size={10} /> Delete</button></div></div>))}</div></div>
      </>)}
      {activeTab === 'leaderboard' && (<div style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #E9EDF2' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><Trophy size={16} color={O} /><span style={{ fontWeight: 700, fontSize: 14 }}>Leaderboard</span></div><div style={{ background: '#F7F8FC', borderRadius: 14, overflow: 'hidden' }}><div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr', padding: '10px 14px', background: '#E9EDF2', fontSize: 10, fontWeight: 700, color: '#001F54' }}><span>Rank</span><span>User</span><span>Value</span></div>{mockLeaderboard.map(user => (<div key={user.rank} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid #E9EDF2', fontSize: 11 }}><span style={{ fontWeight: 700, color: O }}>#{user.rank}</span><span>{user.name}</span><span>{user.value}</span></div>))}</div><p style={{ fontSize: 10, color: '#8899AA', textAlign: 'center', marginTop: 12 }}>Select a contest to view its leaderboard</p></div>)}
    </div>
  )
}