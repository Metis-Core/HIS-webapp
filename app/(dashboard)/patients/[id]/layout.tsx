'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { FaCalendarCheck, FaFileMedical, FaHeartbeat, FaHistory, FaIdCard } from 'react-icons/fa';
import { LinkTabs } from '@/components';
import type { LinkTabItem } from '@/components/layout/link-tabs';
import { api } from '@/helpers/axios';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientBanner from '../components/patient-banner';

export default function PatientDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useSWR<{ data: { data: IPatient } }>(`/patients/${params.id}`, api);
  const patient = data?.data.data;

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
