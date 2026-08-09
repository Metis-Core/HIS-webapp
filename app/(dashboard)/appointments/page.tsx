'use client';

import { useMemo, useState } from 'react';
import { format, isToday } from 'date-fns';
import { FaCalendarCheck, FaCalendarDay, FaCalendarTimes, FaClipboardList, FaSearch } from 'react-icons/fa';
import { Dropdown, EmptyState, Input, Pill, Stats } from '@/components';
import { StatVariantEnum } from '@/enum';
import { AppointmentStatusEnum, AppointmentTypeEnum } from '@/enum/appointment.enum';
import { appointments, statusVariants, typeLabel } from '@/data/appointments';
import { initialsOf } from '@/data/queue';
import type { IOption } from '@/interfaces';

const statusOptions: IOption[] = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(AppointmentStatusEnum).map((status) => ({ label: typeLabel(status), value: status })),
];

const typeOptions: IOption[] = [
  { label: 'All types', value: 'all' },
  ...Object.values(AppointmentTypeEnum).map((type) => ({ label: typeLabel(type), value: type })),
];

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IOption>(statusOptions[0]);
  const [type, setType] = useState<IOption>(typeOptions[0]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments
      .filter((appointment) => {
        if (status.value !== 'all' && appointment.status !== status.value) return false;
        if (type.value !== 'all' && appointment.type !== type.value) return false;
        if (query && !appointment.patientName.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [search, status, type]);

  const stats = useMemo(
    () => [
      {
        label: "Today's appointments",
        value: appointments.filter((a) => isToday(a.date)).length,
        icon: FaCalendarDay,
        variant: StatVariantEnum.Green,
      },
      {
        label: 'Confirmed',
        value: appointments.filter((a) => a.status === AppointmentStatusEnum.CONFIRMED).length,
        icon: FaCalendarCheck,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Completed',
        value: appointments.filter((a) => a.status === AppointmentStatusEnum.COMPLETED).length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Emerald,
      },
      {
        label: 'Cancelled / No-show',
        value: appointments.filter(
          (a) => a.status === AppointmentStatusEnum.CANCELLED || a.status === AppointmentStatusEnum.NO_SHOW,
        ).length,
        icon: FaCalendarTimes,
        variant: StatVariantEnum.Amber,
      },
    ],
    [],
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
            options={statusOptions}
            value={status}
            onChange={(value) => setStatus((Array.isArray(value) ? value[0] : value) ?? statusOptions[0])}
          />
        </div>
        <div className="w-52">
          <Dropdown
            compact
            options={typeOptions}
            value={type}
            onChange={(value) => setType((Array.isArray(value) ? value[0] : value) ?? typeOptions[0])}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-64" />
              <col className="w-44" />
              <col className="w-64" />
              <col className="w-40" />
              <col className="w-36" />
            </colgroup>
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-6 py-3 text-md font-bold">Patient</th>
                <th className="px-6 py-3 text-md font-bold">Date & Time</th>
                <th className="px-6 py-3 text-md font-bold">Doctor</th>
                <th className="px-6 py-3 text-md font-bold">Type</th>
                <th className="px-6 py-3 text-md font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No appointments match your filters" icon={FaClipboardList} />
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-zinc-100 last:border-0 align-top transition hover:bg-green-50/30"
                  >
                    <td className="px-6 py-4">
                      <p className="truncate font-medium text-zinc-900">{appointment.patientName}</p>
                      <p className="mt-1 truncate text-xs text-zinc-500">{appointment.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-zinc-800">{format(appointment.date, 'dd MMM yyyy')}</p>
                      <p className="text-xs text-zinc-500">
                        {format(appointment.date, 'HH:mm')} · {appointment.duration} min
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                          {initialsOf(appointment.doctor)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800">{appointment.doctor}</p>
                          <p className="truncate text-xs text-zinc-500">{appointment.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Pill>{typeLabel(appointment.type)}</Pill>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Pill variant={statusVariants[appointment.status]}>{typeLabel(appointment.status)}</Pill>
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
