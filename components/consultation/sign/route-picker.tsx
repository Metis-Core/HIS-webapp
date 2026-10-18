'use client';

import { FaCheckCircle } from 'react-icons/fa';
import { VisitIntentEnum } from '@/enum';

const INTENT_LABEL: Partial<Record<VisitIntentEnum, string>> = {
  [VisitIntentEnum.LAB]: 'Laboratory',
  [VisitIntentEnum.RADIOLOGY]: 'Radiology',
  [VisitIntentEnum.PHARMACY]: 'Pharmacy',
  [VisitIntentEnum.DENTAL]: 'Dental',
  [VisitIntentEnum.ANTENATAL]: 'Antenatal (ANC)',
  [VisitIntentEnum.CONSULTATION]: 'Consultation',
  [VisitIntentEnum.SURGERY]: 'Surgery',
  [VisitIntentEnum.FOLLOWUP]: 'Follow-up',
};
const OPTIONS = Object.keys(INTENT_LABEL) as VisitIntentEnum[];

const chip = (active: boolean, on: string) =>
  `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
    active ? on : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
  }`;

interface RoutePickerProps {
  intents: VisitIntentEnum[];
  onChange: (intents: VisitIntentEnum[]) => void;
}

export default function RoutePicker({ intents, onChange }: RoutePickerProps) {
  const toggle = (intent: VisitIntentEnum) =>
    onChange(intents.includes(intent) ? intents.filter((x) => x !== intent) : [...intents, intent]);
  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Route patient (optional)</p>
      <p className="text-xs text-ink-muted">
        Pick where the patient goes next. Lab or radiology automatically brings the patient back to you for a review
        before pharmacy; with nothing picked the patient goes to billing. Labs and prescriptions are ordered from their
        tabs, not here.
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange([])}
          className={chip(intents.length === 0, 'bg-status-normal text-white ring-status-normal')}
        >
          <FaCheckCircle className="text-[11px]" />
          Send to billing
        </button>
        {OPTIONS.map((intent) => {
          const idx = intents.indexOf(intent);
          return (
            <button
              key={intent}
              type="button"
              onClick={() => toggle(intent)}
              className={chip(idx >= 0, 'bg-brand text-white ring-brand')}
            >
              {idx >= 0 && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  {idx + 1}
                </span>
              )}
              {INTENT_LABEL[intent]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
