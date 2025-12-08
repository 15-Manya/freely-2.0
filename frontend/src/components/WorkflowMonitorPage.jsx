import DashboardLayout from './DashboardLayout'
import './Dashboard.css'

function WorkflowMonitorPage() {
  return (
    <DashboardLayout title="Workflow Monitor">
      <div className="content-card">
        <div className="content-card-header">
          <h2 className="content-card-title">Workflow Monitor</h2>
        </div>
        <div className="content-card-body">
          <div className="empty-state">
            <div className="empty-state-icon">&#128200;</div>
            <h3 className="empty-state-title">Coming Soon</h3>
            <p className="empty-state-text">Monitor your workflows and track progress in real-time.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default WorkflowMonitorPage
