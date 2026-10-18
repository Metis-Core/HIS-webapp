'use client';

import useSWR, { useSWRConfig } from 'swr';
import { labOrdersService } from '@/helpers/lab.service';
import { labWorkService } from '@/helpers/lab-work.service';
import { pageInfo } from '@/helpers/pagination';
import type {
  IAmendLabResultDto,
  ILabAttachment,
  ILabBoardSummary,
  ILabDayRange,
  ILabItemFilters,
  ILabOrderItem,
  ILabReportFilters,
  ILabReportRow,
  ILabResultAmendment,
  IPageQuery,
  IPagination,
  IUpdateLabOrderItemDto,
} from '@/interfaces';

const isLabKey = (key: unknown) => typeof key === 'string' && key.startsWith('/lab');

/** Result entry, verification and amendment; every change refreshes the lab lists. */
export function useLabItemActions() {
  const { mutate } = useSWRConfig();
  const after = async <T>(work: Promise<T>) => {
    const result = await work;
    await mutate(isLabKey);
    return result;
  };
  return {
    update: (orderId: string, itemId: string, dto: IUpdateLabOrderItemDto) =>
      after(labOrdersService.updateItem(orderId, itemId, dto)),
    verify: (orderId: string, itemId: string) => after(labWorkService.verify(orderId, itemId)),
    amend: (orderId: string, itemId: string, dto: IAmendLabResultDto) =>
      after(labWorkService.amend(orderId, itemId, dto)),
  };
}

/** C1: one row per test on the bench, newest first. */
export function useLabBoard(filters: ILabItemFilters) {
  const { data, isLoading, error } = useSWR<IPagination<ILabOrderItem>>(labWorkService.boardUrl(filters), {
    keepPreviousData: true,
    refreshInterval: 30_000,
  });
  return { items: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}

/** Lab staff only (the API refuses other roles), so callers pass `enabled`. */
export function useLabBoardSummary(range: ILabDayRange, enabled = true) {
  const key = enabled ? labWorkService.boardSummaryUrl(range) : null;
  const { data } = useSWR<ILabBoardSummary>(key, { refreshInterval: 30_000 });
  return data;
}

export function useLabReport(filters: ILabReportFilters) {
  const { data, isLoading, error } = useSWR<IPagination<ILabReportRow>>(labWorkService.reportUrl(filters), {
    keepPreviousData: true,
  });
  return { rows: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}

export function useLabAttachments(orderId: string | undefined, itemId: string | undefined) {
  const key = orderId && itemId ? labWorkService.attachmentsUrl(orderId, itemId) : null;
  const { data, mutate, isLoading } = useSWR<ILabAttachment[]>(key);
  return { attachments: data ?? [], mutate, isLoading };
}

export function useLabAmendments(orderId: string | undefined, itemId: string | undefined, query: IPageQuery = {}) {
  const key = orderId && itemId ? labWorkService.amendmentsUrl(orderId, itemId, query) : null;
  const { data, isLoading } = useSWR<IPagination<ILabResultAmendment>>(key, { keepPreviousData: true });
  return { amendments: data?.items ?? [], pagination: pageInfo(data, query.limit), isLoading };
}
