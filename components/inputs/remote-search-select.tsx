'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import Dropdown from './dropdown';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { PICKER_DEBOUNCE_MS } from '@/helpers/pagination';
import type { IOption, IPagination } from '@/interfaces';

interface RemoteSearchSelectProps<T extends { id: string }> {
  label?: string;
  placeholder?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  /** Builds the paged list URL for a search term (keep its limit small, e.g. PICKER_PAGE_SIZE). */
  buildUrl: (search: string) => string;
  toOption: (value: T) => IOption;
  /** Characters needed before searching; 0 shows the first page straight away. */
  minSearchLength?: number;
  isDisabled?: boolean;
  compact?: boolean;
  /** Plural noun for messages, e.g. "patients". */
  noun?: string;
}

/** Picker that searches the server as the user types instead of loading a whole list into the dropdown. */
export default function RemoteSearchSelect<T extends { id: string }>({
  label,
  placeholder = 'Type to search…',
  value,
  onChange,
  buildUrl,
  toOption,
  minSearchLength = 0,
  isDisabled = false,
  compact,
  noun = 'results',
}: RemoteSearchSelectProps<T>) {
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim(), PICKER_DEBOUNCE_MS);
  const enabled = !isDisabled && search.length >= minSearchLength;
  const { data, error, isValidating } = useSWR<IPagination<T>>(enabled ? buildUrl(search) : null, {
    keepPreviousData: true,
  });
  const results = useMemo(() => (enabled ? (data?.items ?? []) : []), [enabled, data]);
  const options = useMemo(() => results.map(toOption), [results, toOption]);
  const more = enabled && data?.meta?.hasNextPage;

  const noOptionsMessage = error
    ? `Couldn't search ${noun} — retry`
    : enabled
      ? `No matching ${noun}`
      : `Type at least ${minSearchLength} characters`;

  return (
    <div className="flex flex-col gap-1">
      <Dropdown
        label={label}
        placeholder={placeholder}
        options={options}
        value={value ? toOption(value) : null}
        inputValue={text}
        onInputChange={setText}
        isLoading={enabled && isValidating}
        isClearable={!isDisabled}
        isDisabled={isDisabled}
        compact={compact}
        noOptionsMessage={noOptionsMessage}
        onChange={(option) => {
          const picked = Array.isArray(option) ? option[0] : option;
          onChange(picked ? (results.find((r) => r.id === picked.value) ?? null) : null);
        }}
      />
      {more && <p className="text-[11px] text-ink-muted">More {noun} match — keep typing to narrow the list.</p>}
    </div>
  );
}
