export default function AdminAnalysis() {
  return (
    <>
      <h1 className="page-title">Analysis</h1>
      <div className="detail-card">
        <h2 className="section-title">Ticket Statistics</h2>
        <p className="section-desc">Overview of tickets by status (placeholder – connect to your API for real data).</p>
        <div className="stat-cards">
          <div className="stat-card teal">
            <div className="stat-card-value">20</div>
            <div className="stat-card-label">New</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-card-value">750</div>
            <div className="stat-card-label">In Progress</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
          </div>
          <div className="stat-card pink">
            <div className="stat-card-value">150</div>
            <div className="stat-card-label">Closed</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
          </div>
        </div>
      </div>
    </>
  );
}
