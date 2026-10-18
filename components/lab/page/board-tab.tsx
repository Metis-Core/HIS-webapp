'use client';

import { useState } from 'react';
import { Pagination } from '@/components';
import { LabOrderItemStatusEnum as S } from '@/enum';
import { useLabBoard, useLabBoardSummary, usePagedSearch } from '@/hooks';
import type { ILabDayRange } from '@/interfaces';
import { statusLabel } from '../lab-status';
import BoardTable from './board-table';
import { DateRangeFilter, SearchBox, StatusChips } from './lab-filters';

const BENCH: S[] = [S.PENDING, S.COLLECTED, S.IN_PROCESS, S.RESULT_READY];

/** C1: the bench at a glance; opens on unfinished work and refreshes every 30 s. */
export default function BoardTab({ onOpen }: { onOpen: (orderId: string) => void }) {
  const list = usePagedSearch('boardPage');
  const [status, setStatus] = useState<S[]>(BENCH);
  const [range, setRange] = useState<ILabDayRange>({});
  const summary = useLabBoardSummary(range);
  const { items, pagination, isLoading } = useLabBoard({
    page: list.page,
    search: list.debouncedSearch,
    status: status.length ? status : undefined,
    ...range,
  });

  const options = [
    { value: BENCH, label: `On the bench (${BENCH.reduce((n, s) => n + (summary?.[s] ?? 0), 0)})` },
    ...[S.PENDING, S.COLLECTED, S.IN_PROCESS, S.RESULT_READY, S.VERIFIED, S.CANCELLED].map((s) => ({
      value: [s],
      label: `${statusLabel(s)} (${summary?.[s] ?? 0})`,
    })),
    { value: [] as S[], label: 'All' },
  ];
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
      </div>
      <StatusChips options={options} value={status} onChange={refilter(setStatus)} />
      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised">
        <BoardTable items={items} onOpen={onOpen} />
        <Pagination {...pagination} loading={isLoading} onPageChange={list.setPage} label="Lab board pages" />
      </div>
    </div>
  );
}
