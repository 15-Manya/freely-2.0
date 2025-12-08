import { auth } from '../config/firebase'

const API_BASE_URL = '/api'

async function getIdToken(forceRefresh = false) {
  try {
    const user = auth.currentUser
    if (!user) {
      console.warn('No current user found when trying to get ID token')
      return null
    }
    // Force refresh to get a fresh token (especially after sign-in)
    const token = await user.getIdToken(forceRefresh)
    
    // Debug: Log token info (first 50 chars only for security)
    if (forceRefresh) {
      console.log('Token refreshed. Preview:', token ? `${token.substring(0, 50)}...` : 'null')
      console.log('User UID:', user.uid)
      console.log('Project ID from env:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
    }
    
    return token
  } catch (error) {
    console.error('Error getting ID token:', error)
    return null
  }
}

export async function apiRequest(path, options = {}, retryCount = 0) {
  // Force refresh token on first attempt (ensures fresh token after sign-in)
  const token = await getIdToken(retryCount === 0)

  if (!token) {
    throw new Error('Authentication required. Please sign in again.')
  }

  const headers = {
    ...(options.headers || {}),
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // If 401 and we haven't retried, try once more with a fresh token
  if (!response.ok && response.status === 401 && retryCount === 0) {
    console.log('Got 401, retrying with fresh token...')
    // Retry with force refresh
    return apiRequest(path, options, retryCount + 1)
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody.detail || response.statusText || 'API request failed'
    const error = new Error(message)
    error.status = response.status
    error.body = errorBody
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// API functions for risk analysis
export async function createRiskAnalysis(formData) {
  return apiRequest('/risk-analysis', {
    method: 'POST',
    body: formData,
  })
}

export async function getRiskAnalyses() {
  return apiRequest('/risk-analysis')
}

export async function getRiskAnalysis(analysisId) {
  return apiRequest(`/risk-analysis/${analysisId}`)
}

export async function deleteRiskAnalysis(analysisId) {
  return apiRequest(`/risk-analysis/${analysisId}`, {
    method: 'DELETE',
  })
}

// API functions for proposals
export async function createProposal(formData) {
  return apiRequest('/proposals', {
    method: 'POST',
    body: formData,
  })
}

export async function getProposals() {
  return apiRequest('/proposals')
}

export async function getProposal(proposalId) {
  return apiRequest(`/proposals/${proposalId}`)
}

export async function deleteProposal(proposalId) {
  return apiRequest(`/proposals/${proposalId}`, {
    method: 'DELETE',
  })
}

export async function updateProposal(proposalId, userChanges, chatFile = null) {
  const formData = new FormData()
  formData.append('user_changes', userChanges)
  
  if (chatFile) {
    formData.append('chat_file', chatFile)
  }
  
  return apiRequest(`/proposals/${proposalId}`, {
    method: 'PATCH',
    body: formData,
  })
}

export async function getProposalHistory(proposalId) {
  return apiRequest(`/proposals/${proposalId}/history`)
}

export async function restoreProposalVersion(proposalId, versionIndex) {
  const formData = new FormData()
  formData.append('version_index', versionIndex.toString())
  
  return apiRequest(`/proposals/${proposalId}/restore`, {
    method: 'POST',
    body: formData,
  })
}

export async function saveEditedProposal(proposalId, formattedProposal) {
  const formData = new FormData()
  formData.append('formatted_proposal', formattedProposal)
  
  return apiRequest(`/proposals/${proposalId}/save`, {
    method: 'PUT',
    body: formData,
  })
}

export async function generateRiskReportFromProposal(proposalId) {
  return apiRequest(`/proposals/${proposalId}/generate-risk-report`, {
    method: 'POST',
  })
}

export async function generateProposalFromRiskAnalysis(analysisId) {
  return apiRequest(`/risk-analysis/${analysisId}/generate-proposal`, {
    method: 'POST',
  })
}


