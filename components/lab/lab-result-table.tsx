import { describeRange, displayValue, effectiveSchema, groupFields, rangeFor } from '@/helpers/lab-results';
import type { ILabResultData, ILabResultFlags, ILabTest, IPatient } from '@/interfaces';
import LabFlagPill from './lab-flag.pill';

interface LabResultTableProps {
  item: {
    resultData?: ILabResultData | null;
    resultFlags?: ILabResultFlags | null;
    test?: Pick<ILabTest, 'resultSchema'>;
  };
  patient?: Pick<IPatient, 'gender' | 'dateOfBirth'>;
}

/** L5: a structured result as a table (field, value, unit, reference, flag), grouped by section. */
export default function LabResultTable({ item, patient }: LabResultTableProps) {
  const data = item.resultData ?? {};
  const flags = item.resultFlags ?? {};
  if (Object.keys(data).length === 0) {
    return <p className="text-xs text-ink-muted">No result recorded.</p>;
  }
  const groups = groupFields(effectiveSchema(item.test).fields);
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-line text-left text-ink-muted">
          <th className="py-1 font-medium">Test</th>
          <th className="py-1 font-medium">Result</th>
          <th className="py-1 font-medium">Unit</th>
          <th className="py-1 font-medium">Reference</th>
          <th className="py-1 font-medium">Flag</th>
        </tr>
      </thead>
      {groups.map(({ group, fields }) => (
        <tbody key={group ?? 'fields'}>
          {group && (
            <tr>
              <td colSpan={5} className="pt-2 font-semibold text-ink">
                {group}
              </td>
            </tr>
          )}
          {fields
            .filter((f) => data[f.key] !== undefined)
            .map((f) => (
              <tr key={f.key} className="border-b border-line/60">
                <td className="py-1 text-ink-muted">{f.label}</td>
                <td className="py-1 font-mono text-ink">{displayValue(data[f.key])}</td>
                <td className="py-1 text-ink-muted">{f.unit ?? ''}</td>
                <td className="py-1 text-ink-muted">
                  {describeRange(rangeFor(f, patient)) || f.normalValues?.join(' / ') || ''}
                </td>
                <td className="py-1">
                  <LabFlagPill flag={flags[f.key]} />
                </td>
              </tr>
            ))}
        </tbody>
      ))}
    </table>
  );
}
