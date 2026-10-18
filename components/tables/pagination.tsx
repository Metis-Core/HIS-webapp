'use client';

import Button from '../buttons/button';
import { ButtonVariantEnum } from '@/enum';
import type { IPageInfo } from '@/helpers/pagination';

interface PaginationProps extends IPageInfo {
  onPageChange: (page: number) => void;
  loading?: boolean;
  /** Names the list for screen readers when a page has more than one table. */
  label?: string;
  className?: string;
}

/** Shared list footer: "Showing 21–40 of 312", page X of Y, Previous / Next. */
export default function Pagination({
  page,
  limit,
  total,
  hasNextPage,
  onPageChange,
  loading = false,
  label = 'Pagination',
  className = '',
}: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return (
    <nav
      aria-label={label}
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-ink-muted ${className}`}
    >
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
        <span className="tabular-nums" aria-current="page">
          Page {page} of {pages}
        </span>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          disabled={!hasNextPage || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
