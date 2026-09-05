'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, LabSampleTypeEnum, LabTestCategoryEnum, ModalDrawerModeEnum } from '@/enum';
import type { ICreateLabTestDto, ILabTest, IOption, IUpdateLabTestDto } from '@/interfaces';

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
    } else {
      setValues(emptyValues);
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
