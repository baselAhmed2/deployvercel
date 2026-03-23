import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    ssn: '',
    password: '',
    program: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const { studentId, name, email, ssn, password } = formData;
    if (!studentId || !name || !email || !ssn || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@(commerce\.helwan\.edu\.eg|fcba\.capu\.edu\.eg)$/i;
    if (!emailRegex.test(email)) {
      setError('You must use your college email (@commerce.helwan.edu.eg or @fcba.capu.edu.eg)');
      return;
    }

    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.registerStudent) {
      window.TicketAPI.registerStudent(formData)
        .then(() => {
          setSuccess('Registration successful! Redirecting to verify OTP...');
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
          }, 1500);
        })
        .catch((err) => {
          const msg = err && err.message ? err.message : 'Registration failed. Please try again.';
          setError(msg);
        });
    } else {
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
              />
            </div>
            <div className="input-group">
              <i className="fas fa-address-card input-icon"></i>
              <input
                type="text"
                name="ssn"
                placeholder="SSN (National ID)"
                value={formData.ssn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-graduation-cap input-icon"></i>
              <input
                type="text"
                name="program"
                placeholder="Program (Optional)"
                value={formData.program}
                onChange={handleChange}
              />
            </div>
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: 4 }}>{error}</p>}
            {success && <p role="alert" style={{ color: '#28a745', fontSize: '0.85rem', marginTop: 4 }}>{success}</p>}
            <button type="submit" className="sign-in-btn" style={{ marginTop: '10px' }}>
              Register
              <i className="fas fa-user-plus"></i>
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
