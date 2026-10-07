'use client';

import { format } from 'date-fns';
import { Pill } from '@/components';
import { PillVariantEnum, PrescriptionItemStatusEnum, PrescriptionStatusEnum } from '@/enum';
import { usePrescriptionsByConsultation } from '@/hooks';

const prescriptionVariant: Record<PrescriptionStatusEnum, PillVariantEnum> = {
  [PrescriptionStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [PrescriptionStatusEnum.PARTIALLY_DISPENSED]: PillVariantEnum.INFO,
  [PrescriptionStatusEnum.DISPENSED]: PillVariantEnum.SUCCESS,
  [PrescriptionStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

const itemVariant: Record<PrescriptionItemStatusEnum, PillVariantEnum> = {
  [PrescriptionItemStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [PrescriptionItemStatusEnum.PARTIAL]: PillVariantEnum.INFO,
  [PrescriptionItemStatusEnum.DISPENSED]: PillVariantEnum.SUCCESS,
  [PrescriptionItemStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

export default function ConsultationPrescriptionsList({ consultationId }: { consultationId: string }) {
  const { prescriptions } = usePrescriptionsByConsultation(consultationId);

  if (prescriptions.length === 0) {
    return <p className="text-xs text-ink-muted">No prescriptions yet for this consultation.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {prescriptions.map((p) => (
        <li key={p.id} className="flex flex-col gap-2 rounded-md border border-line px-3 py-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted tabular-nums">
              {format(new Date(p.createdAt), 'dd MMM yyyy HH:mm')}
            </span>
            <Pill variant={prescriptionVariant[p.status] ?? PillVariantEnum.DEFAULT}>
              {p.status.replaceAll('_', ' ')}
            </Pill>
          </div>
          <ul className="flex flex-col divide-y divide-line">
            {p.items?.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{i.item?.name ?? i.itemId}</p>
                  <p className="text-xs text-ink-muted">
                    {i.dosage} · {i.frequency}
                    {i.duration ? ` · ${i.duration}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums text-ink-muted">
                    {i.dispensedQuantity}/{i.quantity} dispensed
                  </span>
                  <Pill variant={itemVariant[i.status] ?? PillVariantEnum.DEFAULT}>{i.status}</Pill>
                </div>
              </li>
            ))}
          </ul>
          {p.notes && <p className="rounded-md bg-surface px-2 py-1 text-xs text-ink-muted">Notes: {p.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
