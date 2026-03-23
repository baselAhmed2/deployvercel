'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId.trim() || !email.trim() || !nationalId.trim()) {
      setMessage('Please fill in Student ID, Email and National ID.');
      setIsError(true);
      return;
    }
    setMessage('Password reset request received. Check your email for instructions.');
    setIsError(false);
    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.resetPassword) {
      window.TicketAPI.resetPassword({ studentId, email, nationalId })
        .then(() => {
          setMessage('Password reset link has been sent to your email.');
          setIsError(false);
        })
        .catch((err) => {
          setMessage((err && err.message) ? err.message : 'Failed to reset password.');
          setIsError(true);
        });
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
              <img src="/login/imgs/image%20(5).png" alt="BIS TICKET LEAD" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name">BIS TICKET LEAD</h1>
            <p className="portal-title">Reset Your Password</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
              <input type="text" placeholder="Student ID" autoComplete="username" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
            </div>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <i className="fas fa-id-card input-icon"></i>
              <input type="text" placeholder="National ID" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
            </div>
            {message && <p role="alert" style={{ color: isError ? '#dc3545' : '#198754', fontSize: '0.9rem', marginTop: 12 }}>{message}</p>}
            <button type="submit" className="sign-in-btn">
              Reset Password
              <i className="fas fa-key"></i>
            </button>
            <Link href="/" className="back-to-login">Back to Sign In</Link>
          </form>
        </div>
      </main>
      <footer className="page-footer">
        © 2026 BIS TICKET LEAD. All rights reserved.
      </footer>
    </>
  );
}
