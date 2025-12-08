import DashboardLayout from './DashboardLayout'
import './Dashboard.css'

function InvoiceManagerPage() {
  return (
    <DashboardLayout title="Invoice Manager">
      <div className="content-card">
        <div className="content-card-header">
          <h2 className="content-card-title">Invoice Manager</h2>
        </div>
        <div className="content-card-body">
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <h3 className="empty-state-title">Coming Soon</h3>
            <p className="empty-state-text">Create and manage invoices for your freelance projects.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InvoiceManagerPage
