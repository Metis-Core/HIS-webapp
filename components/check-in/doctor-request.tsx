'use client';

import { Dropdown } from '@/components';
import { useDoctors } from '@/hooks';
import type { IOption } from '@/interfaces';

const ANY: IOption = { label: 'Any available doctor', value: '' };

interface DoctorRequestProps {
  doctorId: string | undefined;
  onChange: (doctorId: string | undefined) => void;
}

/** For a patient who asks for a doctor by name: only doctors who can take a patient now are offered. */
export default function DoctorRequest({ doctorId, onChange }: DoctorRequestProps) {
  const { doctors } = useDoctors({ limit: 50 });
  const options: IOption[] = [
    ANY,
    ...doctors
      .filter((doctor) => doctor.assignable)
      .map((doctor) => ({ label: `Dr ${doctor.username} · ${doctor.waiting} waiting`, value: doctor.id })),
  ];
  return (
    <div className="flex flex-col gap-1">
      <Dropdown
        label="Specific doctor (only if the patient asked for one)"
        options={options}
        value={options.find((o) => o.value === (doctorId ?? '')) ?? ANY}
        onChange={(value) => {
          const picked = Array.isArray(value) ? value[0] : value;
          onChange(picked?.value ? String(picked.value) : undefined);
        }}
      />
      <p className="text-xs text-ink-muted">
        The doctor is told straight away. A doctor who is busy, on leave or out of office is not listed.
      </p>
    </div>
  );
}
