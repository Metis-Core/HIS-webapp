'use client';

import { useState } from 'react';
import { FaChartPie, FaTasks } from 'react-icons/fa';
import { Tabs } from '@/components';
import QueueBoard from '@/components/queue/queue-board';
import { UserRoleEnum } from '@/enum/user.enum';
import { roleInGroup } from '@/helpers/role-groups';
import OverviewDashboard from './overview.dashboard';

type AdminTab = 'overview' | 'queue';

function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');
  return (
    <div className="flex flex-col gap-4">
      <Tabs<AdminTab>
        tabs={[
          { id: 'overview', label: 'Overview', icon: FaChartPie },
          { id: 'queue', label: 'Queue', icon: FaTasks },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'queue' ? <QueueBoard /> : <OverviewDashboard />}
    </div>
  );
}

/** Picks the dashboard for the active role (R4: queue under the admin dashboard, check-in out of it). */
export default function RoleDashboard({ role }: { role: UserRoleEnum | null | undefined }) {
  if (roleInGroup(role, 'ADMINS')) return <AdminDashboard />;
  if (role === UserRoleEnum.RECEPTIONIST || role === UserRoleEnum.NURSE) {
    return <OverviewDashboard primaryAction={{ label: 'Check in a patient', href: '/patients?tab=triage' }} />;
  }
  return <OverviewDashboard />;
}
