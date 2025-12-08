import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

function DashboardLayout({ title, children }) {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setSidebarOpen(false)
  }

  const closeSidebar = () => setSidebarOpen(false)

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <div className="dashboard-layout">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">F</div>
            <span className="sidebar-logo-text">FreeLy</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Menu</div>
            <NavLink 
              to="/" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-nav-item-icon">&#127968;</span>
              Dashboard
            </NavLink>
            <NavLink 
              to="/workflow-monitor" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-nav-item-icon">&#128200;</span>
              Workflow Monitor
            </NavLink>
            <NavLink 
              to="/invoice-manager" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-nav-item-icon">&#128196;</span>
              Invoice Manager
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {getUserInitials()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {currentUser?.displayName || 'User'}
              </div>
              <div className="sidebar-user-email">
                {currentUser?.email || ''}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-signout-btn"
            onClick={handleSignOut}
          >
            <span>&#128682;</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button 
            type="button" 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-actions">
          </div>
        </header>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
