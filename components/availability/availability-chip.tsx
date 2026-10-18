'use client';

import { useState } from 'react';
import { AvailabilityStatusEnum } from '@/enum';
import { useAvailability } from '@/hooks';
import AvailabilityDrawer from './availability.drawer';
import { AVAILABILITY_ICON, AVAILABILITY_LABEL } from './availability-status';

/** Header control: shows the signed-in user's status and opens the availability drawer. */
export default function AvailabilityChip() {
  const [open, setOpen] = useState(false);
  const { overview } = useAvailability();
  const status = overview?.current.status ?? AvailabilityStatusEnum.AVAILABLE;
  const Icon = AVAILABILITY_ICON[status];
  const away = status !== AvailabilityStatusEnum.AVAILABLE;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Availability: ${AVAILABILITY_LABEL[status]}. Change`}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
          away ? 'bg-watch-soft text-watch ring-watch/20' : 'bg-normal-soft text-normal ring-normal/20'
        }`}
      >
        <Icon aria-hidden className="h-3 w-3" />
        {AVAILABILITY_LABEL[status]}
      </button>
      <AvailabilityDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
