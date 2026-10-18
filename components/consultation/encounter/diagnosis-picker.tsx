'use client';

import { FaStar, FaTimes } from 'react-icons/fa';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { buildDiagnosisSearchUrl } from '@/helpers/diagnoses.service';
import type { IDiagnosisCode, IOption } from '@/interfaces';
import type { DiagnosisDraft } from './encounter-values';

interface DiagnosisPickerProps {
  value: DiagnosisDraft[];
  onChange: (value: DiagnosisDraft[]) => void;
  readOnly?: boolean;
}

const MAX_DIAGNOSES = 20;
const toOption = (c: IDiagnosisCode): IOption => ({ label: `${c.code} — ${c.title}`, value: c.id });

/** Coded diagnoses: search the ICD catalogue on the server and keep the picks as chips (D7). */
export default function DiagnosisPicker({ value, onChange, readOnly }: DiagnosisPickerProps) {
  const add = (code: IDiagnosisCode | null) => {
    if (!code || value.some((d) => d.codeId === code.id)) return;
    const draft = { codeId: code.id, code: code.code, title: code.title, isPrimary: value.length === 0 };
    onChange([...value, draft]);
  };
  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    if (next.length && !next.some((d) => d.isPrimary)) next[0] = { ...next[0], isPrimary: true };
    onChange(next);
  };
  const makePrimary = (index: number) => onChange(value.map((d, i) => ({ ...d, isPrimary: i === index })));

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && value.length < MAX_DIAGNOSES && (
        <RemoteSearchSelect<IDiagnosisCode>
          label="Diagnoses (ICD-10)"
          placeholder="Search code or condition, e.g. B54 or malaria"
          value={null}
          onChange={add}
          buildUrl={buildDiagnosisSearchUrl}
          toOption={toOption}
          minSearchLength={2}
          noun="codes"
        />
      )}
      {value.length === 0 ? (
        <p className="text-xs text-ink-muted">No coded diagnosis yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" aria-label="Coded diagnoses">
          {value.map((d, i) => (
            <li
              key={`${d.code}-${i}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ${
                d.isPrimary ? 'bg-brand text-white ring-brand' : 'bg-surface text-ink ring-line'
              }`}
            >
              <button
                type="button"
                disabled={readOnly || d.isPrimary}
                onClick={() => makePrimary(i)}
                aria-label={d.isPrimary ? 'Primary diagnosis' : `Make ${d.code} the primary diagnosis`}
                title={d.isPrimary ? 'Primary diagnosis' : 'Make primary'}
              >
                <FaStar className={d.isPrimary ? 'text-[10px]' : 'text-[10px] opacity-30'} />
              </button>
              <span className="font-mono">{d.code}</span>
              <span>{d.title ?? 'not in catalogue'}</span>
              {!readOnly && (
                <button type="button" onClick={() => remove(i)} aria-label={`Remove ${d.code}`}>
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {value.some((d) => !d.codeId) && (
        <p className="text-[11px] text-watch">
          Codes marked “not in catalogue” came from the old free-text field. Changing the list drops them — pick a
          catalogue code instead.
        </p>
      )}
    </div>
  );
}
