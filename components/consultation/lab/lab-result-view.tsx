import type { ILabOrderItem } from '@/interfaces';

type ResultValues = Record<string, string | number | boolean>;

const parseStructured = (raw: string): ResultValues | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as ResultValues) : null;
  } catch {
    return null;
  }
};

/** One test's result: the schema fields when the test has a result schema, otherwise the plain value. */
export default function LabResultView({ item }: { item: ILabOrderItem }) {
  const schema = item.test?.resultSchema ?? null;
  const raw = item.resultValue ?? '';
  if (!raw) return <div className="text-xs text-ink-muted">No result value recorded.</div>;

  const parsed = parseStructured(raw);
  if (parsed && schema && schema.fields.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {schema.fields.map((f) => {
          const v = parsed[f.key];
          if (v === undefined || v === null || v === '') return null;
          const display = f.type === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
          return (
            <div key={f.key} className="flex justify-between gap-2 border-b border-line/60 py-0.5">
              <span className="text-ink-muted">
                {f.label}
                {f.unit ? ` (${f.unit})` : ''}
              </span>
              <span className="font-mono text-ink">
                {display}
                {f.referenceRange && <span className="ml-2 text-ink-muted">ref {f.referenceRange}</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <span>
        Result:{' '}
        <span className="font-mono text-ink">
          {raw}
          {item.test?.unit ? ` ${item.test.unit}` : ''}
        </span>
      </span>
      {item.test?.referenceRange && <span className="text-ink-muted">Ref: {item.test.referenceRange}</span>}
    </div>
  );
}
