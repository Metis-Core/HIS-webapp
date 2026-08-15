'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaCheckCircle, FaClipboardList, FaHourglassHalf, FaPhone, FaSearch, FaUserClock } from 'react-icons/fa';
import { Dropdown, EmptyState, Input, Pill, Stats } from '@/components';
import { StatVariantEnum } from '@/enum';
import { QueueStageEnum, QueueStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import {
  currentEntry,
  departmentStageMap,
  entryStatusMap,
  initialsOf,
  priorityVariants,
  stageLabel,
  statusVariants,
} from '@/data/queue';
import type { QueuePriority } from '@/data/queue';
import { patientFullName } from '@/data/patients';
import useSWR from 'swr';
import { publicApi } from '@/helpers/axios';
import type { IOption, IPagination } from '@/interfaces';
import type { IVisitRecord } from '@/interfaces/queue.interfaces';

interface IStageStep {
  stage: QueueStageEnum;
  status: QueueStatusEnum;
}

interface IQueueRow {
  id: string;
  patientName: string;
  phone: string;
  priority: QueuePriority;
  stage: QueueStageEnum;
  status: QueueStatusEnum;
  assignedTo: string;
  department: string;
  checkedInAt: Date;
  sequenceNumber: number;
  steps: IStageStep[];
}

function VisitPathway({ steps }: { steps: IStageStep[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => (
        <div key={`${step.stage}-${i}`} className="flex items-center">
          <span
            title={`${stageLabel(step.stage)} · ${stageLabel(step.status)}`}
            className={`h-2.5 w-2.5 rounded-full ${
              step.status === QueueStatusEnum.COMPLETED
                ? 'bg-green-600'
                : step.status === QueueStatusEnum.IN_PROGRESS
                  ? 'bg-orange-500 ring-4 ring-orange-100'
                  : 'bg-zinc-200'
            }`}
          />
          {i < steps.length - 1 && (
            <span
              className={`h-0.5 w-6 ${step.status === QueueStatusEnum.COMPLETED ? 'bg-green-600' : 'bg-zinc-200'}`}
            />
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

export default function QueuePage() {
  const { data } = useSWR<{ data: { data: IPagination<IVisitRecord> } }>('/visits/queues', publicApi);
  const visits = useMemo(() => data?.data.data.items || [], [data]);

  const rows = useMemo<IQueueRow[]>(
    () =>
      visits
        .filter((visit) => (visit.queueEntries ?? []).length > 0)
        .map((visit) => {
          const sorted = [...visit.queueEntries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
          const active = currentEntry(visit)!;
          return {
            id: visit.id,
            patientName: visit.patient ? patientFullName(visit.patient) : visit.patientId,
            phone: visit.patient?.phone ?? '—',
            priority: (visit.visitType === VisitTypeEnum.EMERGENCY ? 'emergency' : 'routine') as QueuePriority,
            stage: departmentStageMap[active.department],
            status: entryStatusMap[active.status],
            assignedTo: active.servedById ? 'Assigned staff' : 'Unassigned',
            department: stageLabel(active.department),
            checkedInAt: visit.createdAt,
            sequenceNumber: active.sequenceNumber,
            steps: sorted.map((entry) => ({
              stage: departmentStageMap[entry.department],
              status: entryStatusMap[entry.status],
            })),
          };
        })
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber),
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
      { label: 'Total in queue', value: rows.length, icon: FaClipboardList, variant: StatVariantEnum.Green },
      {
        label: 'Waiting',
        value: rows.filter((e) => e.status === QueueStatusEnum.PENDING).length,
        icon: FaHourglassHalf,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'In progress',
        value: rows.filter((e) => e.status === QueueStatusEnum.IN_PROGRESS).length,
        icon: FaUserClock,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Emergency cases',
        value: rows.filter((e) => e.priority === 'emergency').length,
        icon: FaCheckCircle,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [rows],
  );

  return (
    <div className="flex flex-col gap-8 py-4">
      <Stats items={stats} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <FaSearch className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xs text-slate-400" />
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

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-64" />
              <col className="w-64" />
              <col className="w-56" />
              <col className="w-36" />
              <col className="w-32" />
            </colgroup>
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-6 py-3 text-md font-bold">Patient</th>
                <th className="px-6 py-3 text-md font-bold">Current Stage</th>
                <th className="px-6 py-3 text-md font-bold">Handled by</th>
                <th className="px-6 py-3 text-md font-bold">Status</th>
                <th className="px-6 py-3 text-right text-md font-bold">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No patients match your filters" icon={FaClipboardList} />
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-100 cursor-pointer last:border-0 align-top transition hover:bg-green-50/30"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/queue/${entry.id}`}
                        className="truncate font-medium text-zinc-900 hover:text-green-800 hover:underline"
                      >
                        {entry.patientName}
                      </Link>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <FaPhone className="shrink-0 text-[10px] text-zinc-400" />
                        <span className="truncate">{entry.phone}</span>
                      </p>
                      <div className="mt-2">
                        <Pill variant={priorityVariants[entry.priority]}>{entry.priority}</Pill>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <VisitPathway steps={entry.steps} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                          {initialsOf(entry.assignedTo)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800">{entry.assignedTo}</p>
                          <p className="truncate text-xs text-zinc-500">{entry.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Pill variant={statusVariants[entry.status]}>{stageLabel(entry.status)}</Pill>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-zinc-500">
                      {formatDistanceToNow(entry.checkedInAt, { addSuffix: true })}
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
