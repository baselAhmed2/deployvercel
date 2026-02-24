import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout({ userDisplayName = 'Alex Robert', userAvatarName, navItems, sidebarFooter }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const avatarName = userAvatarName || userDisplayName;

  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
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
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=6f42c1&color=fff`}
            alt=""
            className="user-avatar"
          />
          <span className="user-name">{userDisplayName}</span>
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
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                    onClick={closeSidebar}
                  >
                    <i className={item.icon}></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {sidebarFooter && (
            <div className="sidebar-footer">
              <ul className="nav-list">
                {sidebarFooter.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                      onClick={closeSidebar}
                    >
                      <i className={item.icon}></i>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <div className="app-layout">
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
