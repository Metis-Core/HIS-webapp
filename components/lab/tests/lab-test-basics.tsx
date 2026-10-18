'use client';

import { Dropdown, Input } from '@/components';
import { LabSampleTypeEnum, LabTestCategoryEnum } from '@/enum';
import type { IOption } from '@/interfaces';

export const emptyTestValues = {
  code: '',
  abbreviation: '',
  name: '',
  description: '',
  category: LabTestCategoryEnum.HEMATOLOGY,
  sampleType: LabSampleTypeEnum.BLOOD,
  unit: '',
  price: '',
  turnaroundHours: '',
  isActive: true,
};

export type LabTestFormValues = typeof emptyTestValues;

const categoryOptions: IOption[] = Object.values(LabTestCategoryEnum).map((v) => ({ label: v, value: v }));
const sampleOptions: IOption[] = Object.values(LabSampleTypeEnum).map((v) => ({ label: v, value: v }));

interface LabTestBasicsProps {
  values: LabTestFormValues;
  set: <K extends keyof LabTestFormValues>(key: K, value: LabTestFormValues[K]) => void;
}

/** Catalogue identity (L4: code and abbreviation are both searchable), price and turnaround. */
export default function LabTestBasics({ values, set }: LabTestBasicsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Code" required value={values.code} onChange={(e) => set('code', e.target.value)} />
        <Input
          label="Abbreviation"
          value={values.abbreviation}
          onChange={(e) => set('abbreviation', e.target.value)}
          placeholder="FBC, Hb"
        />
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
          min={0}
          value={values.turnaroundHours}
          onChange={(e) => set('turnaroundHours', e.target.value)}
        />
      </div>
      <Input label="Description" value={values.description} onChange={(e) => set('description', e.target.value)} />
    </>
  );
}
