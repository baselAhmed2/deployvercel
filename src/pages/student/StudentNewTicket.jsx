import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toast';

export default function StudentNewTicket() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [level, setLevel] = useState('4');
  const [semester, setSemester] = useState('1');
  const [subject, setSubject] = useState('');
  const [doctor, setDoctor] = useState('');
  const [subjectText, setSubjectText] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.createTicket) {
      window.TicketAPI.createTicket({
        level,
        semester,
        subject,
        doctorId: doctor,
        subjectText,
        body,
      })
        .then(() => {
          showToast('Ticket submitted successfully. We will get back to you soon.');
          setTimeout(() => navigate('/student'), 1500);
        })
        .catch((err) => {
          setSending(false);
          showToast((err && err.message) ? err.message : 'Failed to submit ticket.', 'error');
        });
    } else {
      showToast('Ticket submitted successfully. We will get back to you soon.');
      setTimeout(() => navigate('/student'), 1500);
    }
  };

  return (
    <>
      <h1 className="page-title">New Ticket</h1>
      <section className="form-section">
        <h2 className="section-title">Create Quick Ticket</h2>
        <p className="section-desc">Write and address new queries and issues</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Choose Level <span className="required">*</span></label>
              <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)} required>
                <option value="">Select Level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Choose Semester <span className="required">*</span></label>
              <select className="form-select" value={semester} onChange={(e) => setSemester(e.target.value)} required>
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Choose Subject <span className="required">*</span></label>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)} required>
                <option value="">Select Status</option>
                <option value="01">01 - Section Internet Application</option>
                <option value="02">02 - Internet Application</option>
                <option value="05">05 - Section Information System</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Doctor <span className="required">*</span></label>
              <select className="form-select" value={doctor} onChange={(e) => setDoctor(e.target.value)} required>
                <option value="">Choose Doctor</option>
                <option value="1">Dr. Mohamed Ahmed</option>
                <option value="2">Dr. John Snow</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Request Ticket Subject <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter Ticket Subject" value={subjectText} onChange={(e) => setSubjectText(e.target.value)} required />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ticket Body <span className="required">*</span></label>
              <textarea className="form-textarea" placeholder="Type ticket issue here.." value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Ticket</>}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
