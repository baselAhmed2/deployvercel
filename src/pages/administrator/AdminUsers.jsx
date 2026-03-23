import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { showToast } from '../../utils/toast';

const initialUsers = [
  { id: '512393201', role: 'doctor', roleLabel: 'Doctor', name: 'Mohamed Ahmed Sayed', ssn: '30409220104425', createdAt: '22-11-2024' },
  { id: '512393207', role: 'student', roleLabel: 'Student', name: 'Mohamed Ahmed Sayed', ssn: '30409220104425', createdAt: '22-11-2024' },
  { id: '512393207a', role: 'admin', roleLabel: 'Admin', name: 'Mohamed Ahmed Sayed', ssn: '30409220104425', createdAt: '22-11-2024' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
    showToast('User deleted successfully.');
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const dotClass = (role) => {
    if (role === 'doctor') return 'user-card-dot doctor';
    if (role === 'student') return 'user-card-dot student';
    return 'user-card-dot admin';
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
            <li><Link to="/administrator/new-user?role=doctor" onClick={() => setNewUserOpen(false)}><span className="legend-dot blue"></span> Doctor</Link></li>
            <li><Link to="/administrator/new-user?role=student" onClick={() => setNewUserOpen(false)}><span className="legend-dot orange"></span> Student</Link></li>
            <li><Link to="/administrator/new-user?role=admin" onClick={() => setNewUserOpen(false)}><span className="legend-dot green"></span> Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fas fa-search"></i>
          <input type="search" className="search-input" placeholder="Search by User ID" />
        </div>
      </div>
      <div className="tabs">
        <Link to="/administrator/users" className="tab active"><i className="fas fa-users"></i> All Users</Link>
        <Link to="/administrator/users?filter=students" className="tab"><i className="fas fa-user-graduate"></i> Students</Link>
        <Link to="/administrator/users?filter=doctors" className="tab"><i className="fas fa-user-md"></i> Doctors</Link>
        <Link to="/administrator/users?filter=admins" className="tab"><i className="fas fa-user-shield"></i> Admins</Link>
      </div>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-info">
              <div className="user-card-id"><span className={dotClass(user.role)}></span> User ID: {user.id}</div>
              <div className="user-card-name">{user.roleLabel}: {user.name}</div>
              <div className="user-card-ssn">SSN: {user.ssn}</div>
            </div>
            <span className="user-card-meta">Created At {user.createdAt}</span>
            <div className="user-card-actions">
              <Link to={`/administrator/users/${user.id}`} className="btn-primary btn-sm" state={{ user }}><i className="fas fa-user"></i> View Details</Link>
              <button type="button" className="btn-danger" onClick={() => handleDeleteClick(user)}><i className="fas fa-trash-alt"></i> Delete User</button>
            </div>
          </div>
        ))}
      </div>
      <nav className="pagination" aria-label="Users pagination">
        <button type="button" disabled>Previous</button>
        <Link to="/administrator/users?page=1" className="active" aria-current="page">1</Link>
        <Link to="/administrator/users?page=2">2</Link>
        <button type="button">Next</button>
      </nav>

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
