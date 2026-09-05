'use client';
import type { IInputProps } from '@/interfaces';

export default function Input({ label, error, className = '', id, required, ...props }: IInputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-muted">
          {label}
          {required && <span className="ml-0.5 text-critical">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand ${
          error ? 'border-critical focus:border-critical focus:ring-critical' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-critical">{error}</span>}
    </div>
  );
}
