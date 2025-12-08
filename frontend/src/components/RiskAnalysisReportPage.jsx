import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { getRiskAnalysis, deleteRiskAnalysis, generateProposalFromRiskAnalysis } from '../api/client'
import './Dashboard.css'

function RiskAnalysisReportPage() {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDebugText, setShowDebugText] = useState(false)
  const [generatingProposal, setGeneratingProposal] = useState(false)

  useEffect(() => {
    loadAnalysis()
  }, [analysisId])

  // Auto-refresh every 3 seconds if processing
  useEffect(() => {
    if (!analysis || (analysis.status !== 'pending' && analysis.status !== 'processing')) {
      return
    }
    
    const interval = setInterval(() => {
      loadAnalysis()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [analysis])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      const data = await getRiskAnalysis(analysisId)
      setAnalysis(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setDeleting(true)
      await deleteRiskAnalysis(analysisId)
      // Navigate back to dashboard after successful deletion
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to delete analysis')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleGenerateProposal = async () => {
    try {
      setGeneratingProposal(true)
      const proposal = await generateProposalFromRiskAnalysis(analysisId)
      // Navigate to the proposal report page
      navigate(`/proposal/${proposal._id}`)
    } catch (err) {
      console.error('Failed to generate proposal:', err)
      alert('Failed to generate proposal. Please try again.')
    } finally {
      setGeneratingProposal(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Risk Analysis Report">
        <div className="user-info">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Risk Analysis Report">
        <div className="user-info">
          <div className="error-state">
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analysis) {
    return (
      <DashboardLayout title="Risk Analysis Report">
        <div className="user-info">
          <p>Analysis not found.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Risk Analysis Report">
      <div className="user-info">
        <div className="report-header">
          <div>
            <h2>{analysis.client_name || 'Untitled Analysis'}</h2>
            <p className="report-meta">
              Created: {new Date(analysis.created_at).toLocaleString()}
              {analysis.updated_at && analysis.updated_at !== analysis.created_at && (
                <> • Updated: {new Date(analysis.updated_at).toLocaleString()}</>
              )}
            </p>
          </div>
          <span className={`analysis-status analysis-status-${analysis.status}`}>
            {analysis.status}
          </span>
        </div>

        <div className="report-content">
          {/* Debug: Show extracted text */}
          {analysis.input_data?.chat_content && (
            <div className="debug-section">
              <button
                type="button"
                className="debug-toggle-button"
                onClick={() => setShowDebugText(!showDebugText)}
              >
                {showDebugText ? '▼' : '▶'} Debug: View Extracted Text
              </button>
              {showDebugText && (
                <div className="debug-text-container">
                  <div className="debug-text-header">
                    <h4>Extracted Text from Document</h4>
                    <span className="debug-text-info">
                      File: {analysis.input_data.file_name || 'Unknown'} • 
                      Size: {analysis.input_data.file_size ? `${(analysis.input_data.file_size / 1024).toFixed(2)} KB` : 'Unknown'}
                    </span>
                  </div>
                  <div className="debug-text-content">
                    <pre>{analysis.input_data.chat_content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysis.status === 'pending' && (
            <div className="report-status-message">
              <p>Your analysis is being processed. This may take a few moments.</p>
              <button
                type="button"
                className="secondary-button"
                onClick={loadAnalysis}
              >
                Refresh
              </button>
            </div>
          )}

          {analysis.status === 'processing' && (
            <div className="report-status-message">
              <div className="spinner"></div>
              <p>Analysis is in progress. Please wait...</p>
              <button
                type="button"
                className="secondary-button"
                onClick={loadAnalysis}
              >
                Refresh
              </button>
            </div>
          )}

          {analysis.status === 'completed' && analysis.results && (
            <div className="report-results">
              {renderAnalysisResults(analysis.results)}
            </div>
          )}

          {analysis.status === 'failed' && (
            <div className="report-status-message error">
              <p>Analysis failed. Please try creating a new analysis.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate('/')}
              >
                Create New Analysis
              </button>
            </div>
          )}

          {!analysis.results && analysis.status !== 'pending' && analysis.status !== 'processing' && (
            <div className="report-status-message">
              <p>No results available yet.</p>
            </div>
          )}
        </div>

        <div className="report-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleGenerateProposal}
            disabled={generatingProposal || !analysis?.input_data?.chat_content}
          >
            {generatingProposal ? 'Generating...' : 'Generate Proposal'}
          </button>
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete' : 'Delete Report'}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function renderAnalysisResults(results) {
  if (!results || typeof results !== 'object') {
    return <p>No results available.</p>
  }

  // Handle error case
  if (results.error) {
    return (
      <div className="report-error">
        <h3>Analysis Error</h3>
        <p>{results.error}</p>
      </div>
    )
  }

  const riskScore = results.risk_score || 0
  const riskLevel = results.risk_level || 'UNKNOWN'
  const riskMeter = results.risk_meter || '🟡'
  const executiveSummary = results.executive_summary || ''
  const pros = results.pros || []
  const cons = results.cons || []
  const riskBreakdown = results.risk_breakdown || {}
  const recommendation = results.recommendation || ''
  const recommendationReasoning = results.recommendation_reasoning || ''
  const protectiveMeasures = results.protective_measures || []
  const keyQuotes = results.key_quotes || []

  // Determine meter color based on score
  const getMeterColor = (score) => {
    if (score <= 3) return '#10b981' // Green
    if (score <= 6) return '#f59e0b' // Yellow/Orange
    return '#ef4444' // Red
  }

  const meterColor = getMeterColor(riskScore)
  const meterPercentage = (riskScore / 10) * 100

  return (
    <div className="analysis-results">
      {/* Risk Meter Header */}
      <div className="risk-meter-header">
        <div className="risk-meter-display">
          <div className="risk-meter-gauge">
            <div className="risk-meter-container">
              <div 
                className="risk-meter-fill"
                style={{
                  width: `${meterPercentage}%`,
                  backgroundColor: meterColor
                }}
              ></div>
              <div className="risk-meter-scale">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span 
                    key={num} 
                    className={`scale-mark ${riskScore >= num ? 'active' : ''}`}
                    style={{
                      backgroundColor: riskScore >= num ? meterColor : '#e5e7eb'
                    }}
                  ></span>
                ))}
              </div>
            </div>
            <div className="risk-meter-labels">
              <span className="meter-label-start">Low Risk</span>
              <span className="meter-label-end">High Risk</span>
            </div>
          </div>
          <div className="risk-meter-info">
            <h2 className="risk-score">Risk Score: {riskScore}/10</h2>
            <span className={`risk-level risk-level-${riskLevel.toLowerCase()}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="executive-summary">
          <h3>Executive Summary</h3>
          <p>{executiveSummary}</p>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="recommendation-section">
          <h3>Recommendation: {recommendation}</h3>
          {recommendationReasoning && <p>{recommendationReasoning}</p>}
        </div>
      )}

      {/* Pros and Cons */}
      <div className="pros-cons-grid">
        {pros.length > 0 && (
          <div className="pros-section">
            <h3>✅ Pros</h3>
            {pros.map((pro, index) => (
              <div key={index} className="pro-con-item">
                <h4>{pro.title}</h4>
                <p>{pro.description}</p>
                {pro.quotes && pro.quotes.length > 0 && (
                  <div className="quotes">
                    {pro.quotes.map((quote, qIndex) => (
                      <blockquote key={qIndex} className="quote">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {cons.length > 0 && (
          <div className="cons-section">
            <h3>⚠️ Cons</h3>
            {cons.map((con, index) => (
              <div key={index} className="pro-con-item">
                <h4>
                  {con.title}
                  {con.severity && (
                    <span className={`severity severity-${con.severity.toLowerCase()}`}>
                      {con.severity}
                    </span>
                  )}
                </h4>
                <p>{con.description}</p>
                {con.quotes && con.quotes.length > 0 && (
                  <div className="quotes">
                    {con.quotes.map((quote, qIndex) => (
                      <blockquote key={qIndex} className="quote quote-con">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Breakdown */}
      {Object.keys(riskBreakdown).length > 0 && (
        <div className="risk-breakdown">
          <h3>Detailed Risk Breakdown</h3>
          <div className="breakdown-grid">
            {Object.entries(riskBreakdown).map(([category, data]) => {
              if (!data || typeof data !== 'object') return null
              const score = data.score || 0
              const analysis = data.analysis || ''
              const concerns = data.concerns || []
              
              return (
                <div key={category} className="breakdown-item">
                  <div className="breakdown-header">
                    <h4>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    <span className="breakdown-score">Score: {score}/10</span>
                  </div>
                  <p>{analysis}</p>
                  {concerns.length > 0 && (
                    <ul className="concerns-list">
                      {concerns.map((concern, cIndex) => (
                        <li key={cIndex}>{concern}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Protective Measures */}
      {protectiveMeasures.length > 0 && (
        <div className="protective-measures">
          <h3>🛡️ Protective Measures</h3>
          <ul>
            {protectiveMeasures.map((measure, index) => (
              <li key={index}>{measure}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Quotes */}
      {keyQuotes.length > 0 && (
        <div className="key-quotes">
          <h3>Key Quotes from Chat</h3>
          {keyQuotes.map((quoteData, index) => (
            <div key={index} className={`key-quote key-quote-${quoteData.type?.toLowerCase()}`}>
              <blockquote>"{quoteData.quote}"</blockquote>
              <p className="quote-context">{quoteData.context}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RiskAnalysisReportPage

