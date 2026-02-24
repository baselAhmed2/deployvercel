import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ROLE_DASHBOARDS = { student: '/student', doctor: '/doctor', administrator: '/administrator' };

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const fromDoctor = searchParams.get('from') === 'doctor';
  const fromAdmin = searchParams.get('from') === 'administrator';
  const dashboardPath = ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS.student;

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const sid = studentId.trim();
    const pwd = password;
    if (!sid || !pwd) {
      setError('Please enter Student ID and Password.');
      return;
    }
    setError('');
    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.login) {
      window.TicketAPI.login(sid, pwd)
        .then(() => navigate(dashboardPath))
        .catch((err) => {
          const msg = (err && err.message) ? err.message : 'Invalid Student ID or Password.';
          setError(msg);
        });
    } else {
      navigate(dashboardPath);
    }
  };

  const portalTitle =
    role === 'doctor'
      ? 'Doctor Portal'
      : role === 'administrator'
        ? 'Admin Portal'
        : 'Student Ticketing Portal';

  const portalLinks = (() => {
    const linkStyle = { marginRight: 12 };
    if (role === 'student') {
      const links = [];
      if (fromDoctor) links.push(<Link key="doctor" to="/?role=doctor" className="forgot-link">Doctor Portal</Link>);
      if (fromAdmin) links.push(<Link key="admin" to="/?role=administrator" className="forgot-link" style={links.length ? linkStyle : {}}>Admin Portal</Link>);
      return links;
    }
    if (role === 'doctor') {
      const links = [<Link key="student" to="/?from=doctor" className="forgot-link" style={linkStyle}>Student Portal</Link>];
      if (fromAdmin) links.push(<Link key="admin" to="/?role=administrator" className="forgot-link">Admin Portal</Link>);
      return links;
    }
    return [
      <Link key="student" to="/?from=administrator" className="forgot-link" style={linkStyle}>Student Portal</Link>,
      <Link key="doctor" to="/?role=doctor&from=administrator" className="forgot-link">Doctor Portal</Link>,
    ];
  })();

  return (
    <>
      <div className="background">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
      </div>
      <main className="login-wrapper">
        <div className="login-card">
          <div className="card-header">
            <div className="logo">
              <img src="/login/imgs/image (5).png" alt="Capital University" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="university-name">Capital University</h1>
            <p className="portal-title">{portalTitle}</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                placeholder="Student ID"
                autoComplete="username"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <Link to="/forgettenpassword" className="forgot-link">Forgot Password?</Link>
            </div>
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8 }}>{error}</p>}
            <button type="submit" className="sign-in-btn">
              Sign In
              <i className="fas fa-arrow-right"></i>
            </button>
            {portalLinks.length > 0 && (
              <p style={{ textAlign: 'center', marginTop: 14 }}>
                {portalLinks}
              </p>
            )}
          </form>
        </div>
      </main>
      <footer className="page-footer">
        © 2026 Capital University. All rights reserved.
      </footer>
    </>
  );
}
