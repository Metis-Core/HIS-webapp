'use client';

import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';

interface PaginationFooterProps {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

/** "Showing 21–40 of 312" with previous/next controls. */
export default function PaginationFooter({
  page,
  limit,
  total,
  hasNextPage,
  loading = false,
  onPageChange,
}: PaginationFooterProps) {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3 text-xs text-ink-muted">
      <p className="tabular-nums" aria-live="polite">
        {loading ? 'Loading…' : `Showing ${first}–${last} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="tabular-nums">Page {page}</span>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          disabled={!hasNextPage || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
