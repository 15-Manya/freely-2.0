import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

function DashboardLayout({ title, children }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }

    setMenuOpen(false)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{title}</h1>
        <div className="dashboard-menu-wrapper">
          <button
            type="button"
            className="hamburger-button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="dashboard-menu">
              <NavLink
                to="/"
                className="dashboard-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/workflow-monitor"
                className="dashboard-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Workflow Monitor
              </NavLink>
              <NavLink
                to="/invoice-manager"
                className="dashboard-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Invoice Manager
              </NavLink>
              <button
                type="button"
                className="dashboard-menu-item signout-item"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout


