'use client';

import useSWR from 'swr';
import { api } from '@/helpers/axios';

export function RecordCard({
  title,
  meta,
  badge,
  note,
}: {
  title: string;
  meta: string;
  badge?: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-zinc-900">{title}</p>
        {badge && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-zinc-700">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500">{meta}</p>
      {note && <p className="mt-2 text-sm capitalize text-zinc-700">{note}</p>}
    </div>
  );
}

export default function PatientRecordsPanel<T>({
  url,
  selectItems,
  emptyMessage,
  renderItem,
}: {
  url: string;
  selectItems: (data: any) => T[];
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  const { data, isLoading } = useSWR<{ data: any }>(url, api);
  const items = data ? selectItems(data.data) : [];

  if (isLoading) return <p className="py-10 text-center text-sm text-zinc-500">Loading…</p>;
  if (!items.length) return <p className="py-10 text-center text-sm text-zinc-500">{emptyMessage}</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
