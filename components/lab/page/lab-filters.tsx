'use client';

import { FaSearch } from 'react-icons/fa';
import { Input } from '@/components';
import type { ILabDayRange } from '@/interfaces';

export const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';
export const TD = 'px-4 py-3';
export const LINK = 'text-xs font-medium text-primary hover:text-primary-hover';

export function SearchBox({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
      <Input className="pl-9" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** L10: inclusive calendar days; the server rejects from > to. */
export function DateRangeFilter({ value, onChange }: { value: ILabDayRange; onChange: (v: ILabDayRange) => void }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-40">
        <Input
          label="From"
          type="date"
          value={value.from ?? ''}
          max={value.to}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
        />
      </div>
      <div className="w-40">
        <Input
          label="To"
          type="date"
          value={value.to ?? ''}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

export function StatusChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T[]; label: string }>;
  value: T[];
  onChange: (v: T[]) => void;
}) {
  const key = (v: T[]) => [...v].sort().join(',');
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Status filter">
      {options.map((o) => {
        const active = key(o.value) === key(value);
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-3 py-1 text-xs ${active ? 'border-brand bg-brand-soft text-ink' : 'border-line text-ink-muted'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
