'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState('register'); // 'register' | 'otp'

  // Registration form state
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ssn, setSsn] = useState('');
  const [password, setPassword] = useState('');
  const [program, setProgram] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !name || !email || !ssn || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.toLowerCase().endsWith('.edu.eg')) {
      setError('Only college emails ending with ".edu.eg" are allowed.');
      return;
    }

    setError('');
    setLoading(true);

    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.registerStudent) {
      setError('Registration service is not available.');
      setLoading(false);
      return;
    }

    window.TicketAPI.registerStudent({
      StudentId: studentId.trim(),
      Name: name.trim(),
      Email: email.trim(),
      SSN: ssn.trim(),
      Password: password,
      Program: program.trim() || undefined
    })
      .then((res) => {
        setSuccessMsg(res?.message || 'Registration initiated. Please check your college email for the OTP.');
        setStep('otp');
        setLoading(false);
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : 'Registration failed. Please try again.';
        setError(msg);
        setLoading(false);
      });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    window.TicketAPI.verifyOtp({
      Email: email.trim(),
      Otp: otp.trim()
    })
      .then((res) => {
        setSuccessMsg(res?.message || 'Email verified successfully. You can now login.');
        setLoading(false);
        // After a brief delay, redirect to login
        setTimeout(() => {
          router.push('/');
        }, 2000);
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : 'OTP verification failed. Invalid or expired OTP.';
        setError(msg);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="background">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
      </div>
      <main className="login-wrapper" style={{ margin: '2rem 0' }}>
        <div className="login-card" style={{ maxWidth: '450px' }}>
          <div className="card-header">
            <div className="logo">
              <img src="/login/imgs/image%20(5).png" alt="BIS TICKET LEAD" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name">BIS TICKET LEAD</h1>
            <p className="portal-title">{step === 'register' ? 'Student Registration' : 'Verify Email'}</p>
          </div>

          {step === 'register' ? (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <i className="fas fa-id-card input-icon"></i>
                <input
                  type="text"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  placeholder="College Email (.edu.eg)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-address-card input-icon"></i>
                <input
                  type="text"
                  placeholder="SSN"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-graduation-cap input-icon"></i>
                <input
                  type="text"
                  placeholder="Program (Optional)"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                />
              </div>
              <div className="input-group input-group--password">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>

              {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8 }}>{error}</p>}
              
              <button type="submit" className="sign-in-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin" /> Registering...</>
                ) : (
                  <>Sign Up <i className="fas fa-user-plus" /></>
                )}
              </button>

              <div className="form-options" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                <Link href="/" className="forgot-link">Already have an account? Sign In</Link>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleOtpSubmit}>
              {successMsg && <p style={{ color: '#28a745', fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center' }}>{successMsg}</p>}
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#555', textAlign: 'center' }}>
                We've sent a 6-digit code to <strong>{email}</strong>. It is valid for 10 minutes.
              </p>
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  style={{ letterSpacing: '2px', textAlign: 'center' }}
                />
              </div>

              {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8 }}>{error}</p>}

              <button type="submit" className="sign-in-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin" /> Verifying...</>
                ) : (
                  <>Verify Email <i className="fas fa-check-circle" /></>
                )}
              </button>

              <div className="form-options" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep('register')} className="forgot-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Back to Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <footer className="page-footer">
        © 2026 BIS TICKET LEAD. All rights reserved.
      </footer>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="login-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
