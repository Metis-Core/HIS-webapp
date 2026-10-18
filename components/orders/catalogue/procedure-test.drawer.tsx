'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { cleanFields } from '@/components/lab/tests/clean-fields';
import ResultSchemaBuilder from '@/components/lab/tests/result-schema-builder';
import { ButtonVariantEnum, ModalDrawerModeEnum, OrderKindEnum, ProcedureCategoryEnum } from '@/enum';
import type {
  ICreateProcedureTestDto,
  ILabResultField,
  IOption,
  IProcedureTest,
  IUpdateProcedureTestDto,
} from '@/interfaces';
import { CATEGORIES_BY_KIND, CATEGORY_LABEL, KIND_LABEL } from '../order-format';

interface ProcedureTestDrawerProps {
  mode: ModalDrawerModeEnum | null;
  test: IProcedureTest | null;
  onClose: () => void;
  onSave: (payload: ICreateProcedureTestDto | IUpdateProcedureTestDto, id?: string) => Promise<void>;
}

interface FormValues {
  code: string;
  abbreviation: string;
  name: string;
  description: string;
  kind: OrderKindEnum;
  category: ProcedureCategoryEnum;
  price: string;
  durationMinutes: string;
  preparation: string;
  isActive: boolean;
}

const KINDS = Object.values(OrderKindEnum).map((value) => ({ value, label: KIND_LABEL[value] }));

const emptyValues: FormValues = {
  code: '',
  abbreviation: '',
  name: '',
  description: '',
  kind: OrderKindEnum.RADIOLOGY,
  category: ProcedureCategoryEnum.XRAY,
  price: '',
  durationMinutes: '',
  preparation: '',
  isActive: true,
};

const valuesFrom = (test: IProcedureTest): FormValues => ({
  code: test.code,
  abbreviation: test.abbreviation ?? '',
  name: test.name,
  description: test.description ?? '',
  kind: test.kind,
  category: test.category,
  price: String(test.price),
  durationMinutes: test.durationMinutes != null ? String(test.durationMinutes) : '',
  preparation: test.preparation ?? '',
  isActive: test.isActive,
});

/** Add or edit an imaging or procedure entry with its result template. */
export default function ProcedureTestDrawer({ mode, test, onClose, onSave }: ProcedureTestDrawerProps) {
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  return (
    <Drawer
      open={mode !== null}
      onClose={onClose}
      title={isEdit ? `Edit ${test?.name ?? 'entry'}` : 'New imaging or procedure'}
      width="w-[760px]"
    >
      {mode !== null && (
        <ProcedureTestForm
          key={`${mode}-${test?.id ?? 'new'}`}
          test={isEdit ? test : null}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Drawer>
  );
}

type ProcedureTestFormProps = Omit<ProcedureTestDrawerProps, 'mode'>;

function ProcedureTestForm({ test, onClose, onSave }: ProcedureTestFormProps) {
  const isEdit = Boolean(test);
  const [values, setValues] = useState<FormValues>(() => (test ? valuesFrom(test) : emptyValues));
  const [fields, setFields] = useState<ILabResultField[]>(() => test?.resultSchema?.fields ?? []);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((s) => ({ ...s, [key]: value }));
  const categories: IOption[] = CATEGORIES_BY_KIND[values.kind].map((value) => ({
    value,
    label: CATEGORY_LABEL[value],
  }));

  const changeKind = (kind: OrderKindEnum) =>
    setValues((s) => ({
      ...s,
      kind,
      category: CATEGORIES_BY_KIND[kind].includes(s.category) ? s.category : CATEGORIES_BY_KIND[kind][0],
    }));

  const submit = async () => {
    if (!values.code.trim() || !values.name.trim() || values.price === '') {
      toast.error('Code, name and price are required');
      return;
    }
    const cleaned = cleanFields(fields);
    if ('error' in cleaned) {
      toast.error(cleaned.error);
      return;
    }
    const payload: ICreateProcedureTestDto = {
      code: values.code.trim().toUpperCase(),
      abbreviation: values.abbreviation.trim() || undefined,
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      kind: values.kind,
      category: values.category,
      price: Number(values.price),
      durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : undefined,
      preparation: values.preparation.trim() || undefined,
      resultSchema: cleaned.fields.length > 0 ? { fields: cleaned.fields } : undefined,
      isActive: values.isActive,
    };
    setBusy(true);
    try {
      await onSave(payload, test?.id);
      onClose();
    } catch {
      // onSave already reported the failure; keep the form open for a retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Segmented label="Type" options={KINDS} value={values.kind} onChange={changeKind} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Code" required value={values.code} onChange={(e) => set('code', e.target.value)} />
        <Input label="Abbreviation" value={values.abbreviation} onChange={(e) => set('abbreviation', e.target.value)} />
        <Input
          label="Price (UGX)"
          required
          type="number"
          min={0}
          value={values.price}
          onChange={(e) => set('price', e.target.value)}
        />
      </div>
      <Input label="Name" required value={values.name} onChange={(e) => set('name', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Dropdown
          label="Category"
          options={categories}
          value={categories.find((o) => o.value === values.category) ?? null}
          onChange={(o) => set('category', (o as IOption).value as ProcedureCategoryEnum)}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          value={values.durationMinutes}
          onChange={(e) => set('durationMinutes', e.target.value)}
        />
      </div>
      <Input
        label="Patient preparation"
        value={values.preparation}
        onChange={(e) => set('preparation', e.target.value)}
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
          {isEdit ? 'Save changes' : 'Create entry'}
        </Button>
      </div>
    </form>
  );
}
