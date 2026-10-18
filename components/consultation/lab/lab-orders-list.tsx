import { FaClipboardList } from 'react-icons/fa';
import { Pill } from '@/components';
import { PillVariantEnum } from '@/enum';
import type { ILabOrder } from '@/interfaces';
import { orderStatusVariant } from './lab-items';

export default function LabOrdersList({ orders, pending }: { orders: ILabOrder[]; pending: number }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaClipboardList className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Orders in progress</h3>
        {pending > 0 && <Pill variant={PillVariantEnum.INFO}>{pending} pending</Pill>}
      </div>
      {orders.length === 0 ? (
        <p className="text-xs text-ink-muted">No lab orders yet for this consultation.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-col gap-1 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink">
                  {o.items
                    .map((i) => i.test?.code)
                    .filter(Boolean)
                    .join(', ') || 'Tests'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs capitalize text-ink-muted">Priority {o.priority}</span>
                  <Pill variant={orderStatusVariant[o.status] ?? PillVariantEnum.DEFAULT}>
                    {o.status.replaceAll('_', ' ')}
                  </Pill>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                {o.items.map((i) => (
                  <span key={i.id}>
                    {i.test?.code}: <span className="capitalize">{i.status.replaceAll('_', ' ')}</span>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
