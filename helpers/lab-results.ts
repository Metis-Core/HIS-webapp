import { LabOrderItemStatusEnum, LabResultFlagEnum } from '@/enum';
import type {
  ILabOrderItem,
  ILabReferenceRange,
  ILabResultField,
  ILabResultSchema,
  ILabTest,
  IPatient,
  LabResultValue,
} from '@/interfaces';

export const PLAIN_RESULT_KEY = 'value';

/** Same rule as the API: a test without a template has one free-text "Result" field. */
export function effectiveSchema(test: Pick<ILabTest, 'resultSchema' | 'unit'> | undefined): ILabResultSchema {
  if (test?.resultSchema?.fields?.length) return test.resultSchema;
  return {
    fields: [{ key: PLAIN_RESULT_KEY, label: 'Result', type: 'text', ...(test?.unit ? { unit: test.unit } : {}) }],
  };
}

/** Fields under their section headings, in template order. */
export function groupFields(fields: ILabResultField[]): Array<{ group: string | null; fields: ILabResultField[] }> {
  const groups: Array<{ group: string | null; fields: ILabResultField[] }> = [];
  fields.forEach((field) => {
    const group = field.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.group === group) last.fields.push(field);
    else groups.push({ group, fields: [field] });
  });
  return groups;
}

export const FLAG_SHORT: Record<LabResultFlagEnum, string> = {
  [LabResultFlagEnum.LOW]: 'L',
  [LabResultFlagEnum.HIGH]: 'H',
  [LabResultFlagEnum.CRITICAL_LOW]: 'LL',
  [LabResultFlagEnum.CRITICAL_HIGH]: 'HH',
  [LabResultFlagEnum.ABNORMAL]: '*',
};

export const FLAG_LABEL: Record<LabResultFlagEnum, string> = {
  [LabResultFlagEnum.LOW]: 'Low',
  [LabResultFlagEnum.HIGH]: 'High',
  [LabResultFlagEnum.CRITICAL_LOW]: 'Critically low',
  [LabResultFlagEnum.CRITICAL_HIGH]: 'Critically high',
  [LabResultFlagEnum.ABNORMAL]: 'Abnormal',
};

export const isCriticalFlag = (flag: LabResultFlagEnum | undefined) =>
  flag === LabResultFlagEnum.CRITICAL_LOW || flag === LabResultFlagEnum.CRITICAL_HIGH;

export const isReleased = (item: Pick<ILabOrderItem, 'status'>) => item.status === LabOrderItemStatusEnum.VERIFIED;

export function ageInYears(dateOfBirth: string | Date | null | undefined, at = new Date()): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  let years = at.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    at.getUTCMonth() < dob.getUTCMonth() ||
    (at.getUTCMonth() === dob.getUTCMonth() && at.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years >= 0 ? years : null;
}

const specificity = (r: ILabReferenceRange) =>
  (r.sex ? 2 : 0) + (r.minAgeYears !== undefined || r.maxAgeYears !== undefined ? 1 : 0);

/** The interval that applies to this patient (mirrors the API's choice). */
export function rangeFor(
  field: ILabResultField,
  patient: Pick<IPatient, 'gender' | 'dateOfBirth'> | undefined,
): ILabReferenceRange | null {
  const age = ageInYears(patient?.dateOfBirth);
  const fits = (r: ILabReferenceRange) =>
    (!r.sex || r.sex === String(patient?.gender)) &&
    (r.minAgeYears === undefined || (age !== null && age >= r.minAgeYears)) &&
    (r.maxAgeYears === undefined || (age !== null && age < r.maxAgeYears));
  return (field.ranges ?? []).filter(fits).sort((a, b) => specificity(b) - specificity(a))[0] ?? null;
}

export function describeRange(range: ILabReferenceRange | null): string {
  if (!range) return '';
  const { low, high } = range;
  if (low !== undefined && high !== undefined) return `${low} – ${high}`;
  if (high !== undefined) return `≤ ${high}`;
  if (low !== undefined) return `≥ ${low}`;
  return '';
}

export const displayValue = (value: LabResultValue | undefined) =>
  value === undefined || value === '' ? '—' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
