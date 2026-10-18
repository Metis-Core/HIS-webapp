'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import RoleDashboard from '@/components/dashboards/role-dashboard';

export default function Dashboard() {
  const router = useRouter();
  const { user, effectiveRole: role, isRolePicked } = useAuth();
  const mustPickRole = Boolean(user) && !isRolePicked;

  useEffect(() => {
    if (mustPickRole) router.replace('/');
  }, [mustPickRole, router]);

  if (mustPickRole) return null;
  return <RoleDashboard role={role} />;
}
