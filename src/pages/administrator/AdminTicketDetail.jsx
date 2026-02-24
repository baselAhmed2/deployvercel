import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from '../../utils/toast';

export default function AdminTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ticketId = id || '2026-IE123';
  const [senderOpen, setSenderOpen] = useState(true);
  const [status, setStatus] = useState('ongoing');
  const [statusOpen, setStatusOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    { value: 'ongoing', label: 'On-Going Tickets', dot: 'orange' },
    { value: 'resolved', label: 'Resolved Tickets', dot: 'green' },
  ];
  const currentStatus = statusOptions.find((o) => o.value === status) || statusOptions[0];

  const handleReply = (e) => {
    e.preventDefault();
    if (!body.trim()) {
      showToast('Please enter a reply message.', 'error');
      return;
    }
    setSubmitting(true);
    if (window.TicketAPI && window.TicketAPI.replyToTicket) {
      window.TicketAPI.replyToTicket(ticketId, { body, subject, status })
        .then(() => {
          showToast('Reply submitted successfully.');
          setTimeout(() => navigate('/administrator/tickets'), 1500);
        })
        .catch((err) => {
          showToast((err && err.message) ? err.message : 'Failed to submit reply.', 'error');
        })
        .finally(() => setSubmitting(false));
    } else {
      showToast('Reply submitted successfully.');
      setTimeout(() => navigate('/administrator/tickets'), 1500);
    }
  };

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="detail-card">
        <div className="detail-header">
          <span className="ticket-status-dot orange"></span>
          <span className="ticket-id">Ticket# {ticketId}</span>
          <span className="detail-category">Classwork Issue</span>
          <span className="ticket-time" style={{ marginLeft: 'auto' }}>Posted at 12:45 - 3-2026</span>
        </div>
        <h2 className="ticket-subject" style={{ marginBottom: 12 }}>How to deposit money to my portal?</h2>
        <div className="detail-body">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
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
              <input type="text" className="form-input" value="512393207" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input type="text" className="form-input" value="Basel Ahmed" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <div className="form-input form-input--with-dot">
                <span className="legend-dot orange"></span>
                <span>Information Economy</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Group Number</label>
              <input type="text" className="form-input" value="9" readOnly />
            </div>
          </div>
        </div>
      </div>
      <div className="detail-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>Last Replays On Ticket</h2>
        <div className="reply-list">
          <div className="reply-item">
            <div className="reply-meta">Dr. Mohamed on 12-11-2024</div>
            <div className="reply-text">Reply content from the doctor.</div>
          </div>
          <div className="reply-item">
            <div className="reply-meta">Student on 13-11-2024</div>
            <div className="reply-text">Reply content from the student.</div>
          </div>
        </div>
      </div>
      <div className="detail-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Reply to Ticket</h2>
        <form onSubmit={handleReply}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input type="text" className="form-input" value="512393207" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Ticket Subject</label>
              <input type="text" className="form-input" placeholder="Enter Ticket Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-dropdown" aria-expanded={statusOpen}>
                <button type="button" className="status-dropdown-trigger" onClick={() => setStatusOpen(!statusOpen)}>
                  <span className={`status-dot status-dot--${currentStatus.dot}`}></span>
                  <span className="status-dropdown-label">{currentStatus.label}</span>
                  <i className="fas fa-chevron-down status-dropdown-chevron"></i>
                </button>
                <ul className="status-dropdown-menu">
                  {statusOptions.map((opt) => (
                    <li key={opt.value} className={`status-dropdown-option ${opt.value === status ? 'selected' : ''}`} onClick={() => { setStatus(opt.value); setStatusOpen(false); }}>
                      <span className={`status-dot status-dot--${opt.dot}`}></span>
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ticket Body</label>
              <textarea className="form-textarea" placeholder="Type ticket issue here.." value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
