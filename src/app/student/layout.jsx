import DashboardLayoutNext from '../../components/DashboardLayoutNext';
import { studentNav } from '../../lib/navConfig';

export default function StudentLayout({ children }) {
  return (
    <DashboardLayoutNext navItems={studentNav} userDisplayName="Alex Robert">
      {children}
    </DashboardLayoutNext>
  );
}
