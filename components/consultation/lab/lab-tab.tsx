'use client';

import { useMemo, useState } from 'react';
import type { ILabOrder } from '@/interfaces';
import { pendingCount, readyItems } from './lab-items';
import LabOrderForm from './lab-order-form';
import LabOrdersList from './lab-orders-list';
import LabResultsDrawer from './lab-results.drawer';
import LabResultsList from './lab-results-list';

interface LabTabProps {
  consultationId: string;
  orders: ILabOrder[];
  onChanged: () => Promise<unknown>;
  readOnly: boolean;
}

export default function LabTab({ consultationId, orders, onChanged, readOnly }: LabTabProps) {
  const ready = useMemo(() => readyItems(orders), [orders]);
  const [viewing, setViewing] = useState<ILabOrder | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <LabResultsList ready={ready} onView={setViewing} />
      <LabOrdersList orders={orders} pending={pendingCount(orders)} />
      {!readOnly && <LabOrderForm consultationId={consultationId} onOrdered={onChanged} />}
      <LabResultsDrawer order={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
