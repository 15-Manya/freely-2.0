import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

function DashboardLayout({ title, children, hideSidebar = false }) {
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
      
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${hideSidebar ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8Z" fill="#374151"/>
              <path d="M10 18C10 17.4477 10.4477 17 11 17H21C21.5523 17 22 17.4477 22 18V20C22 20.5523 21.5523 21 21 21H11C10.4477 21 10 20.5523 10 20V18Z" fill="#374151"/>
              <path d="M6 22C6 21.4477 6.44772 21 7 21H25C25.5523 21 26 21.4477 26 22V28C26 28.5523 25.5523 29 25 29H7C6.44772 29 6 28.5523 6 28V22Z" fill="#374151"/>
            </svg>
            <span className="sidebar-logo-text">
              <span className="logo-blue">FreeL</span><span className="logo-gray">y</span>
            </span>
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
              Dashboard
            </NavLink>
            <NavLink 
              to="/workflow-monitor" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              Workflow Monitor
            </NavLink>
            <NavLink 
              to="/invoice-manager" 
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
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
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button 
            type="button" 
            className={`mobile-menu-btn ${hideSidebar ? 'always-visible' : ''}`}
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
