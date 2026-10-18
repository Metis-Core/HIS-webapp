'use client';

import { FaPrint } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button } from '@/components';
import LabResultTable from '@/components/lab/lab-result-table';
import { ButtonVariantEnum, DocumentEndpointEnum, OrderKindEnum, OrderStatusEnum } from '@/enum';
import { openDocument } from '@/helpers/documents.service';
import { extractErrorMessage } from '@/helpers/errors';
import type { IProcedureOrder } from '@/interfaces';
import ClassificationPill from './classification-pill';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink-muted';

/** The recorded result of a completed order: classification, flagged findings, impression and notes. */
export default function OrderResultView({ order }: { order: IProcedureOrder }) {
  if (order.status !== OrderStatusEnum.COMPLETED) return null;
  const imaging = order.kind === OrderKindEnum.RADIOLOGY;
  const hasFindings = order.resultData && Object.keys(order.resultData).length > 0;

  const print = async () => {
    try {
      await openDocument(DocumentEndpointEnum.PROCEDURE_REPORT, order.id);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't open the report — retry"));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{imaging ? 'Report' : 'Procedure record'}</h3>
          <ClassificationPill classification={order.classification} />
        </div>
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={() => void print()}>
          <FaPrint className="text-xs" aria-hidden /> Print
        </Button>
      </div>
      {hasFindings && <LabResultTable item={order} patient={order.patient} />}
      {order.impression && (
        <div>
          <p className={LABEL}>Impression</p>
          <p className="whitespace-pre-wrap text-sm font-medium text-ink">{order.impression}</p>
        </div>
      )}
      {order.report && (
        <div>
          <p className={LABEL}>{imaging ? 'Notes' : 'Operation notes'}</p>
          <p className="whitespace-pre-wrap text-sm text-ink">{order.report}</p>
        </div>
      )}
    </section>
  );
}
