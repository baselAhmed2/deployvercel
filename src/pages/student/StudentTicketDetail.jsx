import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function StudentTicketDetail() {
  const { id } = useParams();
  const ticketId = id || '2026-IE123';
  const [senderOpen, setSenderOpen] = useState(true);

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
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
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
            <div className="info-item"><label>Student ID</label><span className="value">512393207</span></div>
            <div className="info-item"><label>Student Name</label><span className="value">Basel Ahmed</span></div>
            <div className="info-item">
              <label>Course</label>
              <span className="value"><span className="legend-dot orange" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}></span> Information Economy</span>
            </div>
            <div className="info-item"><label>Group Number</label><span className="value">9</span></div>
          </div>
        </div>
      </div>
      <div className="detail-card">
        <h2 className="section-title" style={{ marginBottom: 12 }}>Last Replays On Ticket</h2>
        <div className="reply-list">
          <div className="reply-item">
            <div className="reply-meta">You on 12-11-2024</div>
            <div className="reply-text">Massage Text – previous reply content from the student.</div>
          </div>
          <div className="reply-item">
            <div className="reply-meta">Receiver on 13-11-2024</div>
            <div className="reply-text">Massage Text – previous reply content from the doctor/staff.</div>
          </div>
        </div>
      </div>
    </>
  );
}
