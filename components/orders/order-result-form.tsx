'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components';
import LabResultField from '@/components/lab/result/lab-result-field';
import Segmented from '@/components/inputs/segmented';
import { ButtonVariantEnum, OrderKindEnum, ResultClassificationEnum } from '@/enum';
import { groupFields } from '@/helpers/lab-results';
import type { ILabResultData, IProcedureOrder, IUpdateOrderStatusDto, LabResultValue } from '@/interfaces';
import { CLASSIFICATION_LABEL, previewFlags, suggestClassification } from './order-format';

type ResultDto = Pick<IUpdateOrderStatusDto, 'resultData' | 'classification' | 'impression' | 'report'>;

interface OrderResultFormProps {
  order: IProcedureOrder;
  busy: boolean;
  serverError: string | null;
  onSubmit: (dto: ResultDto) => void;
  onBack: () => void;
}

const MIN_TEXT = 3;
const CLASSIFICATIONS = Object.values(ResultClassificationEnum).map((value) => ({
  value,
  label: CLASSIFICATION_LABEL[value],
}));
const TEXTAREA =
  'w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand';

/** Structured result entry from the test's template; flags are computed by the server, classification is the clinician's call. */
export default function OrderResultForm({ order, busy, serverError, onSubmit, onBack }: OrderResultFormProps) {
  const imaging = order.kind === OrderKindEnum.RADIOLOGY;
  const fields = useMemo(() => order.test?.resultSchema?.fields ?? [], [order.test]);
  const [values, setValues] = useState<ILabResultData>({});
  const [chosen, setChosen] = useState<ResultClassificationEnum | null>(null);
  const [impression, setImpression] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const flags = useMemo(() => previewFlags(fields, values, order.patient), [fields, values, order.patient]);
  const classification = chosen ?? suggestClassification(flags);
  const flagged = Object.keys(flags).length > 0;

  const setValue = (key: string, value: LabResultValue | undefined) =>
    setValues((current) => {
      const next = { ...current };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missing = fields.filter((f) => f.required && values[f.key] === undefined);
    if (missing.length > 0) return setError(`Missing required: ${missing.map((f) => f.label).join(', ')}`);
    if (fields.length > 0 && Object.keys(values).length === 0) return setError('Enter at least one finding');
    if (fields.length === 0 && notes.trim().length < MIN_TEXT) {
      return setError(imaging ? 'Write the findings first' : 'Write the operation notes first');
    }
    if (imaging && impression.trim().length < MIN_TEXT) return setError('Write the impression first');
    if (imaging && classification === ResultClassificationEnum.NORMAL && flagged) {
      return setError('Some findings are outside the normal pattern: classify the result as abnormal or critical');
    }
    setError(null);
    onSubmit({
      resultData: fields.length > 0 ? values : undefined,
      classification: imaging ? classification : undefined,
      impression: imaging ? impression.trim() : undefined,
      report: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4">
      {groupFields(fields).map(({ group, fields: groupFieldsList }) => (
        <fieldset key={group ?? 'fields'} className="flex flex-col gap-2">
          {group && <legend className="text-xs font-semibold uppercase text-ink-muted">{group}</legend>}
          <div className="grid grid-cols-2 gap-3">
            {groupFieldsList.map((field) => (
              <LabResultField
                key={field.key}
                field={field}
                value={values[field.key]}
                patient={order.patient}
                onChange={(value) => setValue(field.key, value)}
              />
            ))}
          </div>
        </fieldset>
      ))}
      {imaging && (
        <>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
            Impression
            <textarea
              rows={3}
              maxLength={2000}
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              className={TEXTAREA}
            />
          </label>
          <div className="flex flex-col gap-1">
            <Segmented label="Classification" options={CLASSIFICATIONS} value={classification} onChange={setChosen} />
            {flagged && chosen === null && (
              <p className="text-[11px] text-ink-muted">
                Suggested from the flagged findings; change it if you disagree.
              </p>
            )}
          </div>
        </>
      )}
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
        {imaging ? 'Additional notes' : 'Operation notes'}
        <textarea
          rows={fields.length > 0 ? 3 : 6}
          maxLength={8000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={TEXTAREA}
        />
      </label>
      {(error ?? serverError) && (
        <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
          {error ?? serverError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
          Complete order
        </Button>
      </div>
    </form>
  );
}
