'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showConfirm } from '../../utils/confirmModal';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green' };
const STATUS_LABELS = { 1: 'New', 2: 'On-Going', 3: 'Resolved' };

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

export default function AdminDashboard() {
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ new: 0, inProgress: 0, closed: 0 });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const userRole = getStored('userRole');
  const userProgram = getStored('userProgram');
  const isSubAdmin = userRole === 'SubAdmin';
  const isSuperAdmin = userRole === 'SuperAdmin';

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined') {
      setLoading(false);
      setLoadingMessages(false);
      return;
    }
    const api = window.TicketAPI;

    Promise.all([
      api.getAdminAnalytics ? api.getAdminAnalytics() : Promise.resolve({}),
      api.getAdminAllTickets ? api.getAdminAllTickets(1, 10) : api.getAdminFilteredTickets ? api.getAdminFilteredTickets({ pageIndex: 1, pageSize: 10 }) : Promise.resolve({ data: [], Data: [] }),
    ])
      .then(([analyticsRes, ticketsRes]) => {
        const a = analyticsRes || {};
        const byStatus = a.ticketsByStatus ?? a.TicketsByStatus ?? {};
        const dist = byStatus.distribution ?? byStatus.Distribution ?? {};
        setStats({
          new: dist['New'] ?? dist['1'] ?? 0,
          inProgress: dist['InProgress'] ?? dist['2'] ?? 0,
          closed: dist['Closed'] ?? dist['3'] ?? 0,
        });
        const data = ticketsRes?.data ?? ticketsRes?.Data ?? [];
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));

    if (api.getAdminMessages) {
      api.getAdminMessages(1, 10)
        .then((res) => {
          const data = res?.data ?? res?.Data ?? [];
          setMessages(Array.isArray(data) ? data : []);
        })
        .catch(() => {})
        .finally(() => setLoadingMessages(false));
    } else {
      setLoadingMessages(false);
    }

  }, []);

  const handleDeleteTickets = () => {
    showConfirm({
      title: 'Delete all tickets?',
      message: 'Bulk delete is not supported by the API. You can delete tickets individually from the ticket detail page.',
      confirmText: 'OK',
      cancelText: 'Cancel',
    }).then(() => {});
  };

  const getStatusClass = (s) => STATUS_MAP[s] ?? 'blue';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        {isSubAdmin && userProgram && (
          <span style={{
            fontSize: '0.85rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6,
            background: '#20c997', color: '#fff',
          }}>
            Program: {userProgram}
          </span>
        )}
        {isSuperAdmin && (
          <span style={{
            fontSize: '0.85rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6,
            background: '#6f42c1', color: '#fff',
          }}>
            SuperAdmin — All Programs
          </span>
        )}
      </div>
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}

      {/* Stat Cards */}
      <div className="stat-cards">
        <Link href="/administrator/tickets?status=new" className="stat-card teal">
          <div className="stat-card-value">{stats.new}</div>
          <div className="stat-card-label">New Ticket</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
        </Link>
        <Link href="/administrator/tickets?status=ongoing" className="stat-card yellow">
          <div className="stat-card-value">{stats.inProgress}</div>
          <div className="stat-card-label">In Progress</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
        </Link>
        <Link href="/administrator/tickets?status=resolved" className="stat-card pink">
          <div className="stat-card-value">{stats.closed}</div>
          <div className="stat-card-label">Closed</div>
          <span className="stat-card-link">View entire list</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="section-heading">Quick Actions</h2>
      <div className="stat-cards">
        <Link href="/administrator/add-subject" className="stat-card purple">
          <div className="stat-card-value"><i className="fas fa-book-open"></i></div>
          <div className="stat-card-label">إضافة مادة جديدة</div>
          <span className="stat-card-link">Add new subject</span>
          <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-plus"></i></div>
        </Link>
      </div>

      {/* Admin Messages */}
      <h2 className="section-heading" style={{ marginTop: 24 }}>
        <i className="fas fa-comments" style={{ marginRight: 8 }}></i>
        My Messages
      </h2>
      <div className="detail-card">
        {loadingMessages ? (
          <p style={{ padding: 12 }}><i className="fas fa-spinner fa-spin"></i> Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: '#666', padding: 12 }}>No messages yet. Messages from tickets you've replied to will appear here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {messages.map((m) => {
              const msgId = m.messageId ?? m.MessageId ?? m.id ?? m.Id;
              const body = m.body ?? m.Body ?? '';
              const sentAt = m.sentAt ?? m.SentAt;
              const senderName = m.senderName ?? m.SenderName ?? '';
              const senderId = m.senderId ?? m.SenderId ?? '';
              const ticketId = m.ticketId ?? m.TicketId ?? '';
              const ticketTitle = m.ticketTitle ?? m.TicketTitle ?? '';
              const studentName = m.studentName ?? m.StudentName ?? '';
              const adminId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : '';
              const isOwnMessage = senderId === adminId;
              return (
                <div key={msgId} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  background: isOwnMessage ? '#f8f9fa' : '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&size=24&background=${isOwnMessage ? '6f42c1' : '20c997'}&color=fff`} alt="" style={{ borderRadius: '50%', width: 24, height: 24 }} />
                      <strong style={{ fontSize: '0.9rem' }}>{senderName}</strong>
                      {isOwnMessage && <span style={{ fontSize: '0.75rem', background: '#6f42c1', color: '#fff', padding: '1px 6px', borderRadius: 4 }}>You</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{timeAgo(sentAt)}</span>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#333' }}>{body.length > 120 ? body.slice(0, 120) + '...' : body}</p>
                  <Link href={`/administrator/ticket/${ticketId}`} style={{ fontSize: '0.8rem', color: '#0d6efd' }}>
                    <i className="fas fa-ticket-alt"></i> {ticketTitle || ticketId} — {studentName}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <h2 className="section-heading" style={{ marginTop: 24 }}>Recent Tickets</h2>
      <div className="ticket-list">
        {tickets.length === 0 ? (
          <p style={{ color: '#666', padding: 16 }}>No tickets.</p>
        ) : (
          tickets.map((t) => {
            const id = t.id ?? t.Id ?? '';
            const title = t.title ?? t.Title ?? 'No subject';
            const body = t.body ?? t.Body ?? '';
            const status = t.status ?? t.Status ?? 1;
            const studentName = t.studentName ?? t.StudentName ?? 'Student';
            const doctorName = t.doctorName ?? t.DoctorName ?? 'Dr.';
            const createdAt = t.createdAt ?? t.CreatedAt;
            return (
              <article key={id} className="ticket-card">
                <div className="ticket-card-header">
                  <span className={`ticket-status-dot ${getStatusClass(status)}`}></span>
                  <span className="ticket-id">Ticket# {id}</span>
                  <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                </div>
                <h2 className="ticket-subject">{title}</h2>
                <p className="ticket-preview">{body?.slice(0, 80)}{body?.length > 80 ? '...' : ''}</p>
                <div className="ticket-card-footer">
                  <div className="ticket-responder">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&size=28`} alt="" className="ticket-responder-avatar" />
                    From {studentName} to {doctorName}
                  </div>
                  <Link href={`/administrator/ticket/${id}`} className="btn-link">Open Ticket</Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="detail-card danger-card">
        <div>
          <div className="danger-card-title"><i className="fas fa-info-circle"></i> Delete all Tickets Data</div>
          <p className="danger-card-note">Bulk delete is not supported. Delete tickets individually from the ticket list.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn-danger" onClick={handleDeleteTickets} disabled={deleting}>
            <i className="fas fa-info-circle"></i> Info
          </button>
        </div>
      </div>
    </>
  );
}
