'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../../styles/dashboard.css';
import { showToast, showConfirm } from '../../utils/toast';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green' };

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

/* ─── Collapsible Section Component ─────────────────────────────── */
function CollapsibleSection({ title, icon, iconColor, defaultOpen = false, onOpen, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(defaultOpen);
  const calledRef = useRef(false);

  // لو القسم مفتوح افتراضياً، استدعي onOpen مرة واحدة عند الـ mount
  useEffect(() => {
    if (defaultOpen && !calledRef.current) {
      calledRef.current = true;
      if (onOpen) onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !calledRef.current) {
      calledRef.current = true;
      setLoaded(true);
      if (onOpen) onOpen();
    }
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header — clickable row */}
      <button
        type="button"
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          background: open ? '#faf8ff' : '#fff',
          border: '1px solid #e9ecef',
          borderRadius: open ? '12px 12px 0 0' : 12,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease, border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {icon && <i className={icon} style={{ color: iconColor || '#6f42c1', fontSize: '1rem', width: 20, textAlign: 'center' }} />}
        <span style={{ flex: 1, fontWeight: 600, fontSize: '1.05rem', color: '#212529' }}>{title}</span>
        {badge !== undefined && badge !== null && (
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, minWidth: 22, height: 22,
            background: '#6f42c1', color: '#fff', borderRadius: 11,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
          }}>{badge}</span>
        )}
        <i
          className="fas fa-chevron-down"
          style={{
            fontSize: '0.85rem', color: '#6c757d', marginLeft: 4,
            transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Body — CSS Grid trick: grid-template-rows: 0fr → 1fr gives perfect smooth collapse */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        background: '#fff',
        border: '1px solid #e9ecef',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        boxShadow: open ? '0 2px 6px rgba(0,0,0,0.07)' : 'none',
        transition: 'grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
      }}>
        {/* overflow:hidden على الchild الداخلي هو سر الـ trick */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px 20px',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(-8px)',
            transition: open
              ? 'opacity 0.28s ease 0.05s, transform 0.28s ease 0.05s'
              : 'opacity 0.18s ease, transform 0.18s ease',
          }}>
            {loaded ? children : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats] = useState({ new: 0, inProgress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lazy states — null = not fetched yet
  const [tickets, setTickets] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsTotalPages, setTicketsTotalPages] = useState(1);

  const [messages, setMessages] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [myDoctorTickets, setMyDoctorTickets] = useState(null);
  const [loadingMyTickets, setLoadingMyTickets] = useState(false);
  const [myTicketsPage, setMyTicketsPage] = useState(1);
  const [myTicketsTotalPages, setMyTicketsTotalPages] = useState(1);

  const userRole = getStored('userRole');
  const userProgram = getStored('userProgram');
  const isSubAdmin = userRole === 'SubAdmin';
  const isSuperAdmin = userRole === 'SuperAdmin';

  // Only load stat cards on mount (lightweight)
  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined') {
      setLoading(false);
      return;
    }
    const api = window.TicketAPI;
    const storedPeriod = localStorage.getItem('dashboardPeriod') || '90';
    const periodParam = storedPeriod === 'all' ? null : parseInt(storedPeriod, 10);

    const analyticsCall = api.getAdminAnalytics ? api.getAdminAnalytics(periodParam) : Promise.resolve({});
    analyticsCall
      .then((analyticsRes) => {
        const a = analyticsRes || {};
        const byStatus = a.ticketsByStatus ?? a.TicketsByStatus ?? {};
        const dist = byStatus.distribution ?? byStatus.Distribution ?? {};
        setStats({
          new: dist['New'] ?? dist['1'] ?? 0,
          inProgress: dist['InProgress'] ?? dist['2'] ?? 0,
          closed: dist['Closed'] ?? dist['3'] ?? 0,
        });
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  /* Lazy loaders — called when user opens the section */
  function loadMyTickets(page = 1) {
    if (typeof window.TicketAPI === 'undefined') return;
    // لو أول تحميل والداتا موجودة، متبعتش
    if (page === 1 && myDoctorTickets !== null) return;
    const api = window.TicketAPI;
    setLoadingMyTickets(true);
    const call = api.getAdminMyDoctorTickets
      ? api.getAdminMyDoctorTickets(page, 10, 1) // status=1 => New only
      : Promise.resolve([]);
    call
      .then((res) => {
        const data = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        setMyDoctorTickets(Array.isArray(data) ? data : []);
        const pages = res?.totalPages ?? res?.TotalPages ?? 1;
        setMyTicketsTotalPages(pages);
        setMyTicketsPage(page);
      })
      .catch(() => setMyDoctorTickets([]))
      .finally(() => setLoadingMyTickets(false));
  }

  function loadMessages() {
    if (typeof window.TicketAPI === 'undefined' || messages !== null) return;
    const api = window.TicketAPI;
    setLoadingMessages(true);
    const call = api.getAdminMessages ? api.getAdminMessages(1, 10) : Promise.resolve([]);
    call
      .then((res) => {
        const data = res?.data ?? res?.Data ?? [];
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }

  function loadRecentTickets(page = 1) {
    if (typeof window.TicketAPI === 'undefined') return;
    if (page === 1 && tickets !== null) return;
    const api = window.TicketAPI;
    setLoadingTickets(true);
    const call = api.getAdminAllTickets
      ? api.getAdminAllTickets(page, 10)
      : api.getAdminFilteredTickets
        ? api.getAdminFilteredTickets({ pageIndex: page, pageSize: 10 })
        : Promise.resolve({ data: [] });
    call
      .then((res) => {
        const data = res?.data ?? res?.Data ?? [];
        setTickets(Array.isArray(data) ? data : []);
        const pages = res?.totalPages ?? res?.TotalPages ?? 1;
        setTicketsTotalPages(pages);
        setTicketsPage(page);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }

  const getStatusClass = (s) => STATUS_MAP[s] ?? 'blue';

  const handleDeleteTickets = () => {
    showConfirm({
      title: 'Delete all tickets?',
      message: 'Bulk delete is not supported by the API. You can delete tickets individually from the ticket detail page.',
      confirmText: 'OK',
      cancelText: 'Cancel',
    }).then(() => { });
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        {isSubAdmin && userProgram && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6, background: '#20c997', color: '#fff' }}>
            Program: {userProgram}
          </span>
        )}
        {isSuperAdmin && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6, background: '#6f42c1', color: '#fff' }}>
            SuperAdmin — All Programs
          </span>
        )}
      </div>

      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}

      {/* Stat Cards */}
      <div className="stat-cards" style={{ marginBottom: 28 }}>
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

      {/* ── Collapsible Sections ── */}

      {/* My Tickets */}
      <CollapsibleSection
        title="My Tickets"
        icon="fas fa-chalkboard-teacher"
        iconColor="#6f42c1"
        defaultOpen={true}
        onOpen={loadMyTickets}
      >
        {loadingMyTickets ? (
          <p style={{ color: '#888', padding: '4px 0' }}><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading...</p>
        ) : !myDoctorTickets || myDoctorTickets.length === 0 ? (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              <i className="fas fa-info-circle" style={{ marginRight: 8, color: '#6f42c1' }} /> No tickets yet
            </div>
            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
              You are not assigned to any subject as a doctor. Use{' '}
              <Link href="/administrator/add-course" style={{ color: '#6f42c1' }}>Assign Subjects to Doctor</Link>
              {' '}to assign yourself and start seeing tickets here.
            </p>
          </div>
        ) : (
          <div className="ticket-list">
            {myDoctorTickets.map((t) => {
              const id = t.id ?? t.Id ?? '';
              const title = t.title ?? t.Title ?? 'No subject';
              const body = t.body ?? t.Body ?? '';
              const status = t.status ?? t.Status ?? 1;
              const studentName = t.studentName ?? t.StudentName ?? 'Student';
              const subjectName = t.subjectName ?? t.SubjectName ?? '';
              const createdAt = t.createdAt ?? t.CreatedAt;
              const isHighPriority = t.isHighPriority ?? t.IsHighPriority ?? false;
              return (
                <article key={id} className="ticket-card">
                  <div className="ticket-card-header">
                    <span className={`ticket-status-dot ${getStatusClass(status)}`}></span>
                    <span className="ticket-id">Ticket# {id}</span>
                    {isHighPriority && <span className="ticket-status-label red">High Priority</span>}
                    <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                  </div>
                  <h2 className="ticket-subject">{title}</h2>
                  <p className="ticket-preview">{body?.slice(0, 80)}{body?.length > 80 ? '...' : ''}</p>
                  <div className="ticket-card-footer">
                    <div className="ticket-responder">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&size=28`} alt="" className="ticket-responder-avatar" />
                      From {studentName}{subjectName ? ` · ${subjectName}` : ''}
                    </div>
                    <Link href={`/administrator/ticket/${id}`} className="btn-link">Open Ticket</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {myTicketsTotalPages > 1 && !loadingMyTickets && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => loadMyTickets(myTicketsPage - 1)}
              disabled={myTicketsPage <= 1}
              style={{
                padding: '7px 14px', borderRadius: 7, border: '1px solid #dee2e6',
                background: '#fff', color: myTicketsPage <= 1 ? '#adb5bd' : '#6f42c1',
                cursor: myTicketsPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem',
              }}
            >
              <i className="fas fa-chevron-left" style={{ marginRight: 4 }} /> Prev
            </button>

            <span style={{ fontSize: '0.9rem', color: '#495057', fontWeight: 500, padding: '0 8px' }}>
              Page {myTicketsPage} / {myTicketsTotalPages}
            </span>

            <button
              type="button"
              onClick={() => loadMyTickets(myTicketsPage + 1)}
              disabled={myTicketsPage >= myTicketsTotalPages}
              style={{
                padding: '7px 14px', borderRadius: 7, border: '1px solid #dee2e6',
                background: '#fff', color: myTicketsPage >= myTicketsTotalPages ? '#adb5bd' : '#6f42c1',
                cursor: myTicketsPage >= myTicketsTotalPages ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem',
              }}
            >
              Next <i className="fas fa-chevron-right" style={{ marginLeft: 4 }} />
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* My Messages */}
      <CollapsibleSection
        title="My Messages"
        icon="fas fa-comments"
        iconColor="#20c997"
        onOpen={loadMessages}
      >
        {loadingMessages ? (
          <p style={{ padding: 4 }}><i className="fas fa-spinner fa-spin"></i> Loading messages...</p>
        ) : !messages || messages.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>No messages yet. Messages from tickets you've replied to will appear here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '0 -20px' }}>
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
                  padding: '12px 20px',
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
      </CollapsibleSection>

      {/* Recent Tickets */}
      <CollapsibleSection
        title="Recent Tickets"
        icon="fas fa-ticket-alt"
        iconColor="#fd7e14"
        onOpen={loadRecentTickets}
      >
        {loadingTickets ? (
          <p style={{ color: '#888', padding: '4px 0' }}><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading...</p>
        ) : !tickets || tickets.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>No tickets.</p>
        ) : (
          <div className="ticket-list">
            {tickets.map((t) => {
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
            })}
          </div>
        )}

        {/* Pagination */}
        {ticketsTotalPages > 1 && !loadingTickets && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => loadRecentTickets(ticketsPage - 1)}
              disabled={ticketsPage <= 1}
              style={{
                padding: '7px 14px', borderRadius: 7, border: '1px solid #dee2e6',
                background: '#fff', color: ticketsPage <= 1 ? '#adb5bd' : '#6f42c1',
                cursor: ticketsPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem',
              }}
            >
              <i className="fas fa-chevron-left" style={{ marginRight: 4 }} /> Prev
            </button>

            <span style={{ fontSize: '0.9rem', color: '#495057', fontWeight: 500, padding: '0 8px' }}>
              Page {ticketsPage} / {ticketsTotalPages}
            </span>

            <button
              type="button"
              onClick={() => loadRecentTickets(ticketsPage + 1)}
              disabled={ticketsPage >= ticketsTotalPages}
              style={{
                padding: '7px 14px', borderRadius: 7, border: '1px solid #dee2e6',
                background: '#fff', color: ticketsPage >= ticketsTotalPages ? '#adb5bd' : '#6f42c1',
                cursor: ticketsPage >= ticketsTotalPages ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.9rem',
              }}
            >
              Next <i className="fas fa-chevron-right" style={{ marginLeft: 4 }} />
            </button>
          </div>
        )}
      </CollapsibleSection>
      {isSuperAdmin && (
        <div className="detail-card danger-card" style={{ marginTop: 16 }}>
          <div>
            <div className="danger-card-title"><i className="fas fa-info-circle"></i> Delete all Tickets Data</div>
            <p className="danger-card-note">Bulk delete is not supported. Delete tickets individually from the ticket list.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" className="btn-danger" onClick={handleDeleteTickets}>
              <i className="fas fa-info-circle"></i> Info
            </button>
          </div>
        </div>
      )}
    </>
  );
}
