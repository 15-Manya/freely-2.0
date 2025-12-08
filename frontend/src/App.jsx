import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import DashboardPage from './components/DashboardPage'
import WorkflowMonitorPage from './components/WorkflowMonitorPage'
import InvoiceManagerPage from './components/InvoiceManagerPage'
import RiskAnalysisReportPage from './components/RiskAnalysisReportPage'
import ProposalReportPage from './components/ProposalReportPage'
import './App.css'

function AppRoutes() {
  const { currentUser } = useAuth()

  return (
    <Routes>
      {/* Landing page: if logged in -> dashboard (home), else signup */}
      <Route
        path="/"
        element={currentUser ? <DashboardPage /> : <SignUp />}
      />

      {/* Login page: redirect logged-in users to dashboard */}
      <Route
        path="/login"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <SignIn />
        }
      />

      {/* Main application pages */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route
        path="/workflow-monitor"
        element={currentUser ? <WorkflowMonitorPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/invoice-manager"
        element={currentUser ? <InvoiceManagerPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/risk-analysis/:analysisId"
        element={currentUser ? <RiskAnalysisReportPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/proposal/:proposalId"
        element={currentUser ? <ProposalReportPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

