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
  const [updateSsnLoading, setUpdateSsnLoading] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');
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
  const handleUpdateIdentity = () => {
    if (!editingId.trim() || !editingName.trim()) {
      showToast('ID and Name are required.', 'error');
      return;
    }

    const doUpdate = window.TicketAPI?.updateUserIdentity
      ? window.TicketAPI.updateUserIdentity(id, editingId.trim(), editingName.trim())
      : fetch(`https://tiketapp-fagbbecbexf9f0ed.uaenorth-01.azurewebsites.net/api/Admin/users/${id}/identity`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ newId: editingId.trim(), newName: editingName.trim() })
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update user identity');
          return data;
        });

    setUpdateIdentityLoading(true);
    doUpdate
      .then(() => {
        showToast('User identity updated successfully.');
        if (editingId.trim() !== id) {
            window.location.href = `/administrator/users/${editingId.trim()}`;
        } else {
            setUser((prev) => ({ ...prev, name: editingName.trim(), userName: editingId.trim() }));
        }
      })
      .catch((err) => {
        showToast((err && err.message) ? err.message : 'Failed to update user identity.', 'error');
      })
      .finally(() => {
        setUpdateIdentityLoading(false);
      });
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
    <>
      <div className="toolbar-row" style={{ marginBottom: 20 }}>
        <h1 className="page-title">User Details</h1>
        <Link href="/administrator/users" className="btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Users
        </Link>
      </div>
      <div className="detail-card" style={{ maxWidth: 480 }}>
        <div className="detail-header" style={{ marginBottom: 16 }}>
          <span className={dotClass(role)}></span>
          <span className="ticket-id">User ID: {userName}</span>
        </div>
        <div className="detail-body">
          <div className="form-grid" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="form-input form-input--with-dot">
                <span className={dotClass(role)}></span>
                <span>{roleToLabel(role)}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">User ID</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingId} 
                onChange={(e) => setEditingId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingName} 
                onChange={(e) => setEditingName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Program</label>
              <input type="text" className="form-input" value={program} readOnly />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <button 
                type="button" 
                className="btn-primary" 
                disabled={updateIdentityLoading || (editingId === userName && editingName === name)}
                onClick={handleUpdateIdentity}
              >
                {updateIdentityLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Save ID & Name'}
              </button>
            </div>
            {role.toLowerCase() === 'student' && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">SSN (National ID)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={ssn} 
                    onChange={(e) => setSsn(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <button 
                    type="button" 
                    className="btn-primary" 
                    disabled={updateSsnLoading}
                    onClick={handleUpdateSsn}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {updateSsnLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Update SSN'}
                  </button>
                </div>
              </div>
            )}
            
            {isSuperAdmin && (
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 16, borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: 16 }}>
                <label className="form-label" style={{ color: '#dc3545' }}><i className="fas fa-key"></i> SuperAdmin: Reset Password</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="New password (min 6 chars)"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <button 
                    type="button" 
                    className="btn-primary" 
                    disabled={resetPasswordLoading}
                    onClick={handleResetPassword}
                    style={{ whiteSpace: 'nowrap', background: '#dc3545' }}
                  >
                    {resetPasswordLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Reset Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
