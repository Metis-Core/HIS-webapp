'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaClipboardList, FaHourglassHalf, FaPhone, FaSearch, FaUserClock, FaUsers } from 'react-icons/fa';
import { Dropdown, EmptyState, Input, PageHeader, Pill, Stats } from '@/components';
import { DepartmentEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueEntryStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import { useQueue } from '@/hooks';
import type { IOption, IQueueEntry } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();

const departmentOptions: IOption[] = [
  { label: 'All departments', value: 'all' },
  ...Object.values(DepartmentEnum).map((department) => ({ label: humanize(department), value: department })),
];

const statusOptions: IOption[] = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(QueueEntryStatusEnum).map((status) => ({ label: humanize(status), value: status })),
];

const statusVariants: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

const priorityVariant = (priority: number): PillVariantEnum =>
  priority <= 2 ? PillVariantEnum.DANGER : priority === 3 ? PillVariantEnum.WARNING : PillVariantEnum.DEFAULT;

const patientName = (entry: IQueueEntry) => {
  const patient = entry.visit?.patient;
  return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function QueuePage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<IOption>(departmentOptions[0]);
  const [status, setStatus] = useState<IOption>(statusOptions[0]);

  const { entries, total, isLoading } = useQueue({
    department: department.value === 'all' ? undefined : (department.value as DepartmentEnum),
    status: status.value === 'all' ? undefined : (status.value as QueueEntryStatusEnum),
    limit: 100,
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => patientName(entry).toLowerCase().includes(query));
  }, [entries, search]);

  const stats = useMemo(
    () => [
      { label: 'Total in queue', value: total, icon: FaClipboardList, variant: StatVariantEnum.Green },
      {
        label: 'Waiting',
        value: entries.filter((entry) => entry.status === QueueEntryStatusEnum.WAITING).length,
        icon: FaHourglassHalf,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'In service',
        value: entries.filter((entry) => entry.status === QueueEntryStatusEnum.IN_SERVICE).length,
        icon: FaUserClock,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Emergency cases',
        value: entries.filter((entry) => entry.visit?.visitType === VisitTypeEnum.EMERGENCY).length,
        icon: FaUsers,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [entries, total],
  );

  return (
    <div className="flex flex-col gap-8 py-4">
      <PageHeader title="Queue" description="Live patient flow across departments for today." />
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
            options={departmentOptions}
            value={department}
            onChange={(value) => setDepartment((Array.isArray(value) ? value[0] : value) ?? departmentOptions[0])}
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
              <col className="w-48" />
              <col className="w-56" />
              <col className="w-36" />
              <col className="w-32" />
            </colgroup>
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-6 py-3 text-md font-bold">Patient</th>
                <th className="px-6 py-3 text-md font-bold">Department</th>
                <th className="px-6 py-3 text-md font-bold">Handled by</th>
                <th className="px-6 py-3 text-md font-bold">Status</th>
                <th className="px-6 py-3 text-right text-md font-bold">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-zinc-500">
                    Loading queue…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No patients match your filters" icon={FaClipboardList} />
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const name = patientName(entry);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-zinc-100 cursor-pointer last:border-0 align-top transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/queue/${entry.id}`}
                          className="truncate font-medium text-zinc-900 hover:text-green-800 hover:underline"
                        >
                          {name}
                        </Link>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                          <FaPhone className="shrink-0 text-[10px] text-zinc-400" />
                          <span className="truncate">{entry.visit?.patient?.phone ?? '—'}</span>
                        </p>
                        <div className="mt-2">
                          <Pill variant={priorityVariant(entry.priority)}>Priority {entry.priority}</Pill>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-zinc-700">{humanize(entry.department)}</td>
                      <td className="px-6 py-4">
                        {entry.servedBy ? (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                              {initialsOf(entry.servedBy.username)}
                            </div>
                            <p className="truncate font-medium text-zinc-800">{entry.servedBy.username}</p>
                          </div>
                        ) : (
                          <span className="text-zinc-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Pill variant={statusVariants[entry.status]}>{humanize(entry.status)}</Pill>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-zinc-500">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
