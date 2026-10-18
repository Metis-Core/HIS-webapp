'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaClipboardList, FaStethoscope, FaUserInjured } from 'react-icons/fa';
import { Button, EmptyState, Pill, Stats } from '@/components';
import PriorityBadge from '@/components/queue/priority-badge';
import { ButtonVariantEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueEntryStatusEnum } from '@/enum/queue.enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import { patientFullName, patientInitials } from '@/data/patients';
import { currentEntry, departmentStageMap, entryStatusMap, stageReadyAt, statusVariants } from '@/data/queue';
import type { IPagination } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import type { IVisitRecord } from '@/interfaces/queue.interfaces';
import { useConsultations, useUnreadNotificationsCount } from '@/hooks';
import useSWR from 'swr';
import { api } from '@/helpers/axios';

type Props = {
  /** Extra header action, e.g. reception's "Register & check in". */
  primaryAction?: { label: string; href: string };
};

// Shared overview for every role; front-desk check-in now lives under Patients > Triage (R4).
export default function OverviewDashboard({ primaryAction }: Props) {
  const router = useRouter();
  const { data } = useSWR<{ data: { data: IPagination<IPatient> } }>('/patients', api);
  const patients = useMemo(() => data?.data.data.items || [], [data]);

  const { data: visitsData } = useSWR<{ data: { data: IPagination<IVisitRecord> } }>('/visits/queues', api);
  const visits = useMemo(() => visitsData?.data.data.items || [], [visitsData]);

  const { consultations } = useConsultations({ limit: 10 });
  const { unread } = useUnreadNotificationsCount();

  const activeQueue = useMemo(
    () =>
      visits
        .map((visit) => ({ visit, entry: currentEntry(visit) }))
        .filter((row) => row.entry && row.entry.status !== QueueEntryStatusEnum.COMPLETED)
        .sort((a, b) => a.entry!.sequenceNumber - b.entry!.sequenceNumber),
    [visits],
  );

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [patients],
  );

  const stats = useMemo(
    () => [
      {
        label: 'Registered patients',
        value: data?.data.data.total ?? patients.length,
        icon: FaUserInjured,
        variant: StatVariantEnum.Green,
      },
      {
        label: 'Patients in queue',
        value: activeQueue.length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Active consultations',
        value: consultations.length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Emerald,
      },
      { label: 'Unread alerts', value: unread, icon: FaBell, variant: StatVariantEnum.Amber },
    ],
    [data, patients, activeQueue, consultations, unread],
  );

  return (
    <div className="flex flex-col gap-8 py-4">
      <Stats items={stats} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-primary">Patient flow</h2>
        <div className="flex flex-wrap gap-3">
          {primaryAction && (
            <Button type="button" onClick={() => router.push(primaryAction.href)} variant={ButtonVariantEnum.PRIMARY}>
              {primaryAction.label}
            </Button>
          )}
          <Button type="button" onClick={() => router.push('/patients')} variant={ButtonVariantEnum.SECONDARY}>
            View all patients
          </Button>
        </div>
      </div>

      <div>
        <div className="overflow-hidden rounded-xl border border-line bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface text-primary">
                <tr>
                  <th className="px-6 py-3 text-md font-bold">Patient</th>
                  <th className="px-6 py-3 text-md font-bold">Stage</th>
                  <th className="px-6 py-3 text-md font-bold">Status</th>
                  <th className="px-6 py-3 text-md font-bold">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex h-64 w-full items-center justify-center">
                        <EmptyState message="No patients in queue" icon={FaClipboardList} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeQueue.map(({ visit, entry }) => {
                    const status = entryStatusMap[entry!.status];
                    const stage = departmentStageMap[entry!.department];
                    return (
                      <tr
                        key={entry!.id}
                        className="border-b border-line last:border-0 transition hover:bg-primary-soft/30"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {visit.patient ? patientFullName(visit.patient) : visit.patientId}
                          <PriorityBadge visit={visit} />
                        </td>
                        <td className="px-6 py-4 capitalize text-zinc-600">{stage.replace('-', ' ')}</td>
                        <td className="px-6 py-4">
                          <Pill variant={statusVariants[status]}>{status.replace('-', ' ')}</Pill>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{formatDistanceToNow(stageReadyAt(visit))}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="text-md font-bold text-primary">Recent patients</h3>
            <Button type="button" onClick={() => router.push('/patients')} variant={ButtonVariantEnum.GHOST}>
              View all
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {recentPatients.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center">
                <EmptyState message="No recent patients" icon={FaUserInjured} />
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                    {patientInitials(patient)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{patientFullName(patient)}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDistanceToNow(patient.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Pill
                    variant={
                      patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS
                    }
                  >
                    {patient.type}
                  </Pill>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="text-md font-bold text-primary">Recent consultations</h3>
            <Button type="button" onClick={() => router.push('/consultations')} variant={ButtonVariantEnum.GHOST}>
              View all
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {consultations.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center">
                <EmptyState message="No consultations yet" icon={FaStethoscope} />
              </div>
            ) : (
              consultations.slice(0, 5).map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {consultation.patient
                        ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
                        : consultation.patientId}
                    </p>
                    <p className="text-xs text-zinc-500">{consultation.chiefComplaint}</p>
                  </div>
                  <Pill
                    variant={
                      consultation.status === 'completed'
                        ? PillVariantEnum.SUCCESS
                        : consultation.status === 'cancelled'
                          ? PillVariantEnum.DEFAULT
                          : PillVariantEnum.INFO
                    }
                  >
                    {consultation.status.replaceAll('_', ' ')}
                  </Pill>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
