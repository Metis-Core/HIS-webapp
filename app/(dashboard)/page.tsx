'use client';

import { UserRoleEnum } from '@/enum/user.enum';
import ReceptionistDashboard from '@/components/dashboards/receptionist.dashboard';

export default function Dashboard() {
  const role = UserRoleEnum.RECEPTIONIST;
  const renderDashboard = () => {
    switch (role) {
      case UserRoleEnum.RECEPTIONIST:
        return <ReceptionistDashboard />;
      default:
        return <div>Dashboard not available for this role.</div>;
    }
  };
  return renderDashboard();
}
