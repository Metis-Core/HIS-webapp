'use client';

import Button from '../buttons/button';
import { ButtonVariantEnum } from '@/enum';
import type { IEmptyStateProps } from '@/interfaces';

/* The one place we allow center-aligned content (AGENTS.md §4). */
export default function EmptyState({ message, icon: Icon, actionLabel, onAction }: IEmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-muted">
          <Icon aria-hidden className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-sm font-medium text-ink">{message}</h3>
      {actionLabel && onAction && (
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
