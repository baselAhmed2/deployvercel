'use client';

import { useState } from 'react';
import { TicketAPI } from '../../../lib/api';
import { showToast } from '../../../utils/toast';

export default function StudentSecurityPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

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
      await TicketAPI.changeUserPassword({
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

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="toolbar-row">
        <h1 className="page-title" style={{ fontSize: '1.8rem', color: '#1a202c', fontWeight: 'bold' }}>
          <i className="fas fa-user-shield" style={{ marginRight: '10px', color: '#667eea' }}></i>
          Security Settings
        </h1>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="white-card" style={{ padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2d3748', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(237,137,54,0.1)', color: '#ed8936', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <i className="fas fa-key"></i>
            </span>
            Change Password
          </h2>
          <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Ensure your account is secure. It's recommended to use a strong password that you haven't used elsewhere.
          </p>

          {passSuccess && (
            <div className="alert success" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <i className="fas fa-check-circle" style={{ marginTop: '2px', fontSize: '1.1rem' }}></i>
              <span>Password updated securely.</span>
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
