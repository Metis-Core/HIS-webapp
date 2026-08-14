'use client';

import { UserRoleEnum } from '@/enum/user.enum';
import { useAuth } from '@/providers';
import OverviewDashboard from '@/components/dashboards/overview.dashboard';
import ReceptionistDashboard from '@/components/dashboards/receptionist.dashboard';

const OVERVIEW_ROLES: UserRoleEnum[] = [
  UserRoleEnum.SUPER_ADMIN,
  UserRoleEnum.ADMIN,
  UserRoleEnum.DOCTOR,
  UserRoleEnum.NURSE,
];

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === UserRoleEnum.RECEPTIONIST) return <ReceptionistDashboard />;
  if (role && OVERVIEW_ROLES.includes(role)) return <OverviewDashboard />;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="text-lg font-semibold text-zinc-800">Welcome back</p>
      <p className="text-sm text-zinc-500">Your role dashboard is coming soon. Use the sidebar to continue.</p>
    </div>
  );
}
