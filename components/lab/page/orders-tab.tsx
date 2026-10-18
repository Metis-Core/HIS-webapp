'use client';

import { useState } from 'react';
import { Pagination } from '@/components';
import { LabOrderStatusEnum as O } from '@/enum';
import { usePagedSearch, useLabOrders } from '@/hooks';
import type { ILabDayRange, ILabOrder } from '@/interfaces';
import { OPEN_ORDER_STATUSES } from '../lab-status';
import { DateRangeFilter, SearchBox, StatusChips } from './lab-filters';
import OrdersTable from './orders-table';

const STATUS_OPTIONS: Array<{ value: O[]; label: string }> = [
  { value: [...OPEN_ORDER_STATUSES], label: 'Open' },
  { value: [O.COMPLETED], label: 'Completed' },
  { value: [O.CANCELLED], label: 'Cancelled' },
  { value: [], label: 'All' },
];

/** L2/L10: opens on work still in the lab; search by name, MRN or phone within a date range. */
export default function OrdersTab({ onOpen }: { onOpen: (o: ILabOrder) => void }) {
  const list = usePagedSearch('ordersPage');
  const [status, setStatus] = useState<O[]>([...OPEN_ORDER_STATUSES]);
  const [range, setRange] = useState<ILabDayRange>({});
  const { orders, pagination, isLoading } = useLabOrders({
    page: list.page,
    search: list.debouncedSearch,
    status: status.length ? status : undefined,
    ...range,
  });

  const refilter =
    <T,>(apply: (v: T) => void) =>
    (v: T) => {
      apply(v);
      list.setPage(1);
    };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <SearchBox value={list.search} placeholder="Search name, MRN or phone" onChange={list.setSearch} />
        <DateRangeFilter value={range} onChange={refilter(setRange)} />
        <StatusChips options={STATUS_OPTIONS} value={status} onChange={refilter(setStatus)} />
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <OrdersTable
          orders={orders}
          filtered={Boolean(list.debouncedSearch || range.from || range.to || status.length)}
          onOpen={onOpen}
        />
        <Pagination {...pagination} loading={isLoading} onPageChange={list.setPage} label="Lab order pages" />
      </div>
    </div>
  );
}
