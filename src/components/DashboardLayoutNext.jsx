'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

export default function DashboardLayoutNext({ userDisplayName = 'Alex Robert', userAvatarName, navItems, sidebarFooter, children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          <span className="welcome-text">Welcome!</span>
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
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=6f42c1&color=fff`}
            alt=""
            className="user-avatar"
          />
          <span className="user-name">{displayName}</span>
          <button type="button" className="user-menu-btn" aria-label="User menu">
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>
      </header>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        aria-hidden={!sidebarOpen}
        onClick={closeSidebar}
      />

      <div className="app-body">
        <aside className="sidebar" id="sidebar" aria-hidden={!sidebarOpen}>
          <div className="sidebar-header">
            <span className="brand">TICKET LEAD</span>
            <button type="button" className="sidebar-close" aria-label="Close menu" onClick={closeSidebar}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav>
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={isActive(item.href, item.end) ? 'nav-link active' : 'nav-link'}
                    onClick={closeSidebar}
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
                      className={isActive(item.href, item.end) ? 'nav-link active' : 'nav-link'}
                      onClick={closeSidebar}
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
          </main>
        </div>
      </div>
    </>
  );
}
