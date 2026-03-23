import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    ssn: '',
    program: 'BIS'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    // Prevent non-numeric characters for SSN and Student ID
    if (e.target.name === 'ssn' || e.target.name === 'studentId') {
      const numericValue = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, [e.target.name]: numericValue });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const { studentId, name, email, ssn, program } = formData;
    if (!studentId || !name || !email || !ssn || !program) {
      setError('Please fill in all required fields.');
      return;
    }

    if (ssn.length !== 14) {
      setError('National ID (SSN) must be exactly 14 digits.');
      return;
    }

    const emailRegex = /^[^\s@]+@(commerce\.helwan\.edu\.eg|fcba\.capu\.edu\.eg)$/i;
    if (!emailRegex.test(email)) {
      setError('You must use your college email (@commerce.helwan.edu.eg or @fcba.capu.edu.eg)');
      return;
    }

    setIsSubmitting(true);

    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.registerStudent) {
      window.TicketAPI.registerStudent(formData)
        .then(() => {
          setSuccess('Registration successful! Redirecting to verify OTP...');
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
          }, 1500);
        })
        .catch((err) => {
          setIsSubmitting(false);
          const msg = err && err.message ? err.message.toLowerCase() : '';
          const rawMsg = err && err.message ? err.message : 'Registration failed. Please try again.';
          
          if (msg.includes('already exists') || msg.includes('exist') || msg.includes('registered') || msg.includes('already') || msg.includes('id')) {
            setError('Account already exists! Please securely log in using your Student ID and National ID (SSN) as your password.');
          } else {
            setError(rawMsg);
          }
        });
    } else {
      setIsSubmitting(false);
      setError('API not initialized. Ensure TicketAPI is loaded.');
    }
  };

  return (
    <>
      <div className="background">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
      </div>
      <main className="login-wrapper">
        <div className="login-card" style={{ padding: '30px 36px' }}>
          <div className="card-header" style={{ marginBottom: '20px' }}>
            <div className="logo">
              <img src="/login/imgs/image (5).png" alt="Capital University" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name" style={{ fontSize: '1.5rem' }}>Capital University</h1>
            <p className="portal-title">Create Student Account</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit} style={{ gap: '12px' }}>
            <div className="input-group">
              <i className="fas fa-id-card input-icon"></i>
              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                name="email"
                placeholder="College Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-address-card input-icon"></i>
                <input
                  type="text"
                  name="ssn"
                  placeholder="SSN (National ID) - 14 Digits"
                  value={formData.ssn}
                  onChange={handleChange}
                  maxLength="14"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(203, 213, 225, 0.7)', paddingLeft: '4px' }}>
                💡 Your SSN will securely be set as your login password.
              </span>
            </div>
            
            <div className="input-group">
              <i className="fas fa-graduation-cap input-icon"></i>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '10px',
                  border: '1px solid rgba(165, 180, 252, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="BIS">BIS</option>
                <option value="FMI">FMI</option>
                <option value="SBS">SBS</option>
              </select>
              <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '16px', color: 'rgba(165, 180, 252, 0.7)', pointerEvents: 'none' }}></i>
            </div>
            
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: 4 }}>{error}</p>}
            {success && <p role="alert" style={{ color: '#28a745', fontSize: '0.85rem', marginTop: 4 }}>{success}</p>}
            <button type="submit" className="sign-in-btn" style={{ marginTop: '10px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }} disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
              {!isSubmitting && <i className="fas fa-user-plus"></i>}
              {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
            </button>
            <div className="form-options" style={{ justifyContent: 'center', marginTop: '10px' }}>
              <Link to="/" className="forgot-link">Already have an account? Login</Link>
            </div>
          </form>
        </div>
      </main>
      <footer className="page-footer">
        © 2026 Capital University. All rights reserved.
      </footer>
    </>
  );
}
