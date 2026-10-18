'use client';

import { FaPlus, FaTrash } from 'react-icons/fa';
import type { ILabReferenceRange, LabSexEnumValue } from '@/interfaces';

type NumericKey = Exclude<keyof ILabReferenceRange, 'sex'>;

const COLUMNS: Array<{ key: NumericKey; label: string }> = [
  { key: 'minAgeYears', label: 'Age from' },
  { key: 'maxAgeYears', label: 'Age to (excl.)' },
  { key: 'low', label: 'Low' },
  { key: 'high', label: 'High' },
  { key: 'criticalLow', label: 'Critical low' },
  { key: 'criticalHigh', label: 'Critical high' },
];

const cell = 'w-full rounded border border-line bg-surface-raised px-1.5 py-1 text-xs';

interface RangesEditorProps {
  ranges: ILabReferenceRange[];
  onChange: (ranges: ILabReferenceRange[]) => void;
}

/** L6: reference intervals by sex and age; the most specific matching row is used to flag a result. */
export default function RangesEditor({ ranges, onChange }: RangesEditorProps) {
  const patch = (idx: number, next: ILabReferenceRange) => onChange(ranges.map((r, i) => (i === idx ? next : r)));
  const setNumber = (idx: number, key: NumericKey, raw: string) => {
    const next = { ...ranges[idx] };
    if (raw === '' || Number.isNaN(Number(raw))) delete next[key];
    else next[key] = Number(raw);
    patch(idx, next);
  };
  const setSex = (idx: number, raw: string) => {
    const next = { ...ranges[idx] };
    if (raw) next.sex = raw as LabSexEnumValue;
    else delete next.sex;
    patch(idx, next);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">Reference ranges</span>
        <button type="button" className="text-xs text-brand hover:underline" onClick={() => onChange([...ranges, {}])}>
          <FaPlus className="mr-1 inline" />
          Add range
        </button>
      </div>
      {ranges.length > 0 && (
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-ink-muted">
              <th className="font-medium">Sex</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="font-medium">
                  {c.label}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {ranges.map((r, idx) => (
              <tr key={idx}>
                <td className="pr-1">
                  <select className={cell} value={r.sex ?? ''} onChange={(e) => setSex(idx, e.target.value)}>
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </td>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="pr-1">
                    <input
                      aria-label={c.label}
                      type="number"
                      step="any"
                      className={cell}
                      value={r[c.key] ?? ''}
                      onChange={(e) => setNumber(idx, c.key, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    aria-label="Remove range"
                    onClick={() => onChange(ranges.filter((_, i) => i !== idx))}
                  >
                    <FaTrash className="text-critical" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
