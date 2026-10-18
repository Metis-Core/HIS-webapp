import type { ILabReferenceRange, ILabResultField } from '@/interfaces';

const isEmptyRange = (r: ILabReferenceRange) => Object.keys(r).length === 0;

/** Trims the builder's rows into what the API accepts, or explains the first problem. */
export function cleanFields(fields: ILabResultField[]): { fields: ILabResultField[] } | { error: string } {
  const out: ILabResultField[] = [];
  const keys = new Set<string>();
  for (const f of fields) {
    const key = f.key.trim();
    const label = f.label.trim();
    if (!key && !label) continue;
    if (!key || !label) return { error: 'Every template field needs a key and a label' };
    if (keys.has(key)) return { error: `Duplicate field key: ${key}` };
    keys.add(key);
    const options = f.type === 'select' ? (f.options ?? []) : [];
    if (f.type === 'select' && options.length === 0) return { error: `${label}: add at least one option` };
    const ranges = f.type === 'number' ? (f.ranges ?? []).filter((r) => !isEmptyRange(r)) : [];
    const normalValues = f.type === 'select' || f.type === 'text' ? (f.normalValues ?? []) : [];
    out.push({
      key,
      label,
      type: f.type,
      ...(f.unit?.trim() ? { unit: f.unit.trim() } : {}),
      ...(f.group?.trim() ? { group: f.group.trim() } : {}),
      ...(f.required ? { required: true } : {}),
      ...(f.helpText ? { helpText: f.helpText } : {}),
      ...(options.length ? { options } : {}),
      ...(ranges.length ? { ranges } : {}),
      ...(normalValues.length ? { normalValues } : {}),
    });
  }
  return { fields: out };
}
