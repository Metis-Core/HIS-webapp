'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import type { ReactNode } from 'react';
import { Button, Dropdown, Pill } from '@/components';
import { ButtonVariantEnum, DepartmentEnum, PillVariantEnum } from '@/enum';
import { QueueEntryStatusEnum } from '@/enum/queue.enum';
import { useQueueEntry } from '@/hooks';
import type { IOption } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();

const statusVariants: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((department) => ({
  label: humanize(department),
  value: department,
}));

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 border-b border-zinc-200 pb-2 text-xs font-bold uppercase tracking-wide text-green-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 capitalize text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex items-start gap-3 text-sm text-zinc-700">
      <span className="mt-0.5 text-zinc-500">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-0.5 font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { entry, isLoading, startService, completeStage, skip, transfer } = useQueueEntry(params.id);
  const [transferTo, setTransferTo] = useState<IOption>(departmentOptions[0]);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
    } catch {
      window.alert('Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-zinc-500">Loading queue entry…</div>;
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-zinc-800">Queue entry not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/queue')}>
          Back to queue
        </Button>
      </div>
    );
  }

  const patient = entry.visit?.patient;
  const name = patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';
  const initials = name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const isActive = entry.status === QueueEntryStatusEnum.WAITING || entry.status === QueueEntryStatusEnum.CALLED;

  return (
    <div className="flex flex-col gap-6 py-4">
      <Link
        href="/queue"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-green-800 hover:text-green-900"
      >
        <FaArrowLeft className="text-xs" />
        Back to queue
      </Link>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-3xl font-bold text-white">
                {initials}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-zinc-900">{name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Pill variant={statusVariants[entry.status]}>{humanize(entry.status)}</Pill>
                <Pill variant={PillVariantEnum.INFO}>Priority {entry.priority}</Pill>
              </div>
              <div className="mt-5 w-full space-y-3 border-t border-zinc-100 pt-5 text-left">
                <ProfileRow icon={<FaPhone />} label="Phone" value={patient?.phone} />
                <ProfileRow icon={<FaEnvelope />} label="Email" value={patient?.email} />
                <ProfileRow
                  icon={<FaMapMarkerAlt />}
                  label="Location"
                  value={patient?.city && patient?.address ? `${patient.city} · ${patient.address}` : patient?.city}
                />
              </div>
            </div>
          </section>

          <DetailSection title="Patient details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="MRN" value={patient?.mrn} />
              <DetailField label="Gender" value={patient?.gender} />
              <DetailField label="National ID" value={patient?.nationalId} />
              <DetailField label="Blood type" value={patient?.bloodType?.toUpperCase()} />
            </dl>
          </DetailSection>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <DetailSection title="Queue status">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Department" value={humanize(entry.department)} />
              <DetailField label="Token" value={entry.visit?.tokenNumber} />
              <DetailField label="Sequence" value={String(entry.sequenceNumber)} />
              <DetailField label="Handled by" value={entry.servedBy?.username} />
              <DetailField
                label="Waiting"
                value={formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              />
              <DetailField
                label="Called at"
                value={entry.calledAt ? format(new Date(entry.calledAt), 'dd MMM · HH:mm') : undefined}
              />
              <DetailField label="Notes" value={entry.notes} />
            </dl>
          </DetailSection>

          <DetailSection title="Actions">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Button type="button" disabled={busy || !isActive} onClick={() => run(() => startService())}>
                  Start service
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariantEnum.SECONDARY}
                  disabled={!patient}
                  onClick={() => router.push(`/consultation?patientId=${patient?.id}&visitId=${entry.visitId}`)}
                >
                  Start consultation
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariantEnum.SECONDARY}
                  disabled={busy || entry.status !== QueueEntryStatusEnum.IN_SERVICE}
                  onClick={() => run(() => completeStage())}
                >
                  Complete stage
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariantEnum.DANGER}
                  disabled={busy || !isActive}
                  onClick={() => run(() => skip())}
                >
                  Skip
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-4">
                <div className="w-60">
                  <Dropdown
                    compact
                    label="Transfer to"
                    options={departmentOptions}
                    value={transferTo}
                    onChange={(value) =>
                      setTransferTo((Array.isArray(value) ? value[0] : value) ?? departmentOptions[0])
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant={ButtonVariantEnum.SECONDARY}
                  disabled={busy}
                  onClick={() => run(() => transfer({ nextDepartment: transferTo.value as DepartmentEnum }))}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
