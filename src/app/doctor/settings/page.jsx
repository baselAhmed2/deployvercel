'use client';

import { useState, useEffect } from 'react';
import { TicketAPI } from '../../../lib/api';

export default function DoctorSettingsPage() {
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    TicketAPI.getDoctorNotificationEmail()
      .then(res => {
        const e = res?.email ?? '';
        setEmail(e);
        setSavedEmail(e);
      })
      .catch(() => setError('تعذر تحميل الإيميل'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال إيميل صحيح');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await TicketAPI.updateDoctorNotificationEmail(email);
      setSavedEmail(email);
      setSuccess('تم حفظ الإيميل بنجاح ✓');
      if (email) localStorage.setItem('notifEmailSet', 'true');
      else localStorage.removeItem('notifEmailSet');
    } catch (e) {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Settings</h1>

      <div style={{
        maxWidth: 560,
        background: 'var(--card-bg, rgba(255,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '32px',
      }}>
        <h2 style={{ color: 'var(--text-primary, #fff)', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
          📬 إشعارات التذاكر اليومية
        </h2>
        <p style={{ color: 'var(--text-secondary, #a0aec0)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.7 }}>
          أدخل بريدك الإلكتروني لتصلك رسالة يومية تذكيرية عند وجود تذاكر جديدة بحاجة للرد.
          اتركه فارغاً لإيقاف الإشعارات.
        </p>

        <label style={{ color: 'var(--text-primary, #e2e8f0)', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          البريد الإلكتروني
        </label>
        <input
          type="email"
          placeholder="example@university.edu"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
          disabled={loading}
          dir="ltr"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${error ? '#fc8181' : 'rgba(102,126,234,0.4)'}`,
            borderRadius: 10,
            color: 'var(--text-primary, #fff)',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {error && <p style={{ color: '#fc8181', fontSize: 13, marginTop: 6 }}>{error}</p>}
        {success && <p style={{ color: '#68d391', fontSize: 13, marginTop: 6 }}>{success}</p>}

        {savedEmail && !success && (
          <p style={{ color: '#a0aec0', fontSize: 12, marginTop: 6 }}>
            الإيميل المحفوظ حالياً: <span style={{ color: '#90cdf4' }}>{savedEmail}</span>
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            marginTop: 20,
            padding: '12px 32px',
            background: saving ? '#4a5568' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </>
  );
}
