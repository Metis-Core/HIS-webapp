'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaFlask,
  FaMapMarkerAlt,
  FaPhone,
  FaPills,
  FaShieldAlt,
  FaStethoscope,
  FaTrash,
  FaUserInjured,
} from 'react-icons/fa';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { Button, EmptyState, Pill } from '@/components';
import { ButtonVariantEnum, DepartmentEnum, PillVariantEnum, QueueEntryStatusEnum } from '@/enum';
import { api } from '@/helpers/axios';
import visitsService from '@/helpers/visits.service';
import { useConsultationsByVisit, useLabOrdersByConsultation } from '@/hooks';
import type { IConsultation, IQueueEntryRecord, IVisitRecord } from '@/interfaces';

const DEPT_LABEL: Record<DepartmentEnum, string> = {
  [DepartmentEnum.RECEPTION]: 'Reception',
  [DepartmentEnum.TRIAGE]: 'Triage',
  [DepartmentEnum.OUTPATIENT_CLINIC]: 'Consultation',
  [DepartmentEnum.INPATIENT_WARD]: 'Inpatient ward',
  [DepartmentEnum.MAIN_LABORATORY]: 'Laboratory',
  [DepartmentEnum.RADIOLOGY]: 'Radiology',
  [DepartmentEnum.MAIN_PHARMACY]: 'Pharmacy',
  [DepartmentEnum.FINANCE]: 'Finance',
  [DepartmentEnum.ADMINISTRATION]: 'Administration',
};

const DEPT_ICON: Record<DepartmentEnum, React.ReactNode> = {
  [DepartmentEnum.RECEPTION]: <FaUserInjured className="h-3.5 w-3.5" />,
  [DepartmentEnum.TRIAGE]: <FaStethoscope className="h-3.5 w-3.5" />,
  [DepartmentEnum.OUTPATIENT_CLINIC]: <FaStethoscope className="h-3.5 w-3.5" />,
  [DepartmentEnum.INPATIENT_WARD]: <FaStethoscope className="h-3.5 w-3.5" />,
  [DepartmentEnum.MAIN_LABORATORY]: <FaFlask className="h-3.5 w-3.5" />,
  [DepartmentEnum.RADIOLOGY]: <FaFlask className="h-3.5 w-3.5" />,
  [DepartmentEnum.MAIN_PHARMACY]: <FaPills className="h-3.5 w-3.5" />,
  [DepartmentEnum.FINANCE]: <FaCheckCircle className="h-3.5 w-3.5" />,
  [DepartmentEnum.ADMINISTRATION]: <FaCheckCircle className="h-3.5 w-3.5" />,
};

const STATUS_VARIANT: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  const { data, isLoading, mutate } = useSWR<{ data: { data: IVisitRecord } }>(
    params.id ? `/visits/${params.id}` : null,
    api,
  );
  const visit = data?.data.data;

  const entries = useMemo(
    () => (visit ? [...(visit.queueEntries ?? [])].sort((a, b) => a.sequenceNumber - b.sequenceNumber) : []),
    [visit],
  );

  const activeEntry = entries.find(
    (e) =>
      e.status === QueueEntryStatusEnum.WAITING ||
      e.status === QueueEntryStatusEnum.CALLED ||
      e.status === QueueEntryStatusEnum.IN_SERVICE,
  );

  const patient = visit?.patient;

  const { consultations } = useConsultationsByVisit(visit?.id);

  const completeEntry = async (entry: IQueueEntryRecord) => {
    if (!confirm(`Mark ${DEPT_LABEL[entry.department]} stage as complete?`)) return;
    await toast.promise(visitsService.completeEntry(entry.id), {
      loading: 'Completing stage…',
      success: 'Stage completed — next stage advanced',
      error: "Couldn't complete — retry",
    });
    await mutate();
    await globalMutate((key) => typeof key === 'string' && key.startsWith('/visits'));
  };

  const removeEntry = async (entry: IQueueEntryRecord) => {
    if (!confirm(`Remove ${DEPT_LABEL[entry.department]} stage from the pathway?`)) return;
    await toast.promise(visitsService.deleteEntry(entry.id), {
      loading: 'Removing…',
      success: 'Stage removed',
      error: "Couldn't remove — retry",
    });
    await mutate();
    await globalMutate((key) => typeof key === 'string' && key.startsWith('/visits'));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-6 w-64 rounded bg-line/60" />
        <div className="h-40 rounded-lg border border-line bg-surface-raised" />
        <div className="h-64 rounded-lg border border-line bg-surface-raised" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Visit not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/queue')}>
          Back to queue
        </Button>
      </div>
    );
  }

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}${patient.mrn ? ` · ${patient.mrn}` : ''}`
    : 'Unknown patient';

  const completed = entries.filter((e) => e.status === QueueEntryStatusEnum.COMPLETED).length;
  const total = entries.length;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/queue"
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink"
      >
        <FaArrowLeft className="text-[10px]" />
        Back to queue
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{patientName}</h1>
          <p className="text-sm text-ink-muted">
            {activeEntry
              ? `Currently at ${DEPT_LABEL[activeEntry.department]} — ${activeEntry.status.replaceAll('_', ' ')}`
              : 'Visit complete — no active stage'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill variant={PillVariantEnum.INFO}>
            {completed}/{total} stages done
          </Pill>
          <Pill variant={PillVariantEnum.DEFAULT}>{visit.visitType.replaceAll('_', ' ')}</Pill>
          <Pill variant={PillVariantEnum.DEFAULT}>{visit.status.replaceAll('_', ' ')}</Pill>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <section className="rounded-lg border border-line bg-surface-raised p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand text-lg font-semibold">
                {patient ? initialsOf(`${patient.firstName} ${patient.lastName}`) : '?'}
              </div>
              <h2 className="mt-3 text-sm font-semibold text-ink">
                {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
              </h2>
              <p className="text-xs text-ink-muted">{patient?.mrn ?? 'No MRN'}</p>
            </div>

            <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-xs">
              <ProfileRow icon={<FaPhone />} label="Phone" value={patient?.phone ?? null} />
              <ProfileRow icon={<FaEnvelope />} label="Email" value={patient?.email ?? null} />
              <ProfileRow
                icon={<FaMapMarkerAlt />}
                label="Location"
                value={
                  patient?.city && patient?.address
                    ? `${patient.city} · ${patient.address}`
                    : (patient?.city ?? patient?.address ?? null)
                }
              />
              {patient?.insuranceProvider && (
                <ProfileRow
                  icon={<FaShieldAlt />}
                  label={patient.insuranceProvider}
                  value={patient.insurancePolicyNumber ?? 'Insured'}
                />
              )}
            </dl>
          </section>

          {consultations.length > 0 && <ConsultationSummaries consultations={consultations} />}
        </aside>

        <section className="lg:col-span-8">
          <div className="rounded-lg border border-line bg-surface-raised">
            <header className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">Care pathway</h2>
                <p className="text-xs text-ink-muted">
                  Timeline of every stage in the visit — from check-in to discharge.
                </p>
              </div>
            </header>
            {entries.length === 0 ? (
              <div className="p-6">
                <EmptyState message="No queue entries" icon={FaCheckCircle} />
              </div>
            ) : (
              <ol className="flex flex-col divide-y divide-line">
                {entries.map((entry, i) => (
                  <PathwayRow
                    key={entry.id}
                    entry={entry}
                    isFirst={i === 0}
                    isLast={i === entries.length - 1}
                    onComplete={() => completeEntry(entry)}
                    onRemove={() => removeEntry(entry)}
                  />
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex items-start gap-3 text-ink">
      <span className="mt-0.5 text-ink-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

function PathwayRow({
  entry,
  isFirst,
  isLast,
  onComplete,
  onRemove,
}: {
  entry: IQueueEntryRecord;
  isFirst: boolean;
  isLast: boolean;
  onComplete: () => void;
  onRemove: () => void;
}) {
  const isDone = entry.status === QueueEntryStatusEnum.COMPLETED || entry.status === QueueEntryStatusEnum.SKIPPED;
  const isActive = entry.status === QueueEntryStatusEnum.CALLED || entry.status === QueueEntryStatusEnum.IN_SERVICE;
  const isWaiting = entry.status === QueueEntryStatusEnum.WAITING;

  const timestamp = entry.completedAt ?? entry.startedAt ?? entry.calledAt ?? (entry.createdAt as unknown as string);

  return (
    <li className="relative flex gap-4 px-5 py-4">
      <div className="relative flex w-8 flex-col items-center">
        {!isFirst && <span className="absolute -top-4 h-4 w-px bg-line" />}
        <div
          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ring-2 ${
            isDone
              ? entry.status === QueueEntryStatusEnum.COMPLETED
                ? 'bg-normal-soft text-normal ring-normal/30'
                : 'bg-surface text-ink-muted ring-line'
              : isActive
                ? 'bg-info-soft text-info ring-info/40'
                : isWaiting
                  ? 'bg-watch-soft text-watch ring-watch/40'
                  : 'bg-surface text-ink-muted ring-line'
          }`}
        >
          {DEPT_ICON[entry.department]}
        </div>
        {!isLast && <span className={`absolute top-8 bottom-0 w-px ${isDone ? 'bg-normal/40' : 'bg-line'}`} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">
              #{entry.sequenceNumber} · {DEPT_LABEL[entry.department]}
            </p>
            <p className="text-xs text-ink-muted">
              {entry.completedAt
                ? `Completed ${formatDistanceToNow(new Date(entry.completedAt), { addSuffix: true })}`
                : entry.startedAt
                  ? `In service since ${format(new Date(entry.startedAt), 'HH:mm')}`
                  : entry.calledAt
                    ? `Called ${formatDistanceToNow(new Date(entry.calledAt), { addSuffix: true })}`
                    : `Queued ${formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}`}
            </p>
          </div>
          <Pill variant={STATUS_VARIANT[entry.status] ?? PillVariantEnum.DEFAULT}>
            {entry.status.replaceAll('_', ' ')}
          </Pill>
        </div>

        {entry.notes && (
          <p className="mt-2 rounded-md border border-line bg-surface p-2 text-xs text-ink-muted">{entry.notes}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted tabular-nums">
          {entry.calledAt && <span>Called {format(new Date(entry.calledAt), 'HH:mm')}</span>}
          {entry.startedAt && <span>Started {format(new Date(entry.startedAt), 'HH:mm')}</span>}
          {entry.completedAt && <span>Ended {format(new Date(entry.completedAt), 'HH:mm')}</span>}
        </div>

        {!isDone && (
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-medium text-brand hover:text-brand-hover"
            >
              Mark complete
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs font-medium text-critical hover:opacity-80"
            >
              <FaTrash className="h-2.5 w-2.5" />
              Remove
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function ConsultationSummaries({ consultations }: { consultations: IConsultation[] }) {
  return (
    <section className="rounded-lg border border-line bg-surface-raised">
      <header className="border-b border-line px-5 py-3">
        <h3 className="text-sm font-semibold text-ink">Consultation notes</h3>
        <p className="text-xs text-ink-muted">{consultations.length} record(s) linked</p>
      </header>
      <ul className="flex flex-col divide-y divide-line">
        {consultations.map((c) => (
          <li key={c.id} className="flex flex-col gap-1 px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink">
                {c.type.replaceAll('_', ' ')} · {c.department.replaceAll('_', ' ')}
              </p>
              <Pill variant={PillVariantEnum.DEFAULT}>{c.status.replaceAll('_', ' ')}</Pill>
            </div>
            <p className="text-sm text-ink">{c.chiefComplaint}</p>
            {c.diagnosis && (
              <p className="text-xs text-ink-muted">
                <span className="font-medium">Dx:</span> {c.diagnosis}
              </p>
            )}
            {c.plan && (
              <p className="text-xs text-ink-muted line-clamp-2">
                <span className="font-medium">Plan:</span> {c.plan}
              </p>
            )}
            <ConsultationLabOrders consultationId={c.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConsultationLabOrders({ consultationId }: { consultationId: string }) {
  const { orders } = useLabOrdersByConsultation(consultationId);
  if (orders.length === 0) return null;
  return (
    <div className="mt-1 flex flex-col gap-1 rounded-md bg-surface p-2 text-xs">
      <p className="font-medium text-ink-muted">Lab orders</p>
      {orders.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-2">
          <span className="truncate text-ink">
            {o.items?.map((i) => i.test?.code ?? i.testId).join(', ') || 'tests'}
          </span>
          <Pill variant={PillVariantEnum.DEFAULT}>{o.status.replaceAll('_', ' ')}</Pill>
        </div>
      ))}
    </div>
  );
}
