import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './styles/login.css';
import './styles/dashboard.css';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './components/DashboardLayout';
import StudentTickets from './pages/student/StudentTickets';
import StudentNewTicket from './pages/student/StudentNewTicket';
import StudentTicketDetail from './pages/student/StudentTicketDetail';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorMyCourses from './pages/doctor/DoctorMyCourses';
import DoctorTickets from './pages/doctor/DoctorTickets';
import DoctorTicketDetail from './pages/doctor/DoctorTicketDetail';
import AdminDashboard from './pages/administrator/AdminDashboard';
import AdminTickets from './pages/administrator/AdminTickets';
import AdminTicketDetail from './pages/administrator/AdminTicketDetail';
import AdminUsers from './pages/administrator/AdminUsers';
import AdminUserDetail from './pages/administrator/AdminUserDetail';
import AdminNewUser from './pages/administrator/AdminNewUser';
import AdminAddCourse from './pages/administrator/AdminAddCourse';
import AdminAssignToDoctor from './pages/administrator/AdminAssignToDoctor';
import AdminAnalysis from './pages/administrator/AdminAnalysis';
import AdminSiteSettings from './pages/administrator/AdminSiteSettings';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { to: '/student/new-ticket', label: 'New Ticket', icon: 'fas fa-ticket-alt' },
  { to: '/', label: 'Logout', icon: 'fas fa-sign-out-alt' },
];

const doctorNav = [
  { to: '/doctor', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { to: '/doctor/my-courses', label: 'My Courses', icon: 'fas fa-book' },
  { to: '/doctor/tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
  { to: '/?role=doctor', label: 'Logout', icon: 'fas fa-sign-out-alt' },
];

const adminNav = [
  { to: '/administrator', label: 'Dashboard', icon: 'fas fa-th-large', end: true },
  { to: '/administrator/tickets', label: 'Tickets', icon: 'fas fa-ticket-alt' },
  { to: '/administrator/users', label: 'Users', icon: 'fas fa-users' },
  { to: '/administrator/add-course', label: 'Add Course', icon: 'fas fa-book' },
  { to: '/administrator/assign-to-doctor', label: 'Assign to Doctor', icon: 'fas fa-user-md' },
  { to: '/administrator/analysis', label: 'Analysis', icon: 'fas fa-chart-bar' },
  { to: '/?role=administrator', label: 'Logout', icon: 'fas fa-sign-out-alt' },
];

const adminSidebarFooter = [
  { to: '/administrator/site-settings', label: 'Site Settings', icon: 'fas fa-cog' },
];

function BodyClass() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isLogin = pathname === '/' || pathname.startsWith('/forgettenpassword');
    document.body.className = isLogin ? 'login-body' : 'dashboard-body';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <BodyClass />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgettenpassword" element={<ForgotPassword />} />
        <Route path="/student" element={<DashboardLayout navItems={studentNav} userDisplayName="Alex Robert" />}>
          <Route index element={<StudentTickets />} />
          <Route path="new-ticket" element={<StudentNewTicket />} />
          <Route path="ticket/:id" element={<StudentTicketDetail />} />
        </Route>
        <Route path="/doctor" element={<DashboardLayout navItems={doctorNav} userDisplayName="Alex Robert" />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="my-courses" element={<DoctorMyCourses />} />
          <Route path="tickets" element={<DoctorTickets />} />
          <Route path="ticket/:id" element={<DoctorTicketDetail />} />
        </Route>
        <Route path="/administrator" element={<DashboardLayout navItems={adminNav} sidebarFooter={adminSidebarFooter} userDisplayName="DR Bahlol" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="ticket/:id" element={<AdminTicketDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="new-user" element={<AdminNewUser />} />
          <Route path="add-course" element={<AdminAddCourse />} />
          <Route path="assign-to-doctor" element={<AdminAssignToDoctor />} />
          <Route path="analysis" element={<AdminAnalysis />} />
          <Route path="site-settings" element={<AdminSiteSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
