// Users.jsx - COMPLETE FIXED VERSION (Badge component fix)
import { useState, useEffect, useCallback } from 'react'
import { API, LEVEL_NAMES, O } from './adminUtils'
import { Search, Zap, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Toggle } from './AdminShared'

// Custom Badge component (since AdminShared Badge expects different props)
function Badge({ children, color }) {
  return (
    <span style={{
      background: `${color}15`,
      color: color,
      borderRadius: 30,
      padding: '3px 10px',
      fontSize: 10,
      fontWeight: 700
    }}>{children}</span>
  )
}

export default function Users({ token }) {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [targetLevel, setTargetLevel] = useState(1)
  const [targetVip, setTargetVip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/users.php`, { headers })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadUsers() }, [loadUsers])

  useEffect(() => {
    if (!search) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      ))
    }
    setCurrentPage(1)
  }, [search, users])

  const handleUpgrade = async () => {
    if (!selectedUser) return
    setUpgrading(true)
    try {
      const res = await fetch(`${API}/admin/update_user_level.php`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: selectedUser,
          level: targetLevel,
          is_vip: targetVip ? 1 : 0
        })
      })
      const data = await res.json()
      if (data.success) {
        loadUsers()
        setSelectedUser('')
        alert('User upgraded successfully!')
      } else {
        alert(data.message || 'Upgrade failed')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setUpgrading(false)
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const getAvatarColor = (username) => {
    const colors = [
      'linear-gradient(135deg, #FF6F00, #FF9A00)',
      'linear-gradient(135deg, #14B8A6, #06B6D4)',
      'linear-gradient(135deg, #D4A000, #F59E0B)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      'linear-gradient(135deg, #EF4444, #F97316)',
    ]
    const index = (username?.length || 0) % colors.length
    return colors[index]
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8899AA' }}>Loading users...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>User Management</h1>
        <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Manage members, upgrade levels, and track activity</p>
      </div>

      {/* Upgrade Panel */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 16,
        border: '1px solid #E9EDF2',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${O}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color={O} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>Upgrade User Level</span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', marginBottom: 6, display: 'block' }}>Select User</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: 12,
                border: '1px solid #E9EDF2', fontSize: 12,
                fontFamily: 'inherit', background: '#F7F8FC'
              }}
            >
              <option value="">— Select User —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username} (Level {u.level}) {u.is_vip ? '⭐ VIP' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 120 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', marginBottom: 6, display: 'block' }}>Target Level</label>
            <select
              value={targetLevel}
              onChange={e => setTargetLevel(parseInt(e.target.value))}
              style={{
                width: '100%', padding: '10px', borderRadius: 12,
                border: '1px solid #E9EDF2', fontSize: 12,
                fontFamily: 'inherit', background: '#F7F8FC'
              }}
            >
              {LEVEL_NAMES.map((l, i) => (
                <option key={i} value={i}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', marginBottom: 6, display: 'block' }}>VIP Status</label>
            <Toggle on={targetVip} onToggle={() => setTargetVip(v => !v)} />
          </div>

          <button
            onClick={handleUpgrade}
            disabled={!selectedUser || upgrading}
            style={{
              background: selectedUser ? O : '#E9EDF2',
              color: selectedUser ? '#fff' : '#8899AA',
              border: 'none', borderRadius: 12,
              padding: '10px 20px', fontWeight: 700, fontSize: 12,
              cursor: selectedUser ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Zap size={14} /> {upgrading ? 'Upgrading...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8899AA' }} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 36px',
              borderRadius: 12, border: '1px solid #E9EDF2',
              fontSize: 12, fontFamily: 'inherit', background: '#fff'
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #E9EDF2',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #E9EDF2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#001F54' }}>
            All Users ({filteredUsers.length})
          </span>
          <UsersIcon size={14} color="#8899AA" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E9EDF2' }}>
                {['User', 'Email', 'Level', 'VIP', 'XP', 'Cash'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#8899AA', fontWeight: 600, fontSize: 10 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => {
                const initial = u.username?.charAt(0).toUpperCase() || 'U'
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E9EDF2' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: getAvatarColor(u.username),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff'
                        }}>{initial}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#001F54', fontSize: 12 }}>{u.username}</div>
                          {u.is_admin && <div style={{ fontSize: 8, color: '#8B5CF6', fontWeight: 700 }}>ADMIN</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#5A6E8A', fontSize: 11 }}>{u.email || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge color={O}>Level {u.level}</Badge>
                    </td>
                    <td style={{ padding: '10px 12px', color: u.is_vip ? '#10b981' : '#8899AA', fontSize: 11 }}>
                      {u.is_vip ? '✓ VIP' : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: O, fontWeight: 700, fontSize: 11 }}>
                      {(u.coins || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700, fontSize: 11 }}>
                      ${parseFloat(u.usd_balance || 0).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', padding: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid #E9EDF2',
                background: '#F7F8FC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={12} />
            </button>
            <span style={{ fontSize: 11, color: '#001F54' }}>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid #E9EDF2',
                background: '#F7F8FC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}