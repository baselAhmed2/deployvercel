'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '../../../../utils/toast';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green' };
const STATUS_LABELS = { 1: 'New', 2: 'On-Going', 3: 'Resolved' };
const STATUS_OPTIONS = [
  { value: 2, label: 'On-Going Tickets', dot: 'orange' },
  { value: 3, label: 'Resolved Tickets', dot: 'green' },
];

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function AdminTicketDetail() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id ?? '';
  const ticketId = (() => { try { return decodeURIComponent(rawId); } catch { return rawId; } })();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderOpen, setSenderOpen] = useState(true);
  const [statusValue, setStatusValue] = useState(2);
  const [statusOpen, setStatusOpen] = useState(false);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  useEffect(() => {
    if (!ticketId || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getTicketById) {
      setLoading(false);
      if (!ticketId) setError('Invalid ticket.');
      return;
    }
    window.TicketAPI.getTicketById(ticketId)
      .then((data) => {
        setTicket(data);
        const s = data?.status ?? data?.Status ?? 1;
        setStatusValue(s === 3 ? 3 : 2);
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === statusValue) || STATUS_OPTIONS[0];

  const handleStatusChange = (newStatus) => {
    if (!window.TicketAPI?.updateTicketStatus) return;
    setUpdatingStatus(true);
    window.TicketAPI.updateTicketStatus(ticketId, newStatus)
      .then(() => {
        setStatusValue(newStatus);
        setTicket((prev) => (prev ? { ...prev, status: newStatus, Status: newStatus } : null));
        showToast('Status updated.');
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed to update status.', 'error'))
      .finally(() => setUpdatingStatus(false));
  };

  const handleHighPriorityToggle = () => {
    if (!window.TicketAPI?.markTicketHighPriority) return;
    const next = !(ticket?.isHighPriority ?? ticket?.IsHighPriority);
    setUpdatingPriority(true);
    window.TicketAPI.markTicketHighPriority(ticketId, next)
      .then(() => {
        setTicket((prev) => (prev ? { ...prev, isHighPriority: next, IsHighPriority: next } : null));
        showToast(next ? 'Marked as high priority.' : 'Removed from high priority.');
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed.', 'error'))
      .finally(() => setUpdatingPriority(false));
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      showToast('Please enter a reply message.', 'error');
      return;
    }
    if (!window.TicketAPI?.replyToTicket) {
      showToast('API is not available.', 'error');
      return;
    }
    setSubmitting(true);
    window.TicketAPI.replyToTicket(ticketId, { body })
      .then(() => {
        showToast('Reply submitted successfully.');
        setBody('');
        window.TicketAPI.getTicketById(ticketId).then(setTicket);
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed to submit reply.', 'error'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <>
        <h1 className="page-title">Tickets</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }
  if (error || !ticket) {
    return (
      <>
        <h1 className="page-title">Tickets</h1>
        <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error || 'Ticket not found.'}</p>
        <Link href="/administrator/tickets" className="btn-primary">Back to Tickets</Link>
      </>
    );
  }

  const id = ticket.id ?? ticket.Id ?? ticketId;
  const title = ticket.title ?? ticket.Title ?? 'No subject';
  const ticketBody = ticket.body ?? ticket.Body ?? '';
  const status = ticket.status ?? ticket.Status ?? 1;
  const createdAt = ticket.createdAt ?? ticket.CreatedAt;
  const studentId = ticket.studentId ?? ticket.StudentId ?? '—';
  const studentName = ticket.studentName ?? ticket.StudentName ?? '—';
  const subjectName = ticket.subjectName ?? ticket.SubjectName ?? '—';
  const groupNumber = ticket.groupNumber ?? ticket.GroupNumber ?? '—';
  const doctorName = ticket.doctorName ?? ticket.DoctorName ?? '—';
  const messages = ticket.messages ?? ticket.Messages ?? [];
  const isHighPriority = ticket.isHighPriority ?? ticket.IsHighPriority;
  const statusClass = STATUS_MAP[status] ?? 'blue';
  const statusLabel = STATUS_LABELS[status] ?? 'New';

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="detail-card">
        <div className="detail-header">
          <span className={`ticket-status-dot ${statusClass}`}></span>
          <span className="ticket-id">Ticket# {id}</span>
          {isHighPriority && <span className="ticket-status-label red">High Priority</span>}
          <span className={`ticket-status-label ${statusClass}`}>{statusLabel}</span>
          <span className="ticket-time" style={{ marginLeft: 'auto' }}>Posted at {formatDate(createdAt)}</span>
          <button type="button" className="btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={handleHighPriorityToggle} disabled={updatingPriority}>
            {isHighPriority ? 'Remove High Priority' : 'Mark High Priority'}
          </button>
        </div>
        <h2 className="ticket-subject" style={{ marginBottom: 12 }}>{title}</h2>
        <div className="detail-body">
          <p>{ticketBody}</p>
        </div>
      </div>
      <div className="detail-card">
        <button type="button" className="collapsible-header" aria-expanded={senderOpen} onClick={() => setSenderOpen(!senderOpen)}>
          Ticket Sender Information <i className="fas fa-chevron-down"></i>
        </button>
        <div id="sender-info" className="sender-info-fields" hidden={!senderOpen}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input type="text" className="form-input" value={studentId} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input type="text" className="form-input" value={studentName} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <div className="form-input form-input--with-dot">
                <span className="legend-dot orange"></span>
                <span>{subjectName}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Group Number</label>
              <input type="text" className="form-input" value={groupNumber} readOnly />
            </div>
          </div>
        </div>
      </div>
      <div className="detail-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>Last Replays On Ticket</h2>
        <div className="reply-list">
          {messages.length === 0 ? (
            <p style={{ color: '#666' }}>No replies yet.</p>
          ) : (
            messages.map((m) => {
              const senderName = m.senderName ?? m.SenderName ?? 'Unknown';
              const sentAt = m.sentAt ?? m.SentAt;
              const msgBody = m.body ?? m.Body ?? '';
              return (
                <div key={m.id ?? m.Id ?? Math.random()} className="reply-item">
                  <div className="reply-meta">{senderName} on {formatDate(sentAt)}</div>
                  <div className="reply-text">{msgBody}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="detail-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Reply to Ticket</h2>
        <form onSubmit={handleReply}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input type="text" className="form-input" value={studentId} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-dropdown" aria-expanded={statusOpen}>
                <button type="button" className="status-dropdown-trigger" onClick={() => setStatusOpen(!statusOpen)} disabled={updatingStatus}>
                  <span className={`status-dot status-dot--${currentStatus.dot}`}></span>
                  <span className="status-dropdown-label">{currentStatus.label}</span>
                  <i className="fas fa-chevron-down status-dropdown-chevron"></i>
                </button>
                <ul className="status-dropdown-menu">
                  {STATUS_OPTIONS.map((opt) => (
                    <li key={opt.value} className={`status-dropdown-option ${opt.value === statusValue ? 'selected' : ''}`} onClick={() => { setStatusValue(opt.value); setStatusOpen(false); handleStatusChange(opt.value); }}>
                      <span className={`status-dot status-dot--${opt.dot}`}></span>
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ticket Body</label>
              <textarea className="form-textarea" placeholder="Type your reply here.." value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      <Link href="/administrator/tickets" className="btn-primary" style={{ marginTop: 16 }}>Back to Tickets</Link>
    </>
  );
}
