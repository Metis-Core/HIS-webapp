import { format } from 'date-fns';
import { FaFlask } from 'react-icons/fa';
import { EmptyState, Pill } from '@/components';
import { PillVariantEnum } from '@/enum';
import type { ILabOrder } from '@/interfaces';
import { orderStatusVariant, statusLabel } from '../lab-status';
import { LINK, TD, TH } from './lab-filters';

interface OrdersTableProps {
  orders: ILabOrder[];
  filtered: boolean;
  onOpen: (o: ILabOrder) => void;
}

export default function OrdersTable({ orders, filtered, onOpen }: OrdersTableProps) {
  if (orders.length === 0) {
    return <EmptyState message={filtered ? 'No lab orders match these filters' : 'No lab orders yet'} icon={FaFlask} />;
  }
  return (
    <table className="w-full text-left">
      <thead className="border-b border-line bg-surface text-ink-muted">
        <tr>
          <th className={TH}>Patient</th>
          <th className={TH}>Tests</th>
          <th className={TH}>Priority</th>
          <th className={TH}>Status</th>
          <th className={TH}>Ordered</th>
          <th className={`${TH} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b border-line last:border-0">
            <td className={TD}>
              <div className="text-sm font-medium text-ink">
                {o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—'}
              </div>
              <div className="text-xs text-ink-muted">
                {o.patient?.mrn}
                {o.referringClinician ? ` · Ref: ${o.referringClinician}` : ''}
              </div>
            </td>
            <td className={`${TD} text-sm text-ink`}>{o.items.map((i) => i.test?.code ?? '—').join(', ')}</td>
            <td className={TD}>
              <Pill variant={PillVariantEnum.DEFAULT}>{o.priority}</Pill>
            </td>
            <td className={TD}>
              <Pill variant={orderStatusVariant[o.status]}>{statusLabel(o.status)}</Pill>
            </td>
            <td className={`${TD} text-xs tabular-nums text-ink-muted`}>
              {format(new Date(o.createdAt), 'dd MMM yyyy HH:mm')}
            </td>
            <td className={`${TD} text-right`}>
              <button type="button" onClick={() => onOpen(o)} className={LINK}>
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
