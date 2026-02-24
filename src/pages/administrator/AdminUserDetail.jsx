import { Link, useParams, useLocation } from 'react-router-dom';

export default function AdminUserDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const user = state?.user || { id: id || '—', roleLabel: 'User', name: '—', ssn: '—', createdAt: '—' };

  const dotClass = (role) => {
    if (role === 'doctor') return 'legend-dot blue';
    if (role === 'student') return 'legend-dot orange';
    return 'legend-dot green';
  };

  return (
    <>
      <div className="toolbar-row" style={{ marginBottom: 20 }}>
        <h1 className="page-title">User Details</h1>
        <Link to="/administrator/users" className="btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Users
        </Link>
      </div>
      <div className="detail-card" style={{ maxWidth: 480 }}>
        <div className="detail-header" style={{ marginBottom: 16 }}>
          <span className={dotClass(user.role)}></span>
          <span className="ticket-id">User ID: {user.id}</span>
        </div>
        <div className="detail-body">
          <div className="form-grid" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="form-input form-input--with-dot">
                <span className={dotClass(user.role)}></span>
                <span>{user.roleLabel}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={user.name} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">SSN</label>
              <input type="text" className="form-input" value={user.ssn} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Created At</label>
              <input type="text" className="form-input" value={user.createdAt} readOnly />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
