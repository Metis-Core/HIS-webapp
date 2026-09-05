'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, LabOrderItemStatusEnum, PillVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import type { ILabOrder, ILabOrderItem, ILabResultField, ILabResultSchema, IOption } from '@/interfaces';

interface LabResultDrawerProps {
  open: boolean;
  order: ILabOrder | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

const statusOptions: IOption[] = Object.values(LabOrderItemStatusEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

type SchemaValues = Record<string, string | number | boolean | null>;

interface Draft {
  status: LabOrderItemStatusEnum;
  resultValue: string;
  resultNotes: string;
  isAbnormal: boolean;
  schemaValues: SchemaValues;
}

function parseExisting(item: ILabOrderItem): { plain: string; schema: SchemaValues } {
  const raw = item.resultValue ?? '';
  if (!raw) return { plain: '', schema: {} };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { plain: '', schema: parsed as SchemaValues };
    }
  } catch {
    // fall through to plain value
  }
  return { plain: raw, schema: {} };
}

function draftFromItem(item: ILabOrderItem): Draft {
  const parsed = parseExisting(item);
  return {
    status: item.status,
    resultValue: parsed.plain,
    resultNotes: item.resultNotes ?? '',
    isAbnormal: item.isAbnormal ?? false,
    schemaValues: parsed.schema,
  };
}

export default function LabResultDrawer({ open, order, onClose, onSaved }: LabResultDrawerProps) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !order) {
      setDrafts({});
      return;
    }
    const next: Record<string, Draft> = {};
    order.items.forEach((it) => {
      next[it.id] = draftFromItem(it);
    });
    setDrafts(next);
  }, [open, order]);

  if (!open || !order) return null;

  const setField = <K extends keyof Draft>(itemId: string, key: K, value: Draft[K]) =>
    setDrafts((s) => ({ ...s, [itemId]: { ...s[itemId], [key]: value } }));

  const setSchemaField = (itemId: string, key: string, value: string | number | boolean | null) =>
    setDrafts((s) => ({
      ...s,
      [itemId]: {
        ...s[itemId],
        schemaValues: { ...s[itemId].schemaValues, [key]: value },
      },
    }));

  const submit = async (item: ILabOrderItem) => {
    const draft = drafts[item.id];
    if (!draft) return;
    const schema = item.test?.resultSchema ?? null;

    let serialised: string | undefined;
    if (schema && schema.fields.length > 0) {
      const missing = schema.fields
        .filter((f) => f.required)
        .filter((f) => {
          const v = draft.schemaValues[f.key];
          return v === undefined || v === null || v === '';
        });
      if (missing.length > 0) {
        toast.error(`Missing required: ${missing.map((f) => f.label).join(', ')}`);
        return;
      }
      const clean: SchemaValues = {};
      for (const f of schema.fields) {
        const v = draft.schemaValues[f.key];
        if (v === undefined || v === null || v === '') continue;
        clean[f.key] = v;
      }
      serialised = JSON.stringify(clean);
    } else if (draft.resultValue.trim()) {
      serialised = draft.resultValue.trim();
    }

    setBusy(item.id);
    try {
      await toast.promise(
        labOrdersService.updateItem(order.id, item.id, {
          status: draft.status,
          resultValue: serialised,
          resultNotes: draft.resultNotes.trim() || undefined,
          isAbnormal: draft.isAbnormal,
        }),
        {
          loading: 'Saving result…',
          success: 'Result saved',
          error: (err) => extractErrorMessage(err, "Couldn't save — retry"),
        },
      );
      await onSaved();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Lab results" width="w-[820px]">
      <div className="flex flex-col gap-4">
        <header className="rounded-md border border-line bg-surface p-3 text-sm">
          <p className="font-semibold text-ink">
            {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : 'Patient'}
          </p>
          <p className="text-xs text-ink-muted">
            MRN {order.patient?.mrn ?? '—'} · Priority {order.priority} · {order.status.replaceAll('_', ' ')}
          </p>
        </header>

        {order.items.map((item) => {
          const draft = drafts[item.id];
          if (!draft) return null;
          const schema = item.test?.resultSchema ?? null;
          const hasSchema = Boolean(schema && schema.fields.length > 0);
          return (
            <section key={item.id} className="flex flex-col gap-3 rounded-md border border-line bg-surface-raised p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
                  </p>
                  {item.test?.referenceRange && !hasSchema && (
                    <p className="text-xs text-ink-muted">
                      Reference: {item.test.referenceRange} {item.test.unit ?? ''}
                    </p>
                  )}
                </div>
                <Pill
                  variant={
                    draft.status === LabOrderItemStatusEnum.RESULT_READY
                      ? PillVariantEnum.SUCCESS
                      : draft.status === LabOrderItemStatusEnum.CANCELLED
                        ? PillVariantEnum.DEFAULT
                        : PillVariantEnum.INFO
                  }
                >
                  {draft.status.replaceAll('_', ' ')}
                </Pill>
              </div>

              <Dropdown
                label="Status"
                options={statusOptions}
                value={statusOptions.find((o) => o.value === draft.status) ?? null}
                onChange={(o) => setField(item.id, 'status', (o as IOption).value as LabOrderItemStatusEnum)}
              />

              {hasSchema ? (
                <SchemaFields
                  schema={schema as ILabResultSchema}
                  values={draft.schemaValues}
                  onChange={(key, value) => setSchemaField(item.id, key, value)}
                />
              ) : (
                <Input
                  label={`Result value${item.test?.unit ? ` (${item.test.unit})` : ''}`}
                  value={draft.resultValue}
                  onChange={(e) => setField(item.id, 'resultValue', e.target.value)}
                />
              )}

              <Input
                label="Notes"
                value={draft.resultNotes}
                onChange={(e) => setField(item.id, 'resultNotes', e.target.value)}
              />

              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.isAbnormal}
                  onChange={(e) => setField(item.id, 'isAbnormal', e.target.checked)}
                />
                Flag as abnormal
              </label>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant={ButtonVariantEnum.PRIMARY}
                  loading={busy === item.id}
                  onClick={() => submit(item)}
                >
                  Save
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </Drawer>
  );
}

function SchemaFields({
  schema,
  values,
  onChange,
}: {
  schema: ILabResultSchema;
  values: SchemaValues;
  onChange: (key: string, value: string | number | boolean | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {schema.fields.map((f) => (
        <SchemaField key={f.key} field={f} value={values[f.key] ?? null} onChange={(v) => onChange(f.key, v)} />
      ))}
    </div>
  );
}

function SchemaField({
  field,
  value,
  onChange,
}: {
  field: ILabResultField;
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean | null) => void;
}) {
  const label = `${field.label}${field.required ? ' *' : ''}${field.unit ? ` (${field.unit})` : ''}`;
  if (field.type === 'number') {
    return (
      <div>
        <Input
          label={label}
          type="number"
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={field.helpText}
        />
        {field.referenceRange && <p className="mt-1 text-xs text-ink-muted">Ref: {field.referenceRange}</p>}
      </div>
    );
  }
  if (field.type === 'select') {
    const options: IOption[] = (field.options ?? []).map((o) => ({ label: o, value: o }));
    return (
      <Dropdown
        label={label}
        options={options}
        value={options.find((o) => o.value === value) ?? null}
        onChange={(o) => onChange((o as IOption | null)?.value ?? null)}
      />
    );
  }
  if (field.type === 'boolean') {
    return (
      <label className="mt-6 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }
  return (
    <div>
      <Input
        label={label}
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        placeholder={field.helpText}
      />
      {field.referenceRange && <p className="mt-1 text-xs text-ink-muted">Ref: {field.referenceRange}</p>}
    </div>
  );
}
