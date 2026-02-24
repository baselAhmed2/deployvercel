import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminNewUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [accountLevel, setAccountLevel] = useState('student');
  const [userId, setUserId] = useState('');
  const [ssn, setSsn] = useState('');

  useEffect(() => {
    if (roleParam === 'doctor' || roleParam === 'student' || roleParam === 'admin') setAccountLevel(roleParam);
  }, [roleParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.TicketAPI && window.TicketAPI.createUser) {
      window.TicketAPI.createUser({ accountLevel, userId: userId.trim(), ssn: ssn.trim() }).then(() => navigate('/administrator/users')).catch(() => {});
    } else {
      navigate('/administrator/users');
    }
  };

  return (
    <>
      <h1 className="page-title">New User</h1>
      <section className="form-section">
        <h2 className="section-title">Create User</h2>
        <p className="section-desc">Write and address new queries and issues</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Account Level <span className="required">*</span></label>
              <select className="form-select" value={accountLevel} onChange={(e) => setAccountLevel(e.target.value)} required>
                <option value="">Select Level</option>
                <option value="student">Student</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Enter User ID <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Enter User SSN <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter User SSN" value={ssn} onChange={(e) => setSsn(e.target.value)} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </section>
    </>
  );
}
