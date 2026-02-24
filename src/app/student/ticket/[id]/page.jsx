'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '../../../../utils/toast';

const STATUS_MAP = { 1: 'blue', 2: 'orange', 3: 'green' };
const STATUS_LABELS = { 1: 'Not Replied', 2: 'On-Going', 3: 'Resolved' };

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function StudentTicketDetailPage() {
  const params = useParams();
  const ticketId = params?.id ?? '';
  const [senderOpen, setSenderOpen] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ticketId || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getTicketById) {
      setLoading(false);
      if (!ticketId) setError('Invalid ticket.');
      return;
    }
    setLoading(true);
    setError('');
    window.TicketAPI.getTicketById(ticketId)
      .then((data) => setTicket(data))
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

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
        <Link href="/student" className="btn-primary">Back to Tickets</Link>
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
  const statusClass = STATUS_MAP[status] ?? 'blue';
  const statusLabel = STATUS_LABELS[status] ?? 'Not Replied';
  const canReply = status === 2;

  const handleReply = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      showToast('Please enter a reply message.', 'error');
      return;
    }
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.replyToTicket) {
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

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="detail-card">
        <div className="detail-header">
          <span className={`ticket-status-dot ${statusClass}`}></span>
          <span className="ticket-id">Ticket# {id}</span>
          <span className={`ticket-status-label ${statusClass}`}>{statusLabel}</span>
          <span className="ticket-time" style={{ marginLeft: 'auto' }}>Posted at {formatDate(createdAt)}</span>
        </div>
        <h2 className="ticket-subject" style={{ marginBottom: 12 }}>{title}</h2>
        <div className="detail-body">
          <p>{ticketBody}</p>
        </div>
      </div>
      <div className="detail-card">
        <button
          type="button"
          className="collapsible-header"
          aria-expanded={senderOpen}
          aria-controls="sender-info"
          onClick={() => setSenderOpen(!senderOpen)}
        >
          Ticket Sender Information
          <i className="fas fa-chevron-down"></i>
        </button>
        <div id="sender-info" hidden={!senderOpen}>
          <div className="info-grid">
            <div className="info-item"><label>Student ID</label><span className="value">{studentId}</span></div>
            <div className="info-item"><label>Student Name</label><span className="value">{studentName}</span></div>
            <div className="info-item">
              <label>Course</label>
              <span className="value"><span className="legend-dot orange" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}></span> {subjectName}</span>
            </div>
            <div className="info-item"><label>Group Number</label><span className="value">{groupNumber}</span></div>
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
      {canReply && (
        <div className="detail-card">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Reply to Ticket</h2>
          <p style={{ color: '#666', marginBottom: 12, fontSize: '0.9rem' }}>You can add a reply to this ongoing ticket.</p>
          <form onSubmit={handleReply}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Your Reply</label>
                <textarea className="form-textarea" placeholder="Type your reply here.." value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Submit Reply'}
              </button>
            </div>
          </form>
        </div>
      )}
      {!canReply && status === 3 && <p style={{ color: '#666', padding: 16 }}>This ticket is resolved. You cannot add more replies.</p>}
      <Link href="/student" className="btn-primary" style={{ marginTop: 16 }}>Back to Tickets</Link>
    </>
  );
}
