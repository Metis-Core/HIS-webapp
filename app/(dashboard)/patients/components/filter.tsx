'use client';

import { useEffect, useRef, useState } from 'react';
import { DateRange, type Range, type RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { Button, Dropdown, Input } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import type { IOption } from '@/interfaces';
import { PatientTypeEnum } from '@/enum/patient.enum';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export type PatientsFilterValue = {
  search: string;
  type: PatientTypeEnum | null;
  range: Range;
  dateActive: boolean;
};

type PatientsFilterProps = {
  value: PatientsFilterValue;
  onChange: (value: PatientsFilterValue) => void;
};

const controlClass =
  'h-10 rounded-md border border-slate-400 bg-white px-3 py-0 text-sm leading-10 text-slate-700 outline-none transition hover:border-green-600 focus:border-green-600 focus:ring-1 focus:ring-green-600';

const typeOptions: IOption[] = [
  { label: 'All types', value: 'all' },
  { label: 'Inpatient', value: PatientTypeEnum.INPATIENT },
  { label: 'Outpatient', value: PatientTypeEnum.OUTPATIENT },
];

export default function PatientsFilter({ value, onChange }: PatientsFilterProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedType =
    typeOptions.find((option) => (value.type === null ? option.value === 'all' : option.value === value.type)) ??
    typeOptions[0];

  const displayRange: Range = {
    startDate: value.range.startDate ?? new Date(),
    endDate: value.range.endDate ?? new Date(),
    key: 'selection',
  };

  const rangeLabel =
    value.dateActive && value.range.startDate && value.range.endDate
      ? `${format(value.range.startDate, 'dd MMM yyyy')} – ${format(value.range.endDate, 'dd MMM yyyy')}`
      : 'Date range';

  const hasFilters = value.search.trim().length > 0 || value.type !== null || value.dateActive;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onRangeChange = (ranges: RangeKeyDict) => {
    onChange({ ...value, range: ranges.selection, dateActive: true });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px] flex-1 [&_input]:h-10 [&_input]:py-0 [&_input]:text-sm [&_input]:leading-10">
        <FaSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-400" />
        <Input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Search name, phone, or email"
          className={`${controlClass} pl-9`}
        />
      </div>

      <div className="w-44">
        <Dropdown
          compact
          options={typeOptions}
          value={selectedType}
          placeholder="Type"
          onChange={(option) => {
            const selected = Array.isArray(option) ? option[0] : option;
            const next = !selected || selected.value === 'all' ? null : (selected.value as PatientTypeEnum);
            onChange({ ...value, type: next });
          }}
        />
      </div>

      <div ref={pickerRef} className="relative w-52">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex w-full items-center gap-2 px-3 text-left ${controlClass} ${
            value.dateActive ? 'border-green-600 text-slate-900' : ''
          }`}
        >
          <FaCalendarAlt className="shrink-0 text-slate-400" />
          <span className="truncate">{rangeLabel}</span>
        </button>

        {open && (
          <div className="absolute top-full right-0 z-40 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl">
            <DateRange
              ranges={[displayRange]}
              onChange={onRangeChange}
              moveRangeOnFirstSelection={false}
              months={1}
              direction="horizontal"
              rangeColors={['#166534']}
            />
            <div className="flex justify-end border-t border-zinc-100 px-3 py-2">
              <button
                type="button"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() =>
                  onChange({
                    ...value,
                    dateActive: false,
                    range: {
                      startDate: undefined,
                      endDate: undefined,
                      key: 'selection',
                    },
                  })
                }
              >
                Clear dates
              </button>
            </div>
          </div>
        )}
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant={ButtonVariantEnum.GHOST}
          className="h-10 px-3 text-sm"
          onClick={() =>
            onChange({
              ...value,
              search: '',
              type: null,
              range: {
                startDate: undefined,
                endDate: undefined,
                key: 'selection',
              },
              dateActive: false,
            })
          }
        >
          <FaTimes className="text-xs" />
          Reset
        </Button>
      )}
    </div>
  );
}
