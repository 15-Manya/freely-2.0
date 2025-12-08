import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from './DashboardLayout'
import { createRiskAnalysis, getRiskAnalyses, deleteRiskAnalysis, createProposal, getProposals, deleteProposal } from '../api/client'
import './Dashboard.css'

function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('risk')
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false)
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Proposal Generator state
  const [newProposalOpen, setNewProposalOpen] = useState(false)
  const [selectedProposalType, setSelectedProposalType] = useState(null)
  const [proposals, setProposals] = useState([])
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalError, setProposalError] = useState('')
  const [deletingProposalId, setDeletingProposalId] = useState(null)

  // Form state for client chat import (risk analysis)
  const [formData, setFormData] = useState({
    clientName: '',
    chatFile: null
  })

  // Form state for proposal generator
  const [proposalFormData, setProposalFormData] = useState({
    clientName: '',
    chatFile: null,
    textInput: ''
  })

  // Load analyses on mount and when user is available
  useEffect(() => {
    if (activeTab === 'risk' && currentUser) {
      // Small delay to ensure token is ready after sign-in
      const timer = setTimeout(() => {
        loadAnalyses()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, currentUser])

  // Load proposals on mount and when user is available
  useEffect(() => {
    if (activeTab === 'proposal' && currentUser) {
      // Small delay to ensure token is ready after sign-in
      const timer = setTimeout(() => {
        loadProposals()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, currentUser])

  const loadAnalyses = async () => {
    if (!currentUser) {
      console.warn('Cannot load analyses: user not authenticated')
      return
    }
    
    try {
      const response = await getRiskAnalyses()
      setAnalyses(response.analyses || [])
      setError('')
    } catch (err) {
      console.error('Failed to load analyses:', err)
      setError(err.message || 'Failed to load analyses. Please try again.')
    }
  }

  const loadProposals = async () => {
    if (!currentUser) {
      console.warn('Cannot load proposals: user not authenticated')
      return
    }
    
    try {
      const response = await getProposals()
      setProposals(response.proposals || [])
      setProposalError('')
    } catch (err) {
      console.error('Failed to load proposals:', err)
      setProposalError(err.message || 'Failed to load proposals. Please try again.')
    }
  }

  const handleDeleteAnalysis = async (analysisId, e) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(analysisId)
      await deleteRiskAnalysis(analysisId)
      // Remove from list
      setAnalyses(analyses.filter(a => a._id !== analysisId))
    } catch (err) {
      console.error('Failed to delete analysis:', err)
      alert(err.message || 'Failed to delete analysis. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenNewAnalysis = () => {
    setNewAnalysisOpen(true)
    setSelectedAnalysisType(null)
    setFormData({ clientName: '', chatFile: null })
    setError('')
  }

  const handleCloseModal = () => {
    setNewAnalysisOpen(false)
    setSelectedAnalysisType(null)
    setFormData({ clientName: '', chatFile: null })
    setError('')
  }

  const handleOpenNewProposal = () => {
    setNewProposalOpen(true)
    setSelectedProposalType(null)
    setProposalFormData({ clientName: '', chatFile: null, textInput: '' })
    setError('')
  }

  const handleCloseProposalModal = () => {
    setNewProposalOpen(false)
    setSelectedProposalType(null)
    setProposalFormData({ clientName: '', chatFile: null, textInput: '' })
    setError('')
  }

  const handleSelectProposalType = (type) => {
    setSelectedProposalType(type)
  }

  const handleProposalFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setProposalError('PDF files are not supported. Please upload a text document.')
        e.target.value = '' // Clear the input
        return
      }
      setProposalFormData({ ...proposalFormData, chatFile: file })
      setProposalError('')
    }
  }

  const handleDeleteProposal = async (proposalId, e) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingProposalId(proposalId)
      await deleteProposal(proposalId)
      // Remove from list
      setProposals(proposals.filter(p => p._id !== proposalId))
    } catch (err) {
      console.error('Failed to delete proposal:', err)
      alert(err.message || 'Failed to delete proposal. Please try again.')
    } finally {
      setDeletingProposalId(null)
    }
  }

  const handleGenerateProposal = async (e) => {
    e.preventDefault()
    setProposalError('')
    setProposalLoading(true)

    try {
      if (selectedProposalType === 'from_chat') {
        if (!proposalFormData.clientName.trim()) {
          setProposalError('Please enter a client/project name')
          setProposalLoading(false)
          return
        }
        if (!proposalFormData.chatFile) {
          setProposalError('Please select a chat file to import')
          setProposalLoading(false)
          return
        }

        // Create FormData for file upload
        const submitFormData = new FormData()
        submitFormData.append('proposal_type', 'from_chat')
        submitFormData.append('client_name', proposalFormData.clientName.trim())
        submitFormData.append('chat_file', proposalFormData.chatFile)

        const newProposal = await createProposal(submitFormData)

        // Close modal and refresh proposals list
        handleCloseProposalModal()
        await loadProposals()

        // Navigate to proposal page (we'll create this route later)
        // For now, just show success
        navigate(`/proposal/${newProposal._id}`)
      }
    } catch (err) {
      setProposalError(err.message || 'Failed to create proposal. Please try again.')
    } finally {
      setProposalLoading(false)
    }
  }

  const handleSelectAnalysisType = (type) => {
    if (type === 'text') return // Disabled
    setSelectedAnalysisType(type)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setError('PDF files are not supported. Please upload a text document.')
        e.target.value = '' // Clear the input
        return
      }
      setFormData({ ...formData, chatFile: file })
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (selectedAnalysisType === 'client_chat_import') {
        if (!formData.clientName.trim()) {
          setError('Please enter a client/project name')
          setLoading(false)
          return
        }
        if (!formData.chatFile) {
          setError('Please select a chat file to import')
          setLoading(false)
          return
        }

        // Create FormData for file upload
        const submitFormData = new FormData()
        submitFormData.append('analysis_type', 'client_chat_import')
        submitFormData.append('client_name', formData.clientName.trim())
        submitFormData.append('chat_file', formData.chatFile)

        const newAnalysis = await createRiskAnalysis(submitFormData)
        
        // Close modal and refresh analyses list
        handleCloseModal()
        await loadAnalyses()
        
        // Navigate to report page
        navigate(`/risk-analysis/${newAnalysis._id}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to create analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-inner-tabs">
        <button
          type="button"
          className={`inner-tab${activeTab === 'risk' ? ' inner-tab-active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Analysis
        </button>
        <button
          type="button"
          className={`inner-tab${
            activeTab === 'proposal' ? ' inner-tab-active' : ''
          }`}
          onClick={() => setActiveTab('proposal')}
        >
          Proposal Generator
        </button>
      </div>

      <div className="user-info">
        {activeTab === 'risk' ? (
          <>
            <div className="risk-header">
              <h2>Risk Analysis</h2>
              <button
                type="button"
                className="primary-button"
                onClick={handleOpenNewAnalysis}
              >
                + New analysis
              </button>
            </div>

            {/* Analyses List */}
            {analyses.length > 0 ? (
              <div className="analyses-list">
                {analyses.map((analysis) => (
                  <div
                    key={analysis._id}
                    className="analysis-item"
                  >
                    <div 
                      className="analysis-item-content"
                      onClick={() => navigate(`/risk-analysis/${analysis._id}`)}
                    >
                      <div className="analysis-item-header">
                        <h3 className="analysis-item-title">
                          {analysis.client_name || 'Untitled Analysis'}
                        </h3>
                        <span className={`analysis-status analysis-status-${analysis.status}`}>
                          {analysis.status}
                        </span>
                      </div>
                      <p className="analysis-item-meta">
                        {analysis.analysis_type.replace('_', ' ')} •{' '}
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="analysis-delete-button"
                      onClick={(e) => handleDeleteAnalysis(analysis._id, e)}
                      disabled={deletingId === analysis._id}
                      title="Delete report"
                    >
                      {deletingId === analysis._id ? '...' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No analyses yet. Create your first analysis to get started.</p>
            )}
          </>
        ) : (
          <>
            <div className="risk-header">
              <h2>Proposal Generator</h2>
              <button
                type="button"
                className="primary-button"
                onClick={handleOpenNewProposal}
              >
                + New proposal
              </button>
            </div>

            {/* Proposals List */}
            {proposals.length > 0 ? (
              <div className="analyses-list">
                {proposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="analysis-item"
                  >
                    <div 
                      className="analysis-item-content"
                      onClick={() => navigate(`/proposal/${proposal._id}`)}
                    >
                      <div className="analysis-item-header">
                        <h3 className="analysis-item-title">
                          {proposal.client_name || 'Untitled Proposal'}
                        </h3>
                        <span className={`analysis-status analysis-status-${proposal.status}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="analysis-item-meta">
                        {proposal.proposal_type.replace('_', ' ')} •{' '}
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="analysis-delete-button"
                      onClick={(e) => handleDeleteProposal(proposal._id, e)}
                      disabled={deletingProposalId === proposal._id}
                      title="Delete Proposal"
                    >
                      {deletingProposalId === proposal._id ? '...' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No proposals found. Click "+ New proposal" to get started.</p>
            )}

            {proposalError && (
              <div className="error-message" role="alert">
                {proposalError}
              </div>
            )}
          </>
        )}
      </div>

      {newAnalysisOpen && activeTab === 'risk' && (
        <div className="new-analysis-overlay" onClick={handleCloseModal}>
          <div className="new-analysis-modal" onClick={(e) => e.stopPropagation()}>
            {!selectedAnalysisType ? (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Start new analysis</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  Choose how you want to create a new risk analysis.
                </p>

                <button
                  type="button"
                  className="new-analysis-option"
                  onClick={() => handleSelectAnalysisType('client_chat_import')}
                >
                  Analyse using client chat import
                </button>
                <button
                  type="button"
                  className="new-analysis-option"
                  onClick={() => handleSelectAnalysisType('job_proposal')}
                >
                  Analyse using job proposal
                </button>
                <button
                  type="button"
                  className="new-analysis-option disabled"
                  disabled
                >
                  Analyse using text (coming soon)
                </button>
              </>
            ) : selectedAnalysisType === 'client_chat_import' ? (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Client Chat Import</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  Import a client chat to analyze risks.
                </p>

                <form onSubmit={handleSubmit} className="analysis-form">
                  {error && (
                    <div className="form-error" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="clientName">Client/Project Name</label>
                    <input
                      type="text"
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      placeholder="Enter client or project name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="chatFile">Import Chat</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="chatFile"
                        accept=".txt,.docx,.csv"
                        onChange={handleFileChange}
                        className="file-input"
                        required
                      />
                      <label htmlFor="chatFile" className="file-upload-button">
                        {formData.chatFile
                          ? formData.chatFile.name
                          : 'Browse from computer'}
                      </label>
                      {formData.chatFile && (
                        <button
                          type="button"
                          className="file-remove-button"
                          onClick={() => setFormData({ ...formData, chatFile: null })}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p className="file-hint">Supported formats: TXT, DOCX, CSV (PDF and old .doc files not supported)</p>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedAnalysisType(null)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Generate Report'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Job Proposal</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  This feature is coming soon.
                </p>
                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSelectedAnalysisType(null)}
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Proposal Generator Modal */}
      {newProposalOpen && activeTab === 'proposal' && (
        <div className="new-analysis-overlay" onClick={handleCloseProposalModal}>
          <div className="new-analysis-modal" onClick={(e) => e.stopPropagation()}>
            {!selectedProposalType ? (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Create new proposal</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseProposalModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  Choose how you want to create a new proposal.
                </p>

                <button
                  type="button"
                  className="new-analysis-option"
                  onClick={() => handleSelectProposalType('from_chat')}
                >
                  From client chat
                </button>
                <button
                  type="button"
                  className="new-analysis-option disabled"
                  disabled
                >
                  From text (coming soon)
                </button>
              </>
            ) : selectedProposalType === 'from_chat' ? (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Proposal from Client Chat</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseProposalModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  Upload a client chat to generate a proposal.
                </p>

                <form onSubmit={handleGenerateProposal} className="new-analysis-form">
                  <div className="form-group">
                    <label htmlFor="proposalClientName">Client/Project Name</label>
                    <input
                      type="text"
                      id="proposalClientName"
                      name="clientName"
                      value={proposalFormData.clientName}
                      onChange={(e) =>
                        setProposalFormData({ ...proposalFormData, clientName: e.target.value })
                      }
                      placeholder="e.g., Acme Corp Website Redesign"
                      required
                      disabled={proposalLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="proposalChatFile">Import Chat</label>
                    <input
                      type="file"
                      id="proposalChatFile"
                      name="chatFile"
                      onChange={handleProposalFileChange}
                      accept=".txt,.docx,.csv"
                      required
                      disabled={proposalLoading}
                    />
                    {proposalFormData.chatFile && (
                      <p className="selected-file-name">Selected: {proposalFormData.chatFile.name}</p>
                    )}
                    <p className="file-hint">Supported formats: TXT, DOCX, CSV (PDF and old .doc files not supported)</p>
                  </div>

                  {proposalError && (
                    <div className="error-message" role="alert">
                      {proposalError}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedProposalType(null)}
                      disabled={proposalLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={proposalLoading}
                    >
                      {proposalLoading ? 'Generating...' : 'Generate Proposal'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="new-analysis-modal-header">
                  <h3>Proposal from Text</h3>
                  <button
                    type="button"
                    className="modal-close-button"
                    onClick={handleCloseProposalModal}
                  >
                    ×
                  </button>
                </div>
                <p className="new-analysis-modal-subtitle">
                  Enter text to generate a proposal.
                </p>

                <form className="analysis-form">
                  {error && (
                    <div className="form-error" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="proposalTextClientName">Client/Project Name</label>
                    <input
                      type="text"
                      id="proposalTextClientName"
                      value={proposalFormData.clientName}
                      onChange={(e) =>
                        setProposalFormData({ ...proposalFormData, clientName: e.target.value })
                      }
                      placeholder="Enter client or project name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="proposalTextInput">Project Details</label>
                    <textarea
                      id="proposalTextInput"
                      value={proposalFormData.textInput}
                      onChange={(e) =>
                        setProposalFormData({ ...proposalFormData, textInput: e.target.value })
                      }
                      placeholder="Enter project requirements, scope, or any relevant details..."
                      rows={8}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedProposalType(null)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Generate Proposal'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardPage


