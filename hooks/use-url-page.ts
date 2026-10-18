'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Page number kept in the URL (?page=3) so refresh, back/forward and shared links keep the place.
 * Pass a distinct `param` when one screen has several paged lists.
 */
export function useUrlPage(param = 'page'): [number, (page: number) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Math.max(1, Number.parseInt(searchParams.get(param) ?? '', 10) || 1);

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next <= 1) params.delete(param);
      else params.set(param, String(next));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [param, pathname, router, searchParams],
  );

  return [page, setPage];
}
