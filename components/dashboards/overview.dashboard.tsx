'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { FaClipboardList, FaHeartbeat, FaHourglassHalf, FaNotesMedical, FaPlus, FaUserInjured } from 'react-icons/fa';
import { Button, Pill, Stats } from '@/components';
import { ButtonVariantEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueEntryStatusEnum } from '@/enum/queue.enum';
import { TriageAcuityEnum, TriageStatusEnum } from '@/enum/triage.enum';
import { usePatients, useQueue, useTriage } from '@/hooks';
import { useAuth } from '@/providers';
import type { IPatient, IQueueEntry, ITriage } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();
const acuityLabel = (value: TriageAcuityEnum) => value.replace('LEVEL_', 'Level ');

const queueStatusVariants: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

const acuityVariant = (acuity: TriageAcuityEnum): PillVariantEnum =>
  acuity === TriageAcuityEnum.LEVEL_1 || acuity === TriageAcuityEnum.LEVEL_2
    ? PillVariantEnum.DANGER
    : acuity === TriageAcuityEnum.LEVEL_3
      ? PillVariantEnum.WARNING
      : PillVariantEnum.INFO;

const patientName = (patient?: IPatient) =>
  patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h2>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export default function OverviewDashboard() {
  const { user } = useAuth();
  const { patients, total: patientTotal, isLoading: patientsLoading } = usePatients({ limit: 5 });
  const { entries, total: queueTotal } = useQueue({ limit: 50 });
  const { triages, isLoading: triageLoading } = useTriage({ limit: 50 });

  const waitingQueue = useMemo(
    () => entries.filter((entry) => entry.status === QueueEntryStatusEnum.WAITING),
    [entries],
  );
  const waitingTriage = useMemo(
    () => triages.filter((triage) => triage.status === TriageStatusEnum.WAITING),
    [triages],
  );
  const criticalTriage = useMemo(
    () =>
      triages.filter(
        (triage) => triage.acuity === TriageAcuityEnum.LEVEL_1 || triage.acuity === TriageAcuityEnum.LEVEL_2,
      ),
    [triages],
  );

  const stats = useMemo(
    () => [
      { label: 'Total patients', value: patientTotal, icon: FaUserInjured, variant: StatVariantEnum.Green },
      { label: 'In queue today', value: queueTotal, icon: FaClipboardList, variant: StatVariantEnum.Blue },
      { label: 'Awaiting triage', value: waitingTriage.length, icon: FaHourglassHalf, variant: StatVariantEnum.Amber },
      { label: 'Critical (L1–L2)', value: criticalTriage.length, icon: FaHeartbeat, variant: StatVariantEnum.Emerald },
    ],
    [patientTotal, queueTotal, waitingTriage.length, criticalTriage.length],
  );

  const displayName = user?.firstName || user?.username || 'there';

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/patients">
            <Button type="button" variant={ButtonVariantEnum.PRIMARY}>
              <FaPlus className="text-sm" />
              New patient
            </Button>
          </Link>
          <Link href="/triage">
            <Button type="button" variant={ButtonVariantEnum.SECONDARY}>
              <FaNotesMedical className="text-sm" />
              Triage
            </Button>
          </Link>
        </div>
      </div>

      <Stats items={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent patients"
          action={
            <Link href="/patients" className="text-xs font-semibold text-green-800 hover:underline">
              View all
            </Link>
          }
        >
          {patientsLoading ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Loading…</p>
          ) : patients.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No patients yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {patients.map((patient: IPatient) => {
                const name = patientName(patient);
                return (
                  <li key={patient.id}>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                        {initials(name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900">{name}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {patient.phone ?? patient.mrn ?? '—'}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Queue — waiting now"
          action={
            <Link href="/queue" className="text-xs font-semibold text-green-800 hover:underline">
              Open queue
            </Link>
          }
        >
          {waitingQueue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No one is waiting.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {waitingQueue.slice(0, 6).map((entry: IQueueEntry) => {
                const name = patientName(entry.visit?.patient);
                return (
                  <li key={entry.id}>
                    <Link
                      href={`/queue/${entry.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900">{name}</span>
                        <span className="block truncate text-xs capitalize text-slate-500">
                          {humanize(entry.department)}
                        </span>
                      </span>
                      <Pill variant={queueStatusVariants[entry.status]}>{humanize(entry.status)}</Pill>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Triage — critical & waiting"
          action={
            <Link href="/triage" className="text-xs font-semibold text-green-800 hover:underline">
              Open triage
            </Link>
          }
        >
          {triageLoading ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Loading…</p>
          ) : criticalTriage.length === 0 && waitingTriage.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No active triage records.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...criticalTriage, ...waitingTriage.filter((t) => !criticalTriage.includes(t))]
                .slice(0, 6)
                .map((triage: ITriage) => (
                  <li key={triage.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{patientName(triage.patient)}</span>
                      <span className="block truncate text-xs text-slate-500">{triage.chiefComplaint}</span>
                    </span>
                    <Pill variant={acuityVariant(triage.acuity)}>{acuityLabel(triage.acuity)}</Pill>
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
