'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { UserRoleEnum } from '@/enum/user.enum';
import ReceptionistDashboard from '@/components/dashboards/receptionist.dashboard';

export default function Dashboard() {
  const router = useRouter();
  const { user, effectiveRole: role, isRolePicked } = useAuth();
  const mustPickRole = Boolean(user) && !isRolePicked;

  useEffect(() => {
    if (mustPickRole) router.replace('/');
  }, [mustPickRole, router]);

  if (mustPickRole) return null;

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
