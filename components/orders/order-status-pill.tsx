'use client';

import { Pill } from '@/components';
import type { OrderStatusEnum } from '@/enum';
import { STATUS_ICON, STATUS_LABEL, STATUS_VARIANT } from './order-format';

export default function OrderStatusPill({ status }: { status: OrderStatusEnum }) {
  const Icon = STATUS_ICON[status];
  return (
    <Pill variant={STATUS_VARIANT[status]} icon={<Icon aria-hidden className="h-3 w-3" />}>
      {STATUS_LABEL[status]}
    </Pill>
  );
}
