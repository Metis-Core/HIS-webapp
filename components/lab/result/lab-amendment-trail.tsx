'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { Pagination } from '@/components';
import { displayValue } from '@/helpers/lab-results';
import { useLabAmendments } from '@/hooks';
import type { ILabResultData } from '@/interfaces';

const summarise = (data: ILabResultData | null) =>
  data
    ? Object.entries(data)
        .map(([k, v]) => `${k}: ${displayValue(v)}`)
        .join(', ')
    : '—';

/** H-10: who changed a verified result, when, why, and what it said before. */
export default function LabAmendmentTrail({ orderId, itemId }: { orderId: string; itemId: string }) {
  const [page, setPage] = useState(1);
  const { amendments, pagination } = useLabAmendments(orderId, itemId, { page, limit: 5 });
  if (amendments.length === 0) return null;
  return (
    <details className="rounded-md border border-line px-3 py-2 text-xs">
      <summary className="cursor-pointer font-medium text-ink">Amendments ({pagination.total})</summary>
      <ul className="mt-2 flex flex-col gap-2">
        {amendments.map((a) => (
          <li key={a.id} className="flex flex-col gap-0.5 border-b border-line/60 pb-2">
            <span className="tabular-nums text-ink-muted">
              {format(new Date(a.createdAt), 'dd MMM yyyy HH:mm')}
              {a.amendedBy ? ` · ${a.amendedBy.firstName ?? ''} ${a.amendedBy.lastName ?? ''}` : ''}
            </span>
            <span className="text-ink">Reason: {a.reason}</span>
            <span className="text-ink-muted">Before: {summarise(a.previousData)}</span>
            <span className="text-ink-muted">After: {summarise(a.newData)}</span>
          </li>
        ))}
      </ul>
      <Pagination {...pagination} onPageChange={setPage} />
    </details>
  );
}
