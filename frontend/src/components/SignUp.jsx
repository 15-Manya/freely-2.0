import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'
import './SignUp.css'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
      await signUp(formData.email, formData.password, formData.fullName)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <span className="auth-logo-text">F</span>
          </div>
          <h1>FreeLy</h1>
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
            <h2>Create your account</h2>
            <p>Start your free trial today</p>
          </div>
          
          {error && (
            <div className="auth-message error" role="alert">
              <span className="auth-message-icon">&#9888;</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="auth-message success" role="alert">
              <span className="auth-message-icon">&#10003;</span>
              Account created successfully! Redirecting...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

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
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || success}
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
