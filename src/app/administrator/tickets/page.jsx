'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green', 4: 'red' };
const STATUS_LABELS = { 1: 'New', 2: 'On-Going', 3: 'Resolved', 4: 'Rejected' };

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function AdminTicketsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('q') || '';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPages: 1, totalCount: 0 });
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminFilteredTickets) {
      setLoading(false);
      setError('API is not available.');
      return;
    }
    setLoading(true);
    setError('');
    const filter = {
      pageIndex: pageParam,
      pageSize: 10,
      status: statusFilter === 'new' ? 1 : statusFilter === 'ongoing' ? 2 : statusFilter === 'resolved' ? 3 : statusFilter === 'rejected' ? 4 : undefined,
      searchTicketId: searchInput.trim() || undefined,
    };
    window.TicketAPI.getAdminFilteredTickets(filter)
      .then((res) => {
        const data = res?.data ?? res?.Data ?? [];
        const items = Array.isArray(data) ? data : [];
        setTickets(items);
        setPagination({
          pageIndex: res?.pageIndex ?? res?.PageIndex ?? pageParam,
          totalPages: res?.totalPages ?? res?.TotalPages ?? 1,
          totalCount: res?.totalCount ?? res?.TotalCount ?? 0,
        });
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [pageParam, statusFilter, searchInput]);

  const getStatusClass = (s) => STATUS_MAP[s] ?? 'blue';
  const getStatusLabel = (s) => STATUS_LABELS[s] ?? 'New';

  const tabClass = (tab) => (!tab && !statusFilter) || tab === statusFilter ? 'tab active' : 'tab';
  const pageHref = (p) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (searchInput) params.set('q', searchInput);
    if (p > 1) params.set('page', String(p));
    return `/administrator/tickets${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input
            type="search"
            className="search-input"
            placeholder="Search for ticket"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search tickets"
          />
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot blue"></span> New Tickets</span>
          <span className="legend-item"><span className="legend-dot orange"></span> On-Going Tickets</span>
          <span className="legend-item"><span className="legend-dot green"></span> Resolved Tickets</span>
          <span className="legend-item"><span className="legend-dot red"></span> Rejected Tickets</span>
        </div>
        <select className="filter-select" aria-label="Time filter">
          <option>This Week</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
      </div>
      <div className="tabs">
        <Link href="/administrator/tickets" className={tabClass('')}><i className="fas fa-list"></i> All Tickets</Link>
        <Link href="/administrator/tickets?status=new" className={tabClass('new')}><i className="fas fa-envelope"></i> New</Link>
        <Link href="/administrator/tickets?status=ongoing" className={tabClass('ongoing')}><i className="fas fa-sync-alt"></i> On-Going</Link>
        <Link href="/administrator/tickets?status=resolved" className={tabClass('resolved')}><i className="fas fa-check"></i> Resolved</Link>
        <Link href="/administrator/tickets?status=rejected" className={tabClass('rejected')}><i className="fas fa-ban"></i> Rejected</Link>
      </div>
      {loading && <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>}
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      {!loading && !error && (
        <div className="ticket-list">
          {tickets.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 32, color: '#666' }}>No tickets found.</p>
          ) : (
            tickets.map((t) => {
              const id = t.id ?? t.Id ?? '';
              const title = t.title ?? t.Title ?? 'No subject';
              const body = t.body ?? t.Body ?? '';
              const status = t.status ?? t.Status ?? 1;
              const studentName = t.studentName ?? t.StudentName ?? 'Student';
              const doctorName = t.doctorName ?? t.DoctorName ?? 'Dr.';
              const createdAt = t.createdAt ?? t.CreatedAt;
              const isHighPriority = t.isHighPriority ?? t.IsHighPriority;
              return (
                <article key={id} className="ticket-card">
                  <div className="ticket-card-header">
                    <span className={`ticket-status-dot ${getStatusClass(status)}`}></span>
                    <span className="ticket-id">Ticket# {id}</span>
                    {isHighPriority && <span className="ticket-status-label red">High Priority</span>}
                    <span className={`ticket-status-label ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
                    <span className="ticket-time">Posted at {formatDate(createdAt)}</span>
                  </div>
                  <h2 className="ticket-subject">{title}</h2>
                  <p className="ticket-preview">{body?.slice(0, 120)}{body?.length > 120 ? '...' : ''}</p>
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
      )}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Tickets pagination">
          <Link href={pageHref(Math.max(1, pageParam - 1))}>
            <button type="button" disabled={pageParam <= 1}>Previous</button>
          </Link>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={pageHref(p)} className={p === pageParam ? 'active' : ''} aria-current={p === pageParam ? 'page' : undefined}>{p}</Link>
          ))}
          <Link href={pageHref(Math.min(pagination.totalPages, pageParam + 1))}>
            <button type="button" disabled={pageParam >= pagination.totalPages}>Next</button>
          </Link>
        </nav>
      )}
    </>
  );
}

export default function AdminTickets() {
  return (
    <Suspense fallback={<div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>}>
      <AdminTicketsContent />
    </Suspense>
  );
}
