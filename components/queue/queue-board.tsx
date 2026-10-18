'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaEye,
  FaHourglassHalf,
  FaPhone,
  FaSearch,
  FaTrash,
  FaUserClock,
} from 'react-icons/fa';
import { Dropdown, EmptyState, Input, Pill, Stats } from '@/components';
import {
  QueueEntryStatusEnum,
  QueueStageEnum,
  QueueStatusEnum,
  TriageCategoryEnum,
  VisitTypeEnum,
} from '@/enum/queue.enum';
import PriorityBadge from './priority-badge';
import { PillVariantEnum } from '@/enum';
import {
  currentEntry,
  departmentStageMap,
  entryStatusMap,
  initialsOf,
  stageReadyAt,
  priorityVariants,
  stageLabel,
} from '@/data/queue';
import type { QueuePriority } from '@/data/queue';
import { patientFullName } from '@/data/patients';
import { useSWRConfig } from 'swr';
import visitsService from '@/helpers/visits.service';
import { useVisitQueues } from '@/hooks';
import type { IOption } from '@/interfaces';
import type { IVisitRecord } from '@/interfaces/queue.interfaces';

interface IStageStep {
  stage: QueueStageEnum;
  status: QueueStatusEnum;
}

interface IQueueRow {
  id: string;
  activeEntryId: string;
  patientName: string;
  phone: string;
  priority: QueuePriority;
  stage: QueueStageEnum;
  status: QueueStatusEnum;
  rawStatus: QueueEntryStatusEnum;
  assignedTo: string;
  department: string;
  /** Start of the wait for the current stage. */
  waitingSince: Date;
  sequenceNumber: number;
  steps: IStageStep[];
  visit: IVisitRecord;
}

// Driven by the API's triage colour, so a red walk-in is flagged as well as an emergency visit.
function priorityOf(visit: IVisitRecord): QueuePriority {
  if (visit.triageCategory === TriageCategoryEnum.RED) return 'emergency';
  if (visit.triageCategory === TriageCategoryEnum.YELLOW) return 'urgent';
  return visit.visitType === VisitTypeEnum.EMERGENCY ? 'emergency' : 'routine';
}

function VisitPathway({ steps }: { steps: IStageStep[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => (
        <div key={`${step.stage}-${i}`} className="flex items-center">
          <span
            title={`${stageLabel(step.stage)} · ${stageLabel(step.status)}`}
            className={`h-2 w-2 rounded-full ${
              step.status === QueueStatusEnum.COMPLETED
                ? 'bg-normal'
                : step.status === QueueStatusEnum.IN_PROGRESS
                  ? 'bg-info ring-4 ring-info/15'
                  : 'bg-line'
            }`}
          />
          {i < steps.length - 1 && (
            <span className={`h-0.5 w-5 ${step.status === QueueStatusEnum.COMPLETED ? 'bg-normal' : 'bg-line'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const stageOptions: IOption[] = [
  { label: 'All stages', value: 'all' },
  ...Object.values(QueueStageEnum).map((stage) => ({ label: stageLabel(stage), value: stage })),
];

const statusOptions: IOption[] = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(QueueStatusEnum).map((status) => ({ label: stageLabel(status), value: status })),
];

function rowEdge(priority: QueuePriority, status: QueueStatusEnum) {
  if (priority === 'emergency') return 'bg-critical';
  if (priority === 'urgent') return 'bg-watch';
  if (status === QueueStatusEnum.IN_PROGRESS) return 'bg-info';
  if (status === QueueStatusEnum.COMPLETED) return 'bg-normal';
  return 'bg-line';
}

const rawStatusVariant: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

// Live board of every open visit; shown on /queue and as the admin dashboard's Queue tab (R4).
export default function QueueBoard() {
  const { mutate: globalMutate } = useSWRConfig();
  const { visits, mutate } = useVisitQueues();

  const removeEntry = async (entryId: string) => {
    if (!confirm('Remove this patient from the current stage?')) return;
    await toast.promise(visitsService.deleteEntry(entryId), {
      loading: 'Removing…',
      success: 'Removed from queue',
      error: "Couldn't remove — retry",
    });
    await mutate();
    await globalMutate((key) => typeof key === 'string' && key.startsWith('/visits'));
  };

  const completeEntry = async (entryId: string) => {
    if (!confirm('Mark this stage as complete? The next stage will be advanced.')) return;
    await toast.promise(visitsService.completeEntry(entryId), {
      loading: 'Completing…',
      success: 'Stage completed — next stage advanced',
      error: "Couldn't complete — retry",
    });
    await mutate();
    await globalMutate((key) => typeof key === 'string' && key.startsWith('/visits'));
  };

  const rows = useMemo<IQueueRow[]>(
    () =>
      visits
        .filter((visit) => (visit.queueEntries ?? []).length > 0)
        .map((visit) => {
          const sorted = [...visit.queueEntries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
          const active = currentEntry(visit)!;
          return {
            id: visit.id,
            activeEntryId: active.id,
            patientName: visit.patient ? patientFullName(visit.patient) : visit.patientId,
            phone: visit.patient?.phone ?? '—',
            priority: priorityOf(visit),
            visit,
            stage: departmentStageMap[active.department],
            status: entryStatusMap[active.status],
            rawStatus: active.status,
            assignedTo: visit.assignedDoctor
              ? `Dr ${visit.assignedDoctor.username}`
              : active.servedById
                ? 'Assigned staff'
                : 'Unassigned',
            department: stageLabel(active.department),
            waitingSince: stageReadyAt(visit),
            sequenceNumber: active.sequenceNumber,
            steps: sorted.map((entry) => ({
              stage: departmentStageMap[entry.department],
              status: entryStatusMap[entry.status],
            })),
          };
        })
        // Most urgent first, then whoever has waited longest at their current stage.
        .sort(
          (a, b) =>
            (b.visit.priority ?? 0) - (a.visit.priority ?? 0) || a.waitingSince.getTime() - b.waitingSince.getTime(),
        ),
    [visits],
  );

  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<IOption>(stageOptions[0]);
  const [status, setStatus] = useState<IOption>(statusOptions[0]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((entry) => {
      if (stage.value !== 'all' && entry.stage !== stage.value) return false;
      if (status.value !== 'all' && entry.status !== status.value) return false;
      if (query && !entry.patientName.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [rows, search, stage, status]);

  const stats = useMemo(
    () => [
      { label: 'Total in queue', value: rows.length, icon: FaClipboardList },
      {
        label: 'Waiting',
        value: rows.filter((e) => e.status === QueueStatusEnum.PENDING).length,
        icon: FaHourglassHalf,
      },
      {
        label: 'In progress',
        value: rows.filter((e) => e.status === QueueStatusEnum.IN_PROGRESS).length,
        icon: FaUserClock,
      },
      {
        label: 'Emergency',
        value: rows.filter((e) => e.priority === 'emergency').length,
        icon: FaCheckCircle,
      },
    ],
    [rows],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-primary-muted">Live view of patients moving through today&apos;s visit.</p>
      </div>

      <Stats items={stats} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <FaSearch className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xs text-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient"
            className="pl-9"
          />
        </div>
        <div className="w-52">
          <Dropdown
            compact
            options={stageOptions}
            value={stage}
            onChange={(value) => setStage((Array.isArray(value) ? value[0] : value) ?? stageOptions[0])}
          />
        </div>
        <div className="w-52">
          <Dropdown
            compact
            options={statusOptions}
            value={status}
            onChange={(value) => setStatus((Array.isArray(value) ? value[0] : value) ?? statusOptions[0])}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-64" />
              <col className="w-64" />
              <col className="w-56" />
              <col className="w-36" />
              <col className="w-32" />
              <col className="w-20" />
            </colgroup>
            <thead className="border-b border-line bg-surface text-primary">
              <tr>
                <th className="px-6 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Pathway</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Handled by</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Waiting at stage</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No patients match your filters" icon={FaClipboardList} />
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="group border-b border-line last:border-0 align-top transition hover:bg-surface"
                  >
                    <td className="relative py-3 pl-6 pr-4">
                      <span
                        aria-hidden
                        className={`absolute inset-y-0 left-0 w-0.5 ${rowEdge(entry.priority, entry.status)}`}
                      />
                      <Link
                        href={`/queue/${entry.id}`}
                        className="truncate text-sm font-medium text-ink group-hover:text-brand"
                      >
                        {entry.patientName}
                      </Link>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                        <FaPhone className="shrink-0 text-[10px]" />
                        <span className="truncate">{entry.phone}</span>
                      </p>
                      <div className="mt-1.5">
                        {entry.visit.triageCategory ? (
                          <PriorityBadge visit={entry.visit} />
                        ) : (
                          <Pill variant={priorityVariants[entry.priority]}>{entry.priority}</Pill>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <VisitPathway steps={entry.steps} />
                      <p className="mt-1 text-xs text-ink-muted">{stageLabel(entry.stage)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                          {initialsOf(entry.assignedTo)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink">{entry.assignedTo}</p>
                          <p className="truncate text-xs text-ink-muted">{entry.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Pill variant={rawStatusVariant[entry.rawStatus] ?? PillVariantEnum.DEFAULT}>
                        {entry.rawStatus.replaceAll('_', ' ')}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-ink-muted">
                      {formatDistanceToNow(entry.waitingSince)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/queue/${entry.id}`}
                          aria-label="View pathway"
                          title="View pathway"
                          className="text-xs font-medium text-primary hover:text-primary-hover"
                        >
                          <FaEye />
                        </Link>
                        <button
                          type="button"
                          onClick={() => completeEntry(entry.activeEntryId)}
                          aria-label="Complete stage"
                          title="Complete stage & advance"
                          className="text-xs font-medium text-normal hover:opacity-80"
                        >
                          <FaCheck />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.activeEntryId)}
                          aria-label="Remove from queue"
                          className="text-xs font-medium text-critical hover:opacity-80"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
