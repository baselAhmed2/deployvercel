'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green', 4: 'red' };
const STATUS_LABELS = { 1: 'Not Replied', 2: 'On-Going', 3: 'Resolved', 4: 'Rejected' };

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function StudentTicketsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPages: 1, totalCount: 0 });

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getMyTickets) {
      setLoading(false);
      setError('API is not available.');
      return;
    }
    setLoading(true);
    setError('');
    window.TicketAPI.getMyTickets(pageParam, 10)
      .then((res) => {
        const data = res?.data ?? res?.Data ?? [];
        const items = Array.isArray(data) ? data : [];
        let filtered = items;
        if (statusFilter === 'not-replied') filtered = items.filter((t) => (t.status ?? t.Status) === 1);
        else if (statusFilter === 'ongoing') filtered = items.filter((t) => (t.status ?? t.Status) === 2);
        else if (statusFilter === 'resolved') filtered = items.filter((t) => (t.status ?? t.Status) === 3);
        else if (statusFilter === 'rejected') filtered = items.filter((t) => (t.status ?? t.Status) === 4);
        setTickets(filtered);
        setPagination({
          pageIndex: res?.pageIndex ?? res?.PageIndex ?? pageParam,
          totalPages: res?.totalPages ?? res?.TotalPages ?? 1,
          totalCount: res?.totalCount ?? res?.TotalCount ?? 0,
        });
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [pageParam, statusFilter]);

  const getStatusClass = (s) => STATUS_MAP[s] ?? 'blue';
  const getStatusLabel = (s) => STATUS_LABELS[s] ?? 'Not Replied';

  const applySearch = (list) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => {
      const title = (t.title ?? t.Title ?? '').toLowerCase();
      const body = (t.body ?? t.Body ?? '').toLowerCase();
      const id = (t.id ?? t.Id ?? '').toLowerCase();
      return title.includes(q) || body.includes(q) || id.includes(q);
    });
  };

  const displayedTickets = applySearch(tickets);

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input
            type="search"
            className="search-input"
            placeholder="Search for ticket."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tickets"
          />
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot blue"></span> Not Replied</span>
          <span className="legend-item"><span className="legend-dot orange"></span> On-Going Tickets</span>
          <span className="legend-item"><span className="legend-dot green"></span> Resolved Tickets</span>
          <span className="legend-item"><span className="legend-dot red"></span> Rejected Tickets</span>
        </div>
        <select className="filter-select" aria-label="Time filter">
          <option>This Week</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
        <Link href="/student/new-ticket" className="btn-primary">
          <i className="fas fa-plus"></i> New Ticket
        </Link>
      </div>
      <div className="tabs">
        <Link href="/student" className={`tab ${!statusFilter ? 'active' : ''}`}><i className="fas fa-envelope"></i> All Tickets</Link>
        <Link href="/student?status=not-replied" className={`tab ${statusFilter === 'not-replied' ? 'active' : ''}`}><i className="fas fa-envelope"></i> Not Replied</Link>
        <Link href="/student?status=ongoing" className={`tab ${statusFilter === 'ongoing' ? 'active' : ''}`}><i className="fas fa-envelope"></i> On-Going</Link>
        <Link href="/student?status=resolved" className={`tab ${statusFilter === 'resolved' ? 'active' : ''}`}><i className="fas fa-check"></i> Resolved</Link>
        <Link href="/student?status=rejected" className={`tab ${statusFilter === 'rejected' ? 'active' : ''}`}><i className="fas fa-ban"></i> Rejected</Link>
      </div>
      {loading && <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>}
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      {!loading && !error && (
        <div className="ticket-list">
          {displayedTickets.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 32, color: '#666' }}>
              {tickets.length === 0 ? 'No tickets yet. ' : 'No tickets match your search. '}
              <Link href="/student/new-ticket" className="btn-link">Create your first ticket</Link>
            </p>
          ) : (
            displayedTickets.map((t) => {
              const id = t.id ?? t.Id ?? '';
              const title = t.title ?? t.Title ?? 'No subject';
              const body = t.body ?? t.Body ?? '';
              const status = t.status ?? t.Status ?? 1;
              const doctorName = t.doctorName ?? t.DoctorName ?? '—';
              const createdAt = t.createdAt ?? t.CreatedAt;
              return (
                <article key={id} className="ticket-card">
                  <div className="ticket-card-header">
                    <span className={`ticket-status-dot ${getStatusClass(status)}`} title={getStatusLabel(status)}></span>
                    <span className="ticket-id">Ticket# {id}</span>
                    <span className={`ticket-status-label ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
                    <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                  </div>
                  <h2 className="ticket-subject">{title}</h2>
                  <p className="ticket-preview">{body?.slice(0, 120)}{body?.length > 120 ? '...' : ''}</p>
                  <div className="ticket-card-footer">
                    <div className="ticket-responder">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&size=28`} alt="" className="ticket-responder-avatar" />
                      {doctorName}
                    </div>
                    <Link href={`/student/ticket/${id}`} className="btn-link">Open Ticket</Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Tickets pagination">
          <Link href={`/student${statusFilter ? `?status=${statusFilter}` : ''}?page=${Math.max(1, pageParam - 1)}`}>
            <button type="button" disabled={pageParam <= 1}>Previous</button>
          </Link>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/student${statusFilter ? `?status=${statusFilter}&` : '?'}page=${p}`} className={p === pageParam ? 'active' : ''} aria-current={p === pageParam ? 'page' : undefined}>{p}</Link>
          ))}
          <Link href={`/student${statusFilter ? `?status=${statusFilter}&` : '?'}page=${Math.min(pagination.totalPages, pageParam + 1)}`}>
            <button type="button" disabled={pageParam >= pagination.totalPages}>Next</button>
          </Link>
        </nav>
      )}
    </>
  );
}

export default function StudentTicketsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>}>
      <StudentTicketsContent />
    </Suspense>
  );
}
