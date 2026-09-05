'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Input } from '@/components';
import { ButtonVariantEnum, VisitIntentEnum } from '@/enum';

interface CompleteStageDrawerProps {
  open: boolean;
  title: string;
  patientName?: string;
  onClose: () => void;
  onConfirm: (payload: { nextIntents: VisitIntentEnum[]; notes?: string }) => Promise<void> | void;
  submitting?: boolean;
}

const INTENT_LABEL: Record<VisitIntentEnum, string> = {
  [VisitIntentEnum.CONSULTATION]: 'Consultation',
  [VisitIntentEnum.EXAMINATION]: 'Triage / Re-assess',
  [VisitIntentEnum.LAB]: 'Laboratory',
  [VisitIntentEnum.RADIOLOGY]: 'Radiology',
  [VisitIntentEnum.PHARMACY]: 'Pharmacy',
  [VisitIntentEnum.SURGERY]: 'Surgery',
  [VisitIntentEnum.POSTOPERATIVE]: 'Post-op',
  [VisitIntentEnum.FOLLOWUP]: 'Follow-up',
};

const OPTIONS: VisitIntentEnum[] = [
  VisitIntentEnum.LAB,
  VisitIntentEnum.RADIOLOGY,
  VisitIntentEnum.PHARMACY,
  VisitIntentEnum.CONSULTATION,
  VisitIntentEnum.SURGERY,
  VisitIntentEnum.FOLLOWUP,
];

export default function CompleteStageDrawer({
  open,
  title,
  patientName,
  onClose,
  onConfirm,
  submitting,
}: CompleteStageDrawerProps) {
  const [intents, setIntents] = useState<VisitIntentEnum[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setIntents([]);
    setNotes('');
  }, [open]);

  const toggle = (intent: VisitIntentEnum) =>
    setIntents((s) => (s.includes(intent) ? s.filter((x) => x !== intent) : [...s, intent]));

  const confirm = async () => {
    try {
      await onConfirm({ nextIntents: intents, notes: notes.trim() || undefined });
    } catch (error) {
      toast.error("Couldn't complete — retry");
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={title} width="w-[560px]">
      <div className="flex flex-col gap-5">
        {patientName && (
          <p className="text-sm text-ink-muted">
            Patient: <span className="font-medium text-ink">{patientName}</span>
          </p>
        )}

        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Route patient to</p>
          <p className="text-xs text-ink-muted">
            Pick where the patient needs to go next. Multiple stages are queued in the order you select. Leave empty to
            end the visit here.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {OPTIONS.map((intent) => {
              const active = intents.includes(intent);
              const idx = intents.indexOf(intent);
              return (
                <button
                  key={intent}
                  type="button"
                  onClick={() => toggle(intent)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                    active
                      ? 'bg-brand text-white ring-brand'
                      : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
                  }`}
                >
                  {active && (
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

        <Input
          label="Handoff notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional context for the next handler"
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={confirm} loading={submitting}>
            {intents.length === 0 ? 'Complete visit' : `Complete & route (${intents.length})`}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
