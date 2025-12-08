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

  const [newProposalOpen, setNewProposalOpen] = useState(false)
  const [selectedProposalType, setSelectedProposalType] = useState(null)
  const [proposals, setProposals] = useState([])
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalError, setProposalError] = useState('')
  const [deletingProposalId, setDeletingProposalId] = useState(null)

  const [formData, setFormData] = useState({
    clientName: '',
    chatFile: null
  })

  const [proposalFormData, setProposalFormData] = useState({
    clientName: '',
    chatFile: null,
    textInput: ''
  })

  useEffect(() => {
    if (activeTab === 'risk' && currentUser) {
      const timer = setTimeout(() => {
        loadAnalyses()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, currentUser])

  useEffect(() => {
    if (activeTab === 'proposal' && currentUser) {
      const timer = setTimeout(() => {
        loadProposals()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, currentUser])

  const loadAnalyses = async () => {
    if (!currentUser) return
    try {
      const response = await getRiskAnalyses()
      setAnalyses(response.analyses || [])
      setError('')
    } catch (err) {
      console.error('Failed to load analyses:', err)
      setError(err.message || 'Failed to load analyses.')
    }
  }

  const loadProposals = async () => {
    if (!currentUser) return
    try {
      const response = await getProposals()
      setProposals(response.proposals || [])
      setProposalError('')
    } catch (err) {
      console.error('Failed to load proposals:', err)
      setProposalError(err.message || 'Failed to load proposals.')
    }
  }

  const handleDeleteAnalysis = async (analysisId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this report?')) return
    try {
      setDeletingId(analysisId)
      await deleteRiskAnalysis(analysisId)
      setAnalyses(analyses.filter(a => a._id !== analysisId))
    } catch (err) {
      alert(err.message || 'Failed to delete analysis.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteProposal = async (proposalId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this proposal?')) return
    try {
      setDeletingProposalId(proposalId)
      await deleteProposal(proposalId)
      setProposals(proposals.filter(p => p._id !== proposalId))
    } catch (err) {
      alert(err.message || 'Failed to delete proposal.')
    } finally {
      setDeletingProposalId(null)
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
    setProposalError('')
  }

  const handleCloseProposalModal = () => {
    setNewProposalOpen(false)
    setSelectedProposalType(null)
    setProposalFormData({ clientName: '', chatFile: null, textInput: '' })
    setProposalError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setError('PDF files are not supported. Please upload a text document.')
        e.target.value = ''
        return
      }
      setFormData({ ...formData, chatFile: file })
      setError('')
    }
  }

  const handleProposalFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setProposalError('PDF files are not supported. Please upload a text document.')
        e.target.value = ''
        return
      }
      setProposalFormData({ ...proposalFormData, chatFile: file })
      setProposalError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
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
      const submitFormData = new FormData()
      submitFormData.append('analysis_type', selectedAnalysisType)
      submitFormData.append('client_name', formData.clientName.trim())
      submitFormData.append('chat_file', formData.chatFile)
      const newAnalysis = await createRiskAnalysis(submitFormData)
      handleCloseModal()
      await loadAnalyses()
      navigate(`/risk-analysis/${newAnalysis._id}`)
    } catch (err) {
      setError(err.message || 'Failed to create analysis.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProposal = async (e) => {
    e.preventDefault()
    setProposalError('')
    setProposalLoading(true)
    try {
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
      const submitFormData = new FormData()
      submitFormData.append('proposal_type', 'from_chat')
      submitFormData.append('client_name', proposalFormData.clientName.trim())
      submitFormData.append('chat_file', proposalFormData.chatFile)
      const newProposal = await createProposal(submitFormData)
      handleCloseProposalModal()
      await loadProposals()
      navigate(`/proposal/${newProposal._id}`)
    } catch (err) {
      setProposalError(err.message || 'Failed to create proposal.')
    } finally {
      setProposalLoading(false)
    }
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-tabs">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Analysis
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'proposal' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposal')}
        >
          Proposal Generator
        </button>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <h2 className="content-card-title">
            {activeTab === 'risk' ? 'Risk Analysis' : 'Proposal Generator'}
          </h2>
          <button
            type="button"
            className="btn-primary"
            onClick={activeTab === 'risk' ? handleOpenNewAnalysis : handleOpenNewProposal}
          >
            + New {activeTab === 'risk' ? 'analysis' : 'proposal'}
          </button>
        </div>

        <div className="content-card-body">
          {activeTab === 'risk' ? (
            <>
              {analyses.length > 0 ? (
                <div className="items-list">
                  {analyses.map((analysis) => (
                    <div key={analysis._id} className="list-item">
                      <div className="list-item-icon">&#128202;</div>
                      <div 
                        className="list-item-content"
                        onClick={() => navigate(`/risk-analysis/${analysis._id}`)}
                      >
                        <h3 className="list-item-title">
                          {analysis.client_name || 'Untitled Analysis'}
                        </h3>
                        <p className="list-item-meta">
                          {analysis.analysis_type.replace(/_/g, ' ')} · {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="list-item-actions">
                        <span className={`status-badge ${analysis.status}`}>
                          {analysis.status}
                        </span>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={(e) => handleDeleteAnalysis(analysis._id, e)}
                          disabled={deletingId === analysis._id}
                          title="Delete"
                        >
                          {deletingId === analysis._id ? '...' : '×'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">&#128202;</div>
                  <h3 className="empty-state-title">No analyses yet</h3>
                  <p className="empty-state-text">Create your first risk analysis to get started.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {proposals.length > 0 ? (
                <div className="items-list">
                  {proposals.map((proposal) => (
                    <div key={proposal._id} className="list-item">
                      <div className="list-item-icon">&#128221;</div>
                      <div 
                        className="list-item-content"
                        onClick={() => navigate(`/proposal/${proposal._id}`)}
                      >
                        <h3 className="list-item-title">
                          {proposal.client_name || 'Untitled Proposal'}
                        </h3>
                        <p className="list-item-meta">
                          {proposal.proposal_type.replace(/_/g, ' ')} · {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="list-item-actions">
                        <span className={`status-badge ${proposal.status}`}>
                          {proposal.status}
                        </span>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={(e) => handleDeleteProposal(proposal._id, e)}
                          disabled={deletingProposalId === proposal._id}
                          title="Delete"
                        >
                          {deletingProposalId === proposal._id ? '...' : '×'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">&#128221;</div>
                  <h3 className="empty-state-title">No proposals yet</h3>
                  <p className="empty-state-text">Create your first proposal to get started.</p>
                </div>
              )}
              {proposalError && (
                <div className="error-message" role="alert">{proposalError}</div>
              )}
            </>
          )}
        </div>
      </div>

      {newAnalysisOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {!selectedAnalysisType ? 'Start new analysis' : 
                 selectedAnalysisType === 'client_chat_import' ? 'Client Chat Import' : 'Job Proposal'}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {!selectedAnalysisType ? (
                <>
                  <p className="modal-subtitle">Choose how you want to create a new risk analysis.</p>
                  <button
                    type="button"
                    className="modal-option"
                    onClick={() => setSelectedAnalysisType('client_chat_import')}
                  >
                    Analyze using client chat import
                  </button>
                  <button
                    type="button"
                    className="modal-option"
                    onClick={() => setSelectedAnalysisType('job_proposal')}
                  >
                    Analyze using job proposal
                  </button>
                  <button type="button" className="modal-option" disabled>
                    Analyze using text (coming soon)
                  </button>
                </>
              ) : selectedAnalysisType === 'client_chat_import' || selectedAnalysisType === 'job_proposal' ? (
                <form onSubmit={handleSubmit}>
                  {error && <div className="form-error" role="alert">{error}</div>}
                  
                  <div className="form-group">
                    <label htmlFor="clientName">Client/Project Name</label>
                    <input
                      type="text"
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Enter client or project name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Import Chat</label>
                    <div 
                      className={`file-upload-area ${formData.chatFile ? 'has-file' : ''}`}
                      onClick={() => document.getElementById('chatFile').click()}
                    >
                      <input
                        type="file"
                        id="chatFile"
                        accept=".txt,.docx,.csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {formData.chatFile ? (
                        <div className="file-name">
                          <span>&#128196;</span>
                          {formData.chatFile.name}
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormData({ ...formData, chatFile: null })
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="file-upload-icon">&#128194;</div>
                          <p className="file-upload-text">Click to browse files</p>
                          <p className="file-upload-hint">TXT, DOCX, CSV supported</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSelectedAnalysisType(null)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Generate Report'}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {newProposalOpen && (
        <div className="modal-overlay" onClick={handleCloseProposalModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {!selectedProposalType ? 'Create new proposal' : 'Proposal from Client Chat'}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseProposalModal}>×</button>
            </div>

            <div className="modal-body">
              {!selectedProposalType ? (
                <>
                  <p className="modal-subtitle">Choose how you want to create a new proposal.</p>
                  <button
                    type="button"
                    className="modal-option"
                    onClick={() => setSelectedProposalType('from_chat')}
                  >
                    From client chat
                  </button>
                  <button type="button" className="modal-option" disabled>
                    From text (coming soon)
                  </button>
                </>
              ) : (
                <form onSubmit={handleGenerateProposal}>
                  {proposalError && <div className="form-error" role="alert">{proposalError}</div>}
                  
                  <div className="form-group">
                    <label htmlFor="proposalClientName">Client/Project Name</label>
                    <input
                      type="text"
                      id="proposalClientName"
                      value={proposalFormData.clientName}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, clientName: e.target.value })}
                      placeholder="e.g., Acme Corp Website Redesign"
                      required
                      disabled={proposalLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Import Chat</label>
                    <div 
                      className={`file-upload-area ${proposalFormData.chatFile ? 'has-file' : ''}`}
                      onClick={() => document.getElementById('proposalChatFile').click()}
                    >
                      <input
                        type="file"
                        id="proposalChatFile"
                        accept=".txt,.docx,.csv"
                        onChange={handleProposalFileChange}
                        style={{ display: 'none' }}
                        disabled={proposalLoading}
                      />
                      {proposalFormData.chatFile ? (
                        <div className="file-name">
                          <span>&#128196;</span>
                          {proposalFormData.chatFile.name}
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setProposalFormData({ ...proposalFormData, chatFile: null })
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="file-upload-icon">&#128194;</div>
                          <p className="file-upload-text">Click to browse files</p>
                          <p className="file-upload-hint">TXT, DOCX, CSV supported</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSelectedProposalType(null)}
                      disabled={proposalLoading}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary" disabled={proposalLoading}>
                      {proposalLoading ? 'Generating...' : 'Generate Proposal'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default DashboardPage
