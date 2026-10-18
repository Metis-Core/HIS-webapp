import { format } from 'date-fns';
import { FaFlask } from 'react-icons/fa';
import { EmptyState, Pill } from '@/components';
import type { ILabOrderItem, IUser } from '@/interfaces';
import LabFlagPill from '../lab-flag.pill';
import { itemStatusVariant, statusLabel } from '../lab-status';
import { LINK, TD, TH } from './lab-filters';

const when = (at?: Date | null, by?: IUser | null) =>
  at ? (
    <>
      <div className="tabular-nums">{format(new Date(at), 'dd MMM HH:mm')}</div>
      {by && <div className="text-ink-muted">{`${by.firstName ?? ''} ${by.lastName ?? ''}`.trim()}</div>}
    </>
  ) : (
    <span className="text-ink-muted">—</span>
  );

const worstFlag = (item: ILabOrderItem) => Object.values(item.resultFlags ?? {})[0];

interface BoardTableProps {
  items: ILabOrderItem[];
  onOpen: (orderId: string) => void;
}

/** C1: every test on the bench with who collected, resulted and verified it, and when. */
export default function BoardTable({ items, onOpen }: BoardTableProps) {
  if (items.length === 0) return <EmptyState message="No tests match these filters" icon={FaFlask} />;
  return (
    <table className="w-full text-left text-xs">
      <thead className="border-b border-line bg-surface text-ink-muted">
        <tr>
          <th className={TH}>Patient</th>
          <th className={TH}>Test</th>
          <th className={TH}>Status</th>
          <th className={TH}>Collected</th>
          <th className={TH}>Resulted</th>
          <th className={TH}>Verified</th>
          <th className={`${TH} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const patient = item.order?.patient;
          return (
            <tr key={item.id} className="border-b border-line last:border-0">
              <td className={TD}>
                <div className="text-sm font-medium text-ink">
                  {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                </div>
                <div className="text-ink-muted">
                  {patient?.mrn} · {item.order?.priority}
                </div>
              </td>
              <td className={TD}>
                <span className="font-mono">{item.test?.code}</span> {item.test?.name}
              </td>
              <td className={TD}>
                <div className="flex items-center gap-1">
                  <Pill variant={itemStatusVariant[item.status]}>{statusLabel(item.status)}</Pill>
                  <LabFlagPill flag={worstFlag(item)} />
                </div>
              </td>
              <td className={TD}>{when(item.collectedAt, item.collectedBy)}</td>
              <td className={TD}>{when(item.resultedAt, item.resultedBy)}</td>
              <td className={TD}>{when(item.verifiedAt, item.verifiedBy)}</td>
              <td className={`${TD} text-right`}>
                <button type="button" className={LINK} onClick={() => onOpen(item.orderId)}>
                  Open
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
