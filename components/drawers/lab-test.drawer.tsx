'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Drawer, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, LabSampleTypeEnum, LabTestCategoryEnum, ModalDrawerModeEnum } from '@/enum';
import type {
  ICreateLabTestDto,
  ILabResultField,
  ILabTest,
  IOption,
  IUpdateLabTestDto,
  LabResultFieldType,
} from '@/interfaces';

type ResultFieldRow = ILabResultField;

const emptyValues = {
  code: '',
  name: '',
  description: '',
  category: LabTestCategoryEnum.HEMATOLOGY,
  sampleType: LabSampleTypeEnum.BLOOD,
  unit: '',
  referenceRange: '',
  price: '',
  turnaroundHours: '',
  isActive: true,
};

type FormState = typeof emptyValues;

interface LabTestDrawerProps {
  mode: ModalDrawerModeEnum | null;
  test: ILabTest | null;
  onClose: () => void;
  onSave: (payload: ICreateLabTestDto | IUpdateLabTestDto, id?: string) => Promise<void>;
}

const categoryOptions: IOption[] = Object.values(LabTestCategoryEnum).map((v) => ({ label: v, value: v }));
const sampleOptions: IOption[] = Object.values(LabSampleTypeEnum).map((v) => ({ label: v, value: v }));

export default function LabTestDrawer({ mode, test, onClose, onSave }: LabTestDrawerProps) {
  const open = mode !== null;
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  const [values, setValues] = useState<FormState>(emptyValues);
  const [fields, setFields] = useState<ResultFieldRow[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isEdit && test) {
      setValues({
        code: test.code,
        name: test.name,
        description: test.description ?? '',
        category: test.category,
        sampleType: test.sampleType,
        unit: test.unit ?? '',
        referenceRange: test.referenceRange ?? '',
        price: String(test.price),
        turnaroundHours: test.turnaroundHours != null ? String(test.turnaroundHours) : '',
        isActive: test.isActive,
      });
      setFields(test.resultSchema?.fields ?? []);
    } else {
      setValues(emptyValues);
      setFields([]);
    }
  }, [test, isEdit, open]);

  const title = useMemo(
    () => (mode === ModalDrawerModeEnum.ADD ? 'New lab test' : `Edit ${test?.name ?? 'test'}`),
    [mode, test],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    if (!values.code.trim() || !values.name.trim() || !values.price) {
      toast.error('Code, name and price are required');
      return;
    }
    setBusy(true);
    try {
      const cleanFields: ILabResultField[] = fields
        .map((f) => ({
          ...f,
          key: f.key.trim(),
          label: f.label.trim(),
          unit: f.unit?.trim() || undefined,
          referenceRange: f.referenceRange?.trim() || undefined,
          options: f.type === 'select' ? (f.options ?? []).filter(Boolean).map((o) => o.trim()) : undefined,
        }))
        .filter((f) => f.key && f.label);
      const keys = new Set<string>();
      for (const f of cleanFields) {
        if (keys.has(f.key)) {
          toast.error(`Duplicate field key: ${f.key}`);
          setBusy(false);
          return;
        }
        keys.add(f.key);
      }
      const payload: ICreateLabTestDto | IUpdateLabTestDto = {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        category: values.category,
        sampleType: values.sampleType,
        unit: values.unit.trim() || undefined,
        referenceRange: values.referenceRange.trim() || undefined,
        price: Number(values.price),
        turnaroundHours: values.turnaroundHours ? Number(values.turnaroundHours) : undefined,
        resultSchema: cleanFields.length > 0 ? { fields: cleanFields } : undefined,
        isActive: values.isActive,
      };
      await onSave(payload, test?.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={title} width="w-[640px]">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Code"
            required
            value={values.code}
            onChange={(e) => set('code', e.target.value)}
            placeholder="CBC"
          />
          <Input
            label="Price (UGX)"
            required
            type="number"
            value={values.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </div>

        <Input
          label="Name"
          required
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Complete Blood Count"
        />

        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Category"
            options={categoryOptions}
            value={categoryOptions.find((o) => o.value === values.category) ?? null}
            onChange={(o) => set('category', (o as IOption).value as LabTestCategoryEnum)}
          />
          <Dropdown
            label="Sample type"
            options={sampleOptions}
            value={sampleOptions.find((o) => o.value === values.sampleType) ?? null}
            onChange={(o) => set('sampleType', (o as IOption).value as LabSampleTypeEnum)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Unit" value={values.unit} onChange={(e) => set('unit', e.target.value)} placeholder="g/dL" />
          <Input
            label="Turnaround (hrs)"
            type="number"
            value={values.turnaroundHours}
            onChange={(e) => set('turnaroundHours', e.target.value)}
          />
        </div>

        <Input
          label="Reference range"
          value={values.referenceRange}
          onChange={(e) => set('referenceRange', e.target.value)}
          placeholder="12 - 16 g/dL"
        />

        <Input label="Description" value={values.description} onChange={(e) => set('description', e.target.value)} />

        <ResultSchemaBuilder fields={fields} onChange={setFields} />

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active (can be ordered)
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
            {isEdit ? 'Save changes' : 'Create test'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

const fieldTypeOptions: IOption[] = [
  { label: 'Number', value: 'number' },
  { label: 'Text', value: 'text' },
  { label: 'Select', value: 'select' },
  { label: 'Boolean (yes/no)', value: 'boolean' },
];

function ResultSchemaBuilder({
  fields,
  onChange,
}: {
  fields: ResultFieldRow[];
  onChange: (next: ResultFieldRow[]) => void;
}) {
  const add = () =>
    onChange([...fields, { key: '', label: '', type: 'number', unit: '', referenceRange: '', options: [] }]);
  const remove = (idx: number) => onChange(fields.filter((_, i) => i !== idx));
  const patch = (idx: number, patch: Partial<ResultFieldRow>) =>
    onChange(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Result form fields</p>
          <p className="text-xs text-ink-muted">
            Define the fields the lab tech fills when reporting a result. Leave empty for a single-value test.
          </p>
        </div>
        <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={add}>
          <FaPlus className="text-xs" />
          Add field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-ink-muted">
          No fields yet — the lab tech will use the default single-value + unit + notes form.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((f, idx) => (
            <div key={idx} className="flex flex-col gap-2 rounded-md border border-line bg-surface-raised p-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <Input
                    label="Key"
                    value={f.key}
                    onChange={(e) => patch(idx, { key: e.target.value })}
                    placeholder="hemoglobin"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    label="Label"
                    value={f.label}
                    onChange={(e) => patch(idx, { label: e.target.value })}
                    placeholder="Hemoglobin"
                  />
                </div>
                <div className="col-span-3">
                  <Dropdown
                    label="Type"
                    options={fieldTypeOptions}
                    value={fieldTypeOptions.find((o) => o.value === f.type) ?? null}
                    onChange={(o) => patch(idx, { type: (o as IOption).value as LabResultFieldType })}
                  />
                </div>
                <div className="col-span-2 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="mb-1 text-critical hover:opacity-80"
                    aria-label="Remove field"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>

              {(f.type === 'number' || f.type === 'text') && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Unit"
                    value={f.unit ?? ''}
                    onChange={(e) => patch(idx, { unit: e.target.value })}
                    placeholder="g/dL"
                  />
                  <Input
                    label="Reference range"
                    value={f.referenceRange ?? ''}
                    onChange={(e) => patch(idx, { referenceRange: e.target.value })}
                    placeholder="12 - 16"
                  />
                </div>
              )}

              {f.type === 'select' && (
                <Input
                  label="Options (comma-separated)"
                  value={(f.options ?? []).join(', ')}
                  onChange={(e) =>
                    patch(idx, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="positive, negative, indeterminate"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
