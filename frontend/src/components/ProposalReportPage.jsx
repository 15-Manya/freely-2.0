import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { getProposal, deleteProposal, updateProposal, getProposalHistory, restoreProposalVersion, saveEditedProposal, generateRiskReportFromProposal } from '../api/client'
import './Dashboard.css'

// Helper function to format proposal content for display
function formatProposalContent(content) {
  if (!content) return ''
  
  let formatted = content
  
  // Handle markdown headers first (before other processing)
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  
  // Handle bold text first (double asterisks)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Handle italic text (single asterisks, but skip if they're part of bold)
  // Use a simple approach: replace single asterisks that aren't adjacent to other asterisks
  formatted = formatted.replace(/([^*]|^)\*([^*\n]+?)\*([^*]|$)/g, '$1<em>$2</em>$3')
  
  // Convert line breaks to <br> for proper spacing
  // But preserve structure for numbered labels (like "1. Project/Job Title:")
  // These should NOT be converted to list items since they're labels with content
  
  // Split by double line breaks first to preserve paragraph structure
  const paragraphs = formatted.split(/\n\s*\n/)
  
  formatted = paragraphs.map(para => {
    const trimmed = para.trim()
    if (!trimmed) return ''
    
    // Don't wrap headers in <p> tags
    if (trimmed.startsWith('<h2>') || trimmed.startsWith('<h3>')) {
      return trimmed
    }
    
    // Convert single line breaks to <br> within paragraphs
    // This preserves numbered labels like "1. Label: content" as-is
    const withBreaks = trimmed.replace(/\n/g, '<br>')
    return `<p>${withBreaks}</p>`
  }).filter(p => p).join('\n')
  
  return formatted
}

function ProposalReportPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [showChatbox, setShowChatbox] = useState(false)
  const [chatboxChanges, setChatboxChanges] = useState('')
  const [chatboxFile, setChatboxFile] = useState(null)
  const [chatboxLoading, setChatboxLoading] = useState(false)
  const [chatboxError, setChatboxError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedProposal, setEditedProposal] = useState('')
  const [saving, setSaving] = useState(false)
  const [proposalHistory, setProposalHistory] = useState([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  const [undoRedoLoading, setUndoRedoLoading] = useState(false)
  const [generatingRiskReport, setGeneratingRiskReport] = useState(false)

  const loadProposal = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProposal(proposalId)
      setProposal(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }, [proposalId])

  useEffect(() => {
    loadProposal()
  }, [loadProposal])

  // Initialize edited proposal when proposal loads
  useEffect(() => {
    if (proposal?.results?.formatted_proposal && !editedProposal) {
      setEditedProposal(proposal.results.formatted_proposal)
    }
  }, [proposal, editedProposal])

  // Auto-refresh every 3 seconds if processing
  useEffect(() => {
    if (!proposal || (proposal.status !== 'pending' && proposal.status !== 'processing')) {
      return
    }

    const interval = setInterval(() => {
      loadProposal()
    }, 3000)

    return () => clearInterval(interval)
  }, [proposal, loadProposal])

  // Load proposal history when proposal loads
  useEffect(() => {
    if (proposal && proposal.status === 'completed') {
      loadProposalHistory()
    }
  }, [proposalId, proposal?.status])

  const loadProposalHistory = async () => {
    try {
      const historyData = await getProposalHistory(proposalId)
      setProposalHistory(historyData.history || [])
      setCurrentVersionIndex(historyData.current_version_index ?? -1)
    } catch (err) {
      console.error('Failed to load proposal history:', err)
      // Don't show error to user, just log it
    }
  }

  const handleUndo = async () => {
    // Go to previous version in history
    if (currentVersionIndex <= 0 || proposalHistory.length === 0) {
      return
    }
    
    const targetIndex = currentVersionIndex - 1
    
    try {
      setUndoRedoLoading(true)
      await restoreProposalVersion(proposalId, targetIndex)
      await loadProposal()
      await loadProposalHistory()
    } catch (err) {
      console.error('Failed to undo:', err)
      alert('Failed to undo. Please try again.')
    } finally {
      setUndoRedoLoading(false)
    }
  }

  const handleRedo = async () => {
    // Go to next version in history
    if (currentVersionIndex >= proposalHistory.length - 1 || proposalHistory.length === 0) {
      return
    }
    
    const targetIndex = currentVersionIndex + 1
    
    try {
      setUndoRedoLoading(true)
      await restoreProposalVersion(proposalId, targetIndex)
      await loadProposal()
      await loadProposalHistory()
    } catch (err) {
      console.error('Failed to redo:', err)
      alert('Failed to redo. Please try again.')
    } finally {
      setUndoRedoLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setDeleting(true)
      await deleteProposal(proposalId)
      alert('Proposal deleted successfully!')
      navigate('/') // Redirect to dashboard after deletion
    } catch (err) {
      console.error('Failed to delete proposal:', err)
      setError(err.message || 'Failed to delete proposal. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleGenerateRiskReport = async () => {
    try {
      setGeneratingRiskReport(true)
      const riskAnalysis = await generateRiskReportFromProposal(proposalId)
      // Navigate to the risk analysis report page
      navigate(`/risk-analysis/${riskAnalysis._id}`)
    } catch (err) {
      console.error('Failed to generate risk report:', err)
      alert('Failed to generate risk report. Please try again.')
    } finally {
      setGeneratingRiskReport(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Proposal Report">
        <div className="user-info">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading proposal...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !proposal) {
    return (
      <DashboardLayout title="Proposal Report">
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

  if (!proposal) {
    return (
      <DashboardLayout title="Proposal Report">
        <div className="user-info">
          <p>Proposal not found.</p>
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
    <DashboardLayout title="Proposal Report">
      <div className="user-info">
        <div className="report-header">
          <div>
            <h2>{proposal.client_name || 'Untitled Proposal'}</h2>
            <p className="report-meta">
              Created: {new Date(proposal.created_at).toLocaleString()}
              {proposal.updated_at && proposal.updated_at !== proposal.created_at && (
                <> • Updated: {new Date(proposal.updated_at).toLocaleString()}</>
              )}
            </p>
          </div>
          <span className={`analysis-status analysis-status-${proposal.status}`}>
            {proposal.status}
          </span>
        </div>

        {proposal.input_data?.chat_content && (
          <div className="debug-section">
            <button className="debug-toggle-button" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? '▼' : '▶'} View Extracted Text ({proposal.input_data.file_name})
            </button>
            {showDebug && (
              <div className="debug-content">
                <h4>File: {proposal.input_data.file_name} ({Math.round(proposal.input_data.file_size / 1024)} KB)</h4>
                <pre className="extracted-text">{proposal.input_data.chat_content}</pre>
              </div>
            )}
          </div>
        )}

        <div className="report-content">
          {proposal.status === 'pending' && (
            <div className="report-status-message">
              <p>Your proposal is being processed. This may take a few moments.</p>
              <button
                type="button"
                className="secondary-button"
                onClick={loadProposal}
              >
                Refresh
              </button>
            </div>
          )}

          {proposal.status === 'processing' && (
            <div className="report-status-message">
              <div className="spinner"></div>
              <p>Proposal is being generated. Please wait...</p>
              <button
                type="button"
                className="secondary-button"
                onClick={loadProposal}
              >
                Refresh
              </button>
            </div>
          )}

          {proposal.status === 'completed' && proposal.results && (
            <div className="report-results">
              <div className="executive-summary">
                <div className="proposal-header-with-actions">
                  <h3>Generated Proposal</h3>
                  <div className="proposal-action-buttons">
                    <button
                      type="button"
                      className={`icon-button ${isEditMode ? 'active' : ''}`}
                      onClick={() => {
                        if (!isEditMode) {
                          // Entering edit mode - initialize with current proposal text
                          setEditedProposal(proposal.results.formatted_proposal || '')
                        }
                        setIsEditMode(!isEditMode)
                      }}
                      title={isEditMode ? 'Exit Edit Mode' : 'Edit Proposal'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.13L18.87 8.88L20.71 7.04Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={handleUndo}
                      disabled={undoRedoLoading || proposalHistory.length === 0 || currentVersionIndex <= 0}
                      title="Undo (Previous Version)"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C21.08 11.03 17.15 8 12.5 8Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={handleRedo}
                      disabled={undoRedoLoading || proposalHistory.length === 0 || currentVersionIndex >= proposalHistory.length - 1}
                      title="Redo (Next Version)"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.4 10.6C16.55 9 14.15 8 11.5 8C6.85 8 2.92 11.03 1.53 15.22L3.9 16C4.95 12.81 7.96 10.5 11.5 10.5C13.46 10.5 15.23 11.22 16.62 12.38L13 16H22V7L18.4 10.6Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => {
                        // Download as PDF
                        const printWindow = window.open('', '_blank')
                        if (printWindow) {
                          const content = isEditMode ? editedProposal : (proposal.results.formatted_proposal || '')
                          const htmlContent = `
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>Proposal - ${proposal.client_name || 'Untitled'}</title>
                                <style>
                                  body {
                                    font-family: system-ui, -apple-system, sans-serif;
                                    line-height: 1.8;
                                    color: #374151;
                                    max-width: 800px;
                                    margin: 40px auto;
                                    padding: 20px;
                                  }
                                  h2 {
                                    color: #000480;
                                    margin-top: 24px;
                                    margin-bottom: 12px;
                                    font-size: 20px;
                                    font-weight: 700;
                                  }
                                  h3 {
                                    color: #111827;
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                    font-size: 18px;
                                    font-weight: 600;
                                  }
                                  strong {
                                    font-weight: 600;
                                    color: #111827;
                                  }
                                  ul {
                                    margin: 12px 0;
                                    padding-left: 20px;
                                  }
                                  li {
                                    margin-bottom: 8px;
                                  }
                                  @media print {
                                    body {
                                      margin: 0;
                                      padding: 20px;
                                    }
                                  }
                                </style>
                              </head>
                              <body>
                                ${content
                                  .replace(/\n/g, '<br>')
                                  .replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
                                  .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>')
                                  .replace(/(<li.*?<\/li>)/g, '<ul>$1</ul>')}
                              </body>
                            </html>
                          `
                          printWindow.document.write(htmlContent)
                          printWindow.document.close()
                          setTimeout(() => {
                            printWindow.print()
                          }, 250)
                        }
                      }}
                      title="Download as PDF"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setShowChatbox(true)}
                      title="Update Proposal"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
                        <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
                {isEditMode ? (
                  <div className="proposal-edit-container">
                    <textarea
                      className="proposal-edit-textarea"
                      value={editedProposal}
                      onChange={(e) => setEditedProposal(e.target.value)}
                      placeholder="Edit the proposal text here..."
                    />
                    <div className="proposal-edit-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setIsEditMode(false)
                          setEditedProposal('')
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={async () => {
                          setSaving(true)
                          try {
                            // Save edited proposal via API (this will also update history)
                            await saveEditedProposal(proposalId, editedProposal)
                            
                            // Reload proposal to get updated version
                            await loadProposal()
                            
                            // Reload history to update undo/redo buttons
                            await loadProposalHistory()
                            
                            // Exit edit mode
                            setIsEditMode(false)
                            setEditedProposal('')
                          } catch (err) {
                            console.error('Failed to save proposal:', err)
                            alert('Failed to save proposal. Please try again.')
                          } finally {
                            setSaving(false)
                          }
                        }}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="proposal-content"
                    dangerouslySetInnerHTML={{
                      __html: proposal.results.formatted_proposal 
                        ? formatProposalContent(proposal.results.formatted_proposal)
                        : 'Proposal content will appear here once generated.'
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {proposal.status === 'failed' && (
            <div className="report-status-message error">
              <p>Proposal generation failed. Please try creating a new proposal.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate('/')}
              >
                Create New Proposal
              </button>
            </div>
          )}

          {!proposal.results && proposal.status !== 'pending' && proposal.status !== 'processing' && (
            <div className="report-status-message">
              <p>Proposal generation pending. Status: {proposal.status}</p>
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
            onClick={handleGenerateRiskReport}
            disabled={generatingRiskReport || !proposal?.input_data?.chat_content}
          >
            {generatingRiskReport ? 'Generating...' : 'Generate Risk Report'}
          </button>
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete' : 'Delete Proposal'}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this proposal? This action cannot be undone.</p>
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

        {/* Chatbox Dialog */}
        {showChatbox && (
          <div className="chatbox-modal-overlay" onClick={() => {
            if (!chatboxLoading) {
              setShowChatbox(false)
              setChatboxChanges('')
              setChatboxFile(null)
              setChatboxError('')
            }
          }}>
            <div className="chatbox-modal" onClick={(e) => e.stopPropagation()}>
              <div className="chatbox-modal-header">
                <h3>Update Proposal</h3>
                <button
                  type="button"
                  className="chatbox-close-button"
                  onClick={() => {
                    if (!chatboxLoading) {
                      setShowChatbox(false)
                      setChatboxChanges('')
                      setChatboxFile(null)
                      setChatboxError('')
                    }
                  }}
                  disabled={chatboxLoading}
                >
                  ×
                </button>
              </div>
              <div className="chatbox-modal-content">
                <p className="chatbox-subtitle">
                  Provide changes or import a new chat to update this proposal.
                </p>
                
                <form
                  className="chatbox-form"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setChatboxError('')
                    setChatboxLoading(true)
                    
                    try {
                      // Call update API
                      await updateProposal(proposalId, chatboxChanges, chatboxFile)
                      
                      // Close modal and clear form
                      setShowChatbox(false)
                      setChatboxChanges('')
                      setChatboxFile(null)
                      setChatboxError('')
                      
                      // Reload proposal to show updated status
                      await loadProposal()
                      
                      // Reload history after update
                      await loadProposalHistory()
                    } catch (err) {
                      setChatboxError(err.message || 'Failed to update proposal')
                    } finally {
                      setChatboxLoading(false)
                    }
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="chatboxChanges">Changes or Additional Information</label>
                    <textarea
                      id="chatboxChanges"
                      name="chatboxChanges"
                      value={chatboxChanges}
                      onChange={(e) => setChatboxChanges(e.target.value)}
                      placeholder="Describe any changes or additional information you want to incorporate into the proposal..."
                      rows="4"
                      disabled={chatboxLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="chatboxFile">Import New Chat (Optional)</label>
                    <input
                      type="file"
                      id="chatboxFile"
                      name="chatboxFile"
                      accept=".txt,.docx,.csv"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          // Check if PDF
                          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                            setChatboxError('PDF files are not supported. Please upload a text document.')
                            e.target.value = ''
                            return
                          }
                          setChatboxFile(file)
                          setChatboxError('')
                        }
                      }}
                      disabled={chatboxLoading}
                    />
                    {chatboxFile && (
                      <p className="selected-file-name">Selected: {chatboxFile.name}</p>
                    )}
                    <p className="file-hint">Supported formats: TXT, DOCX, CSV (PDF and old .doc files not supported)</p>
                  </div>

                  {chatboxError && (
                    <div className="error-message" role="alert">
                      {chatboxError}
                    </div>
                  )}

                  <div className="chatbox-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setShowChatbox(false)
                        setChatboxChanges('')
                        setChatboxFile(null)
                        setChatboxError('')
                      }}
                      disabled={chatboxLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={chatboxLoading || (!chatboxChanges.trim() && !chatboxFile)}
                    >
                      {chatboxLoading ? 'Updating...' : 'Update Proposal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProposalReportPage

