'use client';

import { Dropdown, Input } from '@/components';
import { describeRange, rangeFor } from '@/helpers/lab-results';
import type { ILabResultField, IOption, IPatient, LabResultValue } from '@/interfaces';

interface LabResultFieldProps {
  field: ILabResultField;
  value: LabResultValue | undefined;
  patient?: Pick<IPatient, 'gender' | 'dateOfBirth'>;
  onChange: (value: LabResultValue | undefined) => void;
}

/** One template field; the reference hint uses the interval that applies to this patient. */
export default function LabResultField({ field, value, patient, onChange }: LabResultFieldProps) {
  const label = `${field.label}${field.unit ? ` (${field.unit})` : ''}`;
  const reference = describeRange(rangeFor(field, patient)) || field.normalValues?.join(' / ');
  const hint = reference ? <p className="mt-1 text-[11px] text-ink-muted">Ref: {reference}</p> : null;
  const text = value === undefined ? '' : String(value);

  if (field.type === 'select') {
    const options: IOption[] = (field.options ?? []).map((o) => ({ label: o, value: o }));
    return (
      <div>
        <Dropdown
          label={label}
          options={options}
          value={options.find((o) => o.value === value) ?? null}
          onChange={(o) => onChange((o as IOption | null)?.value ?? undefined)}
        />
        {hint}
      </div>
    );
  }
  if (field.type === 'boolean') {
    return (
      <label className="mt-6 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }
  return (
    <div>
      <Input
        label={label}
        required={field.required}
        type={field.type === 'number' ? 'number' : 'text'}
        step="any"
        value={text}
        placeholder={field.helpText}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange(undefined);
          onChange(field.type === 'number' ? Number(raw) : raw);
        }}
      />
      {hint}
    </div>
  );
}
