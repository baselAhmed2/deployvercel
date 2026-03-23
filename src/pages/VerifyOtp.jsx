import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.verifyOtp) {
      window.TicketAPI.verifyOtp({ email: emailParam, otp })
        .then(() => {
          setSuccess('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        })
        .catch((err) => {
           const msg = err && err.message ? err.message : 'Invalid or expired OTP.';
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
        <div className="login-card">
          <div className="card-header">
            <div className="logo">
               <img src="/login/imgs/image (5).png" alt="Capital University" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name">Account Verification</h1>
            <p className="portal-title">Check your college email for the OTP code</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                placeholder="Email"
                value={emailParam}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
            <div className="input-group">
              <i className="fas fa-key input-icon"></i>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
            </div>
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8 }}>{error}</p>}
            {success && <p role="alert" style={{ color: '#28a745', fontSize: '0.9rem', marginTop: 8 }}>{success}</p>}
            <button type="submit" className="sign-in-btn">
              Verify OTP
              <i className="fas fa-check-circle"></i>
            </button>
            <div className="form-options" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <Link to="/register" className="forgot-link">Resend OTP? Back to Register</Link>
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
