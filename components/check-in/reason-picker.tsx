'use client';

import { CheckInReasonEnum, REASON_LABEL, toggleReason } from './check-in-plan';

const ORDER = Object.values(CheckInReasonEnum);

const chip = (active: boolean) =>
  `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
    active ? 'bg-brand text-white ring-brand' : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
  }`;

interface ReasonPickerProps {
  reasons: CheckInReasonEnum[];
  onChange: (reasons: CheckInReasonEnum[]) => void;
}

/** What the patient came for; several can apply. */
export default function ReasonPicker({ reasons, onChange }: ReasonPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-muted">What did the patient come for?</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Reasons for the visit">
        {ORDER.map((reason) => (
          <button
            key={reason}
            type="button"
            aria-pressed={reasons.includes(reason)}
            onClick={() => onChange(toggleReason(reasons, reason))}
            className={chip(reasons.includes(reason))}
          >
            {REASON_LABEL[reason]}
          </button>
        ))}
      </div>
    </div>
  );
}
