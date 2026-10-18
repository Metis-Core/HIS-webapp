'use client';

import { Pill } from '@/components';
import type { AvailabilityStatusEnum } from '@/enum';
import { AVAILABILITY_ICON, AVAILABILITY_LABEL, AVAILABILITY_VARIANT } from './availability-status';

export default function AvailabilityPill({ status }: { status: AvailabilityStatusEnum }) {
  const Icon = AVAILABILITY_ICON[status];
  return (
    <Pill variant={AVAILABILITY_VARIANT[status]} icon={<Icon aria-hidden className="h-3 w-3" />}>
      {AVAILABILITY_LABEL[status]}
    </Pill>
  );
}
