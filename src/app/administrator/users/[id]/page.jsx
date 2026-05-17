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
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Program</label>
              <input type="text" className="form-input" value={program} readOnly />
            </div>
            {role.toLowerCase() === 'student' && (
              <div className="form-group">
                <label className="form-label">SSN (National ID)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={ssn} 
                    onChange={(e) => setSsn(e.target.value)}
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
          </div>
        </div>
      </div>
    </>
  );
}
