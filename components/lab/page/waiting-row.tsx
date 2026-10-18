'use client';

import { Pill } from '@/components';
import PriorityBadge from '@/components/queue/priority-badge';
import { LabOrderStatusEnum, PillVariantEnum, QueueEntryStatusEnum as Q } from '@/enum';
import { useLabOrders } from '@/hooks';
import type { ILabOrder, IQueueEntryRecord } from '@/interfaces';
import { LINK, TD } from './lab-filters';

export interface WaitingActions {
  onCall: (e: IQueueEntryRecord) => void;
  onStart: (e: IQueueEntryRecord) => void;
  onOpen: (o: ILabOrder) => void;
  onOrder: (e: IQueueEntryRecord) => void;
  onComplete: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}

// One visit's orders per row (a visit has a handful), instead of loading every order to match them up.
export default function WaitingRow({ entry: e, actions }: { entry: IQueueEntryRecord; actions: WaitingActions }) {
  const patient = e.visit?.patient;
  const { orders } = useLabOrders({ visitId: e.visitId, limit: 20 });
  const active = orders.find((o) => o.status !== LabOrderStatusEnum.CANCELLED);
  return (
    <tr className="border-b border-line last:border-0">
      <td className={TD}>
        <div className="text-sm font-medium text-ink">{patient ? `${patient.firstName} ${patient.lastName}` : '—'}</div>
        <div className="text-xs text-ink-muted">{patient?.mrn}</div>
        <PriorityBadge visit={e.visit} />
      </td>
      <td className={`${TD} text-sm text-ink`}>
        {orders.length === 0 ? '—' : orders.flatMap((o) => o.items.map((i) => i.test?.code ?? '—')).join(', ')}
      </td>
      <td className={`${TD} text-sm tabular-nums text-ink`}>#{e.sequenceNumber}</td>
      <td className={TD}>
        <Pill variant={e.status === Q.WAITING ? PillVariantEnum.WARNING : PillVariantEnum.INFO}>
          {e.status.replaceAll('_', ' ')}
        </Pill>
      </td>
      <td className={`${TD} text-right`}>
        <div className="flex justify-end gap-3">
          {e.status === Q.WAITING && (
            <button type="button" onClick={() => actions.onCall(e)} className={LINK}>
              Call
            </button>
          )}
          {e.status !== Q.IN_SERVICE && (
            <button type="button" onClick={() => actions.onStart(e)} className={LINK}>
              Start
            </button>
          )}
          {active ? (
            <button type="button" onClick={() => actions.onOpen(active)} className={LINK}>
              Enter results
            </button>
          ) : (
            <button type="button" onClick={() => actions.onOrder(e)} className={LINK}>
              Order tests
            </button>
          )}
          <button type="button" onClick={() => actions.onComplete(e)} className="text-xs font-medium text-normal">
            Complete
          </button>
          <button type="button" onClick={() => actions.onSkip(e)} className="text-xs font-medium text-ink-muted">
            Skip
          </button>
        </div>
      </td>
    </tr>
  );
}
