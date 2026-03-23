import { Link } from 'react-router-dom';

export default function AdminTickets() {
  return (
    <>
      <h1 className="page-title">Tickets</h1>
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input type="search" className="search-input" placeholder="Search for ticket" />
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot blue"></span> New Tickets</span>
          <span className="legend-item"><span className="legend-dot orange"></span> On-Going Tickets</span>
          <span className="legend-item"><span className="legend-dot green"></span> Resolved Tickets</span>
        </div>
        <select className="filter-select" aria-label="Time filter">
          <option>This Week</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
        <Link to="/administrator/ticket/new" className="btn-primary"><i className="fas fa-plus"></i> New Ticket</Link>
      </div>
      <div className="tabs">
        <Link to="/administrator/tickets" className="tab active"><i className="fas fa-list"></i> All Tickets</Link>
        <Link to="/administrator/tickets?status=new" className="tab"><i className="fas fa-envelope"></i> New</Link>
        <Link to="/administrator/tickets?status=ongoing" className="tab"><i className="fas fa-sync-alt"></i> On-Going</Link>
        <Link to="/administrator/tickets?status=resolved" className="tab"><i className="fas fa-check"></i> Resolved</Link>
      </div>
      <div className="ticket-list">
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot orange"></span>
            <span className="ticket-id">Ticket# 2023-CS123</span>
            <span className="ticket-time">Posted at 12:45 AM</span>
          </div>
          <h2 className="ticket-subject">How to deposit money to my portal?</h2>
          <p className="ticket-preview">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=John+Snow&size=28" alt="" className="ticket-responder-avatar" />
              From John Snow to Dr. Mohamed
            </div>
            <Link to="/administrator/ticket/2023-CS123" className="btn-link">Open Ticket</Link>
          </div>
        </article>
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot blue"></span>
            <span className="ticket-id">Ticket# 2023-CS456</span>
            <span className="ticket-time">Posted at 10:30 AM</span>
          </div>
          <h2 className="ticket-subject">Course material access</h2>
          <p className="ticket-preview">Unable to download the PDF for Week 3.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=Basel+Ahmed&size=28" alt="" className="ticket-responder-avatar" />
              From Basel Ahmed to Dr. Mohamed
            </div>
            <Link to="/administrator/ticket/2023-CS456" className="btn-link">Open Ticket</Link>
          </div>
        </article>
        <article className="ticket-card">
          <div className="ticket-card-header">
            <span className="ticket-status-dot green"></span>
            <span className="ticket-id">Ticket# 2023-CS789</span>
            <span className="ticket-status-label green">Resolved</span>
            <span className="ticket-time">Posted at 2:15 PM</span>
          </div>
          <h2 className="ticket-subject">Grade clarification</h2>
          <p className="ticket-preview">Request for review of Assignment 2 grade.</p>
          <div className="ticket-card-footer">
            <div className="ticket-responder">
              <img src="https://ui-avatars.com/api/?name=Student+Name&size=28" alt="" className="ticket-responder-avatar" />
              From Student to Dr. Mohamed
            </div>
            <Link to="/administrator/ticket/2023-CS789" className="btn-link">Open Ticket</Link>
          </div>
        </article>
      </div>
      <nav className="pagination" aria-label="Tickets pagination">
        <button type="button" disabled>Previous</button>
        <Link to="/administrator/tickets?page=1" className="active" aria-current="page">1</Link>
        <Link to="/administrator/tickets?page=2">2</Link>
        <button type="button">Next</button>
      </nav>
    </>
  );
}
