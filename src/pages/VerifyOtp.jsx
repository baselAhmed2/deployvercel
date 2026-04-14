import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef([]);

  // start a 60-second resend cooldown when the page mounts
  useEffect(() => {
    startCountdown();
  }, []);

  const startCountdown = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const focusNext = (index) => {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };
  const focusPrev = (index) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleDigitChange = (index, value) => {
    // Allow only numeric input
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (cleaned) focusNext(index);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else {
        focusPrev(index);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    // focus last filled or last box
    const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);

    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.verifyOtp) {
      window.TicketAPI.verifyOtp({ email: emailParam, otp })
        .then(() => {
          setSuccess('✅ Email verified! Redirecting to login...');
          setTimeout(() => navigate('/'), 2000);
        })
        .catch((err) => {
          setIsSubmitting(false);
          triggerShake();
          setError(err?.message || 'Invalid or expired OTP. Please try again.');
          // clear digits for re-entry
          setDigits(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
        });
    } else {
      setIsSubmitting(false);
      setError('API not initialized. Please refresh and try again.');
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    // Navigate back to register to trigger re-registration / OTP resend
    navigate('/register');
  };

  const isComplete = digits.every(d => d !== '');
  const maskedEmail = emailParam
    ? emailParam.replace(/(.{2}).+(?=@)/, (_, a) => a + '***')
    : '';

  return (
    <>
      <style>{`
        @keyframes formShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
        }
        .otp-shake { animation: formShake 0.4s ease-in-out; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0%   { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }

        .otp-card {
          animation: fadeSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── OTP Digit Boxes ── */
        .otp-boxes {
          display: flex;
          gap: clamp(6px, 2vw, 12px);
          justify-content: center;
          margin: 24px 0 8px;
        }
        .otp-digit {
          width: clamp(42px, 12vw, 56px);
          height: clamp(52px, 14vw, 66px);
          border-radius: 12px;
          border: 2px solid rgba(165, 180, 252, 0.2);
          background: rgba(15, 23, 42, 0.6);
          color: #fff;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          caret-color: #818cf8;
        }
        .otp-digit:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18);
          transform: scale(1.06);
        }
        .otp-digit.filled {
          border-color: rgba(99, 102, 241, 0.55);
          background: rgba(99, 102, 241, 0.12);
        }
        .otp-digit.filled:focus {
          border-color: #818cf8;
        }

        /* ── Email badge ── */
        .email-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.82rem;
          color: #c7d2fe;
          font-weight: 500;
          margin-top: 4px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Progress dots ── */
        .otp-progress {
          display: flex;
          gap: 5px;
          justify-content: center;
          margin-bottom: 6px;
        }
        .otp-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(165, 180, 252, 0.2);
          transition: background 0.2s, transform 0.2s;
        }
        .otp-dot.active {
          background: #6366f1;
          transform: scale(1.3);
        }

        /* ── Resend button ── */
        .resend-btn {
          background: none;
          border: none;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s, opacity 0.2s;
          padding: 0;
        }
        .resend-btn.ready { color: #818cf8; }
        .resend-btn.ready:hover { color: #a5b4fc; text-decoration: underline; }
        .resend-btn.waiting { color: #475569; cursor: default; }

        /* ── Responsive card override ── */
        @media (max-width: 480px) {
          .login-card { padding: 28px 18px 24px !important; }
          .otp-boxes { gap: 7px; }
        }
      `}</style>

      <div className="background">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
      </div>

      <main className="login-wrapper">
        <div className="login-card otp-card">
          <div className="card-header">
            <div className="logo">
              <img
                src="/login/imgs/image (5).png"
                alt="Capital University"
                className="logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h1 className="university-name">Verify Your Email</h1>
            <p className="portal-title" style={{ marginBottom: '6px' }}>
              We sent a 6-digit code to
            </p>
            {maskedEmail && (
              <span className="email-badge">
                <i className="fas fa-envelope" style={{ fontSize: '0.75rem', color: '#818cf8' }}></i>
                {maskedEmail}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className={shake ? 'otp-shake' : ''}>
            {/* ── 6-box OTP input ── */}
            <div className="otp-boxes" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  className={`otp-digit ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  disabled={isSubmitting}
                  aria-label={`OTP digit ${i + 1}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Progress dots */}
            <div className="otp-progress">
              {digits.map((d, i) => (
                <div key={i} className={`otp-dot ${d ? 'active' : ''}`}></div>
              ))}
            </div>

            {/* Messages */}
            {error && (
              <p role="alert" style={{ color: '#f87171', fontSize: '0.88rem', textAlign: 'center', margin: '10px 0 4px', animation: 'pop 0.3s ease' }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 5 }}></i>{error}
              </p>
            )}
            {success && (
              <p role="alert" style={{ color: '#34d399', fontSize: '0.88rem', textAlign: 'center', margin: '10px 0 4px', animation: 'pop 0.3s ease' }}>
                {success}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="sign-in-btn"
              disabled={isSubmitting || !isComplete}
              style={{
                marginTop: '16px',
                opacity: (isSubmitting || !isComplete) ? 0.65 : 1,
                cursor: (isSubmitting || !isComplete) ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'opacity 0.2s'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="fas fa-spinner fa-spin"></i> Verifying...
                </span>
              ) : (
                <span>
                  Verify OTP <i className="fas fa-check-circle" style={{ marginLeft: 5 }}></i>
                </span>
              )}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className={`resend-btn ${resendCountdown === 0 ? 'ready' : 'waiting'}`}
                onClick={handleResend}
                disabled={resendCountdown > 0}
              >
                {resendCountdown > 0
                  ? `Resend OTP in ${resendCountdown}s`
                  : '↩ Resend OTP / Back to Register'}
              </button>
            </div>

            <div className="form-options" style={{ justifyContent: 'center', marginTop: '10px' }}>
              <Link to="/" className="forgot-link">Already verified? Login</Link>
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
