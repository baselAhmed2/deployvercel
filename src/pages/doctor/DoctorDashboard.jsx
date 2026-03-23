import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="stat-cards">
        <Link to="/doctor/tickets?status=new" className="stat-card teal">
          <div className="stat-card-value">20</div>
          <div className="stat-card-label">New Ticket</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
        </Link>
        <Link to="/doctor/tickets?status=ongoing" className="stat-card yellow">
          <div className="stat-card-value">750</div>
          <div className="stat-card-label">In Progress</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
        </Link>
        <Link to="/doctor/tickets?status=resolved" className="stat-card pink">
          <div className="stat-card-value">150</div>
          <div className="stat-card-label">Closed</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
        </Link>
      </div>
      <h2 className="section-heading">High Priority Tickets</h2>
      <div className="ticket-list">
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot blue"></span>
            <span className="ticket-id">Ticket# 2023-AD123</span>
            <span className="ticket-status-label red">High Priority</span>
            <span className="ticket-time">Posted at 12:45 AM</span>
          </div>
          <h2 className="ticket-subject">How to deposit money to my portal?</h2>
          <p className="ticket-preview">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=Basel+Ahmed&size=28" alt="" className="ticket-responder-avatar" />
              From Student Basel Ahmed
            </div>
            <Link to="/doctor/ticket/2023-AD123" className="btn-link">Open Ticket</Link>
          </div>
        </article>
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot orange"></span>
            <span className="ticket-id">Ticket# 2023-AD456</span>
            <span className="ticket-status-label red">High Priority</span>
            <span className="ticket-time">Posted at 10:30 AM</span>
          </div>
          <h2 className="ticket-subject">Course material access issue</h2>
          <p className="ticket-preview">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=John+Snow&size=28" alt="" className="ticket-responder-avatar" />
              From Student John Snow
            </div>
            <Link to="/doctor/ticket/2023-AD456" className="btn-link">Open Ticket</Link>
          </div>
        </article>
      </div>
    </>
  );
}
