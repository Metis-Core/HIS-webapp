'use client';

import { ButtonVariantEnum } from '@/enum';
import type { IButtonProps } from '@/interfaces';

const styles: Record<ButtonVariantEnum, string> = {
  [ButtonVariantEnum.PRIMARY]: 'bg-primary text-white hover:bg-primary-hover',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
