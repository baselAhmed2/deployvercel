'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TicketAPI } from '../lib/api';

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
  }, [router]);

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
        <p style={{ color: '#666' }}>Checking authorization...</p>
        <p style={{ fontSize: '0.9rem', color: '#999' }}>Redirecting to login if not authenticated</p>
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
          />
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
    </>
  );
}
