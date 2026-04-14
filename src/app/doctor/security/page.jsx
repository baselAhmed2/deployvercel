'use client';

import { useState, useEffect } from 'react';
import { TicketAPI } from '../../../lib/api';
import { showToast } from '../../../utils/toast';

export default function SecurityPage() {
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Email State
  const [notifEmail, setNotifEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    // If we have a saved email in localStorage from the modal popup, prepopulate it
    const savedEmail = localStorage.getItem('doctorNotifEmail') || '';
    if (savedEmail) setNotifEmail(savedEmail);
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await TicketAPI.changeDoctorPassword({
        currentPassword: oldPassword,
        newPassword
      });
      setPassSuccess(true);
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err?.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleEmailUpdate = async (e, remove = false) => {
    if (e) e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);

    let finalEmail = notifEmail.trim();

    if (remove) {
      finalEmail = '';
    } else {
      if (!finalEmail) {
        setEmailError('اكتب إيميلك الأول يا دكتور عشان نحفظه.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        setEmailError('شكل الإيميل مش مظبوط، اتأكد منه تاني.');
        return;
      }
    }

    setEmailLoading(true);
    try {
      await TicketAPI.updateDoctorNotificationEmail(finalEmail);
      setEmailSuccess(true);
      if (finalEmail) {
        localStorage.setItem('notifEmailSet', 'true');
        localStorage.setItem('doctorNotifEmail', finalEmail);
        showToast('تم ربط الإيميل بنجاح!', 'success');
      } else {
        localStorage.removeItem('doctorNotifEmail');
        localStorage.setItem('notifEmailSet', 'false');
        setNotifEmail('');
        showToast('تم حذف الإيميل بنجاح!', 'success');
      }
    } catch (err) {
      if (err?.status === 401) {
        setEmailError('جلستك انتهت، من فضلك سجل دخول تاني.');
      } else if (err?.status === 400) {
        setEmailError('حصلت مشكلة في التحديث، اتصل بالدعم الفني.');
      } else {
        setEmailError(err?.message || 'حصل خطأ ومش قادرين نحفظ، جرب كمان شوية.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="toolbar-row">
        <h1 className="page-title" style={{ fontSize: '1.8rem', color: '#1a202c', fontWeight: 'bold' }}>
          <i className="fas fa-user-shield" style={{ marginRight: '10px', color: '#667eea' }}></i>
          Security Settings
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        
        {/* Email Settings Card */}
        <div className="white-card" style={{ padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2d3748', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(102,126,234,0.1)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <i className="fas fa-envelope-open-text"></i>
            </span>
            إيميل الإشعارات والأمان
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.6' }}>
            دي طبقة حماية إضافية ليك! ضيف إيميلك هنا وهنبعتلك ملخص يومي بالتذاكر اللي مستنية ردك وكمان تنبيهات لو في أي تغييرات تخص حسابك.
          </p>

          <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '12px 16px', borderRadius: '4px 8px 8px 4px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
            <i className="fas fa-lightbulb" style={{ color: '#3182ce', marginTop: '3px' }}></i>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#2b6cb0', lineHeight: 1.5 }}>
              <strong>نصيحة:</strong> تقدر تستخدم أي إيميل شخصي (زي Gmail أو Yahoo) ترتاح في استخدامه وبتشوفه كتير، مش شرط أبداً يكون إيميل الجامعة!
            </p>
          </div>

          {emailSuccess && (
            <div className="alert success" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <i className="fas fa-check-circle" style={{ marginTop: '2px', fontSize: '1.1rem' }}></i>
              <span>{notifEmail ? `عظيم جداً! حفظنا إيميلك (${notifEmail}) وهنبعتلك دايماً عليه.` : `تمت إزالة الإيميل. مش هنقدر نبعتلك تنبيهات لحد ما تضيف واحد تاني.`}</span>
            </div>
          )}

          <form onSubmit={(e) => handleEmailUpdate(e, false)} style={{ marginTop: 'auto' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>إيميلك الحالي للطوارئ</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-at" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                <input
                  type="email"
                  value={notifEmail}
                  onChange={e => setNotifEmail(e.target.value)}
                  placeholder="مثال: dr.name@gmail.com"
                  style={{ padding: '14px 14px 14px 40px', width: '100%', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s', outline: 'none', direction: 'ltr' }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  disabled={emailLoading}
                />
              </div>
            </div>

            {emailError && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500' }}><i className="fas fa-exclamation-circle"></i> {emailError}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={emailLoading}
                style={{ flex: 1, padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #48bb78, #38a169)', border: 'none', color: '#fff', cursor: emailLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(56,161,105,0.3)', transition: 'transform 0.2s' }}
                onMouseOver={e => e.target.style.transform = e.target.disabled ? 'none' : 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                {emailLoading ? <><i className="fas fa-spinner fa-spin"></i> بحفظ...</> : <><i className="fas fa-save"></i> حفظ الإيميل</>}
              </button>

              {localStorage.getItem('doctorNotifEmail') && (
                <button
                  type="button"
                  disabled={emailLoading}
                  onClick={(e) => handleEmailUpdate(e, true)}
                  style={{ width: '50px', padding: '14px 0', borderRadius: '10px', fontSize: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', cursor: emailLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => !e.target.disabled && (e.target.style.background = '#fecaca')}
                  onMouseOut={e => !e.target.disabled && (e.target.style.background = '#fee2e2')}
                  title="مسح الإيميل"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="white-card" style={{ padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2d3748', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(237,137,54,0.1)', color: '#ed8936', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <i className="fas fa-key"></i>
            </span>
            Account Access
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Ensure your account is secure. Updating your password will sign you out of all other active sessions securely.
          </p>

          {passSuccess && (
            <div className="alert success" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <i className="fas fa-check-circle" style={{ marginTop: '2px', fontSize: '1.1rem' }}></i>
              <span>Password updated securely. An email confirmation has been sent to your registered address.</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-unlock-alt" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ padding: '14px 14px 14px 40px', width: '100%', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#ed8936'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ padding: '14px 14px 14px 40px', width: '100%', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#ed8936'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-check-double" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ padding: '14px 14px 14px 40px', width: '100%', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#ed8936'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {passError && <p style={{ color: '#e53e3e', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500' }}><i className="fas fa-exclamation-circle"></i> {passError}</p>}

            <button
              type="submit"
              disabled={passLoading}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #ed8936, #dd6b20)', border: 'none', color: '#fff', cursor: passLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(221,107,32,0.3)', transition: 'transform 0.2s' }}
              onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
              {passLoading ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <><i className="fas fa-shield-alt"></i> Update Password</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
