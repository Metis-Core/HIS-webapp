'use client';

import Button from '../buttons/button';
import { ButtonVariantEnum } from '@/enum';
import type { IEmptyStateProps } from '@/interfaces';

export default function EmptyState({ message, icon: Icon, actionLabel, onAction }: IEmptyStateProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center">
      {Icon && <Icon aria-hidden className="absolute inset-0 m-auto h-40 w-40 text-zinc-100" />}
      <h3 className="relative text-lg font-bold text-zinc-600">{message}</h3>
      {actionLabel && onAction && (
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={onAction} className="relative">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
