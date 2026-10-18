import { describe, expect, it } from 'vitest';
import { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import type { ILabResultField, IVaccine } from '@/interfaces';
import { fieldsFor, recordSummary, vaccineDefaults } from './clinic-format';

const mr: IVaccine = {
  name: 'Measles-Rubella (MR)',
  schedule: '9 and 18 months',
  doses: ['Dose 1', 'Dose 2'],
  route: 'Subcutaneous',
  site: 'Left upper arm',
};
const dose: ILabResultField = {
  key: 'dose',
  label: 'Dose',
  type: 'select',
  options: ['Birth dose', 'Dose 1', 'Dose 2', 'Dose 3'],
};
const batch: ILabResultField = { key: 'batch_number', label: 'Batch', type: 'text' };

describe('vaccineDefaults', () => {
  it('suggests the usual route, site and doses, and nothing before a vaccine is chosen', () => {
    expect(vaccineDefaults(mr)).toEqual({ route: 'Subcutaneous', site: 'Left upper arm', doses: ['Dose 1', 'Dose 2'] });
    expect(vaccineDefaults(undefined)).toEqual({});
  });
});

describe('fieldsFor', () => {
  it('limits the dose choices to the chosen vaccine for immunizations only', () => {
    const narrowed = fieldsFor(ClinicRecordKindEnum.IMMUNIZATION, [dose, batch], mr);
    expect(narrowed.find((f) => f.key === 'dose')?.options).toEqual(['Dose 1', 'Dose 2']);
    expect(narrowed.find((f) => f.key === 'batch_number')).toBe(batch);
    expect(fieldsFor(ClinicRecordKindEnum.DELIVERY, [dose], mr)).toEqual([dose]);
  });
});

describe('recordSummary', () => {
  it('summarises each kind of record on one line', () => {
    expect(
      recordSummary({
        kind: ClinicRecordKindEnum.IMMUNIZATION,
        data: { vaccine: 'BCG', dose: 'Birth dose', batch_number: 'B1' },
      }),
    ).toBe('BCG · Birth dose · batch B1');
    expect(
      recordSummary({
        kind: ClinicRecordKindEnum.ANTENATAL_VISIT,
        data: { contact: '3', gestation_weeks: 28, risk: 'Low risk' },
      }),
    ).toBe('Contact 3 · 28 weeks · Low risk');
    expect(
      recordSummary({
        kind: ClinicRecordKindEnum.DELIVERY,
        data: { outcome: 'Live birth', mode: 'Spontaneous vaginal', birth_weight_g: 3200 },
      }),
    ).toBe('Live birth · Spontaneous vaginal · 3200 g');
  });
});
