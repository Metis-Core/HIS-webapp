'use client';

import { FaPlus } from 'react-icons/fa';
import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import type { ILabResultField } from '@/interfaces';
import SchemaFieldRow from './schema-field-row';

interface ResultSchemaBuilderProps {
  fields: ILabResultField[];
  onChange: (next: ILabResultField[]) => void;
}

/** L5: the template the bench fills in; the API validates it and every result against it. */
export default function ResultSchemaBuilder({ fields, onChange }: ResultSchemaBuilderProps) {
  const add = () => onChange([...fields, { key: '', label: '', type: 'number' }]);
  const patch = (idx: number, next: Partial<ILabResultField>) =>
    onChange(fields.map((f, i) => (i === idx ? { ...f, ...next } : f)));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Result template</p>
          <p className="text-xs text-ink-muted">Leave empty for a single free-text result.</p>
        </div>
        <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={add}>
          <FaPlus className="text-xs" />
          Add field
        </Button>
      </div>
      {fields.map((f, idx) => (
        <SchemaFieldRow
          key={idx}
          field={f}
          onChange={(next) => patch(idx, next)}
          onRemove={() => onChange(fields.filter((_, i) => i !== idx))}
        />
      ))}
    </div>
  );
}
