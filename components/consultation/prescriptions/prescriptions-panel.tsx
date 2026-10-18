'use client';

import Link from 'next/link';
import { FaClipboardList, FaExclamationTriangle, FaPills, FaPlus } from 'react-icons/fa';
import { Button, Input } from '@/components';
import ConsultationPrescriptionsList from '@/components/consultation/consultation-prescriptions.list';
import { ButtonVariantEnum, InventoryItemTypeEnum } from '@/enum';
import { inventoryItemsService } from '@/helpers/inventory.service';
import { useListTotal } from '@/hooks';
import type { IConsultation } from '@/interfaces';
import AllergyConfirmModal from './allergy-confirm.modal';
import PrescriptionRow from './prescription-row';
import { usePrescriptionForm } from './use-prescription-form';

const medicationCountUrl = inventoryItemsService.buildListUrl({
  isActive: true,
  type: InventoryItemTypeEnum.MEDICATION,
  limit: 1,
});

export default function PrescriptionsPanel({
  consultation,
  readOnly,
}: {
  consultation: IConsultation;
  readOnly: boolean;
}) {
  const medicationCount = useListTotal(medicationCountUrl);
  const form = usePrescriptionForm(consultation.id);
  const allergies = consultation.patient?.allergies?.trim();

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-2">
          <FaClipboardList className="text-brand" />
          <h3 className="text-sm font-semibold text-ink">Prescribed medication</h3>
        </div>
        <ConsultationPrescriptionsList consultationId={consultation.id} />
      </section>

      {!readOnly && (
        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          <div className="flex items-center gap-2">
            <FaPills className="text-brand" />
            <h3 className="text-sm font-semibold text-ink">New prescription</h3>
            <span className="ml-auto text-xs text-ink-muted">Sent directly to the pharmacy queue on save.</span>
          </div>
          {allergies && (
            <p className="flex items-start gap-2 rounded-lg border border-critical/40 bg-critical-soft px-3 py-2 text-sm text-critical">
              <FaExclamationTriangle className="mt-0.5 shrink-0" />
              <span>Allergies: {allergies}</span>
            </p>
          )}
          <div className="rounded-md border border-line p-3">
            {medicationCount === 0 ? (
              <p className="text-xs text-ink-muted">
                No medications configured yet. Ask the pharmacy admin to add medication stock under{' '}
                <Link href="/inventory" className="text-brand hover:underline">
                  Inventory
                </Link>
                .
              </p>
            ) : form.rows.length === 0 ? (
              <p className="text-xs text-ink-muted">No items yet. Click &quot;Add item&quot; to prescribe.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.rows.map((row, idx) => (
                  <PrescriptionRow
                    key={idx}
                    row={row}
                    onChange={(patch) => form.setRow(idx, patch)}
                    onRemove={() => form.removeRow(idx)}
                  />
                ))}
              </div>
            )}
            {form.formError && (
              <p role="alert" className="mt-3 rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
                {form.formError}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-[240px] flex-1">
                <Input label="Notes" value={form.notes} onChange={(e) => form.setNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={form.addRow}>
                  <FaPlus className="text-xs" />
                  Add item
                </Button>
                <Button
                  type="button"
                  variant={ButtonVariantEnum.PRIMARY}
                  loading={form.busy}
                  onClick={form.submit}
                  disabled={form.rows.length === 0}
                >
                  Prescribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      <AllergyConfirmModal
        message={form.allergyWarning}
        busy={form.busy}
        onConfirm={form.confirmAllergy}
        onClose={form.dismissAllergy}
      />
    </div>
  );
}
