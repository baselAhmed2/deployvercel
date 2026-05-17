'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { showToast } from '../../../../utils/toast';

function roleToLabel(r) {
  const s = (r ?? '').toLowerCase();
  if (s === 'doctor') return 'Doctor';
  if (s === 'student') return 'Student';
  if (s === 'superadmin' || s === 'subadmin') return 'Admin';
  return r || 'User';
}

function dotClass(r) {
  const s = (r ?? '').toLowerCase();
  if (s === 'doctor') return 'legend-dot blue';
  if (s === 'student') return 'legend-dot orange';
  return 'legend-dot green';
}

export default function AdminUserDetail() {
  const params = useParams();
  const id = params?.id ?? '';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ssn, setSsn] = useState('');

  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingProgram, setEditingProgram] = useState('');
  const [updateIdentityLoading, setUpdateIdentityLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const isSuperAdmin = userRole === 'SuperAdmin';

  useEffect(() => {
    if (!id || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminUserById) {
      setLoading(false);
      if (!id) setError('Invalid user.');
      return;
    }
    window.TicketAPI.getAdminUserById(id)
      .then((data) => {
        setUser(data);
        setSsn(data?.ssn ?? data?.Ssn ?? data?.SSN ?? '');
        setEditingId(data?.userName ?? data?.UserName ?? data?.id ?? data?.Id ?? id);
        setEditingName(data?.name ?? data?.Name ?? '');
        setEditingProgram(data?.program ?? data?.Program ?? '');
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="toolbar-row" style={{ marginBottom: 20 }}>
          <h1 className="page-title">User Details</h1>
          <Link href="/administrator/users" className="btn-primary"><i className="fas fa-arrow-left"></i> Back to Users</Link>
        </div>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }
  if (error || !user) {
    return (
      <>
        <div className="toolbar-row" style={{ marginBottom: 20 }}>
          <h1 className="page-title">User Details</h1>
          <Link href="/administrator/users" className="btn-primary"><i className="fas fa-arrow-left"></i> Back to Users</Link>
        </div>
        <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error || 'User not found.'}</p>
      </>
    );
  }

  const name = user.name ?? user.Name ?? '—';
  const role = user.role ?? user.Role ?? '';
  const program = user.program ?? user.Program ?? '—';
  const userName = user.userName ?? user.UserName ?? user.id ?? user.Id ?? id;

  const handleUpdateSsn = () => {
    if (!ssn.trim()) {
      showToast('Please enter an SSN.', 'error');
      return;
    }
    
    // Fallback if TicketAPI.updateStudentSsn is not yet available, directly call fetch
    const doUpdate = window.TicketAPI?.updateStudentSsn 
      ? window.TicketAPI.updateStudentSsn(id, ssn.trim())
      : fetch(`https://tiketapp-fagbbecbexf9f0ed.uaenorth-01.azurewebsites.net/api/Admin/students/${id}/ssn`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ newSsn: ssn.trim() })
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update SSN');
          return data;
        });

    setUpdateSsnLoading(true);
    doUpdate
      .then(() => {
        showToast('SSN updated successfully.');
        setUser((prev) => ({ ...prev, ssn: ssn.trim() }));
      })
      .catch((err) => {
        showToast((err && err.message) ? err.message : 'Failed to update SSN.', 'error');
      })
      .finally(() => {
        setUpdateSsnLoading(false);
      });
  const handleUpdateIdentity = async () => {
    if (!editingId.trim() || !editingName.trim()) {
      showToast('ID and Name are required.', 'error');
      return;
    }

    setUpdateIdentityLoading(true);
    
    try {
      // 1. Update Identity (ID, Name, Program)
      const doUpdateIdentity = window.TicketAPI?.updateUserIdentity
        ? window.TicketAPI.updateUserIdentity(id, editingId.trim(), editingName.trim(), editingProgram.trim())
        : fetch(`https://tiketapp-fagbbecbexf9f0ed.uaenorth-01.azurewebsites.net/api/Admin/users/${id}/identity`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ newId: editingId.trim(), newName: editingName.trim(), newProgram: editingProgram.trim() })
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update user identity');
            return data;
          });

      await doUpdateIdentity;

      // 2. Update SSN if it's a student
      if (role.toLowerCase() === 'student' && ssn !== (user.ssn ?? user.Ssn ?? user.SSN ?? '')) {
        const doUpdateSsn = window.TicketAPI?.updateStudentSsn 
          ? window.TicketAPI.updateStudentSsn(editingId.trim(), ssn.trim())
          : fetch(`https://tiketapp-fagbbecbexf9f0ed.uaenorth-01.azurewebsites.net/api/Admin/users/${editingId.trim()}/ssn`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ newSsn: ssn.trim() })
            }).then(async (res) => {
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || 'Failed to update SSN');
              return data;
            });
            
        await doUpdateSsn;
      }

      showToast('User data updated successfully.');
      if (editingId.trim() !== id) {
          window.location.href = `/administrator/users/${editingId.trim()}`;
      } else {
          setUser((prev) => ({ ...prev, name: editingName.trim(), userName: editingId.trim(), program: editingProgram.trim(), ssn: ssn.trim() }));
      }
    } catch (err) {
      showToast((err && err.message) ? err.message : 'Failed to update user data.', 'error');
    } finally {
      setUpdateIdentityLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const doReset = window.TicketAPI?.resetAnyUserPassword
      ? window.TicketAPI.resetAnyUserPassword(id, newPassword)
      : fetch(`https://tiketapp-fagbbecbexf9f0ed.uaenorth-01.azurewebsites.net/api/Admin/users/${id}/reset-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ newPassword })
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to reset password');
          return data;
        });

    setResetPasswordLoading(true);
    doReset
      .then(() => {
        showToast('Password reset successfully.');
        setNewPassword('');
      })
      .catch((err) => {
        showToast((err && err.message) ? err.message : 'Failed to reset password.', 'error');
      })
      .finally(() => setResetPasswordLoading(false));
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div className="toolbar-row" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-user-edit"></i>
          </span>
          User Profile & Settings
        </h1>
        <Link href="/administrator/users" className="btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <i className="fas fa-arrow-left"></i> Back to Directory
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Main Identity Card */}
        <div className="detail-card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, border: '1px solid #edf2f7', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(102,126,234,0.3)', flexShrink: 0 }}>
              {editingName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', color: '#2d3748', fontWeight: 700 }}>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ background: '#edf2f7', color: '#4a5568', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-id-badge"></i> {userName}
                </span>
                <span style={{ background: 'rgba(72, 187, 120, 0.1)', color: '#2f855a', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className={dotClass(role)} style={{ margin: 0 }}></span> {roleToLabel(role)}
                </span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: '#4a5568', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-address-card" style={{ color: '#a0aec0' }}></i> Identity Information
          </h3>

          <div className="form-grid" style={{ gap: 24 }}>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#4a5568', marginBottom: 8, display: 'block' }}>User ID</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-fingerprint" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}></i>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingId} 
                  onChange={(e) => setEditingId(e.target.value)}
                  style={{ paddingLeft: 40, borderColor: '#e2e8f0', borderRadius: 10, width: '100%' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#4a5568', marginBottom: 8, display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}></i>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingName} 
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{ paddingLeft: 40, borderColor: '#e2e8f0', borderRadius: 10, width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#4a5568', marginBottom: 8, display: 'block' }}>Program</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-graduation-cap" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}></i>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingProgram} 
                  onChange={(e) => setEditingProgram(e.target.value)}
                  style={{ paddingLeft: 40, borderColor: '#e2e8f0', borderRadius: 10, width: '100%' }}
                />
              </div>
            </div>

            {role.toLowerCase() === 'student' && (
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#4a5568', marginBottom: 8, display: 'block' }}>SSN (National ID)</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-id-card" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}></i>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={ssn} 
                    onChange={(e) => setSsn(e.target.value)}
                    style={{ paddingLeft: 40, borderColor: '#e2e8f0', borderRadius: 10, width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 12 }}>
              <button 
                type="button" 
                className="btn-primary" 
                disabled={updateIdentityLoading || (editingId === userName && editingName === name && editingProgram === program && ssn === (user.ssn ?? user.Ssn ?? user.SSN ?? ''))}
                onClick={handleUpdateIdentity}
                style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: '1.05rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(102,126,234,0.25)', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
              >
                {updateIdentityLoading ? <><i className="fas fa-spinner fa-spin"></i> Saving Changes...</> : <><i className="fas fa-save"></i> Save All Identity Changes</>}
              </button>
            </div>
          </div>
        </div>

        {/* Security Card (SuperAdmin) */}
        {isSuperAdmin && (
          <div className="detail-card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, border: '1px solid #fee2e2', background: '#fef2f2', boxShadow: '0 4px 15px rgba(220,53,69,0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#b91c1c', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#fee2e2', color: '#dc2626', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-shield-alt"></i>
              </span>
              SuperAdmin Security Actions
            </h3>
            <p style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: 24 }}>
              Force reset this user's password. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px', position: 'relative' }}>
                <i className="fas fa-key" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f87171' }}></i>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter new strong password..."
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 40, borderColor: '#fca5a5', borderRadius: 10, background: '#fff' }}
                />
              </div>
              <button 
                type="button" 
                className="btn-primary" 
                disabled={resetPasswordLoading || !newPassword || newPassword.length < 6}
                onClick={handleResetPassword}
                style={{ flex: '0 1 auto', minWidth: 200, background: '#dc2626', borderColor: '#b91c1c', borderRadius: 10, padding: '12px 24px', fontWeight: 600, boxShadow: '0 4px 12px rgba(220,38,38,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
              >
                {resetPasswordLoading ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</> : <><i className="fas fa-exclamation-triangle"></i> Force Reset Password</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
