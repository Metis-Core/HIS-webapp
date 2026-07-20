"use client";
import type { IInputProps } from "@/interfaces";

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: IInputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary ${error ? "border-danger" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}