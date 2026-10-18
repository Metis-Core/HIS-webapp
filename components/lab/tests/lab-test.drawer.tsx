'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import type { ICreateLabTestDto, ILabResultField, ILabTest, IUpdateLabTestDto } from '@/interfaces';
import { cleanFields } from './clean-fields';
import LabTestBasics, { emptyTestValues, type LabTestFormValues } from './lab-test-basics';
import ResultSchemaBuilder from './result-schema-builder';

interface LabTestDrawerProps {
  mode: ModalDrawerModeEnum | null;
  test: ILabTest | null;
  onClose: () => void;
  onSave: (payload: ICreateLabTestDto | IUpdateLabTestDto, id?: string) => Promise<void>;
}

const valuesFrom = (test: ILabTest): LabTestFormValues => ({
  code: test.code,
  abbreviation: test.abbreviation ?? '',
  name: test.name,
  description: test.description ?? '',
  category: test.category,
  sampleType: test.sampleType,
  unit: test.unit ?? '',
  price: String(test.price),
  turnaroundHours: test.turnaroundHours != null ? String(test.turnaroundHours) : '',
  isActive: test.isActive,
});

/** Add or edit a catalogue test with its result template and reference ranges. */
export default function LabTestDrawer({ mode, test, onClose, onSave }: LabTestDrawerProps) {
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  return (
    <Drawer
      open={mode !== null}
      onClose={onClose}
      title={isEdit ? `Edit ${test?.name ?? 'test'}` : 'New lab test'}
      width="w-[760px]"
    >
      {mode !== null && (
        <LabTestForm
          key={`${mode}-${test?.id ?? 'new'}`}
          test={isEdit ? test : null}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Drawer>
  );
}

type LabTestFormProps = Omit<LabTestDrawerProps, 'mode'>;

/** Remounted per test, so its state always starts from the test being edited. */
function LabTestForm({ test, onClose, onSave }: LabTestFormProps) {
  const isEdit = Boolean(test);
  const [values, setValues] = useState<LabTestFormValues>(() => (test ? valuesFrom(test) : emptyTestValues));
  const [fields, setFields] = useState<ILabResultField[]>(() => test?.resultSchema?.fields ?? []);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof LabTestFormValues>(key: K, value: LabTestFormValues[K]) =>
    setValues((s) => ({ ...s, [key]: value }));

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
    const payload: ICreateLabTestDto = {
      code: values.code.trim().toUpperCase(),
      abbreviation: values.abbreviation.trim() || undefined,
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      category: values.category,
      sampleType: values.sampleType,
      unit: values.unit.trim() || undefined,
      price: Number(values.price),
      turnaroundHours: values.turnaroundHours ? Number(values.turnaroundHours) : undefined,
      resultSchema: cleaned.fields.length > 0 ? { fields: cleaned.fields } : undefined,
      isActive: values.isActive,
    };
    setBusy(true);
    try {
      await onSave(payload, test?.id);
      onClose();
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
      <LabTestBasics values={values} set={set} />
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
  );
}
