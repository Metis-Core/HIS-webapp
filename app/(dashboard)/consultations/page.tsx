'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaClipboardList, FaEye, FaPlay, FaPlus, FaStethoscope } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import CompleteStageDrawer from '@/components/drawers/complete-stage.drawer';
import {
  ButtonVariantEnum,
  ConsultationStatusEnum,
  DepartmentEnum,
  PillVariantEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
  VisitIntentEnum,
} from '@/enum';
import { useConsultations, useDepartmentQueue, usePatients } from '@/hooks';
import { extractErrorMessage } from '@/helpers/errors';
import type { IConsultation, IPatient, IQueueEntryRecord } from '@/interfaces';

type TabId = 'waiting' | 'all';

const statusVariant: Record<ConsultationStatusEnum, PillVariantEnum> = {
  [ConsultationStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [ConsultationStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [ConsultationStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

const entryStatusVariant: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

export default function ConsultationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('waiting');
  const [search, setSearch] = useState('');
  const [completing, setCompleting] = useState<IConsultation | null>(null);
  const [completingBusy, setCompletingBusy] = useState(false);

  const { patients } = usePatients({ limit: 100 });
  const { consultations, completeConsultation, cancelConsultation } = useConsultations({ limit: 50 });

  const {
    entries: waiting,
    call: callEntry,
    start: startEntry,
    skip: skipEntry,
  } = useDepartmentQueue(DepartmentEnum.OUTPATIENT_CLINIC);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return consultations;
    return consultations.filter((c) => {
      const name = `${c.patient?.firstName ?? ''} ${c.patient?.lastName ?? ''}`.toLowerCase();
      return (
        name.includes(q) || c.chiefComplaint.toLowerCase().includes(q) || (c.diagnosis ?? '').toLowerCase().includes(q)
      );
    });
  }, [consultations, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Waiting',
        value: waiting.filter((e) => e.status !== QueueEntryStatusEnum.COMPLETED).length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'In progress',
        value: consultations.filter((c) => c.status === ConsultationStatusEnum.IN_PROGRESS).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Completed',
        value: consultations.filter((c) => c.status === ConsultationStatusEnum.COMPLETED).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Green,
      },
      { label: 'Total', value: consultations.length, icon: FaStethoscope, variant: StatVariantEnum.Emerald },
    ],
    [consultations, waiting],
  );

  const openAdd = () => router.push('/consultations/new');
  const openDetail = (c: IConsultation) => router.push(`/consultations/${c.id}`);

  const complete = (c: IConsultation) => setCompleting(c);

  const confirmComplete = async ({ nextIntents, notes }: { nextIntents: VisitIntentEnum[]; notes?: string }) => {
    if (!completing) return;
    setCompletingBusy(true);
    try {
      await toast.promise(completeConsultation(completing.id, { nextIntents, notes }), {
        loading: 'Completing…',
        success: nextIntents.length > 0 ? `Completed — routed to ${nextIntents.join(', ')}` : 'Consultation completed',
        error: (err) => extractErrorMessage(err, "Couldn't complete — retry"),
      });
      setCompleting(null);
    } finally {
      setCompletingBusy(false);
    }
  };

  const cancel = async (c: IConsultation) => {
    if (!confirm('Cancel this consultation?')) return;
    await toast.promise(cancelConsultation(c.id, {}), {
      loading: 'Cancelling…',
      success: 'Consultation cancelled',
      error: (err) => extractErrorMessage(err, "Couldn't cancel — retry"),
    });
  };

  const startFromQueue = async (entry: IQueueEntryRecord) => {
    try {
      if (entry.status === QueueEntryStatusEnum.WAITING) {
        await callEntry(entry.id);
      }
      await startEntry(entry.id);
      const patientId = entry.visit?.patient?.id ?? entry.visit?.patientId;
      const search = new URLSearchParams();
      if (patientId) search.set('patientId', patientId);
      if (entry.visitId) search.set('visitId', entry.visitId);
      router.push(`/consultations/new?${search.toString()}`);
    } catch (err) {
      toast.error("Couldn't start — retry");
    }
  };

  const skipFromQueue = async (entry: IQueueEntryRecord) => {
    if (!confirm('Skip this patient?')) return;
    await toast.promise(skipEntry(entry.id), {
      loading: 'Skipping…',
      success: 'Skipped — next patient advanced',
      error: (err) => extractErrorMessage(err, "Couldn't skip — retry"),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Consultations"
        description="Doctor visits — chief complaint, assessment, diagnosis, plan. Order labs and prescriptions inline."
        action={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
            <FaPlus className="text-xs" />
            New consultation
          </Button>
        }
      />

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'waiting', label: `Waiting (${waiting.length})` },
          { id: 'all', label: 'All consultations' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'waiting' ? (
        <WaitingTable entries={waiting} patients={patients} onStart={startFromQueue} onSkip={skipFromQueue} />
      ) : (
        <>
          <Input
            className="max-w-sm"
            placeholder="Search patient / diagnosis / complaint"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <EmptyState
              message="No consultations yet"
              icon={FaStethoscope}
              actionLabel="Start consultation"
              onAction={openAdd}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Chief complaint</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Diagnosis</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-ink">
                          {c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : '—'}
                        </div>
                        <div className="text-xs text-ink-muted">{c.patient?.mrn}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{c.chiefComplaint}</td>
                      <td className="px-4 py-3 text-sm text-ink-muted">{c.diagnosis ?? '—'}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink-muted">{c.type.replaceAll('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <Pill variant={statusVariant[c.status] ?? PillVariantEnum.DEFAULT}>
                          {c.status.replaceAll('_', ' ')}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openDetail(c)}
                            aria-label="Open consultation"
                            title="Open"
                            className="text-xs font-medium text-brand hover:text-brand-hover"
                          >
                            <FaEye />
                          </button>
                          {c.status === ConsultationStatusEnum.IN_PROGRESS && (
                            <>
                              <button
                                type="button"
                                onClick={() => complete(c)}
                                className="text-xs font-medium text-normal hover:opacity-80"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                onClick={() => cancel(c)}
                                className="text-xs font-medium text-critical hover:opacity-80"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <CompleteStageDrawer
        open={completing !== null}
        title="Complete consultation & route"
        patientName={completing?.patient ? `${completing.patient.firstName} ${completing.patient.lastName}` : undefined}
        onClose={() => setCompleting(null)}
        onConfirm={confirmComplete}
        submitting={completingBusy}
      />
    </div>
  );
}

function WaitingTable({
  entries,
  patients,
  onStart,
  onSkip,
}: {
  entries: IQueueEntryRecord[];
  patients: IPatient[];
  onStart: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}) {
  const patientLookup = useMemo(() => {
    const map = new Map<string, IPatient>();
    patients.forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  if (entries.length === 0) {
    return <EmptyState message="Nobody waiting for consultation" icon={FaClipboardList} />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Sequence</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Priority</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Waiting</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const patient = e.visit?.patient ?? patientLookup.get(e.visit?.patientId ?? '');
            const waitedMs = Date.now() - new Date(e.createdAt).getTime();
            const waitedMin = Math.max(0, Math.round(waitedMs / 60000));
            return (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-ink">
                    {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                  </div>
                  <div className="text-xs text-ink-muted">{patient?.mrn}</div>
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink">#{e.sequenceNumber}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{e.priority}</td>
                <td className="px-4 py-3">
                  <Pill variant={entryStatusVariant[e.status] ?? PillVariantEnum.DEFAULT}>
                    {e.status.replaceAll('_', ' ')}
                  </Pill>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">{waitedMin} min</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onStart(e)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover"
                    >
                      <FaPlay className="text-[10px]" />
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => onSkip(e)}
                      className="text-xs font-medium text-ink-muted hover:text-ink"
                    >
                      Skip
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
