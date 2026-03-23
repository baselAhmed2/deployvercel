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
  
  // UI UX States
  const [showSsn, setShowSsn] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleChange = (e) => {
    // Prevent non-numeric characters for SSN and Student ID
    if (e.target.name === 'ssn' || e.target.name === 'studentId') {
      const numericValue = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, [e.target.name]: numericValue });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
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
      setError('You must use your college email (@commerce.helwan.edu.eg or @fcba.capu.edu.eg)');
      triggerShake();
      return;
    }

    setIsSubmitting(true);

    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.registerStudent) {
      const payload = {
        StudentId: formData.studentId,
        Name: formData.name,
        Email: formData.email,
        SSN: formData.ssn,
        Program: formData.program
      };

      window.TicketAPI.registerStudent(payload)
        .then(() => {
          setSuccess('Registration successful! Redirecting to verify OTP...');
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
          }, 1500);
        })
        .catch((err) => {
          setIsSubmitting(false);
          triggerShake();
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
      triggerShake();
      setError('API not initialized. Ensure TicketAPI is loaded.');
    }
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
      <main className="login-wrapper">
        <div className="login-card">
          <div className="card-header">
            <div className="logo">
              <img src="/login/imgs/image (5).png" alt="Capital University" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name">Capital University</h1>
            <p className="portal-title">Create Student Account</p>
          </div>
          <form className={`login-form ${shake ? 'shake-animation' : ''}`} onSubmit={handleSubmit}>
            
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group" style={{ marginBottom: !formData.email.includes('@') && formData.email.length > 0 ? '4px' : '16px' }}>
              <i className="fas fa-envelope input-icon" style={getIconStyle('email')}></i>
              <input
                type="email"
                name="email"
                placeholder="College Email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                <option value="BIS" style={{ background: '#0f172a' }}>BIS</option>
                <option value="FMI" style={{ background: '#0f172a' }}>FMI</option>
                <option value="SBS" style={{ background: '#0f172a' }}>SBS</option>
              </select>
              <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a5b4fc', pointerEvents: 'none', zIndex: 1 }}></i>
            </div>
            
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '8px', textAlign: 'center', animation: 'pop 0.3s ease' }}>{error}</p>}
            {success && <p role="alert" style={{ color: '#28a745', fontSize: '0.9rem', marginTop: '8px', textAlign: 'center', animation: 'pop 0.3s ease' }}>{success}</p>}
            
            <button type="submit" className="sign-in-btn" style={{ marginTop: '16px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden' }} disabled={isSubmitting}>
              <span style={{ transition: 'opacity 0.2s', opacity: isSubmitting ? 0 : 1 }}>
                Register <i className="fas fa-user-plus" style={{ marginLeft: '4px' }}></i>
              </span>
              {isSubmitting && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-spinner fa-spin"></i> Registering...
                </div>
              )}
            </button>
            <div className="form-options" style={{ justifyContent: 'center', marginTop: '16px' }}>
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
