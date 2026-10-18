'use client';

import { FaTrash } from 'react-icons/fa';
import { Dropdown, Input } from '@/components';
import type { ILabResultField, IOption, LabResultFieldType } from '@/interfaces';
import RangesEditor from './ranges-editor';

const fieldTypeOptions: IOption[] = [
  { label: 'Number', value: 'number' },
  { label: 'Text', value: 'text' },
  { label: 'Select', value: 'select' },
  { label: 'Boolean (yes/no)', value: 'boolean' },
];

const splitList = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

interface SchemaFieldRowProps {
  field: ILabResultField;
  onChange: (patch: Partial<ILabResultField>) => void;
  onRemove: () => void;
}

/** One template field: identity, type, unit, section, then ranges (numbers) or expected answers. */
export default function SchemaFieldRow({ field: f, onChange, onRemove }: SchemaFieldRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-3">
      <div className="grid grid-cols-12 items-end gap-2">
        <div className="col-span-3">
          <Input label="Key" value={f.key} onChange={(e) => onChange({ key: e.target.value })} placeholder="hb" />
        </div>
        <div className="col-span-4">
          <Input
            label="Label"
            value={f.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Haemoglobin"
          />
        </div>
        <div className="col-span-4">
          <Dropdown
            label="Type"
            options={fieldTypeOptions}
            value={fieldTypeOptions.find((o) => o.value === f.type) ?? null}
            onChange={(o) => onChange({ type: (o as IOption).value as LabResultFieldType })}
          />
        </div>
        <button type="button" onClick={onRemove} className="col-span-1 mb-2 text-critical" aria-label="Remove field">
          <FaTrash className="text-sm" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input label="Unit" value={f.unit ?? ''} onChange={(e) => onChange({ unit: e.target.value })} />
        <Input
          label="Section"
          value={f.group ?? ''}
          onChange={(e) => onChange({ group: e.target.value })}
          placeholder="Microscopy"
        />
        <label className="mt-6 flex items-center gap-2 text-xs text-ink">
          <input
            type="checkbox"
            checked={Boolean(f.required)}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          Required
        </label>
      </div>
      {f.type === 'select' && (
        <Input
          label="Options (comma-separated)"
          value={(f.options ?? []).join(', ')}
          onChange={(e) => onChange({ options: splitList(e.target.value) })}
          placeholder="Positive, Negative"
        />
      )}
      {(f.type === 'select' || f.type === 'text') && (
        <Input
          label="Normal answers (comma-separated; anything else is flagged)"
          value={(f.normalValues ?? []).join(', ')}
          onChange={(e) => onChange({ normalValues: splitList(e.target.value) })}
          placeholder="Negative"
        />
      )}
      {f.type === 'number' && <RangesEditor ranges={f.ranges ?? []} onChange={(ranges) => onChange({ ranges })} />}
    </div>
  );
}
