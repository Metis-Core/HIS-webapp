'use client';

import { format } from 'date-fns';
import { FaEye, FaFlask } from 'react-icons/fa';
import { Button, DocumentButton, Pill } from '@/components';
import { ButtonVariantEnum, DocumentEndpointEnum, PillVariantEnum } from '@/enum';
import type { ILabOrder } from '@/interfaces';
import type { OrderItem } from './lab-items';

interface LabResultsListProps {
  ready: OrderItem[];
  onView: (order: ILabOrder) => void;
}

const printClass = 'text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline';

export default function LabResultsList({ ready, onView }: LabResultsListProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaFlask className="text-status-normal" />
        <h3 className="text-sm font-semibold text-ink">Results</h3>
        {ready.length > 0 && <Pill variant={PillVariantEnum.SUCCESS}>{ready.length} ready</Pill>}
      </div>
      {ready.length === 0 ? (
        <p className="text-xs text-ink-muted">
          No results yet. Results will appear here as the lab completes each test — you&apos;ll also get a notification.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {ready.map(({ order, item }) => (
            <li key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-ink">
                  {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
                </div>
                <div className="text-xs capitalize text-ink-muted">
                  {item.verifiedAt && (
                    <span className="tabular-nums">{format(new Date(item.verifiedAt), 'dd MMM yyyy HH:mm')} · </span>
                  )}
                  Priority {order.priority}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.isAbnormal && <Pill variant={PillVariantEnum.DANGER}>Abnormal</Pill>}
                <DocumentButton endpoint={DocumentEndpointEnum.LAB_ORDER} id={order.id} className={printClass}>
                  Print
                </DocumentButton>
                <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => onView(order)}>
                  <FaEye className="text-xs" />
                  View results
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
