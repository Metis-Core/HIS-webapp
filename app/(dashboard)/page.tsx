'use client';

import { useAuth } from '@/providers';
import { UserRoleEnum } from '@/enum/user.enum';
import ReceptionistDashboard from '@/components/dashboards/receptionist.dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const renderDashboard = () => {
    switch (role) {
      case UserRoleEnum.SUPER_ADMIN:
      case UserRoleEnum.ADMIN:
      case UserRoleEnum.RECEPTIONIST:
      case UserRoleEnum.DOCTOR:
      case UserRoleEnum.NURSE:
      case UserRoleEnum.LAB_TECH:
      case UserRoleEnum.PHARMACIST:
      case UserRoleEnum.ACCOUNTANT:
        return <ReceptionistDashboard />;
      default:
        return <ReceptionistDashboard />;
    }
  };
  return renderDashboard();
}
