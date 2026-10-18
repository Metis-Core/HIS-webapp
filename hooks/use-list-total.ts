'use client';

import useSWR from 'swr';
import { pageInfo } from '@/helpers/pagination';
import type { IPagination } from '@/interfaces';

/** Total rows behind a list URL (ask for limit=1); lets stat cards count server-side instead of the loaded page. */
export function useListTotal(url: string | null): number {
  const { data } = useSWR<IPagination<unknown>>(url);
  return pageInfo(data).total;
}
