'use client';

import { ButtonVariantEnum } from '@/enum';
import type { IButtonProps } from '@/interfaces';

const styles: Record<ButtonVariantEnum, string> = {
  [ButtonVariantEnum.PRIMARY]: 'bg-brand text-white hover:bg-brand-hover',
  [ButtonVariantEnum.SECONDARY]: 'bg-surface-raised text-ink ring-1 ring-line hover:bg-surface',
  [ButtonVariantEnum.DANGER]: 'bg-critical text-white hover:brightness-95',
  [ButtonVariantEnum.GHOST]: 'bg-transparent text-ink-muted hover:bg-surface hover:text-ink',
};

export default function Button({
  variant = ButtonVariantEnum.PRIMARY,
  loading,
  disabled,
  children,
  className = '',
  ...props
}: IButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
