'use client';

import { useState } from 'react';
import { useDebouncedValue } from './use-debounced-value';
import { useUrlPage } from './use-url-page';

const SEARCH_DEBOUNCE_MS = 300;

/** Search box + URL page for a server-paged list; typing a new search goes back to page 1. */
export function usePagedSearch(pageParam = 'page') {
  const [page, setPage] = useUrlPage(pageParam);
  const [search, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const setSearch = (value: string) => {
    setSearchText(value);
    if (page !== 1) setPage(1);
  };

  return { page, setPage, search, setSearch, debouncedSearch: debouncedSearch || undefined };
}
