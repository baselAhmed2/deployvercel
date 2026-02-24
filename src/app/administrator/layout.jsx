import DashboardLayoutNext from '../../components/DashboardLayoutNext';
import { adminNav, adminSidebarFooter } from '../../lib/navConfig';

export default function AdministratorLayout({ children }) {
  return (
    <DashboardLayoutNext navItems={adminNav} sidebarFooter={adminSidebarFooter} userDisplayName="DR Bahlol">
      {children}
    </DashboardLayoutNext>
  );
}
