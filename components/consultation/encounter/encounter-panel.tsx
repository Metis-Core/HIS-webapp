'use client';

import { Button, Input } from '@/components';
import { ButtonVariantEnum, ConsultationStatusEnum } from '@/enum';
import type { IConsultation } from '@/interfaces';
import AddendaSection from './addenda-section';
import EncounterFields, { EncounterHeaderFields } from './encounter-fields';
import EncounterSaveStatus from './encounter-save-status';
import type { Encounter } from './use-encounter';

interface EncounterPanelProps {
  encounter: Encounter;
  consultation: IConsultation;
  canAddAddendum: boolean;
  onSave: () => void;
}

function SignedNote({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <p className="rounded-md bg-surface px-3 py-2 text-xs text-ink">
      <span className="font-medium text-ink-muted">{label}: </span>
      {text}
    </p>
  );
}

export default function EncounterPanel({ encounter, consultation, canAddAddendum, onSave }: EncounterPanelProps) {
  const { form, values, isOpen } = encounter;
  const readOnly = !isOpen;
  return (
    <>
      <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Encounter</h2>
          {isOpen && (
            <div className="flex items-center gap-3">
              <EncounterSaveStatus {...form} />
              <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={onSave} loading={form.isSaving}>
                Save
              </Button>
            </div>
          )}
        </div>
        <SignedNote label="Hand-off note" text={consultation.completionNotes} />
        <SignedNote label="Cancelled" text={consultation.cancellationReason} />
        <Input
          label="Chief complaint"
          required
          disabled={readOnly}
          value={values.chiefComplaint}
          onChange={(e) => form.setField('chiefComplaint', e.target.value)}
        />
        <EncounterHeaderFields values={values} set={form.setField} readOnly={readOnly} />
        <EncounterFields values={values} set={form.setField} readOnly={readOnly} />
      </section>
      {consultation.status === ConsultationStatusEnum.COMPLETED && (
        <AddendaSection consultationId={consultation.id} canAdd={canAddAddendum} />
      )}
    </>
  );
}
