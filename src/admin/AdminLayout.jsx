// AdminLayout.jsx - COMPLETE REWRITE (no sidebar, bottom nav only, user dropdown)
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Users, ClipboardList, PiggyBank, Settings,
  LogOut, Bell, Menu, X, User, ChevronDown
} from 'lucide-react'

const O = '#FF6F00'

// Bottom navigation items - ONLY 5
const bottomNavItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/tasks', icon: ClipboardList, label: 'Tasks' },
  { path: '/admin/vault', icon: PiggyBank, label: 'Vault' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUserDropdownOpen(false)
    if (onLogout) onLogout()
    navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', paddingBottom: '90px' }}>
      {/* Top Header Bar */}
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #E9EDF2',
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo & Mobile Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              display: 'none', background: 'none', border: 'none', 
              cursor: 'pointer', alignItems: 'center', justifyContent: 'center'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={22} color="#001F54" /> : <Menu size={22} color="#001F54" />}
          </button>
          
          {/* Logo */}
          <div 
            onClick={() => navigate('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <img 
              src="/logo.png" 
              alt="BigTenX Logo" 
              style={{ width: 38, height: 38, borderRadius: 10 }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div style={{ 
              width: 38, height: 38, borderRadius: 12, 
              background: `linear-gradient(135deg, ${O}, #FF9A00)`,
              display: 'none', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>X</span>
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#001F54' }}>BigTen<span style={{ color: O }}>X</span></span>
              <span style={{ color: '#8899AA', fontSize: 11, marginLeft: 6 }}>Admin</span>
            </div>
          </div>
        </div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F7F8FC', border: '1px solid #E9EDF2',
              borderRadius: 30, padding: '6px 12px 6px 8px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${O}, #FF9A00)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700
            }}>
              A
            </div>
            <span style={{ fontSize: 13, color: '#001F54' }}>Admin</span>
            <ChevronDown size={14} color="#8899AA" />
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #E9EDF2', minWidth: 160, zIndex: 200,
              overflow: 'hidden'
            }}>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#EF4444', fontSize: 13, fontWeight: 500,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F8FC'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay (for navigation on mobile) */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', top: 61, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 98
            }}
          />
          <div style={{
            position: 'fixed', top: 61, left: 0, bottom: 0,
            width: 280, background: '#fff', zIndex: 99,
            overflowY: 'auto', padding: '20px 0',
            boxShadow: '2px 0 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '0 16px' }}>
              {bottomNavItems.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      marginBottom: 4, textDecoration: 'none',
                      background: isActive ? `${O}10` : 'transparent',
                      color: isActive ? O : '#5A6E8A',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 13
                    }}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{ padding: '16px 16px 100px 16px', overflowX: 'auto' }}>
        {children}
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #E9EDF2',
        padding: '10px 16px 20px',
        display: 'flex', justifyContent: 'space-around', zIndex: 100
      }}>
        {bottomNavItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                textDecoration: 'none', color: isActive ? O : '#8899AA'
              }}
            >
              <item.icon size={22} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  )
}