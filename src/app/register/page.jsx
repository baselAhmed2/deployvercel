'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState('register'); // 'register' | 'otp'

  // Registration form state (Matches Backend DTO)
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    ssn: '',
    program: 'BIS'
  });

  // OTP state
  const [otp, setOtp] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSsn, setShowSsn] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const getIconStyle = (fieldName) => ({
    color: focusedField === fieldName ? '#818cf8' : undefined,
    transition: 'color 0.3s ease'
  });

  const appendEmailDomain = (domain) => {
    const currentEmail = formData.email.split('@')[0];
    setFormData({ ...formData, email: `${currentEmail}@${domain}` });
  };

  const handleChange = (e) => {
    if (e.target.name === 'ssn' || e.target.name === 'studentId') {
      const numericValue = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, [e.target.name]: numericValue });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const { studentId, name, email, ssn, program } = formData;

    if (!studentId || !name || !email || !ssn || !program) {
      setError('Please fill in all required fields.');
      triggerShake();
      return;
    }

    if (ssn.length !== 14) {
      setError('National ID (SSN) must be exactly 14 digits.');
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@(commerce\.helwan\.edu\.eg|fcba\.capu\.edu\.eg)$/i;
    if (!emailRegex.test(email)) {
      setError('College email must end in @commerce.helwan.edu.eg or @fcba.capu.edu.eg');
      triggerShake();
      return;
    }

    setError('');
    setLoading(true);

    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.registerStudent) {
      setError('Registration service is not available.');
      triggerShake();
      setLoading(false);
      return;
    }

    window.TicketAPI.registerStudent({
      StudentId: studentId,
      Name: name.trim(),
      Email: email.trim(),
      SSN: ssn,
      Program: program
    })
      .then((res) => {
        setSuccessMsg(res?.message || 'Registration successful! Please check your college email for the OTP.');
        setStep('otp');
        setLoading(false);
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : 'Registration failed. Please try again.';
        setError(msg);
        triggerShake();
        setLoading(false);
      });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP sent to your email.');
      triggerShake();
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    window.TicketAPI.verifyOtp({
      Email: formData.email.trim(),
      Otp: otp.trim()
    })
      .then((res) => {
        setSuccessMsg(res?.message || 'Email verified successfully. You can now login.');
        setLoading(false);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : 'OTP verification failed. Invalid or expired OTP.';
        setError(msg);
        triggerShake();
        setLoading(false);
      });
  };

  return (
    <>
      <style>{`
        @keyframes formShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .shake-animation {
          animation: formShake 0.4s ease-in-out;
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .domain-btn:hover {
          background: rgba(99, 102, 241, 0.4) !important;
        }
      `}</style>
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
            <form className={`login-form ${shake ? 'shake-animation' : ''}`} onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <i className="fas fa-id-card input-icon" style={getIconStyle('studentId')}></i>
                <input
                  type="text"
                  name="studentId"
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  onFocus={() => handleFocus('studentId')}
                  onBlur={handleBlur}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <i className="fas fa-user input-icon" style={getIconStyle('name')}></i>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  onBlur={handleBlur}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group" style={{ marginBottom: !formData.email.includes('@') && formData.email.length > 0 ? '4px' : '16px' }}>
                <i className="fas fa-envelope input-icon" style={getIconStyle('email')}></i>
                <input
                  type="email"
                  name="email"
                  placeholder="College Email (.edu.eg)"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  required
                  disabled={loading}
                />
              </div>

              {!formData.email.includes('@') && formData.email.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', marginTop: '-12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1', width: '100%', fontWeight: '500' }}>Quick append domain:</span>
                  <button type="button" className="domain-btn" onClick={() => appendEmailDomain('commerce.helwan.edu.eg')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>@commerce.helwan</button>
                  <button type="button" className="domain-btn" onClick={() => appendEmailDomain('fcba.capu.edu.eg')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>@fcba.capu</button>
                </div>
              )}

              <div className="input-group" style={{ marginBottom: '4px', position: 'relative' }}>
                <i className="fas fa-address-card input-icon" style={{ zIndex: 1, ...getIconStyle('ssn') }}></i>
                <input
                  type={showSsn ? "text" : "password"}
                  name="ssn"
                  placeholder="SSN (National ID) - 14 Digits"
                  value={formData.ssn}
                  onChange={handleChange}
                  onFocus={() => handleFocus('ssn')}
                  onBlur={handleBlur}
                  maxLength="14"
                  required
                  disabled={loading}
                  style={{ paddingRight: '60px' }}
                />
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                  {formData.ssn.length === 14 && <span style={{ color: '#10b981', fontSize: '1rem', animation: 'pop 0.3s ease' }}>✅</span>}
                  <i
                    className={`fas ${showSsn ? 'fa-eye-slash' : 'fa-eye'}`}
                    onClick={() => setShowSsn(!showSsn)}
                    style={{ cursor: 'pointer', color: '#a5b4fc', transition: 'color 0.2s' }}
                    title={showSsn ? 'Hide SSN' : 'Show SSN'}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingLeft: '4px', paddingRight: '4px' }}>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, fontWeight: '500' }}>
                  💡 Your SSN is your password.
                </p>
                <span style={{ fontSize: '0.85rem', color: formData.ssn.length === 14 ? '#10b981' : '#cbd5e1', transition: 'color 0.3s', fontWeight: '500' }}>
                  {formData.ssn.length}/14
                </span>
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <i className="fas fa-graduation-cap input-icon" style={{ zIndex: 1, pointerEvents: 'none', ...getIconStyle('program') }}></i>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  onFocus={() => handleFocus('program')}
                  onBlur={handleBlur}
                  required
                  disabled={loading}
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
                  <option value="BIS" style={{ background: '#0f172a' }}>BIS</option>
                  <option value="FMI" style={{ background: '#0f172a' }}>FMI</option>
                  <option value="SBS" style={{ background: '#0f172a' }}>SBS</option>
                </select>
                <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', pointerEvents: 'none', zIndex: 1 }}></i>
              </div>

              {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8, animation: 'pop 0.3s ease' }}>{error}</p>}

              <button type="submit" className="sign-in-btn" disabled={loading} style={{ marginTop: '1rem', position: 'relative', overflow: 'hidden' }}>
                <span style={{ transition: 'opacity 0.2s', opacity: loading ? 0 : 1 }}>
                  Sign Up <i className="fas fa-user-plus" style={{ marginLeft: '4px' }} />
                </span>
                {loading && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-spinner fa-spin"></i> Registering...
                  </div>
                )}
              </button>

              <div className="form-options" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                <Link href="/" className="forgot-link">Already have an account? Sign In</Link>
              </div>
            </form>
          ) : (
            <form className={`login-form ${shake ? 'shake-animation' : ''}`} onSubmit={handleOtpSubmit}>
              {successMsg && <p style={{ color: '#28a745', fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center', animation: 'pop 0.3s ease' }}>{successMsg}</p>}
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#cbd5e1', textAlign: 'center' }}>
                We've sent a 6-digit code to <strong style={{color: '#fff'}}>{formData.email}</strong>. It is valid for 10 minutes.
              </p>
              <div className="input-group">
                <i className="fas fa-key input-icon" style={getIconStyle('otp')}></i>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => handleFocus('otp')}
                  onBlur={handleBlur}
                  required
                  maxLength={6}
                  style={{ letterSpacing: '2px', textAlign: 'center' }}
                />
              </div>

              {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8, animation: 'pop 0.3s ease' }}>{error}</p>}

              <button type="submit" className="sign-in-btn" disabled={loading} style={{ marginTop: '1rem', position: 'relative', overflow: 'hidden' }}>
                <span style={{ transition: 'opacity 0.2s', opacity: loading ? 0 : 1 }}>
                  Verify Email <i className="fas fa-check-circle" style={{ marginLeft: '4px' }} />
                </span>
                {loading && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-spinner fa-spin"></i> Verifying...
                  </div>
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
