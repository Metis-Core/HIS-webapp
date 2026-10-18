'use client';

import { format } from 'date-fns';
import { DocumentButton, Drawer, Pill } from '@/components';
import { DocumentEndpointEnum, PillVariantEnum } from '@/enum';
import type { ILabOrder } from '@/interfaces';
import { hasResult } from './lab-items';
import LabResultView from './lab-result-view';

interface LabResultsDrawerProps {
  order: ILabOrder | null;
  onClose: () => void;
}

/** Reads an order's results on screen; printing is the secondary action (D8). */
export default function LabResultsDrawer({ order, onClose }: LabResultsDrawerProps) {
  const items = order?.items.filter(hasResult) ?? [];
  return (
    <Drawer open={Boolean(order)} onClose={onClose} title="Lab results" width="w-[600px]">
      {order && (
        <div className="flex flex-col gap-4">
          <p className="text-xs capitalize text-ink-muted">
            Ordered {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')} · priority {order.priority}
          </p>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-md border border-line px-3 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
                  </span>
                  {item.isAbnormal && <Pill variant={PillVariantEnum.DANGER}>Abnormal</Pill>}
                </div>
                <LabResultView item={item} patient={order.patient} />
                {item.resultNotes && (
                  <p className="rounded-md bg-surface px-2 py-1 text-xs text-ink-muted">Notes: {item.resultNotes}</p>
                )}
                {item.verifiedAt && (
                  <span className="text-[11px] tabular-nums text-ink-muted">
                    Verified {format(new Date(item.verifiedAt), 'dd MMM yyyy HH:mm')}
                    {item.verifiedBy ? ` by ${item.verifiedBy.firstName} ${item.verifiedBy.lastName}` : ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <DocumentButton endpoint={DocumentEndpointEnum.LAB_ORDER} id={order.id}>
              Print order report
            </DocumentButton>
            {order.visitId && (
              <DocumentButton endpoint={DocumentEndpointEnum.LAB_REPORT_VISIT} id={order.visitId}>
                Print visit report
              </DocumentButton>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
