export const studentNav = [
  { href: '/student', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { href: '/student/new-ticket', label: 'New Ticket', icon: 'fas fa-ticket-alt' },
  { href: '/', label: 'Logout', icon: 'fas fa-sign-out-alt', end: true },
];

export const doctorNav = [
  { href: '/doctor', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { href: '/doctor/my-courses', label: 'My Courses', icon: 'fas fa-book' },
  { href: '/doctor/tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
  { href: '/', label: 'Logout', icon: 'fas fa-sign-out-alt', end: true },
];

export const adminNav = [
  { href: '/administrator', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { href: '/administrator/tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
  { href: '/administrator/users', label: 'Users', icon: 'fas fa-users' },
  { href: '/administrator/add-subject', label: 'Add Subject', icon: 'fas fa-book-open' },
  { href: '/administrator/add-course', label: 'Assign Subjects to Doctor', icon: 'fas fa-user-plus' },
  { href: '/administrator/analysis', label: 'Analysis', icon: 'fas fa-chart-bar' },
  { href: '/', label: 'Logout', icon: 'fas fa-sign-out-alt', end: true },
];

export const adminSidebarFooter = [
  { href: '/administrator/site-settings', label: 'Site Settings', icon: 'fas fa-cog' },
];
