'use client';

import { useParams } from 'next/navigation';
import { FaCalendarCheck, FaFileMedical, FaHeartbeat, FaHistory, FaIdCard } from 'react-icons/fa';
import { LinkTabs } from '@/components';
import type { LinkTabItem } from '@/components/layout/link-tabs';
import { usePatient } from '@/hooks';
import PatientBanner from '../components/patient-banner';

export default function PatientDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const { patient, isLoading } = usePatient(params.id);

  const base = `/patients/${params.id}`;
  const tabs: LinkTabItem[] = [
    { href: base, label: 'Overview', icon: FaIdCard, matchExact: true },
    { href: `${base}/treatments`, label: 'Treatments', icon: FaFileMedical },
    { href: `${base}/appointments`, label: 'Appointments', icon: FaCalendarCheck },
    { href: `${base}/triage`, label: 'Triage', icon: FaHeartbeat },
    { href: `${base}/visits`, label: 'Visits', icon: FaHistory },
  ];

  return (
    <div className="flex flex-col gap-4">
      {patient ? (
        <PatientBanner patient={patient} />
      ) : (
        <div className="h-24 rounded-lg border border-line bg-surface-raised" aria-busy={isLoading} />
      )}
      <LinkTabs tabs={tabs} />
      <div>{children}</div>
    </div>
  );
}
