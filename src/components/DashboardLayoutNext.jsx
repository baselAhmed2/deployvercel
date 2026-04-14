'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TicketAPI } from '../lib/api';
import EmailPromptModal from './EmailPromptModal';

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

export default function DashboardLayoutNext({ userDisplayName = 'Alex Robert', userAvatarName, navItems, sidebarFooter, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark', next);
      localStorage.setItem('darkMode', String(next));
      return next;
    });
  };

  useEffect(() => {
    const token = getStored('token');
    if (!token) {
      router.replace('/');
      return;
    }
    setAuthorized(true);

    const userRole = getStored('userRole')?.toLowerCase();
    const isDoctorOrAdmin = userRole === 'doctor' || userRole === 'superadmin' || userRole === 'subadmin';
    const notifSet = getStored('notifEmailSet');
    const sessionSkip = sessionStorage.getItem('notifEmailSessionSkip');

    if (isDoctorOrAdmin && notifSet !== 'true' && notifSet !== 'skipped' && !sessionSkip) {
      // Delay prompt slightly to let dashboard load
      setTimeout(() => setShowEmailPrompt(true), 1500);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="skeleton-layout" style={{
        display: 'grid', gridTemplateRows: '64px 1fr', minHeight: '100vh', background: 'var(--sk-bg, #f8f9fa)'
      }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: '1px solid #e9ecef', background: '#fff' }}>
          <div className="skeleton-box" style={{ width: 32, height: 32, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 120, height: 20, borderRadius: 6 }} />
        </div>
        {/* Body skeleton */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: 240, borderRight: '1px solid #e9ecef', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-box" style={{ height: 40, borderRadius: 8 }} />)}
          </div>
          <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton-box" style={{ height: 28, width: 200, borderRadius: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton-box" style={{ height: 100, borderRadius: 12 }} />)}
            </div>
            <div className="skeleton-box" style={{ height: 200, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }
  const displayName = getStored('userName') || userDisplayName;
  const avatarName = userAvatarName || displayName;
  const userRole = getStored('userRole');
  const userProgram = getStored('userProgram');
  const isSubAdmin = userRole === 'SubAdmin';
  const isSuperAdmin = userRole === 'SuperAdmin';

  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
  };

  const isActive = (href, end) => {
    if (!pathname) return false;
    const path = href.split('?')[0];
    if (pathname === path) return true;
    if (end) return false;
    return pathname.startsWith(path + (path === '/' ? '' : '/'));
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button type="button" className="sidebar-toggle" aria-label="Open menu" onClick={openSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <span className="brand">TICKET LEAD</span>
          <span className="welcome-text">Welcome, {displayName ? displayName.split(' ')[0] : ''}!</span>
        </div>
        <div className="header-right">
          {(isSubAdmin || isSuperAdmin) && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              marginRight: 8,
              background: isSuperAdmin ? '#6f42c1' : '#20c997',
              color: '#fff',
            }}>
              {isSuperAdmin ? 'SuperAdmin' : `SubAdmin — ${userProgram || '?'}`}
            </span>
          )}
          {/* ☀️🌙 Dark mode toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleDark}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            <i className="fas fa-sun theme-toggle-icon theme-icon-sun" />
            <i className="fas fa-moon theme-toggle-icon theme-icon-moon" />
          </button>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=6f42c1&color=fff`}
            alt=""
            className="user-avatar"
            style={{ display: 'none' }}
          />
          <span
            className="user-avatar"
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              userSelect: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {avatarName ? avatarName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </span>
          <span className="user-name">{displayName}</span>
        </div>
      </header>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        aria-hidden={!sidebarOpen}
        onClick={closeSidebar}
      />

      <div className="app-body">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar" aria-hidden={!sidebarOpen}>
          <div className="sidebar-header" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 12px 16px' }}>
            <div className="header-logo-tray" style={{ marginBottom: '16px' }}>
              <img src="/Logos/sbs.jpeg" alt="SBS" className="tray-logo" />
              <img src="/Logos/fmi.jpeg" alt="FMI" className="tray-logo" />
              <img src="/Logos/bis.png" alt="BIS" className="tray-logo" />
            </div>
            <button type="button" className="sidebar-close" aria-label="Close menu" onClick={closeSidebar} style={{ position: 'absolute', top: 8, right: 8 }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav>
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={[
                      isActive(item.href, item.end) ? 'nav-link active' : 'nav-link',
                      item.danger ? 'danger' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={(e) => {
                      closeSidebar();
                      if (item.label === 'Logout' && TicketAPI.clearAuth) {
                        TicketAPI.clearAuth();
                      }
                    }}
                  >
                    <i className={item.icon}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {sidebarFooter && (
            <div className="sidebar-footer">
              <ul className="nav-list">
                {sidebarFooter.map((item) => (
                  <li key={item.href} className="nav-item">
                    <Link
                      href={item.href}
                      className={[
                        isActive(item.href, item.end) ? 'nav-link active' : 'nav-link',
                        item.danger ? 'danger' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={(e) => {
                        closeSidebar();
                        if (item.label === 'Logout' && TicketAPI.clearAuth) {
                          TicketAPI.clearAuth();
                        }
                      }}
                    >
                      <i className={item.icon}></i>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <div className="app-layout">
          <main className="main-content">
            {children}
            <footer style={{
              marginTop: 32,
              padding: '20px 0',
              borderTop: '1px solid #dee2e6',
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '0.85rem',
            }}>
              © 2026 BIS TICKET LEAD. All rights reserved.
            </footer>
          </main>
        </div>
      </div>

      {showEmailPrompt && (
        <EmailPromptModal onClose={() => setShowEmailPrompt(false)} />
      )}
    </>
  );
}
