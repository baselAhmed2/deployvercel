'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green' };
const STATUS_LABELS = { 1: 'New', 2: 'On-Going', 3: 'Resolved' };

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ newTickets: 0, inProgressTickets: 0, closedTickets: 0, totalTickets: 0 });
  const [highPriorityTickets, setHighPriorityTickets] = useState([]);
  const [normalTickets, setNormalTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined') {
      setLoading(false);
      return;
    }
    const api = window.TicketAPI;
    Promise.all([
      api.getDoctorStats ? api.getDoctorStats() : Promise.resolve({}),
      api.getDoctorTickets ? api.getDoctorTickets(1, 50) : Promise.resolve({ data: [], Data: [] }),
    ])
      .then(([statsRes, ticketsRes]) => {
        const s = statsRes || {};
        setStats({
          newTickets: s.newTickets ?? s.NewTickets ?? 0,
          inProgressTickets: s.inProgressTickets ?? s.InProgressTickets ?? 0,
          closedTickets: s.closedTickets ?? s.ClosedTickets ?? 0,
          totalTickets: s.totalTickets ?? s.TotalTickets ?? 0,
        });
        const data = ticketsRes?.data ?? ticketsRes?.Data ?? [];
        const items = Array.isArray(data) ? data : [];
        const highPriority = items.filter((t) => t.isHighPriority ?? t.IsHighPriority);
        const normal = items.filter((t) => !(t.isHighPriority ?? t.IsHighPriority));
        setHighPriorityTickets(highPriority);
        setNormalTickets(normal);
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (s) => STATUS_MAP[s] ?? 'blue';
  const getStatusLabel = (s) => STATUS_LABELS[s] ?? 'New';

  if (loading) {
    return (
      <>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      <div className="stat-cards">
        <Link href="/doctor/tickets?status=new" className="stat-card teal">
          <div className="stat-card-value">{stats.newTickets}</div>
          <div className="stat-card-label">New Ticket</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
        </Link>
        <Link href="/doctor/tickets?status=ongoing" className="stat-card yellow">
          <div className="stat-card-value">{stats.inProgressTickets}</div>
          <div className="stat-card-label">In Progress</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
        </Link>
        <Link href="/doctor/tickets?status=resolved" className="stat-card pink">
          <div className="stat-card-value">{stats.closedTickets}</div>
          <div className="stat-card-label">Closed</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
        </Link>
      </div>
      <h2 className="section-heading">High Priority Tickets</h2>
      <div className="ticket-list">
        {highPriorityTickets.length === 0 ? (
          <p style={{ color: '#666', padding: 16 }}>No high priority tickets.</p>
        ) : (
          highPriorityTickets.map((t) => {
            const id = t.id ?? t.Id ?? '';
            const title = t.title ?? t.Title ?? 'No subject';
            const body = t.body ?? t.Body ?? '';
            const status = t.status ?? t.Status ?? 1;
            const studentName = t.studentName ?? t.StudentName ?? 'Student';
            const createdAt = t.createdAt ?? t.CreatedAt;
            return (
              <article key={id} className="ticket-card">
                <div className="ticket-card-header">
                  <span className={`ticket-status-dot ${getStatusClass(status)}`}></span>
                  <span className="ticket-id">Ticket# {id}</span>
                  <span className="ticket-status-label red">High Priority</span>
                  <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                </div>
                <h2 className="ticket-subject">{title}</h2>
                <p className="ticket-preview">{body?.slice(0, 80)}{body?.length > 80 ? '...' : ''}</p>
                <div className="ticket-card-footer">
                  <div className="ticket-responder">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&size=28`} alt="" className="ticket-responder-avatar" />
                    From Student {studentName}
                  </div>
                  <Link href={`/doctor/ticket/${id}`} className="btn-link">Open Ticket</Link>
                </div>
              </article>
            );
          })
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
        <Link
          href="/doctor/tickets"
          className="btn-primary"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 28px', borderRadius: 10, fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          <i className="fas fa-list-ul" />
          View All Tickets
        </Link>
      </div>
      {normalTickets.length > 0 && (
        <>
          <h2 className="section-heading" style={{ marginTop: 24 }}>{highPriorityTickets.length > 0 ? 'Other Tickets' : 'Tickets'}</h2>
          <div className="ticket-list">
            {normalTickets.map((t) => {
              const id = t.id ?? t.Id ?? '';
              const title = t.title ?? t.Title ?? 'No subject';
              const body = t.body ?? t.Body ?? '';
              const status = t.status ?? t.Status ?? 1;
              const studentName = t.studentName ?? t.StudentName ?? 'Student';
              const createdAt = t.createdAt ?? t.CreatedAt;
              return (
                <article key={id} className="ticket-card">
                  <div className="ticket-card-header">
                    <span className={`ticket-status-dot ${getStatusClass(status)}`}></span>
                    <span className="ticket-id">Ticket# {id}</span>
                    <span className={`ticket-status-label ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
                    <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                  </div>
                  <h2 className="ticket-subject">{title}</h2>
                  <p className="ticket-preview">{body?.slice(0, 80)}{body?.length > 80 ? '...' : ''}</p>
                  <div className="ticket-card-footer">
                    <div className="ticket-responder">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&size=28`} alt="" className="ticket-responder-avatar" />
                      From Student {studentName}
                    </div>
                    <Link href={`/doctor/ticket/${id}`} className="btn-link">Open Ticket</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
