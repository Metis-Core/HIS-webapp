'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FaCheckCircle, FaExclamationTriangle, FaSignature } from 'react-icons/fa';
import { Button, Drawer, Input } from '@/components';
import { ButtonVariantEnum, VisitIntentEnum } from '@/enum';
import { useAuth } from '@/providers';

export interface SignEncounterWarning {
  message: string;
  severity?: 'warning' | 'critical';
}

interface CompleteStageDrawerProps {
  open: boolean;
  title: string;
  patientName?: string;
  summary?: React.ReactNode;
  warnings?: SignEncounterWarning[];
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
  summary,
  warnings,
  onClose,
  onConfirm,
  submitting,
}: CompleteStageDrawerProps) {
  const { user } = useAuth();
  const [intents, setIntents] = useState<VisitIntentEnum[]>([]);
  const [notes, setNotes] = useState('');
  const [attested, setAttested] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIntents([]);
    setNotes('');
    setAttested(false);
  }, [open]);

  const criticalWarnings = useMemo(() => (warnings ?? []).filter((w) => w.severity === 'critical'), [warnings]);
  const softWarnings = useMemo(() => (warnings ?? []).filter((w) => w.severity !== 'critical'), [warnings]);

  const toggleIntent = (intent: VisitIntentEnum) =>
    setIntents((s) => (s.includes(intent) ? s.filter((x) => x !== intent) : [...s, intent]));

  const canSign = attested && criticalWarnings.length === 0;

  const confirm = async () => {
    if (!canSign) return;
    try {
      await onConfirm({ nextIntents: intents, notes: notes.trim() || undefined });
    } catch {
      toast.error("Couldn't sign — retry");
    }
  };

  const signerName = user ? `${user.firstName ?? ''} ${user.lastName ?? user.username ?? ''}`.trim() : 'Provider';

  return (
    <Drawer open={open} onClose={onClose} title={title} width="w-[600px]">
      <div className="flex flex-col gap-5">
        {patientName && (
          <p className="text-sm text-ink-muted">
            Patient: <span className="font-medium text-ink">{patientName}</span>
          </p>
        )}

        {summary && (
          <section className="rounded-md border border-line bg-surface p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Encounter summary</p>
            {summary}
          </section>
        )}

        {(criticalWarnings.length > 0 || softWarnings.length > 0) && (
          <section className="flex flex-col gap-2">
            {criticalWarnings.map((w, i) => (
              <div
                key={`c-${i}`}
                className="flex items-start gap-2 rounded-md border border-critical/40 bg-critical-soft p-3 text-sm text-critical"
              >
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            ))}
            {softWarnings.map((w, i) => (
              <div
                key={`s-${i}`}
                className="flex items-start gap-2 rounded-md border border-status-watch/40 bg-status-watch/10 p-3 text-sm text-status-watch"
              >
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            ))}
          </section>
        )}

        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Route patient (optional)</p>
          <p className="text-xs text-ink-muted">
            Pick where the patient needs to go next, or leave empty to end the visit here. Labs and prescriptions are
            ordered from their tabs, not here.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setIntents([])}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                intents.length === 0
                  ? 'bg-status-normal text-white ring-status-normal'
                  : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
              }`}
            >
              <FaCheckCircle className="text-[11px]" />
              End visit
            </button>
            {OPTIONS.map((intent) => {
              const active = intents.includes(intent);
              const idx = intents.indexOf(intent);
              return (
                <button
                  key={intent}
                  type="button"
                  onClick={() => toggleIntent(intent)}
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

        <section className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
          <div className="flex items-start gap-2">
            <FaSignature className="mt-1 text-brand" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Sign encounter</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                By signing, {signerName} attests that the documentation above is accurate and complete. The encounter is
                locked once signed.
              </p>
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-2 rounded-md bg-surface-raised p-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-0.5"
              disabled={criticalWarnings.length > 0}
            />
            <span>
              I, <span className="font-medium">{signerName}</span>, attest that the information in this encounter is
              true and accurate to the best of my knowledge.
            </span>
          </label>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariantEnum.PRIMARY}
            onClick={confirm}
            loading={submitting}
            disabled={!canSign}
          >
            <FaSignature className="text-xs" />
            {intents.length === 0 ? 'Sign & end visit' : `Sign & route (${intents.length})`}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
