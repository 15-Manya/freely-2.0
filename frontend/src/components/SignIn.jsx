import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../services/authService'
import './SignIn.css'

function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo-container">
            <svg className="logo-icon" width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8Z" fill="#374151"/>
              <path d="M10 18C10 17.4477 10.4477 17 11 17H21C21.5523 17 22 17.4477 22 18V20C22 20.5523 21.5523 21 21 21H11C10.4477 21 10 20.5523 10 20V18Z" fill="#374151"/>
              <path d="M6 22C6 21.4477 6.44772 21 7 21H25C25.5523 21 26 21.4477 26 22V28C26 28.5523 25.5523 29 25 29H7C6.44772 29 6 28.5523 6 28V22Z" fill="#374151"/>
            </svg>
            <h1>
              <span className="logo-blue">FreeL</span><span className="logo-gray">y</span>
            </h1>
          </div>
          <p>AI-powered risk analysis and proposal generation for freelancers who want to work smarter.</p>
          
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">&#128202;</div>
              <span className="auth-feature-text">Analyze client conversations for potential risks</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">&#128221;</div>
              <span className="auth-feature-text">Generate professional proposals in seconds</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">&#128170;</div>
              <span className="auth-feature-text">Make informed decisions with AI insights</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to FreeLy</p>
          </div>
          
          {error && (
            <div className="auth-message error" role="alert">
              <span className="auth-message-icon">&#9888;</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/')
                }}
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
