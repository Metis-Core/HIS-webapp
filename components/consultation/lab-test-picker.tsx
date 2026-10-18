'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components';
import { PICKER_DEBOUNCE_MS, PICKER_PAGE_SIZE } from '@/helpers/pagination';
import { useDebouncedValue, useLabTests } from '@/hooks';
import type { ILabTest } from '@/interfaces';

interface LabTestPickerProps {
  selected: ILabTest[];
  onChange: (selected: ILabTest[]) => void;
}

/**
 * Chip picker for ordering lab tests. The catalogue is searched on the server (one small page at a time)
 * rather than loaded whole; picked tests stay visible even when they drop out of the current results.
 */
export default function LabTestPicker({ selected, onChange }: LabTestPickerProps) {
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim(), PICKER_DEBOUNCE_MS);
  const { tests, pagination, isLoading } = useLabTests({
    isActive: true,
    search: search || undefined,
    limit: PICKER_PAGE_SIZE,
  });

  const selectedIds = selected.map((t) => t.id);
  const shown = [...selected, ...tests.filter((t) => !selectedIds.includes(t.id))];
  const toggle = (test: ILabTest) =>
    onChange(selectedIds.includes(test.id) ? selected.filter((t) => t.id !== test.id) : [...selected, test]);

  return (
    <div className="flex flex-col gap-2">
      <Input placeholder="Search code, abbreviation or name" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="max-h-64 overflow-auto rounded-md border border-line p-3">
        {shown.length === 0 && !search && !isLoading ? (
          <p className="text-xs text-ink-muted">
            No lab tests configured yet. Ask the lab admin to add tests under{' '}
            <Link href="/lab" className="text-brand hover:underline">
              Lab › Tests catalog
            </Link>
            .
          </p>
        ) : shown.length === 0 ? (
          <p className="text-xs text-ink-muted">{isLoading ? 'Searching…' : 'No tests match your search.'}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {shown.map((t) => {
              const active = selectedIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(t)}
                  className={`rounded-full px-2.5 py-1 text-xs ring-1 transition ${
                    active
                      ? 'bg-brand text-white ring-brand'
                      : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
                  }`}
                >
                  {t.code} — {t.name} · UGX {t.price.toLocaleString()}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {pagination.hasNextPage && (
        <p className="text-xs text-ink-muted">
          Showing {tests.length} of {pagination.total} tests — type to narrow the list.
        </p>
      )}
    </div>
  );
}
