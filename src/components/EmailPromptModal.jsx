'use client';
import { useState, useEffect } from 'react';
import { TicketAPI } from '../lib/api';

export default function EmailPromptModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSave = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال إيميل صحيح');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await TicketAPI.updateDoctorNotificationEmail(email);
      localStorage.setItem('notifEmailSet', 'true');
      setVisible(false);
      setTimeout(onClose, 300);
    } catch (e) {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('notifEmailSet', 'skipped');
    } else {
      sessionStorage.setItem('notifEmailSessionSkip', 'true');
    }
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(102,126,234,0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '460px',
          width: '90%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'transform 0.3s ease',
          textAlign: 'right',
          direction: 'rtl',
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            fontSize: '32px',
          }}>
            📬
          </div>
        </div>

        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
          إشعارات التذاكر اليومية
        </h2>
        <p style={{ color: '#a0aec0', fontSize: '14px', marginBottom: '28px', textAlign: 'center', lineHeight: 1.7 }}>
          أدخل إيميلك لتصلك رسالة يومية عند وجود تذاكر بحاجة للرد
        </p>

        <label style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          البريد الإلكتروني
        </label>
        <input
          type="email"
          placeholder="example@university.edu"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.07)',
            border: `1px solid ${error ? '#fc8181' : 'rgba(102,126,234,0.4)'}`,
            borderRadius: '10px', color: '#fff', fontSize: '14px',
            outline: 'none', direction: 'ltr', boxSizing: 'border-box',
          }}
          dir="ltr"
          autoFocus
        />
        {error && (
          <p style={{ color: '#fc8181', fontSize: '12px', marginTop: '6px' }}>{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%', marginTop: '20px', padding: '14px',
            background: loading ? '#4a5568' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الإيميل'}
        </button>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            style={{ accentColor: '#667eea', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="dontShowAgain" style={{ color: '#a0aec0', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            لا تظهر هذه الرسالة مرة أخرى
          </label>
        </div>

        <button
          onClick={handleSkip}
          style={{
            width: '100%', marginTop: '10px', padding: '12px',
            background: 'transparent', color: '#718096',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
          }}
        >
          تخطي في الوقت الحالي
        </button>
      </div>
    </div>
  );
}
