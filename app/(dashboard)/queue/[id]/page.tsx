'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaPhone, FaShieldAlt } from 'react-icons/fa';
import type { ReactNode } from 'react';
import { Button, Pill, StagePathway } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { getQueueEntry, initialsOf, priorityVariants, stageLabel, statusVariants } from '@/data/queue';

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
  const entry = getQueueEntry(params.id);

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
                {initialsOf(entry.patientName)}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-zinc-900">{entry.patientName}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Pill variant={statusVariants[entry.status]}>{stageLabel(entry.status)}</Pill>
                <Pill variant={priorityVariants[entry.priority]}>{entry.priority}</Pill>
                {entry.bloodType && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase text-zinc-700">
                    {entry.bloodType}
                  </span>
                )}
              </div>
              <div className="mt-5 w-full space-y-3 border-t border-zinc-100 pt-5 text-left">
                <ProfileRow icon={<FaPhone />} label="Phone" value={entry.phone} />
                <ProfileRow icon={<FaEnvelope />} label="Email" value={entry.email} />
                <ProfileRow
                  icon={<FaMapMarkerAlt />}
                  label="Location"
                  value={
                    entry.city && entry.address ? `${entry.city} · ${entry.address}` : (entry.city ?? entry.address)
                  }
                />
              </div>
            </div>
          </section>

          <DetailSection title="Personal details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Date of birth" value={format(entry.dateOfBirth, 'dd MMM yyyy')} />
              <DetailField label="Gender" value={entry.gender} />
              <DetailField label="National ID" value={entry.nationalId} />
              <DetailField label="Blood type" value={entry.bloodType} />
            </dl>
          </DetailSection>

          {entry.insuranceProvider && (
            <DetailSection title="Insurance">
              <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/50 p-4">
                <FaShieldAlt className="text-green-700" />
                <p className="font-medium text-zinc-800">{entry.insuranceProvider}</p>
              </div>
            </DetailSection>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <DetailSection title="Care pathway">
            <StagePathway stage={entry.stage} />
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailField label="Handled by" value={entry.assignedTo} />
              <DetailField label="Department" value={entry.department} />
              <DetailField label="Checked in" value={format(entry.checkedInAt, 'dd MMM yyyy · HH:mm')} />
              <DetailField label="Waiting" value={formatDistanceToNow(entry.checkedInAt, { addSuffix: true })} />
            </dl>
          </DetailSection>

          <DetailSection title="Doctor & staff comments">
            {entry.notes.length === 0 ? (
              <p className="text-sm text-zinc-500">No comments recorded yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-100">
                {entry.notes.map((note) => (
                  <div key={note.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                      {initialsOf(note.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-zinc-900">{note.author}</p>
                        <p className="text-xs text-zinc-400">{format(note.at, 'dd MMM yyyy · HH:mm')}</p>
                      </div>
                      <p className="text-xs text-zinc-500">{note.role}</p>
                      <p className="mt-1.5 text-sm text-zinc-700">{note.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
