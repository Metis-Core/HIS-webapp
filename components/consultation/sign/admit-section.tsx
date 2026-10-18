'use client';

import { FaProcedures } from 'react-icons/fa';
import { Input } from '@/components';
import type { IAdmitPatientDto } from '@/interfaces';

interface AdmitSectionProps {
  admission: IAdmitPatientDto | null;
  onChange: (admission: IAdmitPatientDto | null) => void;
}

export const isAdmissionComplete = (a: IAdmitPatientDto | null) => !a || Boolean(a.ward.trim() && a.reason.trim());

/** Minimal admission (D6): ward and reason only; beds come later. */
export default function AdmitSection({ admission, onChange }: AdmitSectionProps) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={Boolean(admission)}
          onChange={(e) => onChange(e.target.checked ? { ward: '', reason: '' } : null)}
        />
        <FaProcedures className="text-brand" />
        Admit patient to a ward
      </label>
      {admission && (
        <>
          <p className="text-xs text-ink-muted">
            The patient becomes an inpatient and goes to the ward queue first. Bed allocation is not available yet.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ward"
              required
              maxLength={100}
              value={admission.ward}
              onChange={(e) => onChange({ ...admission, ward: e.target.value })}
              placeholder="e.g. Female medical"
            />
            <Input
              label="Reason for admission"
              required
              maxLength={1000}
              value={admission.reason}
              onChange={(e) => onChange({ ...admission, reason: e.target.value })}
            />
          </div>
        </>
      )}
    </section>
  );
}
