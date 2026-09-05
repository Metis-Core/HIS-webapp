'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowRight, FaClipboardList, FaEye, FaPlay, FaPlus, FaStethoscope } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import {
  ButtonVariantEnum,
  ConsultationStatusEnum,
  ConsultationTypeEnum,
  DepartmentEnum,
  PillVariantEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
} from '@/enum';
import { useConsultations, useDepartmentQueue, usePatients } from '@/hooks';
import { extractErrorMessage } from '@/helpers/errors';
import triageService from '@/helpers/triage.service';
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

  const { patients } = usePatients({ limit: 100 });
  const {
    consultations,
    createConsultation,
    cancelConsultation,
    isLoading: consultationsLoading,
    error: consultationsError,
  } = useConsultations({ limit: 100 });

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
      if (!patientId) {
        toast.error('Missing patient on queue entry');
        return;
      }

      let chiefComplaint = 'To be documented';
      try {
        const triages = await triageService.findByPatient(patientId);
        const latest = triages
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (latest?.chiefComplaint) chiefComplaint = latest.chiefComplaint;
      } catch {
        // triage lookup is best-effort; workspace lets the doctor edit
      }

      const consultation = await toast.promise(
        createConsultation({
          patientId,
          visitId: entry.visitId ?? undefined,
          chiefComplaint,
          type: ConsultationTypeEnum.OUTPATIENT,
          department: DepartmentEnum.OUTPATIENT_CLINIC,
        }),
        {
          loading: 'Opening encounter…',
          success: 'Encounter started',
          error: (err) => extractErrorMessage(err, "Couldn't start — retry"),
        },
      );
      const id = (consultation as { id?: string } | undefined)?.id;
      if (id) router.push(`/consultations/${id}`);
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
        <>
          <p className="text-xs text-ink-muted">
            Tap <span className="font-semibold text-brand">Start</span> next to the patient at the top of the queue —
            the encounter opens instantly and you can document it.
          </p>
          <WaitingTable entries={waiting} patients={patients} onStart={startFromQueue} onSkip={skipFromQueue} />
        </>
      ) : (
        <>
          <p className="text-xs text-ink-muted">
            Click a row (or the <span className="font-semibold text-brand">Open</span> button) to enter the consultation
            workspace and fill in the encounter, labs and prescriptions.
          </p>
          <Input
            className="max-w-sm"
            placeholder="Search patient / diagnosis / complaint"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {consultationsLoading ? (
            <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-6">
              <div className="h-4 w-40 animate-pulse rounded bg-line" />
              <div className="h-3 w-full animate-pulse rounded bg-line/70" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-line/70" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-line/70" />
            </div>
          ) : consultationsError ? (
            <div className="rounded-lg border border-critical/40 bg-critical-soft p-4 text-sm text-critical">
              Couldn't load consultations. Check that the API is reachable and you're signed in — then refresh.
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              message={
                search.trim()
                  ? 'No consultations match your search'
                  : consultations.length === 0
                    ? 'No consultations yet'
                    : 'No consultations match your search'
              }
              icon={FaStethoscope}
              actionLabel={consultations.length === 0 ? 'Start consultation' : undefined}
              onAction={consultations.length === 0 ? openAdd : undefined}
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
                  {filtered.map((c) => {
                    const inProgress = c.status === ConsultationStatusEnum.IN_PROGRESS;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => openDetail(c)}
                        className="cursor-pointer border-b border-line last:border-0 hover:bg-surface"
                      >
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
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetail(c)}
                              aria-label={inProgress ? 'Continue consultation' : 'Open consultation'}
                              title={inProgress ? 'Continue documenting' : 'Open consultation'}
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 transition ${
                                inProgress
                                  ? 'bg-brand text-white ring-brand hover:bg-brand-hover'
                                  : 'bg-surface text-ink ring-line hover:bg-surface-raised'
                              }`}
                            >
                              <FaEye className="text-[11px]" />
                              {inProgress ? 'Continue' : 'Open'}
                              <FaArrowRight className="text-[10px]" />
                            </button>
                            {inProgress && (
                              <button
                                type="button"
                                onClick={() => cancel(c)}
                                className="text-xs font-medium text-critical hover:opacity-80"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
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
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
                    >
                      <FaPlay className="text-[10px]" />
                      Start
                      <FaArrowRight className="text-[10px]" />
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
