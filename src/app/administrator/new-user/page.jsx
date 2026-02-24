'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '../../../utils/toast';

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

export default function AdminNewUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState('Student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('BIS');
  const [saving, setSaving] = useState(false);

  const userRole = getStored('userRole');
  const userProgram = getStored('userProgram');
  const isSubAdmin = userRole === 'SubAdmin';

  useEffect(() => {
    if (roleParam === 'doctor' || roleParam === 'Doctor') setRole('Doctor');
    else if (roleParam === 'student' || roleParam === 'Student') setRole('Student');
    else if (roleParam === 'admin' || roleParam === 'SubAdmin') setRole('SubAdmin');
    else if (roleParam === 'SuperAdmin' && !isSubAdmin) setRole('SuperAdmin');
  }, [roleParam, isSubAdmin]);

  useEffect(() => {
    if (isSubAdmin && userProgram) {
      setProgram(userProgram);
    }
  }, [isSubAdmin, userProgram]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.createAdminUser) {
      showToast('API is not available.', 'error');
      return;
    }
    setSaving(true);
    window.TicketAPI.createAdminUser({
      id: id.trim(),
      password: password.trim(),
      name: name.trim(),
      role,
      program: isSubAdmin ? userProgram : program,
    })
      .then(() => {
        showToast('User created successfully.');
        router.push('/administrator/users');
      })
      .catch((err) => {
        setSaving(false);
        showToast((err && err.message) ? err.message : 'Failed to create user.', 'error');
      });
  };

  const roleOptions = isSubAdmin
    ? [{ value: 'Student', label: 'Student' }, { value: 'Doctor', label: 'Doctor' }, { value: 'SubAdmin', label: 'Sub Admin' }]
    : [{ value: 'Student', label: 'Student' }, { value: 'Doctor', label: 'Doctor' }, { value: 'SubAdmin', label: 'Sub Admin' }, { value: 'SuperAdmin', label: 'Super Admin' }];

  return (
    <>
      <h1 className="page-title">New User</h1>
      <section className="form-section">
        <h2 className="section-title">Create User</h2>
        <p className="section-desc">Add a new user to the system</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Role <span className="required">*</span></label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">User ID (College ID) <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter User ID" value={id} onChange={(e) => setId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password (SSN) <span className="required">*</span></label>
              <input type="password" className="form-input" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Program <span className="required">*</span></label>
              {isSubAdmin ? (
                <input type="text" className="form-input" value={userProgram || 'N/A'} readOnly style={{ background: '#f0f0f0' }} />
              ) : (
                <select className="form-select" value={program} onChange={(e) => setProgram(e.target.value)} required>
                  <option value="BIS">BIS</option>
                  <option value="FMI">FMI</option>
                  <option value="CS">CS</option>
                </select>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </section>
    </>
  );
}
