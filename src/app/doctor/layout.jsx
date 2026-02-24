import DashboardLayoutNext from '../../components/DashboardLayoutNext';
import { doctorNav } from '../../lib/navConfig';

export default function DoctorLayout({ children }) {
  return (
    <DashboardLayoutNext navItems={doctorNav} userDisplayName="Alex Robert">
      {children}
    </DashboardLayoutNext>
  );
}
