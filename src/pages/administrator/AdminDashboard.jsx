import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showConfirm } from '../../utils/confirmModal';
import { TicketAPI } from '../../api';

const STATUS_DOT = { New: 'blue', InProgress: 'orange', Closed: 'green' };
const STATUS_LABEL = { 0: 'New', 1: 'InProgress', 2: 'Closed' };

export default function AdminDashboard() {
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ newTickets: 0, inProgressTickets: 0, closedTickets: 0, totalTickets: 0 });
  const [myTickets, setMyTickets] = useState(null); // null = loading

  useEffect(() => {
    // Load stats & my doctor tickets in parallel
    Promise.all([
      TicketAPI.getMyDoctorTickets(1, 5),
    ])
      .then(([ticketsRes]) => {
        const tickets = Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.data ?? [];
        setMyTickets(tickets);

        // Compute mini stats from the tickets list (fallback when no dedicated stats endpoint)
        const newCount = tickets.filter((t) => (t.status === 0 || t.status === 'New')).length;
        const inProgress = tickets.filter((t) => (t.status === 1 || t.status === 'InProgress')).length;
        const closed = tickets.filter((t) => (t.status === 2 || t.status === 'Closed')).length;
        setStats({ newTickets: newCount, inProgressTickets: inProgress, closedTickets: closed, totalTickets: tickets.length });
      })
      .catch(() => setMyTickets([]));
  }, []);

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

  const statusDot = (ticket) => {
    const s = typeof ticket.status === 'number' ? STATUS_LABEL[ticket.status] : ticket.status;
    return STATUS_DOT[s] ?? 'blue';
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="stat-cards">
        <Link to="/administrator/tickets?status=new" className="stat-card teal">
          <div className="stat-card-value">{stats.newTickets}</div>
          <div className="stat-card-label">New Ticket</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
        </Link>
        <Link to="/administrator/tickets?status=ongoing" className="stat-card yellow">
          <div className="stat-card-value">{stats.inProgressTickets}</div>
          <div className="stat-card-label">In Progress</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
        </Link>
        <Link to="/administrator/tickets?status=resolved" className="stat-card pink">
          <div className="stat-card-value">{stats.closedTickets}</div>
          <div className="stat-card-label">Closed</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
        </Link>
      </div>

      <h2 className="section-heading">My Tickets</h2>

      {myTickets === null ? (
        <p style={{ color: 'var(--text-muted,#888)', marginTop: '1rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading…
        </p>
      ) : myTickets.length === 0 ? (
        <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              <i className="fas fa-info-circle" style={{ marginRight: 8, color: '#6f42c1' }} />
              No tickets yet
            </div>
            <p style={{ color: 'var(--text-muted,#888)', margin: 0 }}>
              You are not assigned to any subject as a doctor.{' '}
              <Link to="/administrator/assign-to-doctor" style={{ color: '#6f42c1' }}>
                Assign yourself to a subject
              </Link>{' '}
              to start seeing tickets here.
            </p>
          </div>
        </div>
      ) : (
        <div className="ticket-list">
          {myTickets.map((ticket) => (
            <article key={ticket.id} className="ticket-card">
              <div className="ticket-card-header">
                <span className={`ticket-status-dot ${statusDot(ticket)}`}></span>
                <span className="ticket-id">Ticket# {ticket.id}</span>
                {ticket.isHighPriority && (
                  <span className="ticket-status-label red">High Priority</span>
                )}
                <span className="ticket-time">Posted at {formatTime(ticket.createdAt)}</span>
              </div>
              <h2 className="ticket-subject">{ticket.title}</h2>
              <p className="ticket-preview">{ticket.body}</p>
              <div className="ticket-card-footer">
                <div className="ticket-responder">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.studentName || 'Student')}&size=28`}
                    alt=""
                    className="ticket-responder-avatar"
                  />
                  From {ticket.studentName || 'Student'} · {ticket.subjectName}
                </div>
                <Link to={`/administrator/ticket/${ticket.id}`} className="btn-link">Open Ticket</Link>
              </div>
            </article>
          ))}
        </div>
      )}

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

