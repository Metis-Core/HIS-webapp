import type { IPagination } from '@/interfaces';

/** Default rows per page; matches the API default. */
export const PAGE_SIZE = 20;
/** Search-as-you-type pickers show this many matches and ask the user to narrow further. */
export const PICKER_PAGE_SIZE = 20;
export const PICKER_DEBOUNCE_MS = 300;

/** Largest page the API serves; for lookups sized to what is already on screen. */
export const MAX_PAGE_SIZE = 100;

export interface IPageInfo {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

/** Reads paging info from any list response, tolerating the legacy top-level fields. */
export function pageInfo<T>(data: IPagination<T> | undefined, limit = PAGE_SIZE): IPageInfo {
  const total = data?.meta?.total ?? data?.total ?? 0;
  const page = data?.meta?.page ?? data?.page ?? 1;
  const size = data?.meta?.limit ?? data?.limit ?? limit;
  return { total, page, limit: size, hasNextPage: data?.meta?.hasNextPage ?? page * size < total };
}
