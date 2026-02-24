'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ROLE_DASHBOARDS = { student: '/student', doctor: '/doctor', administrator: '/administrator' };

/** Backend roles (Student, Doctor, SuperAdmin, SubAdmin) -> frontend path */
function roleToDashboardPath(role) {
  if (!role) return ROLE_DASHBOARDS.student;
  const r = role.toLowerCase();
  if (r === 'doctor') return ROLE_DASHBOARDS.doctor;
  if (r === 'superadmin' || r === 'subadmin') return ROLE_DASHBOARDS.administrator;
  return ROLE_DASHBOARDS.student;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.clearAuth) {
      window.TicketAPI.clearAuth();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sid = studentId.trim();
    const pwd = password;
    if (!sid || !pwd) {
      setError('Please enter Student ID and Password.');
      return;
    }
    setError('');
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.login) {
      setError('Login service is not available.');
      return;
    }
    window.TicketAPI.login(sid, pwd)
      .then((res) => {
        const token = res?.token ?? res?.Token;
        const role = res?.role ?? res?.Role;
        if (res && token) {
          try {
            localStorage.setItem('token', token);
            const name = res?.name ?? res?.Name;
            const userId = res?.userId ?? res?.UserId;
            const program = res?.program ?? res?.Program;
            if (name != null) localStorage.setItem('userName', name);
            if (userId != null) localStorage.setItem('userId', userId);
            if (role != null) localStorage.setItem('userRole', role);
            if (program != null) localStorage.setItem('userProgram', program);
            else localStorage.removeItem('userProgram');
          } catch (_) {}
          router.push(roleToDashboardPath(role));
        } else {
          setError('Invalid response from server.');
        }
      })
      .catch((err) => {
        const msg = (err && err.message) ? err.message : 'Invalid Student ID or Password.';
        setError(msg);
      });
  };

  const portalTitle =
    role === 'doctor'
      ? 'Doctor Portal'
      : role === 'administrator'
        ? 'Admin Portal'
        : 'Student Ticketing Portal';

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
              <img src="/login/imgs/image%20(5).png" alt="Capital University" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
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
            <div className="input-group input-group--password">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
            </div>
            {error && <p role="alert" style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: 8 }}>{error}</p>}
            <button type="submit" className="sign-in-btn">
              Sign In
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </main>
      <footer className="page-footer">
        © 2026 Capital University. All rights reserved.
      </footer>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
