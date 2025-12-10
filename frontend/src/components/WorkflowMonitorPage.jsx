import { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './Dashboard.css'

function WorkflowMonitorPage() {
  const [activeTab, setActiveTab] = useState('projects')
  const [showPastProjects, setShowPastProjects] = useState(false)
  const [activeProjectsCount] = useState(0) // TODO: Replace with actual count from API
  const [pastProjectsCount] = useState(0) // TODO: Replace with actual count from API

  return (
    <DashboardLayout title="Workflow Monitor">
      <div className="dashboard-tabs">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Active/Current Projects
        </button>
        <button
          type="button"
          className={`dashboard-tab ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          TO-DO
        </button>
      </div>

      <div className="content-card">
        <div className="content-card-header">
          <h2 className="content-card-title">
            {activeTab === 'todo' ? 'TO-DO' : 'Active/Current Projects'}
          </h2>
          {activeTab === 'projects' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowPastProjects(!showPastProjects)}
              disabled={pastProjectsCount === 0}
            >
              {showPastProjects ? 'Hide Past Projects' : 'View Past Projects'}
            </button>
          )}
        </div>

        <div className="content-card-body">
          {activeTab === 'todo' ? (
            <div className="empty-state">
              <h3 className="empty-state-title">No tasks yet</h3>
              <p className="empty-state-text">Your to-do items will appear here.</p>
            </div>
          ) : (
            <>
              <div className="projects-count">
                <span className="projects-count-label">No. of Active Projects - </span>
                <span className="projects-count-number">{activeProjectsCount}</span>
              </div>
              <div className="empty-state">
                <h3 className="empty-state-title">No active projects</h3>
                <p className="empty-state-text">Your active projects will appear here.</p>
              </div>
              {showPastProjects && (
                <div className="past-projects-section" style={{ marginTop: '32px' }}>
                  <h3 className="section-title">Past Projects</h3>
                  <div className="empty-state">
                    <h3 className="empty-state-title">No past projects</h3>
                    <p className="empty-state-text">Your completed projects will appear here.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default WorkflowMonitorPage
