'use client';

import { format } from 'date-fns';
import { DocumentButton, PageHeader, Pill } from '@/components';
import { ConsultationStatusEnum, DocumentEndpointEnum, PillVariantEnum } from '@/enum';
import type { IConsultation } from '@/interfaces';

const statusVariant: Record<ConsultationStatusEnum, PillVariantEnum> = {
  [ConsultationStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [ConsultationStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [ConsultationStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

const documentClass =
  'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface';

export const patientNameOf = (c: IConsultation) =>
  c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : 'Consultation';

export default function ConsultationHeader({ consultation }: { consultation: IConsultation }) {
  return (
    <PageHeader
      title={patientNameOf(consultation)}
      description={`${consultation.chiefComplaint} · ${consultation.type.replaceAll('_', ' ')} · ${format(new Date(consultation.createdAt), 'dd MMM yyyy')}`}
      action={
        <div className="flex items-center gap-2">
          <Pill variant={statusVariant[consultation.status] ?? PillVariantEnum.DEFAULT}>
            {consultation.status.replaceAll('_', ' ')}
          </Pill>
          <DocumentButton endpoint={DocumentEndpointEnum.DISCHARGE} id={consultation.id} className={documentClass}>
            Discharge summary
          </DocumentButton>
          {consultation.visitId && (
            <DocumentButton endpoint={DocumentEndpointEnum.RECEIPT} id={consultation.visitId} className={documentClass}>
              Visit receipt
            </DocumentButton>
          )}
        </div>
      }
    />
  );
}
