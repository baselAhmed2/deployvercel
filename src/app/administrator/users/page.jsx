'use client';

import { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { showToast } from '../../../utils/toast';

function userDetailHref(user) {
  const id = user.id ?? user.Id ?? '';
  return `/administrator/users/${id}`;
}

function roleToLabel(r) {
  const s = (r ?? '').toLowerCase();
  if (s === 'doctor') return 'Doctor';
  if (s === 'student') return 'Student';
  if (s === 'superadmin' || s === 'subadmin') return 'Admin';
  return r || 'User';
}

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('q') || '';

  const userRole = getStored('userRole');
  const isSubAdmin = userRole === 'SubAdmin';

  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminUsers) {
      setLoading(false);
      setError('API is not available.');
      return;
    }
    setLoading(true);
    setError('');
    window.TicketAPI.getAdminUsers(pageParam, 10, searchInput.trim())
      .then((res) => {
        const data = res?.data ?? res?.Data ?? [];
        let items = Array.isArray(data) ? data : [];
        if (filterParam === 'students') items = items.filter((u) => ((u.role ?? u.Role) ?? '').toLowerCase() === 'student');
        else if (filterParam === 'doctors') items = items.filter((u) => ((u.role ?? u.Role) ?? '').toLowerCase() === 'doctor');
        else if (filterParam === 'admins') items = items.filter((u) => { const r = ((u.role ?? u.Role) ?? '').toLowerCase(); return r === 'superadmin' || r === 'subadmin'; });
        setUsers(items);
        setPagination({ totalPages: res?.totalPages ?? res?.TotalPages ?? 1 });
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [pageParam, filterParam, searchInput]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const userId = userToDelete.id ?? userToDelete.Id;
    if (!userId || !window.TicketAPI?.deleteAdminUser) {
      setUserToDelete(null);
      return;
    }
    window.TicketAPI.deleteAdminUser(userId)
      .then(() => {
        setUsers((prev) => prev.filter((u) => (u.id ?? u.Id) !== userId));
        setUserToDelete(null);
        showToast('User deleted successfully.');
      })
      .catch((err) => {
        showToast((err && err.message) ? err.message : 'Failed to delete.', 'error');
        setUserToDelete(null);
      });
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const dotClass = (role) => {
    const r = (role ?? '').toLowerCase();
    if (r === 'doctor') return 'user-card-dot doctor';
    if (r === 'student') return 'user-card-dot student';
    return 'user-card-dot admin';
  };

  const tabClass = (tab) => (!tab && !filterParam) || tab === filterParam ? 'tab active' : 'tab';
  const pageHref = (p) => {
    const params = new URLSearchParams();
    if (filterParam) params.set('filter', filterParam);
    if (searchInput) params.set('q', searchInput);
    if (p > 1) params.set('page', String(p));
    return `/administrator/users${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <>
      <div className="toolbar-row">
        <h1 className="page-title">Users</h1>
        <div className={'new-user-wrap' + (newUserOpen ? ' open' : '')}>
          <button type="button" className="btn-primary" onClick={() => setNewUserOpen(!newUserOpen)}>
            <i className="fas fa-plus"></i> New User <i className="fas fa-chevron-down" style={{ marginLeft: 4, fontSize: '0.75rem' }}></i>
          </button>
          <ul className="new-user-dropdown">
            <li><Link href="/administrator/new-user?role=doctor" onClick={() => setNewUserOpen(false)}><span className="legend-dot blue"></span> Doctor</Link></li>
            <li><Link href="/administrator/new-user?role=student" onClick={() => setNewUserOpen(false)}><span className="legend-dot orange"></span> Student</Link></li>
            <li><Link href="/administrator/new-user?role=SubAdmin" onClick={() => setNewUserOpen(false)}><span className="legend-dot green"></span> Sub Admin</Link></li>
            {!isSubAdmin && (
              <li><Link href="/administrator/new-user?role=SuperAdmin" onClick={() => setNewUserOpen(false)}><span className="legend-dot" style={{ background: '#6f42c1' }}></span> Super Admin</Link></li>
            )}
          </ul>
        </div>
      </div>
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input
            type="search"
            className="search-input"
            placeholder="Search by User ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search users"
          />
        </div>
      </div>
      <div className="tabs">
        <Link href="/administrator/users" className={tabClass('')}><i className="fas fa-users"></i> All Users</Link>
        <Link href="/administrator/users?filter=students" className={tabClass('students')}><i className="fas fa-user-graduate"></i> Students</Link>
        <Link href="/administrator/users?filter=doctors" className={tabClass('doctors')}><i className="fas fa-user-md"></i> Doctors</Link>
        <Link href="/administrator/users?filter=admins" className={tabClass('admins')}><i className="fas fa-user-shield"></i> Admins</Link>
      </div>
      {loading && <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>}
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      {!loading && !error && (
        <div className="user-list">
          {users.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 32, color: '#666' }}>No users found.</p>
          ) : (
            users.map((user) => {
              const id = user.id ?? user.Id ?? user.userName ?? user.UserName ?? '';
              const role = user.role ?? user.Role ?? '';
              const name = user.name ?? user.Name ?? '—';
              const userName = user.userName ?? user.UserName ?? id;
              return (
                <div key={id} className="user-card">
                  <div className="user-card-info">
                    <div className="user-card-id"><span className={dotClass(role)}></span> User ID: {userName}</div>
                    <div className="user-card-name">{roleToLabel(role)}: {name}</div>
                    <div className="user-card-ssn">Program: {user.program ?? user.Program ?? '—'}</div>
                  </div>
                  <div className="user-card-actions">
                    <Link href={userDetailHref(user)} className="btn-primary btn-sm"><i className="fas fa-user"></i> View Details</Link>
                    <button type="button" className="btn-danger" onClick={() => handleDeleteClick(user)}><i className="fas fa-trash-alt"></i> Delete User</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Users pagination">
          <Link href={pageHref(Math.max(1, pageParam - 1))}>
            <button type="button" disabled={pageParam <= 1}>Previous</button>
          </Link>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={pageHref(p)} className={p === pageParam ? 'active' : ''} aria-current={p === pageParam ? 'page' : undefined}>{p}</Link>
          ))}
          <Link href={pageHref(Math.min(pagination.totalPages, pageParam + 1))}>
            <button type="button" disabled={pageParam >= pagination.totalPages}>Next</button>
          </Link>
        </nav>
      )}

      {userToDelete && createPortal(
        <div className="confirm-overlay" onClick={handleCancelDelete} role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-delete-title">Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>
            <div className="confirm-modal-actions">
              <button type="button" className="btn-primary" onClick={handleCancelDelete}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleConfirmDelete}><i className="fas fa-trash-alt"></i> Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function AdminUsers() {
  return (
    <Suspense fallback={<div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
