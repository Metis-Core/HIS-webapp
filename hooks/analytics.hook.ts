'use client';

import useSWR from 'swr';
import { buildQuery } from '@/helpers/crud.service';
import type { IAnalyticsOverview, IAnalyticsRange } from '@/interfaces';

const REFRESH_MS = 60_000;

export function useAnalyticsOverview(range: IAnalyticsRange) {
  const { data, error, isLoading } = useSWR<IAnalyticsOverview>(`/analytics/overview${buildQuery(range)}`, {
    keepPreviousData: true,
    refreshInterval: REFRESH_MS,
  });
  return { overview: data, error, isLoading };
}
