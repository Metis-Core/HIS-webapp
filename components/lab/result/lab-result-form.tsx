'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { effectiveSchema, groupFields } from '@/helpers/lab-results';
import type { ILabOrderItem, ILabResultData, IPatient, LabResultValue } from '@/interfaces';
import LabResultField from './lab-result-field';

export interface LabResultSubmission {
  resultData: ILabResultData;
  resultNotes?: string;
}

interface LabResultFormProps {
  item: ILabOrderItem;
  patient?: Pick<IPatient, 'gender' | 'dateOfBirth'>;
  submitLabel: string;
  busy: boolean;
  /** Extra inputs above the buttons, e.g. the amendment reason. */
  children?: React.ReactNode;
  onSubmit: (submission: LabResultSubmission) => void;
  onCancel?: () => void;
}

/** L5: result entry from the test's template. Flags are computed by the server, never typed in (L6). */
export default function LabResultForm(props: LabResultFormProps) {
  const { item, patient, submitLabel, busy, children, onSubmit, onCancel } = props;
  const schema = effectiveSchema(item.test);
  const [values, setValues] = useState<ILabResultData>(item.resultData ?? {});
  const [notes, setNotes] = useState(item.resultNotes ?? '');

  const setValue = (key: string, value: LabResultValue | undefined) =>
    setValues((current) => {
      const next = { ...current };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });

  const submit = () => {
    const missing = schema.fields.filter((f) => f.required && values[f.key] === undefined);
    if (missing.length > 0) {
      toast.error(`Missing required: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    if (Object.keys(values).length === 0) {
      toast.error('Enter at least one result value');
      return;
    }
    onSubmit({ resultData: values, resultNotes: notes.trim() || undefined });
  };

  return (
    <div className="flex flex-col gap-3">
      {groupFields(schema.fields).map(({ group, fields }) => (
        <fieldset key={group ?? 'fields'} className="flex flex-col gap-2">
          {group && <legend className="text-xs font-semibold uppercase text-ink-muted">{group}</legend>}
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <LabResultField
                key={f.key}
                field={f}
                value={values[f.key]}
                patient={patient}
                onChange={(v) => setValue(f.key, v)}
              />
            ))}
          </div>
        </fieldset>
      ))}
      <Input label="Notes" value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} />
      {children}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
