import { useState } from 'react';
import { Link } from 'react-router-dom';
import { showConfirm } from '../../utils/confirmModal';

export default function AdminDashboard() {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteTickets = () => {
    showConfirm({
      title: 'Delete all tickets?',
      message: 'Delete all tickets data? This cannot be undone. Users will be kept.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    }).then((ok) => {
      if (!ok) return;
      setDeleting(true);
      if (window.TicketAPI && window.TicketAPI.deleteAllTickets) {
        window.TicketAPI.deleteAllTickets().finally(() => setDeleting(false));
      } else setDeleting(false);
    });
  };

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="stat-cards">
        <Link to="/administrator/tickets?status=new" className="stat-card teal">
          <div className="stat-card-value">20</div>
          <div className="stat-card-label">New Ticket</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
        </Link>
        <Link to="/administrator/tickets?status=ongoing" className="stat-card yellow">
          <div className="stat-card-value">750</div>
          <div className="stat-card-label">In Progress</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
        </Link>
        <Link to="/administrator/tickets?status=resolved" className="stat-card pink">
          <div className="stat-card-value">150</div>
          <div className="stat-card-label">Closed</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
        </Link>
      </div>
      <h2 className="section-heading">My Tickets</h2>
      <div className="ticket-list">
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot blue"></span>
            <span className="ticket-id">Ticket# 2023-AD123</span>
            <span className="ticket-time">Posted at 12:45 AM</span>
          </div>
          <h2 className="ticket-subject">How to deposit money to my portal?</h2>
          <p className="ticket-preview">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=Ahmed+Mohamed&size=28" alt="" className="ticket-responder-avatar" />
              From Ahmed Mohamed to Dr. Mohamed
            </div>
            <Link to="/administrator/ticket/2023-AD123" className="btn-link">Open Ticket</Link>
          </div>
        </article>
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot orange"></span>
            <span className="ticket-id">Ticket# 2023-CS123</span>
            <span className="ticket-time">Posted at 10:30 AM</span>
          </div>
          <h2 className="ticket-subject">Course material access</h2>
          <p className="ticket-preview">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=John+Snow&size=28" alt="" className="ticket-responder-avatar" />
              From John Snow to Dr. Mohamed
            </div>
            <Link to="/administrator/ticket/2023-CS123" className="btn-link">Open Ticket</Link>
          </div>
        </article>
      </div>
      <div className="detail-card danger-card">
        <div>
          <div className="danger-card-title"><i className="fas fa-info-circle"></i> Delete all Tickets Data</div>
          <p className="danger-card-note">Ensure: Delete Include All Data <span className="except">Except Users</span></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="danger-card-meta">Created At 22-11-2024</span>
          <button type="button" className="btn-danger" onClick={handleDeleteTickets} disabled={deleting}>
            <i className="fas fa-trash-alt"></i> Delete Tickets
          </button>
        </div>
      </div>
    </>
  );
}
